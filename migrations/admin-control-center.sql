-- Additive extension to the Prisma-managed application schema.
-- Keep telemetry private: it is intentionally outside the public Data API.
CREATE SCHEMA IF NOT EXISTS trekly_admin;
REVOKE ALL ON SCHEMA trekly_admin FROM PUBLIC, anon, authenticated;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'USER';
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('USER', 'ADMIN'));
CREATE INDEX profiles_admin_created_idx ON public.profiles (created_at DESC, id);
CREATE INDEX profiles_admin_role_idx ON public.profiles (role, created_at DESC);

CREATE TABLE trekly_admin.tracking_config (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  started_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO trekly_admin.tracking_config (id) VALUES (true);

CREATE TABLE trekly_admin.activity_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX activity_events_time_user_idx ON trekly_admin.activity_events (created_at DESC, user_id);
CREATE INDEX activity_events_user_time_idx ON trekly_admin.activity_events (user_id, created_at DESC);

CREATE TABLE trekly_admin.operation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('API','ERROR','AUTH','SECURITY')),
  operation text NOT NULL,
  outcome text NOT NULL CHECK (outcome IN ('SUCCESS','FAILURE','DENIED')),
  status_code integer,
  duration_ms integer,
  user_id uuid,
  code text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX operation_events_category_time_idx ON trekly_admin.operation_events (category, created_at DESC);
CREATE INDEX operation_events_outcome_time_idx ON trekly_admin.operation_events (outcome, created_at DESC);
CREATE INDEX operation_events_time_idx ON trekly_admin.operation_events (created_at DESC, id);

CREATE TABLE trekly_admin.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  action text NOT NULL,
  target_id uuid,
  outcome text NOT NULL CHECK (outcome IN ('SUCCESS','DENIED')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_logs_time_idx ON trekly_admin.audit_logs (created_at DESC);
CREATE INDEX audit_logs_actor_time_idx ON trekly_admin.audit_logs (actor_id, created_at DESC);

ALTER TABLE trekly_admin.tracking_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE trekly_admin.activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE trekly_admin.operation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE trekly_admin.audit_logs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON ALL TABLES IN SCHEMA trekly_admin FROM PUBLIC, anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA trekly_admin FROM PUBLIC, anon, authenticated;

-- Every signup is USER, including inserts from trusted profile-sync triggers.
-- Only a trusted DB connection can subsequently promote an existing profile.
CREATE FUNCTION trekly_admin.guard_profile_role() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.role := 'USER';
  ELSIF NEW.role IS DISTINCT FROM OLD.role THEN
    IF current_user IN ('anon', 'authenticated') THEN
      RAISE EXCEPTION 'Profile role cannot be changed by a client' USING ERRCODE = '42501';
    END IF;
    INSERT INTO trekly_admin.audit_logs (action, target_id, outcome)
    VALUES ('DATABASE_ROLE_CHANGED_' || NEW.role, NEW.id, 'SUCCESS');
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION trekly_admin.guard_profile_role() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER guard_profile_role BEFORE INSERT OR UPDATE OF role ON public.profiles
FOR EACH ROW EXECUTE FUNCTION trekly_admin.guard_profile_role();

-- Existing RLS policies remain intact. Column grants also prevent escalation if
-- a future profile UPDATE policy is added. The trigger is defense in depth.
REVOKE INSERT, UPDATE ON public.profiles FROM PUBLIC, anon, authenticated;
GRANT INSERT (id, name, email, created_at, updated_at), UPDATE (name, email, updated_at)
ON public.profiles TO authenticated;
