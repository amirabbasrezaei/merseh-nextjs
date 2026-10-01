import type { Metadata } from "next";
import Layout from "@/Components/Layout/Layout";
import PaymentResult from "@/Components/Payment/PaymentResult";

export const metadata: Metadata = {
  title: "نتیجه پرداخت",
  robots: { index: false, follow: false },
};

type SearchParams = Record<string, string | string[] | undefined>;

/** The gateway sometimes returns HTML-escaped separators, e.g. `&amp;trackId=`. */
function readParam(params: SearchParams, key: string) {
  const value = params[key] ?? params[`amp;${key}`];
  return (Array.isArray(value) ? value[0] : value) ?? null;
}

export default async function PaymentPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  return (
    <Layout footer={false}>
      <PaymentResult trackId={readParam(params, "trackId")} />
    </Layout>
  );
}
