import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GolfCharity — Play Golf, Change Lives",
  description:
    "Join the UK's premier golf charity subscription platform. Play golf, enter monthly prize draws, and support your favourite charity. ₹2999/month.",
  keywords: "golf, charity, subscription, prize draw, golf scores, donate",
  openGraph: {
    title: "GolfCharity — Play Golf, Change Lives",
    description: "Monthly prize draws for golfers. 10% goes to charity.",
    type: "website",
  },
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
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

