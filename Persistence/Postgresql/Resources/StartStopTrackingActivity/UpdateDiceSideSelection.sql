CREATE OR REPLACE PROCEDURE UpdateDiceSideSelection
(
  dSId int,
  un varchar(64)
)
LANGUAGE plpgsql
AS $$

  DECLARE timestamp timestamp with time zone = now() at time zone 'utc';

BEGIN

    -- start tracking a new activity
    IF NOT dSId = 0 THEN
      INSERT INTO time_entry
SELECT
  timestamp as "start",
  a.id as "fk_activity_id"
FROM users u
  INNER JOIN tt.activities a on u.id = a.fk_user_id
WHERE u.username = un AND a.side_id = dSId
;

END IF;

    -- stop tracking the previous active activity
UPDATE t
SET
  t."end" = timestamp
FROM users u
  INNER JOIN tt.activities a ON u.id = a.fk_user_id
  INNER JOIN tt.time_entry t on a.id = t.fk_activity_id
WHERE u.username = un AND t."end" IS null;
;
END;

$$;
