import Layout from '../src/components/Layout';
import SEO from '../src/components/SEO';
import Link from 'next/link';

export default function CorrectionsPolicy() {
    return (
        <Layout>
            <SEO
                title="Corrections & Update Policy | Military Disability Nexus"
                description="Our commitment to medical accuracy. Learn how we handle content updates, corrections, and revisions to our clinical guides."
                breadcrumbs={[{ name: 'Home', path: '/' }, { name: 'Corrections Policy', path: '/corrections-policy' }]}
            />
            
            <div className="bg-slate-50 min-h-screen py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-slate-900 mb-4">Corrections & Update Policy</h1>
                        <p className="text-lg text-slate-600">Our commitment to accuracy and transparency</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 md:p-12 mb-12">
                        <div className="prose prose-lg prose-slate max-w-none">
                            <p>
                                At Military Disability Nexus, we are committed to providing veterans with the most accurate, medically sound, and up-to-date information regarding VA disability claims. However, medical science and VA regulations are continually evolving, and occasionally, errors may occur. 
                            </p>
                            <p>
                                This Corrections Policy outlines how we handle updates, revisions, and corrections to our published content.
                            </p>

                            <h2 className="mt-10">Commitment to Accuracy</h2>
                            <p>
                                Every piece of clinical content is reviewed by licensed medical professionals before publication. If a factual error, medical inaccuracy, or outdated regulatory reference is identified, we are committed to correcting it promptly and transparently.
                            </p>

                            <h2 className="mt-10">How We Handle Corrections</h2>
                            <ul>
                                <li><strong>Minor Updates:</strong> For typographical errors, broken links, or formatting issues that do not affect the clinical or regulatory meaning of the text, we update the content directly without a formal correction notice.</li>
                                <li><strong>Substantive Corrections:</strong> If an article contains a factual error or inaccurate medical interpretation, we will update the text and append a "Correction" note at the bottom of the article. This note will explain what was changed and the date of the correction.</li>
                                <li><strong>Regulatory Updates:</strong> When the VA updates its Schedule for Rating Disabilities (VASRD) or passes new legislation (e.g., the PACT Act), we will update our existing guides and adjust the "Last Updated" or "Last Reviewed" date at the top of the article.</li>
                            </ul>

                            <h2 className="mt-10">Reporting an Error</h2>
                            <p>
                                If you believe you have found an error, an outdated reference, or a medical inaccuracy in our content, we welcome your feedback. Please contact our editorial team:
                            </p>
                            <p>
                                <strong>Email:</strong> <a href="mailto:contact@militarydisabilitynexus.com">contact@militarydisabilitynexus.com</a><br/>
                            </p>
                            <p>
                                Please include the URL of the page in question and a brief description of the suspected error. Our clinical review team will investigate the claim and implement necessary changes within 3-5 business days.
                            </p>

                            <h2 className="mt-10">Version Control</h2>
                            <p>
                                We maintain internal version control for all clinical documents and Nexus Letters provided directly to clients. However, public blog posts and educational materials are updated in-place to ensure veterans always access the most current information.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
