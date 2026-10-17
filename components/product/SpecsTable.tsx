import type { Spec } from "@/lib/specs";

/** The product's specs as a two-column table; renders nothing when there are none. */
export default function SpecsTable({ specs }: { specs: Spec[] }) {
  if (specs.length === 0) return null;
  return (
    <table className="w-full text-sm">
      <caption className="sr-only">Caractéristiques</caption>
      <tbody>
        {specs.map((s, i) => (
          <tr key={i} className="border-b border-outline-variant last:border-b-0">
            <th scope="row" className="py-2.5 pr-4 text-left font-normal text-secondary align-top w-2/5">
              {s.label}
            </th>
            <td className="py-2.5 text-on-surface">{s.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
