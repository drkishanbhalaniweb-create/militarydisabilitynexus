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
    'Clinician-led reviews focused on medical evidence, causation language, chronology, and documentation quality for VA disability claims.',
    'Educational content, service pages, and proof pages that are aligned with published editorial and medical review standards.',
    'A nationwide service model centered on record review, written documentation, and consultations within the business scope disclosed on this site.',
];

const limitItems = [
    'The site does not offer legal representation, accreditation as a VA claims representative, or guarantees of claim outcomes.',
    'Website content and clinical review do not create a physician-patient relationship or replace diagnosis, treatment, or emergency care.',
    'Trust language is intentionally restrained because veterans are making high-stakes decisions on a YMYL website.',
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
            'Learn how Military Disability Nexus structures clinician-led evidence review, site trust standards, and service boundaries for veterans researching VA disability documentation.',
        mainEntity: buildOrganizationReference(),
        about: buildOrganizationReference(),
    };

    return (
        <Layout>
            <SEO
                title="About Military Disability Nexus"
                description="Learn how Military Disability Nexus handles clinician-led evidence review, service boundaries, and trust standards for veterans researching VA disability documentation."
                keywords="about Military Disability Nexus, clinician-led VA documentation, medical review process, veteran-first claim support"
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
                                    Clinician-led evidence work with explicit trust boundaries
                                </h1>
                                <p className="mt-6 max-w-3xl text-lg leading-relaxed text-white/85 sm:text-xl">
                                    Military Disability Nexus is positioned around medically grounded documentation for VA disability claims. On a YMYL site, that means being clear about what the organization does, how reviews happen, and where the boundaries are.
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                                <article className="rounded-[1.5rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
                                    <div className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">Legal entity</div>
                                    <div className="mt-3 text-2xl font-bold text-white">{organizationEntity.legalName}</div>
                                    <p className="mt-3 text-sm leading-relaxed text-white/80">
                                        Operates as {organizationEntity.name} with publicly disclosed contact and policy pages.
                                    </p>
                                </article>
                                <article className="rounded-[1.5rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
                                    <div className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">Published standards</div>
                                    <div className="mt-3 text-2xl font-bold text-white">Editorial + Clinical Review</div>
                                    <p className="mt-3 text-sm leading-relaxed text-white/80">
                                        Trust pages explain how educational content is maintained and how medically sensitive pages are reviewed.
                                    </p>
                                </article>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                        <article className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
                            <h2 className="text-3xl font-bold text-slate-900">What this organization is trying to do</h2>
                            <p className="mt-5 text-lg leading-relaxed text-slate-700">
                                The site exists to help veterans understand the medical-documentation side of a VA disability claim. That includes record review, evidence-focused services, and site content that explains what tends to strengthen or weaken a claim file.
                            </p>
                            <p className="mt-4 text-lg leading-relaxed text-slate-700">
                                The intent is not to sound bigger than the business scope. For SEO and trust, that restraint matters more than generic authority language because veterans are making high-stakes decisions here.
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
                            <h2 className="text-3xl font-bold text-slate-900">How the work is structured</h2>
                            <p className="mt-4 text-lg leading-relaxed text-slate-700">
                                The process needs to be understandable to users and machine-readable to search engines. These steps reflect the actual trust framing already used throughout the site.
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
                            <h2 className="text-3xl font-bold text-slate-900">What the site does</h2>
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
                            <h2 className="text-3xl font-bold text-slate-900">What the site does not do</h2>
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
                        <h2 className="text-3xl font-bold sm:text-4xl">Need help understanding the right next step?</h2>
                        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-white/85">
                            Start with the main intake route if you want to submit details or schedule a discovery call. Use the policy pages above if you are evaluating the trust and process standards behind the site.
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
