import Head from 'next/head';
import Script from 'next/script';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import posthog from 'posthog-js';
import { Toaster } from 'sonner';
import '../src/index.css';
import '../src/App.css';

// We keep the old CSS imports for now to minimize breakage.
// Ideally, we move these to styles/globals.css later.

function MyApp({ Component, pageProps }) {
    const router = useRouter();

    useEffect(() => {
        // Initialize PostHog
        posthog.init('phc_yJW1VjHGGwmCbbrtczfqqNxgBDbhlhOWcdzcIJEOTFE', {
            api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
            person_profiles: 'identified_only', // or 'always' to create profiles for anonymous users as well
            loaded: (posthog) => {
                if (process.env.NODE_ENV === 'development') posthog.debug();
            },
        });

        const handleRouteChange = () => posthog?.capture('$pageview');

        // Track page views
        router.events.on('routeChangeComplete', handleRouteChange);

        return () => {
            router.events.off('routeChangeComplete', handleRouteChange);
        };
    }, [router.events]);

    // Use a custom layout if the page component defines one
    const getLayout = Component.getLayout || ((page) => page);

    return getLayout(
        <>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            {/* Google Analytics - GTM */}
            <Script
                src="https://www.googletagmanager.com/gtag/js?id=G-QHR9W0GZ8R"
                strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', 'G-QHR9W0GZ8R');
                `}
            </Script>

            {/* Reddit Pixel */}
            <Script id="reddit-pixel" strategy="afterInteractive">
                {`
                !function(w,d){if(!w.rdt){var p=w.rdt=function(){p.sendEvent?p.sendEvent.apply(p,arguments):p.callQueue.push(arguments)};p.callQueue=[];var t=d.createElement("script");t.src="https://www.redditstatic.com/ads/pixel.js",t.async=!0;var s=d.getElementsByTagName("script")[0];s.parentNode.insertBefore(t,s)}}(window,document);
                rdt('init','a2_i2eauxejgsxp');
                rdt('track', 'PageVisit');
                `}
            </Script>

            <Toaster position="top-right" richColors />
            <Component {...pageProps} />
        </>
    );
}

export default MyApp;
