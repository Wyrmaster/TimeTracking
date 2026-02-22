CREATE OR REPLACE FUNCTION update_dice_side_selection
(
  dSId int,
  un varchar(64)
)
RETURNS TABLE("ActivityId" bigint, "Timestamp" timestamp with time zone)
LANGUAGE plpgsql
AS $$

  DECLARE timestamp timestamp with time zone = now() at time zone 'utc';
  DECLARE activityId bigint = 0;

  BEGIN

    CALL stop_tracking(un);
    
    -- start tracking a new activity
    IF NOT dSId = 0 THEN
    
      SELECT a.id
        INTO activityId
        FROM tt.users u
          INNER JOIN tt.workspace ws ON ws.id = u.active_workspace_id
          INNER JOIN tt.activities a ON ws.id = a.workspace_id
        WHERE u.username = un AND a.side_id = dSId
      ;
      
      IF activityid IS NULL THEN
        RETURN QUERY SELECT CAST(0 AS bigint) AS "ActivityId", timestamp AS "Timestamp";
      
      ELSE
        INSERT INTO tt.time_entry (description, start, activity_id)
          VALUES('', timestamp, activityId)
        ;
      
        RETURN QUERY SELECT activityId AS "ActivityId", timestamp AS "Timestamp";
      END IF;
      
    ELSE
      
    RETURN QUERY SELECT CAST(0 AS bigint) AS "ActivityId", timestamp AS "Timestamp";
    
    END IF;

END;

$$
