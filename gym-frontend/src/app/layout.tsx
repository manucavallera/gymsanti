import "./globals.css";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/lib/auth";
import { CartProvider } from "@/lib/cart";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "GYM CORE",
  description: "Tu centro de entrenamiento personalizado",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} bg-zinc-950 text-white`}>
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
