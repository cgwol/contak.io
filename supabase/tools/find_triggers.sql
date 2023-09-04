SELECT FORMAT('%s %s ON %s.%s FOR EACH %s %s', action_timing, event_manipulation, event_object_schema, event_object_table, action_orientation, action_statement), 
* FROM information_schema.triggers
WHERE action_statement LIKE '%soft_delete_parent_row%'