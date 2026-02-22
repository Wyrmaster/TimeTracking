CREATE OR REPLACE PROCEDURE stop_tracking
(
  un varchar(64)
)
LANGUAGE plpgsql
AS $$

  DECLARE timestamp timestamp with time zone = now() at time zone 'utc';

  BEGIN
      
    -- stop tracking the previous active activity
    UPDATE tt.time_entry AS t
      SET
        "end" = timestamp
      FROM tt.users u
        INNER JOIN tt.workspace ws ON ws.id = u.active_workspace_id
        INNER JOIN tt.activities a ON a.workspace_id = ws.id
      WHERE a.id = t.activity_id AND u.username = un AND t."end" IS null
    ;

    CALL clean();
  
  END;

$$
