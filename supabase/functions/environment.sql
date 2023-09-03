CREATE OR REPLACE FUNCTION contak.environment() 
RETURNS TABLE(name text, supabase_project_ref character varying, public_supabase_url text, public_supabase_rest_url text, public_supabase_api_key text)
LANGUAGE plpgsql
IMMUTABLE PARALLEL SAFE
AS $$
  DECLARE supabase_project_ref VARCHAR(32) = 'ontjcsevddaxmnnzjfqb';
  BEGIN
  -- go to https://supabase.com/dashboard/project/${supabase_project_ref}/settings/api for this information
  -- columns prefixes with PUBLIC will be accessible to the web client through process.env.{{COLUMN_NAME}}, Google 'vite environment variables' for more details.
  RETURN QUERY SELECT
    'production' AS name,
    supabase_project_ref,
    'https://' || supabase_project_ref || '.supabase.co' AS public_supabase_url,
    'https://' || supabase_project_ref || '.supabase.co/rest/v1' AS public_supabase_rest_url,
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9udGpjc2V2ZGRheG1ubnpqZnFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODI0NTg1NTYsImV4cCI6MTk5ODAzNDU1Nn0.Ht278TSBKvkYNs9v50VM2Ub_Ez8Paq34hEM96mA4Rks' AS public_supabase_api_key
  FROM (VALUES ('')) AS _;
  END;
$$;

REVOKE EXECUTE ON FUNCTION contak.environment() FROM authenticated, PUBLIC;

