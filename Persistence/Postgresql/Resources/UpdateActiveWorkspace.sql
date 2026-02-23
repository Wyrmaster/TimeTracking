CREATE OR REPLACE FUNCTION update_active_workspace(
  workspace_id bigint,
  un varchar(64)
)
  RETURNS TABLE("ActivityId" bigint, "Timestamp" timestamp with time zone)
  LANGUAGE plpgsql
AS
$$

DECLARE
  timestamp      timestamp with time zone = now() at time zone 'utc';
  DECLARE sideId int;

BEGIN

  -- get the current active side id from the entries
  SELECT
      COALESCE(a.side_id, 0)
    INTO sideId
    FROM tt.users u
         INNER JOIN tt.workspace ws ON ws.id = u.active_workspace_id
         INNER JOIN tt.activities a ON a.workspace_id = ws.id
         INNER JOIN tt.time_entry t ON a.id = t.activity_id
  WHERE u.username = un
    AND t."end" IS null;

  CALL stop_tracking(un);

  -- set the new workspace id
  UPDATE tt.users AS u
      SET
        active_workspace_id = workspace_id
    WHERE u.username = un;

  -- start tracking the current active id in the new workspace
  IF NOT sideId = 0 THEN
    INSERT INTO tt.time_entry
      SELECT timestamp as "start",
             a.id      as "fk_activity_id"
      FROM tt.users u
             INNER JOIN tt.workspace ws ON ws.id = u.active_workspace_id
             INNER JOIN tt.activities a ON ws.id = a.workspace_id
      WHERE u.username = un
        AND a.side_id = sideId;

  END IF;

  RETURN QUERY
    SELECT *
      FROM
      (
        SELECT
            COALESCE(a.id, CAST(0 AS bigint)) AS "ActivityId",
            timestamp AS "Timestamp"
          FROM tt.users u
            INNER JOIN tt.workspace ws ON ws.id = u.active_workspace_id
            INNER JOIN tt.activities a ON a.workspace_id = ws.id
            INNER JOIN tt.time_entry t ON a.id = t.activity_id
          WHERE u.username = un AND t."end" IS NULL
            
          UNION
            
          SELECT  CAST(0 AS bigint) AS "ActivityId", timestamp AS "Timestamp"
      ) as _
      LIMIT 1;

END;

$$
