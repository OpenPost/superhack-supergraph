'use client';

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import '@farcaster/auth-kit/styles.css';
import { AuthKitProvider } from '@farcaster/auth-kit';
import { SignInButton } from '@farcaster/auth-kit';
const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "Create Next App",
//   description: "Generated by create next app",
// };

const config = {
  rpcUrl: 'https://mainnet.optimism.io',
  domain: 'localhost:3000',
  siweUri: 'http://localhost:3000/',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthKitProvider config={config}>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </AuthKitProvider>

  );
}


