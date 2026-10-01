import { carouselCardWidthClass, carouselGapClass } from "./cardWidth";

export default function CarouselSkeleton() {
  return (
    <div className="flex w-full flex-col gap-8 md:gap-10" aria-hidden>
      <div className="flex flex-col gap-3 border-b border-hairline pb-5">
        <div className="h-3 w-24 animate-pulse rounded-full bg-blush-100" />
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 animate-pulse rounded-xl bg-blush-200 md:h-9 md:w-9" />
          <div className="h-7 w-48 animate-pulse rounded-full bg-blush-100" />
        </div>
      </div>
      <div className={`no-scrollbar flex overflow-hidden ${carouselGapClass}`}>
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className={carouselCardWidthClass}>
            <div className="aspect-square w-full animate-pulse rounded-tile bg-ivory" />
            <div className="flex flex-col gap-2 px-1 pt-4">
              <div className="h-3 w-1/4 animate-pulse rounded-full bg-blush-100" />
              <div className="h-4 w-full animate-pulse rounded-full bg-blush-100" />
              <div className="h-4 w-2/3 animate-pulse rounded-full bg-blush-100" />
              <div className="mt-1 h-5 w-1/3 animate-pulse rounded-full bg-blush-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
