import { Inter, Outfit, Space_Grotesk, Playfair_Display, Poppins } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${inter.variable} ${poppins.variable} ${outfit.variable} ${spaceGrotesk.variable} ${playfair.variable}`}
    >
      {children}
    </div>
  );
}
