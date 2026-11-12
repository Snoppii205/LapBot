import { useEffect, useMemo, useState } from 'react';
import { RetroLoadingBar, WindowFrame } from '../../components/os/RetroOsPrimitives.js';
import {
  IconBotCpu,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconCopy,
  IconDownload,
  IconExternalLink,
  IconFileText,
  IconLayers,
  IconLock,
  IconPlay,
  IconRefresh,
  IconSearch,
  IconShieldCheck,
  IconSparkleAi,
  IconSpinner,
  IconTerminalAdmin,
  IconTruckCod,
  IconUnlock,
  IconZap
} from '../../components/icons/RetroIcons.js';
import './ApiDocsPage.css';

type AuthLevel =
  | 'PUBLIC'
  | 'GUEST'
  | 'CUSTOMER'
  | 'GUEST_OR_CUSTOMER'
  | 'ADMIN_STAFF'
  | 'SUPER_ADMIN';

interface OpenApiSchema {
  type?: string;
  format?: string;
  nullable?: boolean;
  description?: string;
  enum?: Array<string | number | boolean>;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  minItems?: number;
  maxItems?: number;
  default?: unknown;
  required?: string[];
  properties?: Record<string, OpenApiSchema>;
  items?: OpenApiSchema;
  oneOf?: OpenApiSchema[];
  anyOf?: OpenApiSchema[];
  $ref?: string;
}

interface OpenApiParameter {
  name: string;
  in: 'path' | 'query';
  required?: boolean;
  description?: string;
  schema?: OpenApiSchema;
}

interface OpenApiOperation {
  tags?: string[];
  summary?: string;
  description?: string;
  operationId?: string;
  'x-auth-level'?: AuthLevel;
  'x-rate-limit'?: string;
  'x-sse-stream'?: boolean;
  parameters?: OpenApiParameter[];
  requestBody?: {
    required?: boolean;
    description?: string;
    content?: {
      'application/json'?: {
        schema?: OpenApiSchema;
        example?: unknown;
      };
    };
  };
  responses?: Record<
    string,
    {
      description?: string;
      content?: Record<
        string,
        {
          schema?: OpenApiSchema;
          example?: unknown;
        }
      >;
    }
  >;
}

interface OpenApiDocument {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
  };
  servers?: Array<{ url: string; description?: string }>;
  tags?: Array<{ name: string; description?: string }>;
  components?: {
    schemas?: Record<string, OpenApiSchema>;
  };
  paths: Record<string, Record<string, OpenApiOperation>>;
}

interface FlattenedEndpoint {
  id: string;
  method: string;
  path: string;
  tag: string;
  summary: string;
  description: string;
  auth: AuthLevel;
  rateLimit?: string;
  isSse: boolean;
  operation: OpenApiOperation;
}

interface SchemaFieldRow {
  path: string;
  type: string;
  required: boolean;
  constraints: string;
}

const AUTH_LABELS: Record<AuthLevel, string> = {
  PUBLIC: 'Public',
  GUEST: 'Cookie Guest',
  CUSTOMER: 'Cookie Thành viên',
  GUEST_OR_CUSTOMER: 'Guest / Thành viên',
  ADMIN_STAFF: 'Admin Staff',
  SUPER_ADMIN: 'Super Admin'
};

function formatSchemaType(schema?: OpenApiSchema): string {
  if (!schema) return 'object';
  if (schema.$ref) {
    return schema.$ref.split('/').pop() ?? 'object';
  }
  if (schema.type === 'array') {
    return `array<${formatSchemaType(schema.items)}>`;
  }
  const base = schema.format
    ? `${schema.type ?? 'string'} (${schema.format})`
    : (schema.type ?? 'object');
  return schema.nullable ? `${base} | null` : base;
}

function formatConstraints(schema?: OpenApiSchema): string {
  if (!schema) return '—';
  const parts: string[] = [];
  if (schema.enum?.length) {
    parts.push(`enum: ${schema.enum.slice(0, 6).join(', ')}${schema.enum.length > 6 ? '...' : ''}`);
  }
  if (schema.minimum !== undefined) parts.push(`min: ${schema.minimum}`);
  if (schema.maximum !== undefined) parts.push(`max: ${schema.maximum}`);
  if (schema.minLength !== undefined) parts.push(`minLen: ${schema.minLength}`);
  if (schema.maxLength !== undefined) parts.push(`maxLen: ${schema.maxLength}`);
  if (schema.minItems !== undefined) parts.push(`minItems: ${schema.minItems}`);
  if (schema.maxItems !== undefined) parts.push(`maxItems: ${schema.maxItems}`);
  if (schema.default !== undefined) parts.push(`mặc định: ${String(schema.default)}`);
  return parts.length ? parts.join(' · ') : '—';
}

function flattenSchemaRows(
  schema: OpenApiSchema | undefined,
  components: Record<string, OpenApiSchema> | undefined,
  prefix = '',
  depth = 0
): SchemaFieldRow[] {
  if (!schema || depth > 3) return [];
  if (schema.$ref) {
    const refName = schema.$ref.split('/').pop() ?? '';
    return flattenSchemaRows(components?.[refName], components, prefix, depth + 1);
  }
  if (schema.type === 'array' && schema.items) {
    return flattenSchemaRows(schema.items, components, `${prefix}[]`, depth + 1);
  }
  if (!schema.properties) return [];

  const reqSet = new Set(schema.required ?? []);
  const rows: SchemaFieldRow[] = [];

  for (const [key, prop] of Object.entries(schema.properties)) {
    const fullName = prefix ? `${prefix}.${key}` : key;
    rows.push({
      path: fullName,
      type: formatSchemaType(prop),
      required: reqSet.has(key),
      constraints: formatConstraints(prop)
    });

    if (prop.properties && depth < 2) {
      rows.push(...flattenSchemaRows(prop, components, fullName, depth + 1));
    } else if (prop.type === 'array' && prop.items?.properties && depth < 2) {
      rows.push(...flattenSchemaRows(prop.items, components, `${fullName}[]`, depth + 1));
    }
  }

  return rows;
}

