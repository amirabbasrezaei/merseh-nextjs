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

export function SpecHighlights({ rows }: { rows: SpecRow[] }) {
  const items = rows.slice(0, 4);
  if (!items.length) return null;

  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
      {items.map((row, index) => (
        <div key={`${row.label}-${index}`} className="flex min-w-0 flex-col gap-0.5">
          <dt className="text-caption text-lightBlack">
            {row.value ? row.label : "ویژگی"}
          </dt>
          <dd className="text-small font-medium text-plum-900">
            {row.value ?? row.label}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default function ProductSpecs({ rows }: { rows: SpecRow[] }) {
  if (!rows.length) return null;

  return (
    <div className="rounded-panel bg-ivory px-5 py-1 sm:px-8">
      <dl>
        {rows.map((row, index) => (
          <div
            key={`${row.label}-${index}`}
            className="grid grid-cols-1 gap-1 border-b border-hairline py-3.5 last:border-b-0 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] sm:items-baseline sm:gap-6"
          >
            {row.value ? (
              <>
                <dt className="text-caption text-lightBlack">{row.label}</dt>
                <dd className="text-small text-plum-900">{row.value}</dd>
              </>
            ) : (
              <dd className="text-small text-plum-900 sm:col-span-2">{row.label}</dd>
            )}
          </div>
        ))}
      </dl>
    </div>
  );
}
