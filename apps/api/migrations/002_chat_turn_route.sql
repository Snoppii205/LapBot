ALTER TABLE chat_turns ADD COLUMN IF NOT EXISTS route_control_mode text;
ALTER TABLE chat_turns ADD COLUMN IF NOT EXISTS route_needs_human boolean;

UPDATE chat_turns t SET route_control_mode=s.control_mode,route_needs_human=s.needs_human
FROM chat_sessions s WHERE t.session_id=s.id AND (t.route_control_mode IS NULL OR t.route_needs_human IS NULL);

ALTER TABLE chat_turns ALTER COLUMN route_control_mode SET NOT NULL;
ALTER TABLE chat_turns ALTER COLUMN route_needs_human SET NOT NULL;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='chat_turns_route_control_mode_check') THEN
    ALTER TABLE chat_turns ADD CONSTRAINT chat_turns_route_control_mode_check CHECK (route_control_mode IN ('AI','AGENT'));
  END IF;
END $$;