function synthesizeExample(
  schema: OpenApiSchema | undefined,
  components: Record<string, OpenApiSchema> | undefined,
  depth = 0
): unknown {
  if (!schema || depth > 4) return {};
  if (schema.$ref) {
    const refName = schema.$ref.split('/').pop() ?? '';
    return synthesizeExample(components?.[refName], components, depth + 1);
  }
  if (schema.enum?.length) return schema.enum[0];
  if (schema.default !== undefined) return schema.default;

  switch (schema.type) {
    case 'string':
      if (schema.format === 'uuid') return '00000000-0000-4000-8000-000000000001';
      if (schema.format === 'date-time') return '2026-11-12T12:00:00.000Z';
      return 'string';
    case 'integer':
    case 'number':
      return schema.minimum ?? 1;
    case 'boolean':
      return true;
    case 'array':
      return schema.items ? [synthesizeExample(schema.items, components, depth + 1)] : [];
    case 'object':
    default: {
      if (!schema.properties) return {};
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(schema.properties)) {
        out[k] = synthesizeExample(v, components, depth + 1);
      }
      return out;
    }
  }
}

function EndpointCard({
  endpoint,
  baseOrigin,
  components
}: {
  endpoint: FlattenedEndpoint;
  baseOrigin: string;
  components?: Record<string, OpenApiSchema>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [subTab, setSubTab] = useState<'spec' | 'try'>('spec');
  const [copiedCurl, setCopiedCurl] = useState(false);

  const parameters = endpoint.operation.parameters ?? [];
  const pathParams = parameters.filter(p => p.in === 'path');
  const queryParams = parameters.filter(p => p.in === 'query');

  const bodySpec = endpoint.operation.requestBody?.content?.['application/json'];
  const defaultBodyString = useMemo(() => {
    if (!bodySpec) return '';
    const sample =
      bodySpec.example !== undefined
        ? bodySpec.example
        : synthesizeExample(bodySpec.schema, components);
    return JSON.stringify(sample, null, 2);
  }, [bodySpec, components]);

  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [bodyInput, setBodyInput] = useState<string>(defaultBodyString);
  const [running, setRunning] = useState(false);
  const [tryResult, setTryResult] = useState<{
    status: number;
    statusText: string;
    durationMs: number;
    contentType: string;
    body: string;
  } | null>(null);

  useEffect(() => {
    setBodyInput(defaultBodyString);
  }, [defaultBodyString]);

  const buildTargetPath = () => {
    let resolved = endpoint.path;
    for (const p of pathParams) {
      const val = paramValues[`path:${p.name}`]?.trim() || `{${p.name}}`;
      resolved = resolved.replace(`{${p.name}}`, encodeURIComponent(val));
    }
    const qs = new URLSearchParams();
    for (const q of queryParams) {
      const val = paramValues[`query:${q.name}`]?.trim();
      if (val) qs.set(q.name, val);
    }
    const queryStr = qs.toString();
    return queryStr ? `${resolved}?${queryStr}` : resolved;
  };

  const curlSnippet = useMemo(() => {
    const isMut = ['POST', 'PATCH', 'PUT', 'DELETE'].includes(endpoint.method);
    const lines = [`curl -X ${endpoint.method} "${baseOrigin}${endpoint.path}"`];
    if (isMut) {
      lines.push(`  -H "Origin: ${baseOrigin}"`);
    }
    if (bodySpec) {
      lines.push('  -H "Content-Type: application/json"');
      const compactBody = defaultBodyString.replace(/\s+/g, ' ').trim();
      lines.push(`  -d '${compactBody}'`);
    }
    return lines.join(' \\\n');
  }, [endpoint.method, endpoint.path, baseOrigin, bodySpec, defaultBodyString]);

  const handleCopyCurl = () => {
    void navigator.clipboard.writeText(curlSnippet);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 1600);
  };

  const refreshBodyUuids = () => {
    try {
      const parsed = JSON.parse(bodyInput) as Record<string, unknown>;
      if ('client_request_id' in parsed) parsed.client_request_id = crypto.randomUUID();
      if ('client_message_id' in parsed) parsed.client_message_id = crypto.randomUUID();
      setBodyInput(JSON.stringify(parsed, null, 2));
    } catch {
      setBodyInput(defaultBodyString);
    }
  };

  const handleRunTry = async () => {
    for (const p of pathParams) {
      if (!paramValues[`path:${p.name}`]?.trim()) {
        setTryResult({
          status: 0,
          statusText: 'THIẾU THAM SỐ PATH',
          durationMs: 0,
          contentType: 'text/plain',
          body: `Vui lòng nhập giá trị cho tham số đường dẫn bắt buộc: ${p.name}`
        });
        return;
      }
    }

    const url = buildTargetPath();
    const headers: Record<string, string> = {};
    let payload: string | undefined;

    if (bodySpec && ['POST', 'PATCH', 'PUT'].includes(endpoint.method)) {
      try {
        JSON.parse(bodyInput);
      } catch {
        setTryResult({
          status: 0,
          statusText: 'JSON KHÔNG HỢP LỆ',
          durationMs: 0,
          contentType: 'text/plain',
          body: 'Request Body không đúng cú pháp JSON. Hãy kiểm tra dấu ngoặc kép và dấu phẩy.'
        });
        return;
      }
      headers['Content-Type'] = 'application/json';
      payload = bodyInput;
    }

    setRunning(true);
    setTryResult(null);
    const started = performance.now();

    try {
      const response = await fetch(url, {
        method: endpoint.method,
        credentials: 'include',
        headers,
        body: payload
      });

      const contentType = response.headers.get('content-type') ?? '';
      let formatted = '';

      if (contentType.includes('text/event-stream') && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          setTryResult({
            status: response.status,
            statusText: response.statusText || 'SSE STREAMING',
            durationMs: Math.round(performance.now() - started),
            contentType,
            body: buffer
          });
        }
        formatted = buffer || '(Luồng SSE kết thúc không có dữ liệu)';
      } else if (contentType.includes('application/json')) {
        const json: unknown = await response.json();
        formatted = JSON.stringify(json, null, 2);
      } else if (contentType.startsWith('image/')) {
        formatted = `[Dữ liệu nhị phân hình ảnh (${contentType}) — Mở trực tiếp đường dẫn: ${baseOrigin}${url}]`;
      } else {
        formatted = await response.text();
      }

      setTryResult({
        status: response.status,
        statusText: response.statusText || (response.ok ? 'OK' : 'ERROR'),
        durationMs: Math.round(performance.now() - started),
        contentType,
        body: formatted
      });
    } catch (err) {
      setTryResult({
        status: 0,
        statusText: 'NETWORK ERROR',
        durationMs: Math.round(performance.now() - started),
        contentType: 'text/plain',
        body: err instanceof Error ? err.message : 'Không thể kết nối tới máy chủ.'
      });
    } finally {
      setRunning(false);
    }
  };

  const bodyRows = useMemo(
    () => flattenSchemaRows(bodySpec?.schema, components),
    [bodySpec?.schema, components]
  );

  const primarySuccessCode = endpoint.operation.responses?.['200']
    ? '200'
    : endpoint.operation.responses?.['201']
      ? '201'
      : '200';

  const successJsonSpec =
    endpoint.operation.responses?.[primarySuccessCode]?.content?.['application/json'];

  const responseRows = useMemo(
    () => flattenSchemaRows(successJsonSpec?.schema, components),
    [successJsonSpec?.schema, components]
  );

  const responseSampleString = useMemo(() => {
    if (endpoint.isSse) {
      return (endpoint.operation.responses?.['200']?.content?.['text/event-stream']?.example ??
        'event: start\ndata: {"turn_id":"..."}\n\nevent: text_delta\ndata: {"text":"..."}\n\nevent: done\ndata: {"status":"COMPLETED"}') as string;
    }
    if (!successJsonSpec?.schema) return '';
    return JSON.stringify(synthesizeExample(successJsonSpec.schema, components), null, 2);
  }, [endpoint.isSse, endpoint.operation.responses, successJsonSpec?.schema, components]);

  const isPublic = endpoint.auth === 'PUBLIC';

  return (
    <article className={`api-docs-endpoint ${expanded ? 'expanded' : ''}`}>
      <button
        type="button"
        className="api-docs-endpoint-head"
        onClick={() => setExpanded(prev => !prev)}
        aria-expanded={expanded}
      >
        <div className="api-docs-endpoint-main">
          <span className={`api-method-badge api-method-${endpoint.method}`}>
            {endpoint.method}
          </span>
          <code className="api-endpoint-path">{endpoint.path}</code>
          <span className="api-endpoint-summary">{endpoint.summary}</span>
        </div>

        <div className="api-docs-endpoint-badges">
          {endpoint.isSse && <span className="api-sse-pill">SSE STREAM</span>}
          <span className={`api-auth-pill api-auth-${endpoint.auth}`}>
            {isPublic ? <IconUnlock size={12} /> : <IconLock size={12} />}
            <span>{AUTH_LABELS[endpoint.auth]}</span>
          </span>
          {expanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
        </div>
      </button>

      {expanded && (
        <div className="api-docs-endpoint-body">
          <div className="api-docs-subtabs">
            <div className="api-docs-subtab-group">
              <button
                type="button"
                className={`api-docs-subtab ${subTab === 'spec' ? 'active' : ''}`}
                onClick={() => setSubTab('spec')}
              >
                <IconFileText size={14} />
                <span>Đặc tả Kỹ thuật</span>
              </button>
              <button
                type="button"
                className={`api-docs-subtab ${subTab === 'try' ? 'active' : ''}`}
                onClick={() => setSubTab('try')}
              >
                <IconPlay size={13} />
                <span>Chạy thử API (Try it out)</span>
              </button>
            </div>

            <button type="button" className="api-docs-btn" onClick={handleCopyCurl}>
              {copiedCurl ? <IconCheck size={14} /> : <IconCopy size={14} />}
              <span>{copiedCurl ? 'Đã chép cURL' : 'Sao chép cURL'}</span>
            </button>
          </div>

          {subTab === 'spec' ? (
            <>
              <div className="api-docs-desc-box">
                <div>{endpoint.description}</div>
                <div className="api-docs-meta-strip">
                  <span className="api-docs-meta-tag">
                    Quyền truy cập: <strong>{AUTH_LABELS[endpoint.auth]}</strong>
                  </span>
                  {endpoint.rateLimit && (
                    <span className="api-docs-meta-tag">
                      Giới hạn tần suất: <strong>{endpoint.rateLimit}</strong>
                    </span>
                  )}
                  {['POST', 'PATCH', 'PUT', 'DELETE'].includes(endpoint.method) && (
                    <span className="api-docs-meta-tag">
                      Bảo vệ CSRF: <strong>Header Origin = {baseOrigin}</strong>
                    </span>
                  )}
                </div>
              </div>

              {parameters.length > 0 && (
                <div>
                  <h4 className="api-docs-section-title">
                    <span>Tham số Đường dẫn & Truy vấn (Parameters)</span>
                  </h4>
                  <div className="api-docs-table-wrap">
                    <table className="api-docs-table">
                      <thead>
                        <tr>
                          <th>Tham số</th>
                          <th>Vị trí</th>
                          <th>Kiểu dữ liệu</th>
                          <th>Bắt buộc</th>
                          <th>Ràng buộc</th>
                          <th>Mô tả</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parameters.map(param => (
                          <tr key={`${param.in}:${param.name}`}>
                            <td>
                              <code className="api-docs-code">{param.name}</code>
                            </td>
                            <td>
                              <code className="api-docs-code">{param.in}</code>
                            </td>
                            <td>{formatSchemaType(param.schema)}</td>
                            <td>
                              {param.required ? (
                                <span className="api-req-badge">BẮT BUỘC</span>
                              ) : (
                                <span className="api-opt-badge">Tuỳ chọn</span>
                              )}
                            </td>
                            <td>{formatConstraints(param.schema)}</td>
                            <td>{param.description ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {bodySpec && (
                <div>
                  <h4 className="api-docs-section-title">
                    <span>Request Body (application/json)</span>
                  </h4>
                  {bodyRows.length > 0 && (
                    <div className="api-docs-table-wrap" style={{ marginBottom: '10px' }}>
                      <table className="api-docs-table">
                        <thead>
                          <tr>
                            <th>Trường JSON</th>
                            <th>Kiểu dữ liệu</th>
                            <th>Bắt buộc</th>
                            <th>Ràng buộc Schema</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bodyRows.map(row => (
                            <tr key={row.path}>
                              <td>
                                <code className="api-docs-code">{row.path}</code>
                              </td>
                              <td>{row.type}</td>
                              <td>
                                {row.required ? (
                                  <span className="api-req-badge">BẮT BUỘC</span>
                                ) : (
                                  <span className="api-opt-badge">Tuỳ chọn</span>
                                )}
                              </td>
                              <td>{row.constraints}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <pre className="api-docs-pre">{defaultBodyString}</pre>
                </div>
              )}

              <div>
                <h4 className="api-docs-section-title">
                  <span>
                    Cấu trúc Phản hồi ({primarySuccessCode}{' '}
                    {endpoint.isSse ? 'text/event-stream' : 'application/json'})
                  </span>
                </h4>
                {responseRows.length > 0 && (
                  <div className="api-docs-table-wrap" style={{ marginBottom: '10px' }}>
                    <table className="api-docs-table">
                      <thead>
                        <tr>
                          <th>Trường Phản hồi</th>
                          <th>Kiểu dữ liệu</th>
                          <th>Luôn có mặt</th>
                          <th>Ràng buộc</th>
                        </tr>
                      </thead>
                      <tbody>
                        {responseRows.map(row => (
                          <tr key={row.path}>
                            <td>
                              <code className="api-docs-code">{row.path}</code>
                            </td>
                            <td>{row.type}</td>
                            <td>
                              {row.required ? (
                                <span className="api-req-badge">CÓ</span>
                              ) : (
                                <span className="api-opt-badge">Tuỳ ngữ cảnh</span>
                              )}
                            </td>
                            <td>{row.constraints}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {responseSampleString && <pre className="api-docs-pre">{responseSampleString}</pre>}
              </div>

              <div>
                <h4 className="api-docs-section-title">
                  <span>Mã Trạng thái HTTP (Status Codes)</span>
                </h4>
                <div className="api-docs-status-list">
                  {Object.entries(endpoint.operation.responses ?? {}).map(([code, detail]) => {
                    const isSuccess = code.startsWith('2');
                    return (
                      <div
                        key={code}
                        className={`api-status-chip ${isSuccess ? 'ok' : 'err'}`}
                        title={detail.description}
                      >
                        <strong>{code}</strong> — {detail.description}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {parameters.length > 0 && (
                <div className="api-try-grid">
                  {parameters.map(param => {
                    const fieldKey = `${param.in}:${param.name}`;
                    return (
                      <div key={fieldKey} className="api-try-field">
                        <label>
                          {param.name} ({param.in}) {param.required ? '*' : ''}
                        </label>
                        {param.schema?.enum ? (
                          <select
                            className="api-try-input"
                            value={paramValues[fieldKey] ?? ''}
                            onChange={e =>
                              setParamValues(prev => ({ ...prev, [fieldKey]: e.target.value }))
                            }
                          >
                            <option value="">— Không chọn —</option>
                            {param.schema.enum.map(opt => (
                              <option key={String(opt)} value={String(opt)}>
                                {String(opt)}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            className="api-try-input"
                            placeholder={
                              param.schema?.format === 'uuid'
                                ? 'Nhập UUID...'
                                : (param.description ?? param.name)
                            }
                            value={paramValues[fieldKey] ?? ''}
                            onChange={e =>
                              setParamValues(prev => ({ ...prev, [fieldKey]: e.target.value }))
                            }
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {bodySpec && ['POST', 'PATCH', 'PUT'].includes(endpoint.method) && (
                <div>
                  <div className="api-docs-section-title">
                    <span>JSON Request Body</span>
                    <button type="button" className="api-docs-btn" onClick={refreshBodyUuids}>
                      <IconRefresh size={13} />
                      <span>Tạo UUID mới / Khôi phục mẫu</span>
                    </button>
                  </div>
                  <textarea
                    className="api-try-textarea"
                    value={bodyInput}
                    onChange={e => setBodyInput(e.target.value)}
                    spellCheck={false}
                  />
                </div>
              )}

              <div className="api-docs-toolbar">
                <button
                  type="button"
                  className="api-docs-btn api-docs-btn-primary"
                  disabled={running}
                  onClick={() => void handleRunTry()}
                >
                  {running ? <IconSpinner size={14} /> : <IconPlay size={14} />}
                  <span>
                    {running ? 'Đang thực thi...' : `Gửi ${endpoint.method} ${buildTargetPath()}`}
                  </span>
                </button>
              </div>

              {tryResult && (
                <div className="api-try-result">
                  <div className="api-try-result-bar">
                    <span
                      className={`api-status-chip ${
                        tryResult.status >= 200 && tryResult.status < 300 ? 'ok' : 'err'
                      }`}
                    >
                      HTTP {tryResult.status} · {tryResult.statusText}
                    </span>
                    <span>
                      Thời gian phản hồi: <strong>{tryResult.durationMs} ms</strong> ·{' '}
                      <code>{tryResult.contentType || 'n/a'}</code>
                    </span>
                  </div>
                  <pre className="api-docs-pre">{tryResult.body}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

export function ApiDocsPage() {
  const [doc, setDoc] = useState<OpenApiDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dbReady, setDbReady] = useState<boolean | null>(null);

  const [guideTab, setGuideTab] = useState<'auth' | 'cod' | 'sse' | 'errors'>('auth');
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [authFilter, setAuthFilter] = useState<string>('ALL');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');

  const [guestInfo, setGuestInfo] = useState<{
    session_id: string;
    control_version: number;
  } | null>(null);
  const [initSessionBusy, setInitSessionBusy] = useState(false);
  const [copiedBase, setCopiedBase] = useState(false);

  const baseOrigin = typeof window !== 'undefined' ? window.location.origin : '';

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      fetch('/api/v1/openapi.json').then(async r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return (await r.json()) as OpenApiDocument;
      }),
      fetch('/api/v1/health/ready')
        .then(r => r.ok)
        .catch(() => false)
    ])
      .then(([spec, ready]) => {
        if (!active) return;
        setDoc(spec);
        setDbReady(ready);
        setLoading(false);
      })
      .catch(err => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Không thể tải đặc tả OpenAPI.');
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const allEndpoints = useMemo<FlattenedEndpoint[]>(() => {
    if (!doc) return [];
    const list: FlattenedEndpoint[] = [];
    for (const [path, methods] of Object.entries(doc.paths)) {
      for (const [m, op] of Object.entries(methods)) {
        const methodUpper = m.toUpperCase();
        list.push({
          id: `${methodUpper}:${path}`,
          method: methodUpper,
          path,
          tag: op.tags?.[0] ?? 'Khác',
          summary: op.summary ?? path,
          description: op.description ?? '',
          auth: op['x-auth-level'] ?? 'PUBLIC',
          rateLimit: op['x-rate-limit'],
          isSse: Boolean(op['x-sse-stream']),
          operation: op
        });
      }
    }
    return list;
  }, [doc]);

  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const ep of allEndpoints) {
      counts.set(ep.tag, (counts.get(ep.tag) ?? 0) + 1);
    }
    return counts;
  }, [allEndpoints]);

  const filteredEndpoints = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allEndpoints.filter(ep => {
      if (selectedTag !== 'ALL' && ep.tag !== selectedTag) return false;
      if (methodFilter !== 'ALL' && ep.method !== methodFilter) return false;
      if (authFilter === 'PUBLIC' && ep.auth !== 'PUBLIC') return false;
      if (
        authFilter === 'CUSTOMER_GUEST' &&
        !['GUEST', 'CUSTOMER', 'GUEST_OR_CUSTOMER'].includes(ep.auth)
      ) {
        return false;
      }
      if (authFilter === 'ADMIN' && !['ADMIN_STAFF', 'SUPER_ADMIN'].includes(ep.auth)) {
        return false;
      }
      if (!q) return true;
      return (
        ep.path.toLowerCase().includes(q) ||
        ep.summary.toLowerCase().includes(q) ||
        ep.description.toLowerCase().includes(q) ||
        ep.method.toLowerCase().includes(q)
      );
    });
  }, [allEndpoints, selectedTag, methodFilter, authFilter, search]);

  const groupedEndpoints = useMemo(() => {
    const orderedTags = doc?.tags?.map(t => t.name) ?? [];
    const map = new Map<string, FlattenedEndpoint[]>();
    for (const ep of filteredEndpoints) {
      const bucket = map.get(ep.tag) ?? [];
      bucket.push(ep);
      map.set(ep.tag, bucket);
    }
    const keys = [...map.keys()].sort((a, b) => {
      const ia = orderedTags.indexOf(a);
      const ib = orderedTags.indexOf(b);
      if (ia !== -1 && ib !== -1) return ia - ib;
      return a.localeCompare(b);
    });
    return keys.map(tag => ({
      tag,
      description: doc?.tags?.find(t => t.name === tag)?.description ?? '',
      items: map.get(tag) ?? []
    }));
  }, [filteredEndpoints, doc?.tags]);

  const handleInitGuestSession = async () => {
    setInitSessionBusy(true);
    try {
      const res = await fetch('/api/v1/chat/session', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: '{}'
      });
      if (res.ok) {
        const data = (await res.json()) as { session_id: string; control_version: number };
        setGuestInfo({ session_id: data.session_id, control_version: data.control_version });
      }
    } finally {
      setInitSessionBusy(false);
    }
  };

  const handleDownloadSpec = () => {
    if (!doc) return;
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lapbot-openapi-3.0.3.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyBaseUrl = () => {
    void navigator.clipboard.writeText(`${baseOrigin}/api/v1`);
    setCopiedBase(true);
    setTimeout(() => setCopiedBase(false), 1600);
  };

  if (loading) {
    return <RetroLoadingBar label="Đang tổng hợp sơ đồ đặc tả OpenAPI 3.0.3 từ Backend..." />;
  }

  if (error || !doc) {
    return (
      <WindowFrame title="API_DOCS // ERROR" accent="amber">
        <p>Không thể tải đặc tả API: {error}</p>
      </WindowFrame>
    );
  }

  return (
    <div className="api-docs-root">
      {/* 1. Hero Overview Window */}
      <WindowFrame
        title="LAPBOT.OS // API_SPECIFICATION"
        subtitle={`OPENAPI ${doc.openapi} · v${doc.info.version}`}
        accent="warm"
      >
        <div className="api-docs-hero-grid">
          <div className="api-docs-hero-copy">
            <h1>Đặc tả Kỹ thuật RESTful & SSE Streaming API</h1>
            <p>{doc.info.description}</p>

            <div className="api-docs-toolbar">
              <button
                type="button"
                className="api-docs-btn api-docs-btn-primary"
                onClick={handleDownloadSpec}
              >
                <IconDownload size={15} />
                <span>Tải OpenAPI JSON (Postman / Swagger)</span>
              </button>

              <a
                href="/api/v1/openapi.json"
                target="_blank"
                rel="noreferrer"
                className="api-docs-btn"
              >
                <IconExternalLink size={15} />
                <span>Xem Raw openapi.json</span>
              </a>

              <button
                type="button"
                className="api-docs-btn api-docs-btn-amber"
                disabled={initSessionBusy}
                onClick={() => void handleInitGuestSession()}
              >
                {initSessionBusy ? <IconSpinner size={14} /> : <IconZap size={15} />}
                <span>Khởi tạo Cookie Guest để Test ngay</span>
              </button>
            </div>

            {guestInfo && (
              <div className="api-docs-session-banner">
                <span>
                  Đã kích hoạt phiên <strong>lapbot_guest</strong>:{' '}
                  <code>{guestInfo.session_id}</code> (control_version ={' '}
                  <strong>{guestInfo.control_version}</strong>)
                </span>
                <span>Sẵn sàng test nhóm API Chat & Đặt hàng!</span>
              </div>
            )}
          </div>

          <div className="api-docs-metrics">
            <div className="api-docs-metric-card">
              <span className="api-docs-metric-label">
                <IconLayers size={13} />
                <span>Tổng số Endpoint</span>
              </span>
              <span className="api-docs-metric-value">
                {allEndpoints.length} API / {doc.tags?.length ?? 0} Phân hệ
              </span>
            </div>

            <div className="api-docs-metric-card">
              <span className="api-docs-metric-label">
                <IconShieldCheck size={13} />
                <span>Trạng thái Hệ thống</span>
              </span>
              <span className="api-docs-metric-value">
                {dbReady ? 'ONLINE · DB Ready' : 'DEGRADED'}
              </span>
            </div>

            <div className="api-docs-metric-card" style={{ gridColumn: '1 / -1' }}>
              <span className="api-docs-metric-label">
                <IconTerminalAdmin size={13} />
                <span>Base Endpoint URL</span>
              </span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px'
                }}
              >
                <span className="api-docs-metric-value">{baseOrigin}/api/v1</span>
                <button type="button" className="api-docs-btn" onClick={handleCopyBaseUrl}>
                  {copiedBase ? <IconCheck size={13} /> : <IconCopy size={13} />}
                  <span>{copiedBase ? 'Đã chép' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </WindowFrame>

      {/* 2. Architectural Standards & Protocol Reference */}
      <WindowFrame title="ARCHITECTURE_STANDARDS // GIAO THỨC & BẤT BIẾN HỆ THỐNG" accent="amber">
        <div className="api-docs-guide-tabs">
          <button
            type="button"
            className={`api-docs-guide-tab ${guideTab === 'auth' ? 'active' : ''}`}
            onClick={() => setGuideTab('auth')}
          >
            <IconShieldCheck size={15} />
            <span>1. Xác thực & Bảo mật</span>
          </button>
          <button
            type="button"
            className={`api-docs-guide-tab ${guideTab === 'cod' ? 'active' : ''}`}
            onClick={() => setGuideTab('cod')}
          >
            <IconTruckCod size={15} />
            <span>2. Giao dịch Đặt hàng COD</span>
          </button>
          <button
            type="button"
            className={`api-docs-guide-tab ${guideTab === 'sse' ? 'active' : ''}`}
            onClick={() => setGuideTab('sse')}
          >
            <IconSparkleAi size={15} />
            <span>3. Giao thức AI Streaming (SSE)</span>
          </button>
          <button
            type="button"
            className={`api-docs-guide-tab ${guideTab === 'errors' ? 'active' : ''}`}
            onClick={() => setGuideTab('errors')}
          >
            <IconBotCpu size={15} />
            <span>4. Quy ước Chung & Bảng Mã Lỗi</span>
          </button>
        </div>

        {guideTab === 'auth' && (
          <div className="api-docs-guide-grid">
            <div className="api-docs-info-card">
              <h3>
                <IconLock size={15} /> Ba lớp Phiên Cookie (HttpOnly + Secure)
              </h3>
              <ul>
                <li>
                  <code>lapbot_guest</code>: Phiên khách ẩn danh 30 ngày cho giỏ hàng, chat AI và
                  đặt COD không cần tài khoản.
                </li>
                <li>
                  <code>lapbot_member</code>: Phiên khách hàng thành viên (mật khẩu băm{' '}
                  <code>scrypt</code>
                  ), tự động đồng bộ lịch sử đơn vãng lai khi đăng nhập.
                </li>
                <li>
                  <code>lapbot_admin</code>: Phiên nhân sự nội bộ phân tách 2 cấp độ{' '}
                  <code>STAFF</code> (vận hành đơn, catalog, chat) và <code>SUPER_ADMIN</code> (quản
                  lý nhân sự, cấu hình AI & cửa hàng).
                </li>
              </ul>
            </div>

            <div className="api-docs-info-card">
              <h3>
                <IconShieldCheck size={15} /> Chống CSRF & Ràng buộc Schema Nghiêm ngặt
              </h3>
              <ul>
                <li>
                  Mọi phương thức thay đổi dữ liệu (<code>POST</code>, <code>PATCH</code>,{' '}
                  <code>PUT</code>, <code>DELETE</code>) bắt buộc có header{' '}
                  <code>Origin: {baseOrigin}</code>, nếu lệch trả về <code>403 INVALID_ORIGIN</code>
                  .
                </li>
                <li>
                  Tất cả JSON Schema đặt <code>additionalProperties: false</code> và{' '}
                  <code>coerceTypes: false</code> nhằm chặn đứng trường dữ liệu lạ ngay tại tầng
                  Fastify Ajv.
                </li>
              </ul>
            </div>
          </div>
        )}

        {guideTab === 'cod' && (
          <div className="api-docs-flow-steps">
            <div className="api-docs-flow-step">
              <span className="api-docs-flow-step-num">BƯỚC 1 · PREVIEW</span>
              <h4>POST /api/v1/orders/preview</h4>
              <p>
                Tạo báo giá nháp <code>PENDING_CONFIRMATION</code> giữ nguyên mức giá trong{' '}
                <strong>15 phút</strong> nhưng <strong>không khoá tồn kho</strong> (chống đầu cơ
                giam hàng ảo). Mỗi phiên giữ tối đa 1 báo giá hoạt động.
              </p>
            </div>
            <div className="api-docs-flow-step">
              <span className="api-docs-flow-step-num">BƯỚC 2 · ATOMIC CONFIRM</span>
              <h4>POST /api/v1/orders/:id/confirm</h4>
              <p>
                Khoá hàng tuần tự nghiêm ngặt (
                <code>chat_sessions → orders → laptops FOR SHARE → laptop_variants FOR UPDATE</code>
                ) tránh deadlock, kiểm tra hạn 15 phút, đối chiếu giá và trừ <code>stock - 1</code>{' '}
                nguyên tử.
              </p>
            </div>
            <div className="api-docs-flow-step">
              <span className="api-docs-flow-step-num">BƯỚC 3 · SAFE CANCEL</span>
              <h4>POST /api/v1/orders/:id/cancel</h4>
              <p>
                Nếu đơn đã xác nhận bị huỷ hợp lệ (bởi khách ở bước đầu hoặc bởi Admin), hệ thống
                hoàn trả tồn kho <strong>đúng 1 lần duy nhất</strong> ngay trong cùng giao dịch
                PostgreSQL.
              </p>
            </div>
          </div>
        )}

        {guideTab === 'sse' && (
          <div className="api-docs-guide-grid">
            <div className="api-docs-info-card">
              <h3>
                <IconSparkleAi size={15} /> Khung sự kiện SSE (POST /chat/message-stream)
              </h3>
              <ul>
                <li>
                  <code>event: start</code> — Cấp <code>turn_id</code> mở lượt phản hồi.
                </li>
                <li>
                  <code>event: text_delta</code> — Từng mảnh văn bản Markdown stream thời gian thực.
                </li>
                <li>
                  <code>event: widget</code> — Khối giao diện tương tác nhúng trực tiếp vào bong
                  bóng chat (<code>laptop_cards</code>, <code>laptop_spec</code>,{' '}
                  <code>address_form</code>, <code>handoff_notice</code>).
                </li>
                <li>
                  <code>event: done</code> / <code>event: error</code> — Đóng lượt stream an toàn.
                </li>
              </ul>
            </div>

            <div className="api-docs-info-card">
              <h3>
                <IconBotCpu size={15} /> Rào chắn 5 Tool AI & Cổng Handoff (control-gate)
              </h3>
              <ul>
                <li>
                  Mô hình LLM chỉ có quyền gọi 5 tool đọc/hiển thị UI (
                  <code>search_laptop_catalog</code>, <code>get_laptop_detail</code>,{' '}
                  <code>get_laptop_variants_and_stock</code>, <code>show_checkout_form</code>,{' '}
                  <code>escalate_to_human_agent</code>) — tuyệt đối không tự ý tạo/sửa đơn hay đọc
                  PII.
                </li>
                <li>
                  Khi khách bấm <em>Gặp nhân viên</em> hoặc Admin bấm <em>Claim</em>,{' '}
                  <code>control_version</code> tăng lên và ngắt luồng LLM ngay lập tức trong bộ nhớ.
                </li>
              </ul>
            </div>
          </div>
        )}

        {guideTab === 'errors' && (
          <div className="api-docs-table-wrap">
            <table className="api-docs-table">
              <thead>
                <tr>
                  <th>HTTP Status</th>
                  <th>Mã lỗi tiêu biểu (error.code)</th>
                  <th>Ý nghĩa & Cách xử lý phía Client</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code className="api-docs-code">400</code>
                  </td>
                  <td>
                    <code>VALIDATION_ERROR</code>, <code>INVALID_QUERY</code>,{' '}
                    <code>INVALID_CURSOR</code>
                  </td>
                  <td>
                    Payload thiếu trường bắt buộc, sai kiểu dữ liệu hoặc query không hợp lệ. Hiển
                    thị <code>error.field_errors</code> nếu có.
                  </td>
                </tr>
                <tr>
                  <td>
                    <code className="api-docs-code">401</code>
                  </td>
                  <td>
                    <code>UNAUTHORIZED</code>, <code>SESSION_REQUIRED</code>
                  </td>
                  <td>
                    Chưa đăng nhập hoặc cookie phiên đã hết hạn. Gọi lại tạo phiên hoặc đăng nhập.
                  </td>
                </tr>
                <tr>
                  <td>
                    <code className="api-docs-code">403</code>
                  </td>
                  <td>
                    <code>INVALID_ORIGIN</code>, <code>FORBIDDEN</code>
                  </td>
                  <td>
                    Sai header Origin CSRF hoặc tài khoản STAFF gọi tính năng chỉ dành cho
                    SUPER_ADMIN.
                  </td>
                </tr>
                <tr>
                  <td>
                    <code className="api-docs-code">409</code>
                  </td>
                  <td>
                    <code>OUT_OF_STOCK</code>, <code>QUOTE_EXPIRED</code>,{' '}
                    <code>REVISION_CONFLICT</code>, <code>CONTROL_VERSION_MISMATCH</code>
                  </td>
                  <td>
                    Xung đột nghiệp vụ đồng thời (hết hàng lúc chốt, quá 15 phút báo giá, hoặc dữ
                    liệu vừa được người khác cập nhật). Cần tải lại trạng thái mới nhất.
                  </td>
                </tr>
                <tr>
                  <td>
                    <code className="api-docs-code">429 / 503</code>
                  </td>
                  <td>
                    <code>RATE_LIMITED</code>, <code>AI_BUSY</code>, <code>AI_DISABLED</code>
                  </td>
                  <td>Vượt ngưỡng gọi API theo IP/Session hoặc hàng đợi 10 luồng AI đang đầy.</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </WindowFrame>

      {/* 3. Interactive Endpoint Explorer */}
      <div className="api-docs-explorer">
        <aside className="api-docs-sidebar">
          <WindowFrame title="FILTER & MODULES" compact>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="api-docs-search-wrap">
                <IconSearch size={15} />
                <input
                  type="search"
                  className="api-docs-search-input"
                  placeholder="Tìm URL, tên API, mô tả..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              <div className="api-docs-method-chips">
                {['ALL', 'GET', 'POST', 'PATCH', 'PUT', 'DELETE'].map(m => (
                  <button
                    key={m}
                    type="button"
                    className={`api-docs-chip ${methodFilter === m ? 'active' : ''}`}
                    onClick={() => setMethodFilter(m)}
                  >
                    {m === 'ALL' ? 'TẤT CẢ' : m}
                  </button>
                ))}
              </div>

              <select
                className="api-docs-select"
                value={authFilter}
                onChange={e => setAuthFilter(e.target.value)}
                aria-label="Lọc theo cấp quyền"
              >
                <option value="ALL">Quyền hạn: Tất cả ({allEndpoints.length})</option>
                <option value="PUBLIC">Chỉ API Công khai (Public)</option>
                <option value="CUSTOMER_GUEST">Khách / Thành viên (Session Cookie)</option>
                <option value="ADMIN">Quản trị viên (Admin / Super Admin)</option>
              </select>

              <div className="api-docs-tag-nav">
                <button
                  type="button"
                  className={`api-docs-tag-btn ${selectedTag === 'ALL' ? 'active' : ''}`}
                  onClick={() => setSelectedTag('ALL')}
                >
                  <span>Tất cả phân hệ</span>
                  <span className="api-docs-tag-count">{allEndpoints.length}</span>
                </button>
                {doc.tags?.map(t => (
                  <button
                    key={t.name}
                    type="button"
                    className={`api-docs-tag-btn ${selectedTag === t.name ? 'active' : ''}`}
                    onClick={() => setSelectedTag(t.name)}
                  >
                    <span>{t.name}</span>
                    <span className="api-docs-tag-count">{tagCounts.get(t.name) ?? 0}</span>
                  </button>
                ))}
              </div>
            </div>
          </WindowFrame>
        </aside>

        <div className="api-docs-groups">
          {groupedEndpoints.length === 0 ? (
            <WindowFrame title="KHÔNG TÌM THẤY ENDPOINT" accent="amber">
              <p style={{ margin: 0 }}>
                Không có API nào khớp với bộ lọc hiện tại. Hãy xoá từ khoá hoặc đặt lại bộ lọc
                phương thức.
              </p>
            </WindowFrame>
          ) : (
            groupedEndpoints.map(group => (
              <WindowFrame
                key={group.tag}
                title={group.tag.toUpperCase()}
                subtitle={`${group.items.length} ENDPOINTS`}
              >
                {group.description && <p className="api-docs-group-desc">{group.description}</p>}
                <div className="api-docs-endpoint-list">
                  {group.items.map(ep => (
                    <EndpointCard
                      key={ep.id}
                      endpoint={ep}
                      baseOrigin={baseOrigin}
                      components={doc.components?.schemas}
                    />
                  ))}
                </div>
              </WindowFrame>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
