import '@/styles/globals.css';
import { appWithTranslation } from 'next-i18next';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import type { NextComponentType, NextPageContext } from 'next';

const inter = Inter({ subsets: ['latin'] });

function App({ Component, pageProps }: AppProps) {
  return (
    <div className={inter.className}>
      {/* @ts-ignore */}
      <Toaster />
      {/* @ts-ignore */}
      <Component {...pageProps} />
    </div>
  );
}

export default appWithTranslation(App);
