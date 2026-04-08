import Link from 'next/link';
import SEO from '../src/components/SEO';
import Layout from '../src/components/Layout';

const PrivacyPolicy = () => {
    return (
        <Layout>
            <SEO
                title="Privacy Policy - Military Disability Nexus"
                description="Privacy Policy for Military Disability Nexus. Learn how we collect, use, and protect your personal information including Protected Health Information (PHI)."
                keywords="privacy policy, data protection, personal information, military disability nexus, HIPAA, PHI"
            />
            <div className="relative min-h-screen overflow-hidden">
                {/* Fixed Background */}
                <div className="fixed inset-0 z-0 overflow-hidden">
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{
                            backgroundImage: 'url("/Gemini_Generated_Image_f6860of6860of686.webp")',
                            filter: 'blur(4px)',
                            transform: 'scale(1.1)',
                            width: '100%',
                            height: '100%'
                        }}
                        role="presentation"
                        aria-hidden="true"
                    ></div>
                    <div className="absolute inset-0 bg-white/50"></div>
                </div>

                <div className="relative z-10">
                    {/* Hero */}
                    <section className="py-24">
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                            <h1 className="text-5xl font-bold text-slate-900 mb-6 drop-shadow-sm">Privacy Policy</h1>
                            <p className="text-xl text-slate-700">
                                Last Updated: November 25, 2025
                            </p>
                        </div>
                    </section>

                    {/* Content */}
                    <section className="py-16">
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 md:p-12 shadow-2xl border border-white/40">
                                <div className="prose prose-slate max-w-none prose-headings:text-black prose-p:text-black prose-li:text-black prose-strong:text-black prose-ul:text-black marker:text-black">

                                    {/* Section 1 */}
                                    <h2 className="text-2xl font-bold text-slate-900 mt-0 mb-4">1. Introduction and Our Commitment</h2>
                                    <p className="text-slate-700 leading-relaxed mb-6">
                                        MAGLINC CONSULTANCY LLC, a Wyoming limited liability company doing business as Military Disability Nexus (the "Company," "we," "us," or "our"), provides non-clinical, medicolegal consultative services to veterans and other claimants pursuing disability benefits from the U.S. Department of Veterans Affairs (VA).
                                    </p>
                                    <p className="text-slate-700 leading-relaxed mb-6">
                                        We recognize the profound sensitivity of the information you entrust to us, which includes detailed military service records and comprehensive medical history. We are committed to protecting your privacy and maintaining the confidentiality and security of your information.
                                    </p>
                                    <p className="text-slate-700 leading-relaxed mb-6">
                                        This Privacy Policy describes how we collect, use, disclose, and safeguard your information, including Protected Health Information ("PHI") as defined by the Health Insurance Portability and Accountability Act of 1996 ("HIPAA"), the HITECH Act, and their implementing regulations. This Policy is integrated with our Business Associate Agreements with contractors and our HIPAA Authorization Form for clients.
                                    </p>
                                    <p className="text-slate-700 leading-relaxed mb-6">
                                        By using our website or services, you agree to the practices described in this Policy.
                                    </p>

                                    {/* Section 2 */}
                                    <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. Scope and Application</h2>
                                    <p className="text-slate-700 leading-relaxed mb-4">This Privacy Policy applies to all information collected through:</p>
                                    <ul className="list-disc pl-6 mb-6 text-slate-700 space-y-2">
                                        <li>Our primary website at https://www.militarydisabilitynexus.com and all associated subdomains (the "Website").</li>
                                        <li>All electronic, written, or verbal communications in the course of providing our services (e.g., intake forms, emails, consultations, video conferences).</li>
                                        <li>The secure client portal and any document upload systems we utilize.</li>
                                        <li>Any interactions with our independent contractors, service providers, and third-party vendors.</li>
                                        <li>Any other method where you voluntarily provide information to us.</li>
                                    </ul>

                                    {/* Section 3 */}
                                    <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. Categories of Information We Collect</h2>
                                    <p className="text-slate-700 leading-relaxed mb-4">We collect several types of information to provide and improve our services to you.</p>

                                    <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">3.1. Personal Identifiers and Contact Information</h3>
                                    <p className="text-slate-700 leading-relaxed mb-4">
                                        This includes your full legal name, mailing address, email address, telephone number, date of birth, and, for identification and record-matching purposes only, the last four digits of your Social Security Number.
                                    </p>

                                    <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">3.2. Military Service and Claims-Related Information</h3>
                                    <p className="text-slate-700 leading-relaxed mb-4">
                                        This includes your branch of service, dates of active duty, separation documents (DD-214), Service Treatment Records (STRs), your entire VA Claims File (C-File), rating decisions, Statements of the Case (SOCs), and all correspondence with the VA.
                                    </p>

                                    <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">3.3. Protected Health Information (PHI)</h3>
                                    <p className="text-slate-700 leading-relaxed mb-4">
                                        This is the most sensitive category and includes all medical, mental health, and dental records from military, VA, and private healthcare providers. This encompasses diagnoses, prognosis, treatment notes, clinical findings, laboratory and imaging reports, prescription histories, and any other information related to your physical or mental health.
                                    </p>

                                    <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">3.4. Payment and Transaction Information</h3>
                                    <p className="text-slate-700 leading-relaxed mb-4">
                                        When you purchase our services, we collect payment information. However, all payment transactions are processed by our third-party payment processors (e.g., Stripe, PayPal). We do not store your full credit card number on our servers. We only receive and store transaction details necessary for billing and accounting, such as the last four digits of your card, the billing address, the transaction date and amount, and a payment token.
                                    </p>

                                    <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">3.5. Technical and Website Usage Data</h3>
                                    <p className="text-slate-700 leading-relaxed mb-4">
                                        When you visit our Website, we automatically collect information such as your IP address, browser type and version, operating system, device information, referring URLs, pages you view, time and date of your visits, the time spent on those pages, and other diagnostic data. We collect this information using cookies, web beacons, and similar tracking technologies.
                                    </p>

                                    <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">3.6. Communication and Correspondence Records</h3>
                                    <p className="text-slate-700 leading-relaxed mb-6">
                                        We retain records of our communications with you, including the content of emails, written correspondence, and, with your prior consent, recordings of telephone or video consultations used for quality assurance and service delivery.
                                    </p>

                                    {/* Section 4 */}
                                    <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. Methods of Information Collection</h2>
                                    <p className="text-black leading-relaxed mb-4">We collect information through the following means:</p>
                                    <ul className="list-disc pl-6 mb-6 text-black space-y-2">
                                        <li><strong>Directly From You:</strong> When you voluntarily provide it to us by filling out intake forms, uploading documents to our secure portal, communicating with us via email or phone, or during teleconsultations.</li>
                                        <li><strong>Automatically:</strong> Through the use of cookies and similar technologies as you navigate our Website.</li>
                                        <li><strong>From Third Parties, With Your Authorization:</strong> When you explicitly authorize us to request records on your behalf from entities such as the VA, the National Personnel Records Center (NPRC), military treatment facilities, and private healthcare providers.</li>
                                        <li><strong>From Publicly Available Sources:</strong> In limited circumstances, we may use publicly available information to verify identity or service history, but this is never used as a substitute for the official records you provide.</li>
                                    </ul>

                                    {/* Section 5 */}
                                    <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">5. Lawful Bases and Purposes for Processing Your Information</h2>
                                    <p className="text-slate-700 leading-relaxed mb-4">We process your information only for specific, legitimate purposes, including:</p>

                                    <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">5.1. Service Delivery and Contract Fulfillment</h3>
                                    <p className="text-slate-700 leading-relaxed mb-4">
                                        To perform the medicolegal consultative services you have requested, including the preparation of Nexus Letters, Disability Benefits Questionnaires (DBQs), Rebuttal Opinions, claim strategy reports, and other deliverables as outlined in our Professional Services Agreement.
                                    </p>

                                    <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">5.2. Client Communication and Support</h3>
                                    <p className="text-slate-700 leading-relaxed mb-4">
                                        To communicate with you regarding the status of your case, request additional information or records, provide updates, and respond to your inquiries.
                                    </p>

                                    <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">5.3. Payment Processing</h3>
                                    <p className="text-slate-700 leading-relaxed mb-4">
                                        To process your payments, issue invoices and receipts, and manage our financial records.
                                    </p>

                                    <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">5.4. Administrative and Legal Compliance</h3>
                                    <p className="text-slate-700 leading-relaxed mb-4">
                                        To maintain internal administrative records, for quality assurance and training purposes, to comply with our legal obligations under HIPAA and other federal and state laws, and to defend against potential legal claims.
                                    </p>

                                    <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">5.5. Security and Fraud Prevention</h3>
                                    <p className="text-slate-700 leading-relaxed mb-4">
                                        To ensure the security of our Website and services, to detect and prevent fraud, and to protect the rights and safety of our Company, our clients, and the public.
                                    </p>

                                    <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">5.6. Marketing and Business Development</h3>
                                    <p className="text-slate-700 leading-relaxed mb-4">
                                        To send you marketing communications about our services, provided you have given explicit consent or where we have a legitimate interest. You may opt-out of these communications at any time.
                                    </p>

                                    <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">5.7. Website Improvement</h3>
                                    <p className="text-slate-700 leading-relaxed mb-6">
                                        To analyze and improve the functionality, performance, and user experience of our Website through anonymized and aggregated data.
                                    </p>

                                    {/* Section 6 */}
                                    <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">6. Our Strict Handling of Protected Health Information (PHI)</h2>
                                    <p className="text-slate-700 leading-relaxed mb-4">The handling of your PHI is governed by the highest standards of confidentiality and security:</p>

                                    <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">6.1. Access Restrictions</h3>
                                    <p className="text-slate-700 leading-relaxed mb-4">
                                        Access to PHI is strictly limited to U.S.-licensed physicians, nurse practitioners, and authorized support personnel who require access to perform their specific job functions. All such individuals are bound by executed Business Associate Agreements and undergo mandatory HIPAA and security training.
                                    </p>

                                    <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">6.2. Secure Storage</h3>
                                    <p className="text-slate-700 leading-relaxed mb-4">
                                        All PHI is stored on encrypted, HIPAA-compliant cloud platforms and secure servers. Data is encrypted both in transit and at rest.
                                    </p>

                                    <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">6.3. Segregation of Duties</h3>
                                    <p className="text-slate-700 leading-relaxed mb-4">
                                        Non-clinical team members, including those located internationally who perform marketing and administrative support, are systematically barred from accessing PHI. They only have access to anonymized or pseudonymized data necessary for their specific, limited tasks.
                                    </p>

                                    <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">6.4. Record Retention and Destruction</h3>
                                    <p className="text-slate-700 leading-relaxed mb-6">
                                        We retain your PHI for a maximum of thirty (30) calendar days after the final deliverable has been provided to you and our engagement is complete. After this period, all PHI in our possession, including electronic copies and backups, is permanently and irretrievably destroyed using National Institute of Standards and Technology (NIST)-compliant data destruction methods. Original hard-copy documents you provided will be returned to you upon request within this 30 day window.
                                    </p>

                                    {/* Section 7 */}
                                    <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">7. Disclosure and Sharing of Information</h2>
                                    <p className="text-slate-700 leading-relaxed mb-4">We do not, and will not, sell, rent, or trade your Personal Information or PHI. We may disclose information in the following limited circumstances:</p>

                                    <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">7.1. Service Providers and Business Associates</h3>
                                    <p className="text-slate-700 leading-relaxed mb-4">
                                        We disclose PHI to our U.S.-licensed independent contractor clinicians and to third-party vendors who provide services on our behalf (e.g., secure cloud storage, IT support, payment processing, transcription services). All such entities are contractually bound by Business Associate Agreements that prohibit them from using or disclosing your information for any purpose other than providing services to us and require them to implement appropriate security measures.
                                    </p>

                                    <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">7.2. Legal and Regulatory Requirements</h3>
                                    <p className="text-slate-700 leading-relaxed mb-4">
                                        We may disclose your information if required to do so by law, court order, subpoena, or other valid legal process, or to comply with reporting obligations to government agencies.
                                    </p>

                                    <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">7.3. Business Transfers</h3>
                                    <p className="text-slate-700 leading-relaxed mb-4">
                                        In the event of a merger, acquisition, reorganization, or sale of assets, your information may be transferred. We will provide notice before your information is transferred and becomes subject to a different privacy policy.
                                    </p>

                                    <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">7.4. With Your Consent</h3>
                                    <p className="text-slate-700 leading-relaxed mb-6">
                                        We will disclose your information for any other purpose with your explicit, prior written consent.
                                    </p>

                                    {/* Section 8 */}
                                    <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">8. International Data Transfers and Safeguards</h2>
                                    <p className="text-black leading-relaxed mb-4">As noted, certain non-clinical, administrative, and marketing functions are supported by team members located outside the United States. In all such cases:</p>
                                    <ul className="list-disc pl-6 mb-6 text-black space-y-2">
                                        <li><strong>Strict Data Segregation:</strong> These international team members have no access to PHI or unredacted medical records.</li>
                                        <li><strong>Use of Anonymized Data:</strong> When necessary for their tasks, they are provided only with anonymized or pseudonymized data sets that cannot be used to identify an individual.</li>
                                        <li><strong>Contractual Safeguards:</strong> All international team members and entities are bound by stringent contractual agreements that incorporate Standard Contractual Clauses and data protection obligations that meet or exceed the requirements of HIPAA and U.S. privacy laws.</li>
                                        <li><strong>Prohibition on Further Transfer:</strong> They are expressly prohibited from transferring data to any additional third parties.</li>
                                    </ul>

                                    {/* Section 9 */}
                                    <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">9. Your Privacy Rights</h2>
                                    <p className="text-slate-700 leading-relaxed mb-4">You have the following rights regarding your personal information and PHI:</p>

                                    <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">9.1. Right of Access and Portability</h3>
                                    <p className="text-slate-700 leading-relaxed mb-4">
                                        You may request to access and receive a copy of the personal information and PHI we hold about you.
                                    </p>

                                    <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">9.2. Right to Rectification</h3>
                                    <p className="text-slate-700 leading-relaxed mb-4">
                                        You may request the correction of any inaccurate or incomplete information we hold about you.
                                    </p>

                                    <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">9.3. Right to Erasure ("Right to be Forgotten")</h3>
                                    <p className="text-slate-700 leading-relaxed mb-4">
                                        You may request the deletion of your personal information, subject to certain legal exceptions that require us to retain records (e.g., for legal compliance, to complete a transaction).
                                    </p>

                                    <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">9.4. Right to Restrict Processing</h3>
                                    <p className="text-slate-700 leading-relaxed mb-4">
                                        You may request that we restrict the processing of your personal information in certain circumstances.
                                    </p>

                                    <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">9.5. Right to Revoke Authorization</h3>
                                    <p className="text-slate-700 leading-relaxed mb-4">
                                        You may revoke your HIPAA Authorization for the use and disclosure of your PHI at any time, in writing, though such revocation will not apply to actions we have already taken in reliance on that authorization.
                                    </p>

                                    <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">9.6. Right to an Accounting of Disclosures</h3>
                                    <p className="text-slate-700 leading-relaxed mb-4">
                                        You have the right to receive a list of certain disclosures of your PHI we have made.
                                    </p>

                                    <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">9.7. Right to Opt-Out of Marketing</h3>
                                    <p className="text-slate-700 leading-relaxed mb-4">
                                        You may opt-out of receiving marketing communications from us at any time by using the "unsubscribe" link in our emails or by contacting us directly.
                                    </p>
                                    <p className="text-slate-700 leading-relaxed mb-6">
                                        To exercise any of these rights, please contact our Privacy Officer using the information in Section 14. We will respond to your request within the timeframes required by applicable law.
                                    </p>

                                    {/* Section 10 */}
                                    <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">10. Our Data Security Measures</h2>
                                    <p className="text-black leading-relaxed mb-4">
                                        We implement a layered security approach using administrative, technical, and physical safeguards designed to protect your information from unauthorized access, disclosure, alteration, and destruction. These measures include, but are not limited to:
                                    </p>
                                    <ul className="list-disc pl-6 mb-6 text-black space-y-2">
                                        <li><strong>Encryption:</strong> End-to-end encryption for all data in transit and at rest.</li>
                                        <li><strong>Access Controls:</strong> Strict role-based access controls, mandatory multi-factor authentication (MFA), and principle of least privilege.</li>
                                        <li><strong>Network Security:</strong> Advanced firewalls, intrusion detection and prevention systems, and regular vulnerability scanning.</li>
                                        <li><strong>Policies and Training:</strong> Comprehensive information security policies and mandatory, ongoing privacy and security training for all personnel.</li>
                                        <li><strong>Incident Response:</strong> A formal, documented incident response plan to address any potential data security breaches in a timely and compliant manner.</li>
                                    </ul>

                                    {/* Section 11 */}
                                    <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">11. Use of Cookies and Tracking Technologies</h2>
                                    <p className="text-slate-700 leading-relaxed mb-6">
                                        We use cookies and similar tracking technologies to track activity on our Website and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier. For detailed information on the types of cookies we use, their purposes, and how you can control your cookie preferences, please see our separate Cookie Policy.
                                    </p>

                                    {/* Section 12 */}
                                    <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">12. Children's Privacy</h2>
                                    <p className="text-slate-700 leading-relaxed mb-6">
                                        Our Website and services are not directed to individuals under the age of 18 ("Children"). We do not knowingly collect personal information from Children. If you are a parent or guardian and you are aware that your Child has provided us with Personal Information, please contact us. If we become aware that we have collected Personal Information from a Child without verification of parental consent, we take steps to remove that information from our servers.
                                    </p>

                                    {/* Section 13 */}
                                    <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">13. Changes to This Privacy Policy</h2>
                                    <p className="text-slate-700 leading-relaxed mb-6">
                                        We may update our Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. We may also provide notice to you through other means, such as via email or a banner on the Website. Your continued use of our Website or services after the effective date of the revised Privacy Policy constitutes your acceptance of the terms.
                                    </p>

                                    {/* Section 14 */}
                                    <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">14. Contact Information and How to Lodge a Complaint</h2>
                                    <p className="text-slate-700 leading-relaxed mb-4">
                                        If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, or if you wish to exercise any of your rights, please contact us:
                                    </p>
                                    <div className="bg-slate-50 rounded-lg p-6 mb-6">
                                        <p className="text-slate-800 font-semibold mb-2">MAGLINC CONSULTANCY LLC d/b/a Military Disability Nexus</p>
                                        <p className="text-slate-700">30 N Gould St Ste R, Sheridan, WY 82801</p>
                                        <p className="text-slate-700">Email: admin@maglincconsultancy.com</p>
                                    </div>
                                    <p className="text-slate-700 leading-relaxed">
                                        If you believe your privacy rights have been violated, you have the right to file a complaint with our Privacy Officer or with the Secretary of the U.S. Department of Health and Human Services. We will not retaliate against you for filing a complaint.
                                    </p>

                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </Layout>
    );
};

export default PrivacyPolicy;
