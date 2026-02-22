-- clean all entries that have been tracked less than a minute
CREATE OR REPLACE PROCEDURE clean()
LANGUAGE plpgsql
AS $$

  BEGIN
    DELETE
    FROM tt.time_entry te
    WHERE te."end" IS NOT NULL
      AND EXTRACT(EPOCH FROM (te."end" - te.start)) < 60;
  END

$$