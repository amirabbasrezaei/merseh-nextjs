import { Truck_Courier_SVG } from "../SVGS";

const VALUE_PROPS = [
  { label: "ارسال با پیک و پست", icon: true },
  // PLACEHOLDER: not a published store policy
  { label: "PLACEHOLDER", icon: false },
  // PLACEHOLDER: not a published store policy
  { label: "PLACEHOLDER", icon: false },
] as const;

export default function ValueProps() {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {VALUE_PROPS.map((item, index) => (
        <li
          key={`${item.label}-${index}`}
          className="flex items-center justify-center gap-3 rounded-card border border-line bg-white px-4 py-4 text-small text-black1"
        >
          {item.icon ? (
            <Truck_Courier_SVG classname="h-6 w-6 shrink-0 fill-green2" />
          ) : null}
          {item.label}
        </li>
      ))}
    </ul>
  );
}
