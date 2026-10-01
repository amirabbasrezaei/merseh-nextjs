import HeroMedia from "./HeroMedia";
import { SITE_NAME } from "@/utils/site";

export default function Hero() {
  return (
    <section aria-labelledby="home-hero-title">
      <h1 id="home-hero-title" className="sr-only">
        فروشگاه آنلاین آرایشی و مراقبت پوست {SITE_NAME}
      </h1>
      <HeroMedia />
    </section>
  );
}
