-- Add discounted_price to academy_courses
-- When set, this is the actual selling price and `price` becomes the crossed-out compare-at price.

ALTER TABLE academy_courses
  ADD COLUMN IF NOT EXISTS discounted_price NUMERIC(10,2)
    CHECK (discounted_price IS NULL OR discounted_price >= 0);
