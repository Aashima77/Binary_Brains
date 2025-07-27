import {
  Fira_Code as FontMono,
  Inter as FontSans,
  Roboto,
  Host_Grotesk,
} from "next/font/google";

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const fontRoboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const fontGrotesk = Host_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
});
