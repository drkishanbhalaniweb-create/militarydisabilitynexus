import { Html, Head, Main, NextScript } from 'next/document';
import { META_PIXEL_ID } from '../src/lib/metaPixel';

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                <link rel="icon" href="/favicon.ico" />

                {/* Preconnect for Performance */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />

                {/* Fonts */}
                {/* Fonts */}
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Outfit:wght@100..900&family=EB+Garamond:ital,wght@0,400..800;1,400..800&family=Merriweather:ital,wght@0,300..900;1,300..900&family=Lora:ital,wght@0,400..700;1,400..700&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />

                {/* Google Search Console Verification */}
                <meta name="google-site-verification" content="O8eemG4oLRin5DFXB3gsTulQUCBYBSI2kpSK33frjTg" />

                {/* Global Google Tag (Google Ads + GA4) */}
                <script async src="https://www.googletagmanager.com/gtag/js?id=AW-17752607391"></script>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            window.dataLayer = window.dataLayer || [];
                            function gtag(){dataLayer.push(arguments);}
                            gtag('js', new Date());
                            gtag('config', 'AW-17752607391');
                            gtag('config', 'G-QHR9W0GZ8R');
                        `,
                    }}
                />
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
