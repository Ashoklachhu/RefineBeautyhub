-- Add discounted_price to services
-- When set, this is the actual selling price and the original `price` becomes the crossed-out compare-at price.

ALTER TABLE services
  ADD COLUMN IF NOT EXISTS discounted_price NUMERIC(10,2)
    CHECK (discounted_price IS NULL OR discounted_price >= 0);
