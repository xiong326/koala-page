ALTER TABLE koalas ADD COLUMN tags TEXT;

UPDATE koalas
SET tags = nicknames
WHERE tags IS NULL
  AND nicknames IS NOT NULL;
