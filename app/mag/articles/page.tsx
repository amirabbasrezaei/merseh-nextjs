import MagLayout from "@/Components/Layout/MagLayout";
import Articles from "@/Components/Mag/Articles/Articles";

export const revalidate = 3600;
export default function page() {
  return (
    <MagLayout>
      <Articles />
    </MagLayout>
  );
}
