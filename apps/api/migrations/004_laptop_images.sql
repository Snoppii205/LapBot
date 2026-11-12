CREATE TABLE laptop_images (
  laptop_id uuid NOT NULL REFERENCES laptops(id) ON DELETE CASCADE,
  position integer NOT NULL CHECK (position >= 1),
  image_url text NOT NULL,
  caption text NOT NULL,
  PRIMARY KEY (laptop_id, position)
);
