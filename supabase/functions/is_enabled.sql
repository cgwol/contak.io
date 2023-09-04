
CREATE OR REPLACE FUNCTION contak.is_enabled(i_config_parameter text)
RETURNS boolean
LANGUAGE SQL
AS $$ 
  SELECT coalesce(current_setting(i_config_parameter, true), 'off') = 'on';
$$;
