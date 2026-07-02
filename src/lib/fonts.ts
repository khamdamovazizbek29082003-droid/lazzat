import { Unbounded, Inter } from "next/font/google";

/** Wordmark + headings. */
export const displayFont = Unbounded({ subsets: ["latin"], weight: ["500", "600", "700"] });

/** Body copy — applied on <body>. */
export const bodyFont = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });
