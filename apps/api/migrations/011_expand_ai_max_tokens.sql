-- Expand AI max tokens limit from 1200 to 4096 and raise runtime defaults to prevent truncation on detailed comparisons
ALTER TABLE ai_settings
  DROP CONSTRAINT IF EXISTS ai_settings_max_tokens_per_call_check;

ALTER TABLE ai_settings
  ALTER COLUMN max_tokens_per_call SET DEFAULT 3600,
  ALTER COLUMN turn_timeout_ms SET DEFAULT 45000,
  ADD CONSTRAINT ai_settings_max_tokens_per_call_check
    CHECK (max_tokens_per_call BETWEEN 128 AND 4096);

UPDATE ai_settings
  SET max_tokens_per_call = GREATEST(max_tokens_per_call, 3600),
      turn_timeout_ms = GREATEST(turn_timeout_ms, 45000)
  WHERE id = 1;
