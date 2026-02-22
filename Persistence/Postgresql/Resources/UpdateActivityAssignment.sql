CREATE OR REPLACE PROCEDURE update_activity_assignment
(
  dSId int,
  un varchar(64)
)
LANGUAGE plpgsql
AS $$
       
  BEGIN

    UPDATE tt.activities a
      SET
        side_id = sideId
        FROM tt.time_entry te
          INNER JOIN tt.workspace w on w.id = a.workspace_id
        INNER JOIN tt.users u on u.id = w.fk_user_id
      WHERE u.username = un && te."end" IS NULL
    ;
  
  END;

$$
