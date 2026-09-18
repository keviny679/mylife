import type { Metadata } from "next";
import { Lora } from "next/font/google";
import "./globals.css";
import { AudioProvider } from "@/lib/audio-context";
import { WeatherProvider } from "@/lib/weather-context";
import AudioPlayer from "@/components/AudioPlayer";
import NavDrawer from "@/components/NavDrawer";
import AtmosphereBackdrop from "@/components/AtmosphereBackdrop";
import { Analytics } from '@vercel/analytics/react'

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
});

export const metadata: Metadata = {
  title: "MyLife",
  description: "Your private space to reflect.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${lora.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <WeatherProvider>
          <AtmosphereBackdrop />
          <div className="relative z-10 min-h-screen">
            <AudioProvider>
              <NavDrawer />
              {children}
              <AudioPlayer />
            </AudioProvider>
          </div>
        </WeatherProvider>
        <Analytics />
      </body>
    </html>
  );
}
