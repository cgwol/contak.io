
DROP FUNCTION IF EXISTS contak.login_as_user(i_username text);
CREATE OR REPLACE FUNCTION contak.login_as_user(i_username text)
RETURNS uuid
LANGUAGE 'plpgsql' 
AS $$ 
DECLARE user_id uuid = (SELECT user_id FROM contak.users WHERE username = i_username);
BEGIN
  IF user_id IS NULL THEN 
    RAISE EXCEPTION 'Cannot login as user "%" because they do not exists', i_username;
  END IF;
  EXECUTE 'SET request.jwt.claim.sub TO ' || quote_literal(user_id);
  SET role TO authenticated;
  RETURN user_id;
END;$$;

REVOKE ALL ON FUNCTION contak.login_as_user(i_username text) FROM authenticated, PUBLIC;

COMMENT ON FUNCTION contak.login_as_user(i_username text) IS 'Mocks logging in as a user from contak.users table. Only use for development purposes.';