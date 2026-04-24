import Link from 'next/link';
import {
    ArrowRight,
    Building2,
    CheckCircle2,
    FilePenLine,
    Mail,
    MapPin,
    Phone,
    ShieldCheck,
    Stethoscope,
} from 'lucide-react';
import SEO from '../src/components/SEO';
import Layout from '../src/components/Layout';
import {
    aboutProcessSteps,
    buildOrganizationReference,
    clinicalReviewTeam,
    editorialTeam,
    organizationEntity,
    organizationSocialProfiles,
} from '../src/lib/trust';

const scopeItems = [
    'Expert reviews by licensed clinicians focused on medical evidence, chronology, and the quality of your claim documentation.',
    'Educational content and guidance that follows strict medical and editorial standards to ensure accuracy.',
    'A nationwide service dedicated to record review and clinical documentation built for the VA’s requirements.',
];

const limitItems = [
    'We are consultants, not legal representatives. We do not offer legal advice or VA accreditation.',
    'Our work is for evidence purposes and does not create a doctor-patient relationship or replace your clinical care.',
    'We lead with honesty and restraint because we know how much these decisions matter to you.',
];

const trustLinks = [
    {
        href: editorialTeam.href,
        label: 'Editorial policy',
        description: 'See how educational and proof content is planned, written, and updated.',
        icon: FilePenLine,
    },
    {
        href: clinicalReviewTeam.href,
        label: 'Medical review policy',
        description: 'See how medically sensitive website content is reviewed for scope and accuracy.',
        icon: Stethoscope,
    },
    {
        href: '/disclaimer',
        label: 'Disclaimer',
        description: 'Read the site-level legal and service boundary disclosures.',
        icon: ShieldCheck,
    },
];

