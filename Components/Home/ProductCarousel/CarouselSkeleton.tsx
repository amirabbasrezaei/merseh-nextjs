import { carouselCardWidthClass } from "./cardWidth";

export default function CarouselSkeleton() {
  return (
    <div className="flex w-full flex-col gap-6" aria-hidden>
      <div className="h-6 w-40 animate-pulse rounded-card bg-hover1" />
      <div className="no-scrollbar flex gap-3 overflow-hidden sm:gap-4">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className={carouselCardWidthClass}>
            <div className="rounded-card border border-line bg-white p-4 shadow-card">
              <div className="aspect-square w-full animate-pulse bg-hover1" />
              <div className="mt-3 h-4 w-full animate-pulse rounded-card bg-hover1" />
              <div className="mt-2 h-4 w-2/3 animate-pulse rounded-card bg-hover1" />
              <div className="mt-3 h-4 w-1/3 animate-pulse rounded-card bg-hover1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
