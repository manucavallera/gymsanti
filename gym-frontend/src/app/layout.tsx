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
      <body className={`${inter.className} text-white`}>
        <div
          className="fixed inset-0 -z-10"
          style={{
            backgroundImage: "url('/bg-dark.jpg'), url('/bg-pink.jpg')",
            backgroundSize: "50% 100%, 50% 100%",
            backgroundPosition: "left top, right top",
            backgroundRepeat: "no-repeat",
          }}
        />
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
