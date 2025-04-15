// Use client-side logic after this
'use client';

import { Provider } from 'react-redux'; 
import { store } from '../redux/store'; 
import { metadata } from './metadata';
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import ReduxProvider from '@/redux/ReduxProvider';

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} mb-20`}>
        <ReduxProvider>
          <Toaster />
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
