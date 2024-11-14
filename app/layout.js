import localFont from "next/font/local";
import "./globals.css";
import Navbar from "./components/Navbar/Navbar";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Price Wice",
  description: "Stay up to date with the latest price of products. Enter the URL of any online product and recieve an email whenever the price changes",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} >
        <Navbar/> 
        {children}
      </body>
    </html>
  );
}
