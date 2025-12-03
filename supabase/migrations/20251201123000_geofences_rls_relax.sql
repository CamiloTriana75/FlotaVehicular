-- Relax RLS to allow anon (frontend without Supabase session)
-- Date: 2025-12-01 12:30

-- Drop existing policies if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='geofences' AND policyname='geofences_select') THEN
    DROP POLICY geofences_select ON public.geofences;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='geofence_state' AND policyname='geofence_state_select') THEN
    DROP POLICY geofence_state_select ON public.geofence_state;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='geofence_events' AND policyname='geofence_events_select') THEN
    DROP POLICY geofence_events_select ON public.geofence_events;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='geofences' AND policyname='geofences_write') THEN
    DROP POLICY geofences_write ON public.geofences;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='geofences' AND policyname='geofences_update') THEN
    DROP POLICY geofences_update ON public.geofences;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='geofence_events' AND policyname='geofence_events_insert') THEN
    DROP POLICY geofence_events_insert ON public.geofence_events;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='geofence_state' AND policyname='geofence_state_upsert') THEN
    DROP POLICY geofence_state_upsert ON public.geofence_state;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='geofence_state' AND policyname='geofence_state_update') THEN
    DROP POLICY geofence_state_update ON public.geofence_state;
  END IF;
END$$;

-- Recreate permissive policies for anon and authenticated
CREATE POLICY geofences_select ON public.geofences
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY geofences_write ON public.geofences
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY geofences_update ON public.geofences
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY geofence_state_select ON public.geofence_state
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY geofence_state_upsert ON public.geofence_state
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY geofence_state_update ON public.geofence_state
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY geofence_events_select ON public.geofence_events
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY geofence_events_insert ON public.geofence_events
  FOR INSERT TO anon, authenticated WITH CHECK (true);
