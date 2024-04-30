import type { Metadata } from "next";
import "./globals.css";
import TRPC_Provider from "@/Components/TRPC_Provider";







export const metadata: Metadata = {
  title: "Merseh",
  description: "محصولات ارگانیک مرسه",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="rtl">
      <body className={`overflow-x-hidden bg-white `} >
        <TRPC_Provider>{children}</TRPC_Provider>
        {/* <Footer /> */}
      </body>
    </html>
  );
}
