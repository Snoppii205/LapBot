# Requires PowerShell 7. API key is read without echo and never saved.
[CmdletBinding()]
param(
    [ValidateRange(1, 2)][int]$Concurrency = 1,
    [ValidateRange(5, 30)][int]$TimeoutSeconds = 30,
    [ValidateRange(0, 30)][int]$PauseBeforeModelSeconds = 20,
    [string[]]$Models = @()
)
$ErrorActionPreference = 'Stop'
$baseUrl = if ($env:LLM_BASE_URL) { $env:LLM_BASE_URL } else { 'http://localhost:11434/v1' }
$origin = ([Uri]$baseUrl).GetLeftPart([UriPartial]::Authority)
$catalog = Invoke-RestMethod -Uri "$origin/admin/public/seller-info" -MaximumRedirection 0 -TimeoutSec 20
$modelIds = @($catalog.models.id | Sort-Object -Unique)
if ($modelIds.Count -eq 0 -or $modelIds.Count -gt 40) { throw 'Unexpected catalog size; review before probing.' }
$selectedModelIds = if ($Models.Count) { @($Models | Sort-Object -Unique) } else { $modelIds }
if (@($selectedModelIds | Where-Object { $_ -notin $modelIds }).Count) { throw 'Requested model not present in public catalog.' }
$runState = [hashtable]::Synchronized(@{quotaBlocked = $false})
$secret = $null
$keyPlain = if ($env:LLM_API_KEY) {
    $env:LLM_API_KEY
} else {
    $secret = Read-Host 'Gateway API key (hidden)' -AsSecureString
    [Net.NetworkCredential]::new('', $secret).Password
}
$outputDir = Join-Path $PSScriptRoot '../diagnostics'
$null = New-Item -ItemType Directory -Path $outputDir -Force
$outputPath = Join-Path $outputDir ("gateway-models-{0}.json" -f (Get-Date -Format 'yyyyMMdd-HHmmss'))
$results = [Collections.Generic.List[object]]::new()
$started = [DateTime]::UtcNow.ToString('o')
try {
    $selectedModelIds | ForEach-Object -Parallel {
        $ErrorActionPreference = 'Stop'
        $modelId = $_
        $apiBase = $using:baseUrl
        $apiKey = $using:keyPlain
        $timeout = $using:TimeoutSeconds
        $sharedState = $using:runState
        function Read-ProbeStream {
            param([hashtable]$Body, [Net.Http.HttpClient]$Client, [int]$DeadlineMs)
            $timer = [Diagnostics.Stopwatch]::StartNew()
            $cts = [Threading.CancellationTokenSource]::new([Math]::Max(1, $DeadlineMs))
            $req = [Net.Http.HttpRequestMessage]::new([Net.Http.HttpMethod]::Post, "$apiBase/chat/completions")
            $req.Content = [Net.Http.StringContent]::new(($Body | ConvertTo-Json -Depth 20 -Compress), [Text.Encoding]::UTF8, 'application/json')
            $result = [ordered]@{
                status = $null; content_type = $null; first_content_ms = $null; total_ms = $null
                content_deltas = 0; tool_deltas = 0; json_events = 0; done = $false
                parse_errors = 0; provider_error = $false; error_type = $null; error_message = $null
                finish_reason = $null; response_model = $null; usage = $null; reply = ''; tools = @()
                gateway_notice = $null
            }
            $response = $null; $reader = $null
            $pending = [Collections.Generic.List[string]]::new()
            $tools = @{}
            try {
                $response = $Client.SendAsync($req, [Net.Http.HttpCompletionOption]::ResponseHeadersRead, $cts.Token).GetAwaiter().GetResult()
                $result.status = [int]$response.StatusCode
                $result.content_type = [string]$response.Content.Headers.ContentType
                if (-not $response.IsSuccessStatusCode) {
                    $raw = $response.Content.ReadAsStringAsync($cts.Token).GetAwaiter().GetResult()
                    $safe = $raw.Replace($apiKey, '[REDACTED]') -replace 'sk-[A-Za-z0-9_-]+', '[REDACTED]'
                    $result.error_message = $safe.Substring(0, [Math]::Min(400, $safe.Length))
                } elseif ($result.content_type -notmatch '^text/event-stream(?:;|$)') {
                    $result.error_type = 'unexpected_content_type'
                } else {
                    $stream = $response.Content.ReadAsStreamAsync($cts.Token).GetAwaiter().GetResult()
                    $reader = [IO.StreamReader]::new($stream, [Text.Encoding]::UTF8)
                    while ($true) {
                        $line = $reader.ReadLineAsync($cts.Token).AsTask().GetAwaiter().GetResult()
                        if ($null -eq $line) { break }
                        if ($line.StartsWith('data:')) {
                            $value = $line.Substring(5)
                            if ($value.StartsWith(' ')) { $value = $value.Substring(1) }
                            $pending.Add($value)
                            if (($pending -join "`n").Length -gt 131072) { throw 'Event too large' }
                            continue
                        }
                        if ($line -ne '' -or $pending.Count -eq 0) { continue }
                        $data = $pending -join "`n"; $pending.Clear()
                        if ($data -eq '[DONE]') { $result.done = $true; break }
                        try { $event = $data | ConvertFrom-Json -Depth 30 -ErrorAction Stop }
                        catch { $result.parse_errors++; continue }
                        $result.json_events++
                        if ($event.error) { $result.provider_error = $true }
                        if ($event.model) { $result.response_model = $event.model }
                        if ($event.usage) { $result.usage = $event.usage }
                        foreach ($choice in $event.choices) {
                            if ($choice.index -ne 0) { continue }
                            if ($choice.finish_reason) { $result.finish_reason = $choice.finish_reason }
                            if ([string]$choice.delta.content -ne '') {
                                if ($null -eq $result.first_content_ms) { $result.first_content_ms = $timer.ElapsedMilliseconds }
                                $result.content_deltas++
                                $result.reply += [string]$choice.delta.content
                                if ($result.reply.Length -gt 65536) { throw 'Reply too large' }
                            }
                            foreach ($tc in $choice.delta.tool_calls) {
                                $result.tool_deltas++
                                $index = [int]$tc.index
                                if (-not $tools.ContainsKey($index)) {
                                    $tools[$index] = @{id = ''; type = 'function'; function = @{name = ''; arguments = ''}}
                                }
                                if ($tc.id) { $tools[$index].id += [string]$tc.id }
                                if ($tc.function.name) { $tools[$index].function.name += [string]$tc.function.name }
                                if ($tc.function.arguments) { $tools[$index].function.arguments += [string]$tc.function.arguments }
                                if ($tools.Count -gt 4 -or $tools[$index].function.arguments.Length -gt 16384) { throw 'Tool payload too large' }
                            }
                        }
                    }
                    if ($pending.Count) { $result.error_type = 'unterminated_sse_event' }
                }
            } catch { $result.error_type = $_.Exception.GetType().Name }
            finally {
                $result.total_ms = $timer.ElapsedMilliseconds
                if ($result.status -eq 429 -or $result.reply -match 'SYSTEM NOTICE:\s*RATE LIMIT EXCEEDED|RPM limit exceeded') {
                    $result.gateway_notice = 'rate_limit'
                    $sharedState.quotaBlocked = $true
                }
                $result.tools = @($tools.Keys | Sort-Object | ForEach-Object { $tools[$_] })
                if ($null -ne $reader) { $reader.Dispose() }
                if ($null -ne $response) { $response.Dispose() }
                $req.Dispose(); $cts.Dispose()
            }
            return [pscustomobject]$result
        }
        function Test-Transport {
            param($Result, [string]$Finish)
            return ($Result.status -eq 200 -and $Result.done -and $Result.parse_errors -eq 0 -and
                -not $Result.provider_error -and -not $Result.error_type -and -not $Result.gateway_notice -and $Result.finish_reason -eq $Finish)
        }
        function Remove-ToolIds {
            param($Result)
            $Result.tools = @($Result.tools | ForEach-Object {
                @{name = $_.function.name; arguments = $_.function.arguments; has_id = [bool]$_.id}
            })
            return $Result
        }
        $record = [ordered]@{
            model_id = $modelId; checked_at_utc = [DateTime]::UtcNow.ToString('o')
            state = 'NOT_TESTED'; text_ok = $false; tool_ok = $false; followup_ok = $false
            tool_turn_ms = $null; text = $null; tool = $null; followup = $null; note = $null
        }
        if ($modelId -eq 'antigravity-swarm') {
            $record.note = 'Multi-agent route excluded from single-model LapBot adapter scope.'
            [pscustomobject]$record
            return
        }
        if ($sharedState.quotaBlocked) {
            $record.state = 'NOT_TESTED_QUOTA'; $record.note = 'Stopped batch after a rate-limit notice; retry later at a slower pace.'
            [pscustomobject]$record
            return
        }
        if ($using:PauseBeforeModelSeconds -gt 0) { Start-Sleep -Seconds $using:PauseBeforeModelSeconds }
        if ($sharedState.quotaBlocked) {
            $record.state = 'NOT_TESTED_QUOTA'; $record.note = 'Another probe encountered rate limiting.'
            [pscustomobject]$record
            return
        }
        $handler = [Net.Http.HttpClientHandler]::new(); $handler.AllowAutoRedirect = $false
        $client = [Net.Http.HttpClient]::new($handler)
        $client.DefaultRequestHeaders.Authorization = [Net.Http.Headers.AuthenticationHeaderValue]::new('Bearer', $apiKey)
        try {
            $textBody = @{
                model = $modelId; max_tokens = 600; stream = $true; stream_options = @{include_usage = $true}
                messages = @(@{role = 'user'; content = 'Tra loi tieng Viet, dung 3 dong ngan: 1. Nhu cau 2. Ngan sach 3. Bao hanh. Khong giai thich them.'})
            }
            $text = Read-ProbeStream $textBody $client ($timeout * 1000)
            $record.text_ok = (Test-Transport $text 'stop') -and $text.content_deltas -gt 0 -and -not [string]::IsNullOrWhiteSpace($text.reply)
            $record.text = Remove-ToolIds $text
            if ($text.status -eq 401 -or $text.status -eq 403 -or $text.gateway_notice -eq 'rate_limit') {
                $record.state = 'AUTH_OR_QUOTA'; $record.note = 'Tool probes skipped after auth/quota failure.'
            } else {
                $messages = @(
                    @{role = 'system'; content = 'You are a Vietnamese laptop sales assistant. Product prices must come from search_laptop_catalog. Use the tool before answering a catalog question.'},
                    @{role = 'user'; content = 'Tim laptop duoi 20 trieu dong bang cong cu tra cuu. Chi gioi thieu san pham trong ket qua.'}
                )
                $toolSchema = @{type = 'function'; function = @{
                    name = 'search_laptop_catalog'; description = 'Search laptop catalog by maximum budget in VND.'
                    parameters = @{type = 'object'; properties = @{max_price = @{type = 'integer'; minimum = 0}}; required = @('max_price'); additionalProperties = $false}
                }}
                $toolBody = @{model = $modelId; max_tokens = 600; stream = $true; stream_options = @{include_usage = $true}; messages = $messages; tools = @($toolSchema); tool_choice = 'auto'}
                $turnTimer = [Diagnostics.Stopwatch]::StartNew()
                $tool = Read-ProbeStream $toolBody $client ($timeout * 1000)
                if ((Test-Transport $tool 'tool_calls') -and $tool.tools.Count -eq 1) {
                    $call = $tool.tools[0]
                    $arguments = $null
                    try { $arguments = $call.function.arguments | ConvertFrom-Json -ErrorAction Stop } catch { }
                    $record.tool_ok = $call.function.name -eq 'search_laptop_catalog' -and [bool]$call.id -and
                        $null -ne $arguments -and $arguments.max_price -eq 20000000 -and @($arguments.PSObject.Properties).Count -eq 1
                    if ($record.tool_ok -and $turnTimer.ElapsedMilliseconds -lt ($timeout * 1000)) {
                        $messages += @{role = 'assistant'; content = $(if ($tool.reply) { $tool.reply } else { $null }); tool_calls = @($tool.tools)}
                        $messages += @{role = 'tool'; tool_call_id = $call.id; content = '{"products":[{"variant_id":"00000000-0000-4000-8000-000000000001","name":"Laptop Demo A","price_vnd":17990000,"in_stock":true}],"synthetic_test_data":true}'}
                        $followBody = @{model = $modelId; max_tokens = 600; stream = $true; stream_options = @{include_usage = $true}; messages = $messages; tools = @($toolSchema); tool_choice = 'none'}
                        $follow = Read-ProbeStream $followBody $client (($timeout * 1000) - [int]$turnTimer.ElapsedMilliseconds)
                        $digits = $follow.reply -replace '\D', ''
                        $record.followup_ok = (Test-Transport $follow 'stop') -and $digits.Contains('17990000') -and $follow.reply -match 'Demo A'
                        $record.followup = Remove-ToolIds $follow
                    }
                }
                $record.tool_turn_ms = $turnTimer.ElapsedMilliseconds
                $record.tool = Remove-ToolIds $tool
                if ($tool.gateway_notice -eq 'rate_limit' -or $record.followup.gateway_notice -eq 'rate_limit') { $record.state = 'AUTH_OR_QUOTA' }
                elseif ($record.text_ok -and $record.tool_ok -and $record.followup_ok) { $record.state = 'PASS' }
                elseif ($record.text_ok) { $record.state = 'TEXT_ONLY_OR_TOOL_FAILED' }
                else { $record.state = 'NOT_CONFIRMED' }
            }
        } catch { $record.state = 'PROBE_ERROR'; $record.note = $_.Exception.GetType().Name }
        finally { $client.Dispose(); $handler.Dispose(); $apiKey = $null }
        [pscustomobject]$record
    } -ThrottleLimit $Concurrency | ForEach-Object {
        $results.Add($_)
        [ordered]@{
            started_at_utc = $started; updated_at_utc = [DateTime]::UtcNow.ToString('o')
            base_url = $baseUrl; catalog_source = "$origin/admin/public/seller-info"
            catalog_model_ids = $modelIds; selected_model_ids = $selectedModelIds
            concurrency = $Concurrency; pause_before_model_seconds = $PauseBeforeModelSeconds
            max_tokens_per_call = 600; classification_version = 2
            tool_turn_deadline_seconds = $TimeoutSeconds; results = @($results.ToArray())
        } | ConvertTo-Json -Depth 30 | Set-Content -LiteralPath $outputPath -Encoding utf8
        [pscustomobject]@{model = $_.model_id; state = $_.state; text_ms = $_.text.total_ms; tool_turn_ms = $_.tool_turn_ms} | ConvertTo-Json -Compress
    }
} finally {
    $keyPlain = $null
    if ($secret) { $secret.Dispose(); $secret = $null }
}
Write-Output "Report: $outputPath"
