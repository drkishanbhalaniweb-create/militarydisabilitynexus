import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                <link rel="icon" href="/favicon.ico" />

                {/* Preconnect for Performance */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />

                {/* Fonts */}
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />

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
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
