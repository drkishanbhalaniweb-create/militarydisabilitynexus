import Link from 'next/link';
import { XCircle, ArrowLeft, HelpCircle } from 'lucide-react';
import SEO from '../../src/components/SEO';
import Layout from '../../src/components/Layout';

const PaymentCanceled = () => {
    return (
        <Layout>
            <SEO
                title="Payment Canceled"
                description="Your payment was canceled."
                noindex={true}
            />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
                <div className="max-w-2xl mx-auto">
                    {/* Canceled Card */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg text-center mb-6">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-6">
                            <XCircle className="w-12 h-12 text-amber-600" />
                        </div>

                        <h1 className="text-3xl font-bold text-slate-900 mb-4">
                            Payment Canceled
                        </h1>

                        <p className="text-lg text-slate-600 mb-6">
                            Your payment was canceled and no charges were made to your account.
                        </p>

                        <p className="text-slate-600">
                            Your form submission has been saved. You can complete the payment at any time to proceed with your request.
                        </p>
                    </div>

                    {/* Help Card */}
                    <div className="bg-navy-50 border border-navy-200 rounded-xl p-6 mb-6">
                        <h3 className="font-semibold text-navy-900 mb-3 flex items-center">
                            <HelpCircle className="w-5 h-5 mr-2" />
                            Need Help?
                        </h3>
                        <p className="text-sm text-navy-800 mb-3">
                            If you encountered any issues during checkout or have questions about payment:
                        </p>
                        <ul className="text-sm text-navy-800 space-y-2">
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Contact us at contact@militarydisabilitynexus.com</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Call us at +1 307 318 1367</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>We're here to help Monday-Saturday, 9am-5pm EST</span>
                            </li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            href="/"
                            className="flex-1 text-white px-6 py-3 rounded-lg font-semibold transition-all text-center flex items-center justify-center"
                            style={{ backgroundColor: '#B91C3C' }}
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Return to Home
                        </Link>
                        <Link
                            href="/contact"
                            className="flex-1 bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-all border-2 border-indigo-600 text-center block"
                        >
                            Contact Support
                        </Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default PaymentCanceled;
