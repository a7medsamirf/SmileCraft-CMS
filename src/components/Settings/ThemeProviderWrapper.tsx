"use client"; // Ensures this runs on the client side

import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import { AnimatePresence } from "framer-motion";

export default function ThemeProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system">
      <AnimatePresence mode="wait">
        {children}
      </AnimatePresence>
      <Toaster position="top-center" reverseOrder={false}  toastOptions={{duration: 5000}}  />
    </ThemeProvider>
  );
}
