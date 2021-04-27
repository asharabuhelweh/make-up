DROP TABLE IF EXISTS make;
CREATE TABLE make(
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE,
  price TEXT,
  image TEXT,
  description TEXT
);
