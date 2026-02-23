CREATE OR REPLACE FUNCTION start_tracking
(
  un varchar(64),
  a_id bigint,
  des varchar(256)
)
RETURNS TABLE(activityId bigint, "timestamp" timestamp with time zone)
LANGUAGE plpgsql
AS $$

  DECLARE startTrackingTimestamp timestamp with time zone = now() at time zone 'utc';

  BEGIN

    CALL stop_tracking(un);
    
    -- start tracking an activity
    INSERT INTO tt.time_entry (description, start, activity_id)
      VALUES (des, startTrackingTimestamp, a_id)
    ;

    RETURN QUERY SELECT a_id as "ActivityId", startTrackingTimestamp AS "Timestamp";
  
  END;

$$
