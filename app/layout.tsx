import "./globals.css";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import NavBars from "@/app/ui/nav";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "NeuraRoom",
  description: "Made by Tracy and Junling",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="overflow-y-hidden">
        <Providers>
          <div className=" flex h-screen flex-col">
            <div className="bg-black nav-container px-6 pt-4">
              <NavBars />
            </div>
            <div className="dark flex-grow p-6 md:overflow-y-auto md:p-6">
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
