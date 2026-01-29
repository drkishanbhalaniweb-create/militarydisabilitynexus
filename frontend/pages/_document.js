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

                {/* Google tag (gtag.js) */}
                <script async src="https://www.googletagmanager.com/gtag/js?id=G-QHR9W0GZ8R"></script>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', 'G-QHR9W0GZ8R');
                        `,
                    }}
                />

                {/* Reddit Pixel */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                        !function(w,d){if(!w.rdt){var p=w.rdt=function(){p.sendEvent?p.sendEvent.apply(p,arguments):p.callQueue.push(arguments)};p.callQueue=[];var t=d.createElement("script");t.src="https://www.redditstatic.com/ads/pixel.js",t.async=!0;var s=d.getElementsByTagName("script")[0];s.parentNode.insertBefore(t,s)}}(window,document);
                        rdt('init','a2_i2eauxejgsxp');
                        rdt('track', 'PageVisit');
                        `,
                    }}
                />
            </Head>
            <body>
                <Main />
                <NextScript />
                {/* PostHog Analytics */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                        !(function (t, e) {
                            var o, n, p, r;
                            e.__SV ||
                                ((window.posthog = e),
                                (e._i = []),
                                (e.init = function (i, s, a) {
                                    function g(t, e) {
                                        var o = e.split(".");
                                        2 == o.length && ((t = t[o[0]]), (e = o[1])),
                                            (t[e] = function () {
                                                t.push(
                                                    [e].concat(
                                                        Array.prototype.slice.call(
                                                            arguments,
                                                            0,
                                                        ),
                                                    ),
                                                );
                                            });
                                    }
                                    ((p = t.createElement("script")).type =
                                        "text/javascript"),
                                        (p.crossOrigin = "anonymous"),
                                        (p.async = !0),
                                        (p.src =
                                            s.api_host.replace(
                                                ".i.posthog.com",
                                                "-assets.i.posthog.com",
                                            ) + "/static/array.js"),
                                        (r =
                                            t.getElementsByTagName(
                                                "script",
                                                )[0]).parentNode.insertBefore(p, r);
                                    var u = e;
                                    for (
                                        void 0 !== a ? (u = e[a] = []) : (a = "posthog"),
                                            u.people = u.people || [],
                                            u.toString = function (t) {
                                                var e = "posthog";
                                                return (
                                                    "posthog" !== a && (e += "." + a),
                                                    t || (e += " (stub)"),
                                                    e
                                                );
                                            },
                                            u.people.toString = function () {
                                                return u.toString(1) + ".people (stub)";
                                            },
                                            o =
                                                "init me ws ys ps bs capture je Di ks register register_once register_for_session unregister unregister_for_session Ps getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSurveysLoaded onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey canRenderSurveyAsync identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty Es $s createPersonProfile Is opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing Ss debug xs getPageViewId captureTraceFeedback captureTraceMetric".split(
                                                    " ",
                                                ),
                                            n = 0;
                                        n < o.length;
                                        n++
                                    )
                                        g(u, o[n]);
                                    e._i.push([i, s, a]);
                                }),
                                (e.__SV = 1));
                        })(document, window.posthog || []);
                        posthog.init("phc_yJW1VjHGGwmCbbrtczfqqNxgBDbhlhOWcdzcIJEOTFE", {
                            api_host: "https://us.i.posthog.com",
                            person_profiles: "identified_only",
                        });
                        `,
                    }}
                />
            </body>
        </Html>
    );
}
