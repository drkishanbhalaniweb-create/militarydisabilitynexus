import { Html, Head, Main, NextScript } from 'next/document';
import { META_PIXEL_ID } from '../src/lib/metaPixel';

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                <link rel="icon" href="/favicon.ico" />

                {/* Google Search Console Verification */}
                <meta name="google-site-verification" content="O8eemG4oLRin5DFXB3gsTulQUCBYBSI2kpSK33frjTg" />
            </Head>
            <body>
                <noscript>
                    <img
                        height="1"
                        width="1"
                        style={{ display: 'none' }}
                        src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
                        alt=""
                    />
                </noscript>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
