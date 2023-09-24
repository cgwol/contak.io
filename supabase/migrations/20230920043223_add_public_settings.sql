SET role TO postgres;

CREATE TABLE IF NOT EXISTS public.public_settings 
(
    id text PRIMARY KEY,
    value text NULL,
    created_at timestamptz NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.public_settings IS 'Stores public site wide settings such as api urls or public api keys';
