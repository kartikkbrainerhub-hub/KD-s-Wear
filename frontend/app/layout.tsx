import type { Metadata } from "next";
import "@/app/globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "KD's Wear | Premium Custom Streetwear Designer",
  description: "Create, customize, and order premium 240GSM boxy drop-shoulder streetwear shirts with live fabric customization engines, text builders, and secure checkouts.",
  keywords: "custom streetwear, custom t-shirt printing, t-shirt design tool, oversized tees, Razorpay payment",
  authors: [{ name: "KD's Wear" }]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;700;900&family=Montserrat:wght@400;700;900&family=Raleway:wght@400;700&family=Oswald:wght@400;700&family=Bebas+Neue&family=Anton&family=Teko:wght@400;700&family=Playfair+Display:ital,wght@0,700;1,400&family=Cinzel:wght@400;700;900&family=Italiana&family=Cormorant+Garamond:ital,wght@0,400;1,400&family=IM+Fell+English:ital,wght@0,400;1,400&family=Cinzel+Decorative:wght@400;700&family=MedievalSharp&family=Permanent+Marker&family=Pacifico&family=Dancing+Script:wght@700&family=Space+Mono:wght@400;700&family=Share+Tech+Mono&family=Exo+2:wght@400;700&family=Rajdhani:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen flex flex-col bg-[#faf8f5] text-zinc-900 selection:bg-[#7a1c27] selection:text-white">
        {/* Global Navigation Header */}
        <Navbar />
        
        {/* Main Content Workspace */}
        <div className="flex-grow flex flex-col">
          {children}
        </div>
        
        {/* Global Brand Footer Directory */}
        <Footer />
      </body>
    </html>
  );
}
