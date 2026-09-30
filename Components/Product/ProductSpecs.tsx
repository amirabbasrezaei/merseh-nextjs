export type SpecRow = {
  label: string;
  value: string | null;
};

export function parseDetails(details: string[]): SpecRow[] {
  return details.map((line) => {
    const separator = line.search(/[:：]/);
    if (separator < 0) return { label: line.trim(), value: null };

    const label = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    if (!label || !value) return { label: line.trim(), value: null };
    return { label, value };
  });
}

export default function ProductSpecs({ rows }: { rows: SpecRow[] }) {
  if (!rows.length) return null;

  return (
    <dl className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
      {rows.map((row, index) => (
        <div
          key={`${row.label}-${index}`}
          className={
            row.value
              ? "flex flex-col gap-0.5 border-b border-[#f0f0f0] py-2.5"
              : "flex flex-col gap-0.5 border-b border-[#f0f0f0] py-2.5 sm:col-span-2"
          }
        >
          {row.value ? (
            <>
              <dt className="text-[13px] text-lightBlack">{row.label}</dt>
              <dd className="text-[15px] text-black1">{row.value}</dd>
            </>
          ) : (
            <dd className="text-[15px] text-black1">{row.label}</dd>
          )}
        </div>
      ))}
    </dl>
  );
}
