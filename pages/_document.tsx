import { Html, Head, Main, NextScript, DocumentProps } from 'next/document';
import i18nextConfig from '../next-i18next.config';

type Props = DocumentProps & {
  // add custom document props
};

export default function Document(props: Props) {
  const currentLocale =
    props.__NEXT_DATA__.locale ?? i18nextConfig.i18n.defaultLocale;
  return (
    // @ts-ignore
    <Html lang={currentLocale}>
      {/* @ts-ignore */}
      <Head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="WiseBuddy"></meta>
      </Head>
      <body>
        {/* @ts-ignore */}
        <Main />
        {/* @ts-ignore */}
        <NextScript />
      </body>
    </Html>
  );
}
