import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html lang="en" data-scroll-behavior="smooth">
            <Head>
                <link rel="icon" href="/favicon.ico" />
                {/* Add any other global head tags here */}
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