const About = () => {
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: 'About Military Disability Nexus',
        url: `${organizationEntity.url}/about`,
        description:
            'Learn about Military Disability Nexus: our mission to provide expert clinical evidence review and our commitment to transparency for veterans.',
        mainEntity: buildOrganizationReference(),
        about: buildOrganizationReference(),
    };

    return (
        <Layout>
            <SEO
                title="About Military Disability Nexus | Our Mission & Values"
                description="Learn about our commitment to providing veterans with expert, clinician-led medical evidence and honest guidance for VA disability claims."
                keywords="about Military Disability Nexus, veteran medical evidence, clinical record review, honest VA documentation"
                canonical="/about"
                structuredData={structuredData}
                breadcrumbs={[
                    { name: 'Home', path: '/' },
                    { name: 'About', path: '/about' }
                ]}
            />

            <div className="min-h-screen bg-slate-50">
                <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-navy-800 to-slate-800 text-white">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(185,28,60,0.18),transparent_24%)]" />
                    <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
                        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/90">
                                    <Building2 className="h-4 w-4" />
                                    <span>About The Organization</span>
                                </div>
                                <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                                    Evidence you can trust. Expertise you can lean on.
                                </h1>
                                <p className="mt-6 max-w-3xl text-lg leading-relaxed text-white/85 sm:text-xl">
                                    Military Disability Nexus was founded on a simple principle: veterans deserve medical documentation that is as disciplined and rigorous as their service. We provide the expertise you need to move forward with confidence.
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                                <article className="rounded-[1.5rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
                                    <div className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">Our Foundation</div>
                                    <div className="mt-3 text-2xl font-bold text-white">Integrity & Clarity</div>
                                    <p className="mt-3 text-sm leading-relaxed text-white/80">
                                        We operate with absolute transparency, ensuring you know exactly who we are and how we work.
                                    </p>
                                </article>
                                <article className="rounded-[1.5rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
                                    <div className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">Our Promise</div>
                                    <div className="mt-3 text-2xl font-bold text-white">Professional Excellence</div>
                                    <p className="mt-3 text-sm leading-relaxed text-white/80">
                                        Every page and every report is held to the highest standard of clinical and editorial review.
                                    </p>
                                </article>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                        <article className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
                            <h2 className="text-3xl font-bold text-slate-900">Why we’re here</h2>
                            <p className="mt-5 text-lg leading-relaxed text-slate-700">
                                We believe that navigating the medical side of a VA claim shouldn’t be a mystery. We’re here to help you understand your records, clarify the evidence, and build documentation that accurately reflects your service and your health.
                            </p>
                            <p className="mt-4 text-lg leading-relaxed text-slate-700">
                                We lead with honesty and professional restraint. We don’t make empty promises or use hype—because we know that when it comes to your benefits, accuracy is the only thing that matters.
                            </p>
                        </article>

                        <article className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
                            <h2 className="text-3xl font-bold text-slate-900">Entity details</h2>
                            <div className="mt-6 space-y-4 text-slate-700">
                                <div className="flex items-start gap-3">
                                    <Mail className="mt-1 h-5 w-5 text-navy-700" />
                                    <a href={`mailto:${organizationEntity.email}`} className="font-medium hover:text-navy-700">
                                        {organizationEntity.email}
                                    </a>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Phone className="mt-1 h-5 w-5 text-navy-700" />
                                    <a href={`tel:${organizationEntity.telephone}`} className="font-medium hover:text-navy-700">
                                        {organizationEntity.telephone}
                                    </a>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MapPin className="mt-1 h-5 w-5 text-navy-700" />
                                    <div>
                                        {organizationEntity.address.streetAddress}
                                        <br />
                                        {organizationEntity.address.addressLocality}, {organizationEntity.address.addressRegion} {organizationEntity.address.postalCode}
                                        <br />
                                        {organizationEntity.address.addressCountry}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 border-t border-slate-200 pt-6">
                                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Verified profiles</div>
                                <div className="mt-4 flex flex-wrap gap-3">
                                    {organizationSocialProfiles.map((profile) => (
                                        <a
                                            key={profile.href}
                                            href={profile.href}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-navy-700 hover:text-navy-700"
                                        >
                                            {profile.label}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </article>
                    </div>
                </section>

                <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
                    <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
                        <div className="max-w-3xl">
                            <h2 className="text-3xl font-bold text-slate-900">Our approach to your evidence</h2>
                            <p className="mt-4 text-lg leading-relaxed text-slate-700">
                                Our process is designed to be transparent and thorough. We want you to understand exactly how your records are reviewed and how our clinical expertise works for you.
                            </p>
                        </div>

                        <div className="mt-8 grid gap-5 lg:grid-cols-2">
                            {aboutProcessSteps.map((step, index) => (
                                <article key={step.title} className="rounded-[1.5rem] bg-slate-50 p-6">
                                    <div className="text-sm font-semibold uppercase tracking-[0.18em] text-navy-700">
                                        Step {index + 1}
                                    </div>
                                    <h3 className="mt-3 text-xl font-bold text-slate-900">{step.title}</h3>
                                    <p className="mt-3 leading-relaxed text-slate-700">{step.body}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
                    <div className="grid gap-6 lg:grid-cols-2">
                        <article className="rounded-[2rem] border border-emerald-200 bg-white p-8 shadow-sm sm:p-10">
                            <h2 className="text-3xl font-bold text-slate-900">How we help</h2>
                            <div className="mt-6 space-y-4">
                                {scopeItems.map((item) => (
                                    <div key={item} className="flex items-start gap-3">
                                        <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-emerald-600" />
                                        <p className="leading-relaxed text-slate-700">{item}</p>
                                    </div>
                                ))}
                            </div>
                        </article>

                        <article className="rounded-[2rem] border border-amber-200 bg-white p-8 shadow-sm sm:p-10">
                            <h2 className="text-3xl font-bold text-slate-900">Our commitments</h2>
                            <div className="mt-6 space-y-4">
                                {limitItems.map((item) => (
                                    <div key={item} className="flex items-start gap-3">
                                        <ShieldCheck className="mt-1 h-5 w-5 flex-shrink-0 text-amber-700" />
                                        <p className="leading-relaxed text-slate-700">{item}</p>
                                    </div>
                                ))}
                            </div>
                        </article>
                    </div>
                </section>

                <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
                    <div className="grid gap-6 lg:grid-cols-3">
                        {trustLinks.map((item) => {
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm transition-colors hover:border-navy-700 hover:bg-slate-50"
                                >
                                    <Icon className="h-8 w-8 text-navy-700" />
                                    <h2 className="mt-5 text-2xl font-bold text-slate-900">{item.label}</h2>
                                    <p className="mt-3 leading-relaxed text-slate-600">{item.description}</p>
                                    <span className="mt-5 inline-flex items-center gap-2 font-semibold text-navy-700">
                                        Read more
                                        <ArrowRight className="h-4 w-4" />
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </section>

                <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
                    <div className="rounded-[2rem] bg-gradient-to-br from-navy-700 via-navy-800 to-slate-900 p-10 text-white shadow-2xl sm:p-12">
                        <h2 className="text-3xl font-bold sm:text-4xl">Ready to take the next step?</h2>
                        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-white/85">
                            Whether you need a full record review or just have questions about our process, we’re here to help. Explore our services or reach out to our team to get started.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-4">
                            <Link
                                href="/forms"
                                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-navy-800"
                            >
                                Go to the intake page
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                                href="/contact"
                                className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-6 py-3 font-semibold text-white/90 transition-colors hover:bg-white/10"
                            >
                                Contact the team
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    );
};

export default About;
