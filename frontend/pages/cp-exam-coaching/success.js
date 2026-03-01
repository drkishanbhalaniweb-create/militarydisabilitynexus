import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { CheckCircle, Clock, Calendar, ArrowRight, ShieldCheck, Mail } from 'lucide-react';
import SEO from '../../src/components/SEO';
import Layout from '../../src/components/Layout';
import Link from 'next/link';

const CPCoachingSuccess = () => {
    const router = useRouter();
    const { session_id } = router.query;
    const [showCal, setShowCal] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowCal(true);

            // Load Cal.com embed script
            if (typeof window !== 'undefined') {
                const script = document.createElement('script');
                script.src = 'https://app.cal.com/embed/embed.js';
                script.async = true;
                document.head.appendChild(script);

                return () => {
                    if (document.head.contains(script)) {
                        document.head.removeChild(script);
                    }
                };
            }
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <Layout>
            <SEO
                title="Payment Successful - Schedule Your C&P Coaching"
                description="Your payment has been received. Please schedule your 60-minute C&P coaching session below."
                noindex={true}
            />

            <div className="min-h-screen bg-slate-50 py-12 md:py-20 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Header Card */}
                    <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 mb-10 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-navy-600 to-red-700" />

                        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-50 rounded-full mb-8">
                            <CheckCircle className="w-12 h-12 text-green-600" />
                        </div>

                        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
                            Payment Received!
                        </h1>

                        <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
                            Thank you for trusting us with your C&P exam preparation. Your payment has been processed successfully, and we're ready to help you prepare.
                        </p>

                        <div className="inline-flex items-center gap-2 bg-navy-50 text-navy-700 px-6 py-3 rounded-full text-lg font-bold border border-navy-100">
                            <Calendar className="w-5 h-5" />
                            Next Step: Schedule Your 60-Min Session Below
                        </div>
                    </div>

                    {/* Cal.com Container */}
                    <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100 mb-10 min-h-[800px] relative">
                        {!showCal && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                                <div className="w-16 h-16 border-4 border-navy-100 border-t-navy-600 rounded-full animate-spin mb-6" />
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">Preparing your schedule...</h2>
                                <p className="text-slate-500">Wait a moment while we load the booking calendar.</p>
                            </div>
                        )}

                        {showCal && (
                            <div className="animate-in fade-in duration-700">
                                <iframe
                                    src="https://cal.com/militarydisabilitynexus/c-p-exam-coaching?embed=true"
                                    width="100%"
                                    height="800"
                                    frameBorder="0"
                                    style={{ border: 0 }}
                                    title="Schedule C&P Coaching"
                                />
                            </div>
                        )}
                    </div>

                    {/* Assistance Section */}
                    <div className="grid md:grid-cols-2 gap-6 mb-12">
                        <div className="bg-navy-900 rounded-3xl p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-navy-300" />
                                Timeframe info
                            </h3>
                            <p className="text-navy-100 opacity-90 leading-relaxed">
                                If you don't see a time that works for your upcoming exam, please email us immediately and we will do our best to accommodate a rush session.
                            </p>
                        </div>

                        <div className="bg-slate-100 rounded-3xl p-8 border border-slate-200">
                            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Mail className="w-5 h-5 text-slate-400" />
                                Need support?
                            </h3>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                Have questions about your booking? Email our support team:
                            </p>
                            <a href="mailto:contact@militarydisabilitynexus.com" className="font-bold text-navy-600 hover:text-navy-700 transition-colors block text-lg">
                                contact@militarydisabilitynexus.com
                            </a>
                        </div>
                    </div>

                    {/* Back to Home */}
                    <div className="text-center">
                        <Link
                            href="/cp-exam-coaching"
                            className="inline-flex items-center gap-2 text-slate-500 hover:text-navy-600 font-bold transition-colors"
                        >
                            <span>Back to C&P Coaching Landing Page</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default CPCoachingSuccess;
