import Layout from '../src/components/Layout';
import SEO from '../src/components/SEO';
import Link from 'next/link';
import { ShieldCheck, CheckCircle, Stethoscope, Microscope } from 'lucide-react';

export default function Methodology() {
    return (
        <Layout>
            <SEO
                title="Our Methodology & Editorial Standards | Military Disability Nexus"
                description="Learn about our rigorous clinical review process, evidence-based approach, and commitment to medical accuracy for VA disability claims."
                breadcrumbs={[{ name: 'Home', path: '/' }, { name: 'Methodology', path: '/methodology' }]}
            />
            
            <div className="bg-slate-50 min-h-screen py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-slate-900 mb-4">Our Methodology & Editorial Standards</h1>
                        <p className="text-lg text-slate-600">How we ensure the accuracy and reliability of our clinical content</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 md:p-12 mb-12">
                        <div className="prose prose-lg prose-slate max-w-none">
                            <p>
                                At Military Disability Nexus, we understand that accurate medical information is critical to the success of your VA disability claim. Our content and service offerings are built upon a rigorous, evidence-based methodology designed to provide veterans with the highest standard of clinical documentation.
                            </p>

                            <h2 className="flex items-center gap-3 mt-10">
                                <Stethoscope className="w-6 h-6 text-navy-600" />
                                1. Clinical Authorship & Review
                            </h2>
                            <p>
                                Every article, guide, and case study published on our platform is authored or thoroughly reviewed by licensed healthcare professionals. Our team comprises medical experts with deep experience in independent medical opinions (IMOs) and the VA rating schedule. We do not rely on AI-generated content for medical advice, and all clinical statements are verified by humans.
                            </p>

                            <h2 className="flex items-center gap-3 mt-10">
                                <Microscope className="w-6 h-6 text-navy-600" />
                                2. Evidence-Based Approach
                            </h2>
                            <p>
                                Our documentation and educational resources are rooted in peer-reviewed medical literature and established clinical guidelines. When discussing service connections, secondary conditions, or symptom severity, we cite authoritative medical journals and the official VA Schedule for Rating Disabilities (VASRD).
                            </p>

                            <h2 className="flex items-center gap-3 mt-10">
                                <ShieldCheck className="w-6 h-6 text-navy-600" />
                                3. Independence & Objectivity
                            </h2>
                            <p>
                                Military Disability Nexus operates independently. We are not a law firm, we are not affiliated with the Department of Veterans Affairs, and we do not provide legal advice. Our sole focus is on providing objective, medically sound evaluations and documentation. Our clinicians maintain strict professional independence in all their assessments.
                            </p>

                            <h2 className="flex items-center gap-3 mt-10">
                                <CheckCircle className="w-6 h-6 text-navy-600" />
                                4. Continuous Updating
                            </h2>
                            <p>
                                The VA claims process and medical science are constantly evolving. We regularly audit and update our content to ensure it reflects the latest PACT Act regulations, VASRD updates, and medical consensus. Each article displays a "Last Reviewed" date to ensure transparency.
                            </p>
                        </div>
                    </div>

                    <div className="bg-navy-700 rounded-2xl p-8 text-center text-white">
                        <h3 className="text-2xl font-bold mb-4">Have questions about our process?</h3>
                        <p className="mb-6 text-navy-100">Our clinical team is ready to assist you with your specific case.</p>
                        <Link href="/contact" className="inline-block bg-white text-navy-800 px-8 py-3 rounded-full font-semibold hover:bg-slate-100 transition-colors">
                            Contact Us
                        </Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
