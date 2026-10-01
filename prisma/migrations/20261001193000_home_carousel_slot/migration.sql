-- Place is chosen in the page by matching HomeCarousel.slot to a component id.
ALTER TABLE "HomeCarousel" ADD COLUMN "slot" TEXT;

WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "sortOrder" ASC, id ASC) AS rn
  FROM "HomeCarousel"
)
UPDATE "HomeCarousel" AS carousel
SET "slot" = CASE ranked.rn
  WHEN 1 THEN 'after-categories'
  WHEN 2 THEN 'after-brands'
  ELSE 'extra-' || ranked.rn::text
END
FROM ranked
WHERE carousel.id = ranked.id;

ALTER TABLE "HomeCarousel" ALTER COLUMN "slot" SET NOT NULL;

CREATE UNIQUE INDEX "HomeCarousel_slot_key" ON "HomeCarousel"("slot");

DROP INDEX "HomeCarousel_isActive_sortOrder_idx";

CREATE INDEX "HomeCarousel_isActive_idx" ON "HomeCarousel"("isActive");

ALTER TABLE "HomeCarousel" DROP COLUMN "sortOrder";
