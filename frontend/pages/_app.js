import Head from 'next/head';
import { Toaster } from 'sonner';
import '../src/index.css';
import '../src/App.css';

// We keep the old CSS imports for now to minimize breakage.
// Ideally, we move these to styles/globals.css later.

function MyApp({ Component, pageProps }) {
    // Use a custom layout if the page component defines one
    const getLayout = Component.getLayout || ((page) => page);

    return getLayout(
        <>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <Toaster position="top-right" richColors />
            <Component {...pageProps} />
        </>
    );
}

export default MyApp;
