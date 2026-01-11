import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { ArrowRight, Users, Clock, Award } from 'lucide-react';
import { servicesApi, blogApi } from '../src/lib/api';
import SEO from '../src/components/SEO';
import Layout from '../src/components/Layout';

// Dynamic import for QuickIntakeForm to prevent SSR (uses document APIs)
const QuickIntakeForm = dynamic(
    () => import('../src/components/forms/QuickIntakeForm'),
    {
        ssr: false,
        loading: () => (
            <div className="h-[520px] w-full rounded-2xl bg-white/60 animate-pulse" />
        )
    }
);

export async function getStaticProps() {
    try {
        const [servicesData, blogData] = await Promise.all([
            servicesApi.getAll(),
            blogApi.getAll(3),
        ]);

        return {
            props: {
                services: servicesData?.slice(0, 4) || [],
                blogPosts: blogData || [],
            },
            revalidate: 3600, // Revalidate every hour
        };
    } catch (error) {
        console.error('Error fetching homepage data:', error);
        return {
            props: {
                services: [],
                blogPosts: [],
            },
            revalidate: 60, // Retry sooner on error
        };
    }
}

const Home = ({ services, blogPosts }) => {
    const router = useRouter();

    return (
        <Layout>
            <Head>
                <title>VA Nexus Letters & DBQs | Military Disability Nexus</title>
                <meta
                    name="description"
                    content="Professional medical documentation services for VA disability claims. Expert nexus letters, DBQs, Aid & Attendance evaluations, and medical consultations for veterans seeking disability benefits and compensation."
                />
            </Head>
            <SEO
                structuredData={{
                    "@context": "https://schema.org",
                    "@type": "MedicalBusiness",
                    "name": "Military Disability Nexus",
                    "description": "Professional medical documentation services for VA disability claims",
                    "url": "https://www.militarydisabilitynexus.com",
                    "telephone": "+1-307-301-2019",
                    "priceRange": "$$",
                    "areaServed": {
                        "@type": "Country",
                        "name": "United States"
                    },
                    "medicalSpecialty": "Veterans Medical Documentation",
                    "email": "contact@militarydisabilitynexus.com"
                }}
            />

            {/* Hero Section with Fixed Background */}
            <section className="relative min-h-screen w-full overflow-hidden">
                {/* Fixed Blurred Background */}
                <div className="fixed inset-0 z-0 w-full h-full overflow-hidden">
                    <div
                        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
                        style={{
                            backgroundImage: 'url("/Gemini_Generated_Image_7ax9sd7ax9sd7ax9.png")',
                            filter: 'blur(4px)',
                            width: '100%',
                            height: '100%'
                        }}
                        role="presentation"
                        aria-hidden="true"
                    ></div>
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-navy-700/50 via-navy-600/45 to-navy-500/50"></div>
                </div>

                {/* Hero Content */}
                <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 pb-32 sm:pb-40">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                        {/* Left Column */}
                        <div className="space-y-4 sm:space-y-6 w-full min-w-0">
                            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold border border-white/30 max-w-full">
                                <span className="truncate">Clinician-Led • Expert Medical Opinion • Nationwide</span>
                            </div>

                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight drop-shadow-lg">
                                Clinician-Led Expertise for Your VA Disability Claim
                            </h1>

                            <p className="text-base sm:text-lg text-white/90 leading-relaxed drop-shadow">
                                Our licensed clinicians provide evidence-based{" "}
                                <a
                                    href="https://www.militarydisabilitynexus.com/services/independent-medical-opinion-nexus-letter"
                                    className="underline hover:text-white"
                                >
                                    medical opinions
                                </a>
                                , expert consultations, and record reviews to help veterans build strong,
                                VA-ready documentation.
                            </p>



                            <div className="flex flex-col gap-3 sm:gap-4 w-full">
                                <button
                                    onClick={() => router.push('/forms?view=schedule')}
                                    className="inline-flex items-center justify-center text-center text-white px-4 sm:px-8 py-3 sm:py-3.5 rounded-lg font-semibold text-sm sm:text-base hover:shadow-lg transition-all duration-300 hover:scale-105 w-full sm:w-auto"
                                    style={{ backgroundColor: '#B91C3C' }}
                                    aria-label="Book a free discovery call"
                                >
                                    <span className="truncate">Free Discovery Call</span>
                                </button>
                                <Link
                                    href="/diagnostic"
                                    className="inline-flex items-center justify-center text-center bg-white px-4 sm:px-8 py-3 sm:py-3.5 rounded-lg font-semibold text-sm sm:text-base border-2 border-white/30 hover:shadow-lg transition-all duration-300 hover:scale-105 w-full sm:w-auto"
                                    style={{ color: '#B91C3C' }}
                                    aria-label="Start the claim readiness diagnostic"
                                >
                                    <span className="truncate">Check Claim Readiness Diagnostic</span>
                                </Link>
                            </div>

                            <div className="grid grid-cols-2 gap-4 sm:gap-6 pt-4 w-full">
                                <div className="min-w-0">
                                    <div className="text-xs sm:text-sm text-white/70 mb-1">Turnaround</div>
                                    <div className="text-base sm:text-lg font-bold text-white break-words">7-10 business days</div>
                                </div>
                                <div className="min-w-0">
                                    <div className="text-xs sm:text-sm text-white/70 mb-1">Clinician</div>
                                    <div className="text-base sm:text-lg font-bold text-white">MD / DO / NP</div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Form */}
                        <div className="relative z-30 w-full min-w-0">
                            <QuickIntakeForm />
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section with Waves */}
            <section className="relative bg-white w-full overflow-visible">
                {/* Top Waves */}
                <div className="absolute top-0 left-0 w-full" style={{ marginTop: '-1px', pointerEvents: 'none' }}>
                    {/* Back wave */}
                    <svg className="absolute w-full" viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ height: '200px', top: '-120px', filter: 'drop-shadow(0 -4px 6px rgba(0,0,0,0.1))', display: 'block' }}>
                        <path fill="#64748b" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,138.7C960,139,1056,117,1152,112C1248,107,1344,117,1392,122.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>
                    {/* Middle wave */}
                    <svg className="absolute w-full" viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ height: '180px', top: '-90px', filter: 'drop-shadow(0 -3px 5px rgba(0,0,0,0.08))', display: 'block' }}>
                        <path fill="#94a3b8" d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>
                    {/* Front wave */}
                    <svg className="absolute w-full" viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ height: '160px', top: '-60px', filter: 'drop-shadow(0 -2px 4px rgba(0,0,0,0.06))', display: 'block' }}>
                        <path fill="#e2e8f0" d="M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,224C672,224,768,192,864,165.3C960,139,1056,117,1152,128C1248,139,1344,181,1392,202.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>
                </div>

                {/* Stats Content */}
                <div className="relative z-20 py-20 sm:py-32">
                    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 md:gap-16">
                            {/* Veterans Served */}
                            <Link href="/contact" className="flex flex-col items-center text-center group">
                                <div className="w-40 h-40 rounded-full flex items-center justify-center shadow-2xl mb-6 transform group-hover:scale-110 transition-transform cursor-pointer" style={{ backgroundColor: '#B91C3C' }}>
                                    <Users className="w-16 h-16 text-white" />
                                </div>
                                <div className="text-3xl font-bold text-slate-900 mb-2">1,000+</div>
                                <div className="text-base font-semibold text-slate-700 mb-2">Veterans Served</div>
                                <p className="text-sm text-slate-600 group-hover:underline">Get in touch</p>
                            </Link>

                            {/* Average Turnaround */}
                            <Link href="/community" className="flex flex-col items-center text-center group">
                                <div className="w-40 h-40 rounded-full flex items-center justify-center shadow-2xl mb-6 transform group-hover:scale-110 transition-transform cursor-pointer" style={{ backgroundColor: '#B91C3C' }}>
                                    <Clock className="w-16 h-16 text-white" />
                                </div>
                                <div className="text-3xl font-bold text-slate-900 mb-2">7-10 Days</div>
                                <div className="text-base font-semibold text-slate-700 mb-2">Average Turnaround</div>
                                <p className="text-sm text-slate-600 group-hover:underline">Fast professional service</p>
                            </Link>

                            {/* Satisfaction Rate */}
                            <Link href="/case-studies" className="flex flex-col items-center text-center group">
                                <div className="w-40 h-40 rounded-full flex items-center justify-center shadow-2xl mb-6 transform group-hover:scale-110 transition-transform cursor-pointer" style={{ backgroundColor: '#B91C3C' }}>
                                    <Award className="w-16 h-16 text-white" />
                                </div>
                                <div className="text-3xl font-bold text-slate-900 mb-2">98%</div>
                                <div className="text-base font-semibold text-slate-700 mb-2">Satisfaction Rate</div>
                                <p className="text-sm text-slate-600 group-hover:underline">Read Case Studies</p>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>


            {/* Services Section with Navy Background */}
            <section className="relative bg-gradient-to-br from-navy-600 via-navy-700 to-navy-800 text-white py-16 sm:py-24 w-full" style={{ marginTop: '-2px' }}>
                {/* Top Wave Transition */}
                <div className="absolute top-0 left-0 w-full" style={{ marginTop: '-1px', pointerEvents: 'none' }}>
                    <svg className="w-full" viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ height: '120px', display: 'block', verticalAlign: 'middle' }}>
                        <path fill="#ffffff" fillOpacity="1" d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
                    </svg>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Our Services</h2>
                        <p className="text-xl text-white/90">
                            Professional medical documentation for your VA claim
                        </p>
                    </div>

                    {services.length === 0 ? (
                        <div className="text-center py-12 text-white/80">Services coming soon</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {services.map((service) => (
                                <article
                                    key={service.id}
                                    className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all hover:scale-105 h-full flex flex-col"
                                >
                                    <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                                    <div className="text-white/80 text-sm mb-4 leading-relaxed whitespace-pre-wrap flex-grow">
                                        {service.short_description.split('\n').map((line, i) => {
                                            return line.trim() ? <p key={i} className="mb-1">{line}</p> : <br key={i} />;
                                        })}
                                    </div>
                                    <Link
                                        href={`/services/${service.slug}`}
                                        className="inline-flex items-center text-white font-semibold text-sm hover:text-navy-200 transition-colors mt-auto"
                                        aria-label={`Learn more about ${service.title}`}
                                    >
                                        <span>Learn more</span>
                                        <ArrowRight className="w-4 h-4 ml-1" />
                                    </Link>
                                </article>
                            ))}
                        </div>
                    )}
                </div>

                {/* Bottom Wave Transition */}
                <div className="absolute bottom-0 left-0 w-full" style={{ marginBottom: '-2px', pointerEvents: 'none' }}>
                    <svg className="w-full" viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ height: '120px', display: 'block', verticalAlign: 'middle' }}>
                        <path fill="#0f172a" fillOpacity="1" d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
                    </svg>
                </div>
            </section>

            {/* How It Works Section - Dark Background */}
            <section className="relative bg-slate-950 text-white py-12 sm:py-16 md:py-24 w-full" style={{ marginTop: '-2px' }}>
                <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10 sm:mb-12 md:mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">How It Works</h2>
                        <p className="text-base sm:text-lg md:text-xl text-slate-300">Simple, straightforward process</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
                        {[
                            { num: '01', title: 'Choose Service', desc: 'Select the service that fits your needs' },
                            { num: '02', title: 'Submit Records', desc: 'Upload your medical and service records' },
                            { num: '03', title: 'Expert Review', desc: 'Licensed clinicians review your case' },
                            { num: '04', title: 'Receive Documentation', desc: 'Get your completed nexus letter or DBQ' }
                        ].map((step) => (
                            <div key={step.num} className="text-center">
                                <div className="text-5xl sm:text-6xl font-bold text-navy-500/30 mb-3 sm:mb-4">{step.num}</div>
                                <h3 className="text-lg sm:text-xl font-bold mb-2 text-white">{step.title}</h3>
                                <p className="text-slate-300 text-sm sm:text-base">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Wave Transition */}
                <div className="absolute bottom-0 left-0 w-full overflow-hidden" style={{ lineHeight: 0 }}>
                    <svg className="w-full" viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ height: '80px', display: 'block' }}>
                        <path fill="#ffffff" d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>
                </div>
            </section>

            {/* Latest Resources Section */}
            <section className="relative bg-white py-16 sm:py-20 w-full overflow-hidden">
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-slate-900 mb-3">Latest Resources</h2>
                        <p className="text-lg text-slate-600">Guides and updates to help with your claim</p>
                    </div>

                    {blogPosts.length === 0 ? (
                        <div className="text-center py-12 text-slate-600">Resources coming soon</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                            {blogPosts.map((post) => (
                                <article
                                    key={post.id}
                                    className="bg-white rounded-xl overflow-hidden border border-slate-200 hover:shadow-lg transition-all group h-full flex flex-col"
                                >
                                    <Link href={`/blog/${post.slug}`} className="flex flex-col h-full" aria-label={`Read article: ${post.title}`}>
                                        {post.featured_image_url && (
                                            <div className="aspect-video bg-gradient-to-br from-indigo-400 to-indigo-500 overflow-hidden">
                                                <img
                                                    src={post.featured_image_url}
                                                    alt={post.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    loading="lazy"
                                                />
                                            </div>
                                        )}
                                        <div className="p-6 flex-grow flex flex-col">
                                            {post.category && (
                                                <div className="text-xs font-semibold uppercase mb-2" style={{ color: '#1e3a5f' }}>
                                                    {post.category}
                                                </div>
                                            )}
                                            <h3 className="text-lg font-bold text-slate-900 mb-2 transition-colors" style={{ '--tw-text-opacity': '1' }}>
                                                {post.title}
                                            </h3>
                                            <div className="text-sm text-slate-600 mb-4 line-clamp-2 whitespace-pre-wrap flex-grow">
                                                {post.excerpt.split('\n').map((line, i) => {
                                                    return line.trim() ? <span key={i}>{line} </span> : null;
                                                })}
                                            </div>
                                            <div className="flex items-center justify-between text-xs text-slate-500 mt-auto">
                                                <span>{new Date(post.published_at).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}</span>
                                                <span>{post.read_time || '5'} min read</span>
                                            </div>
                                        </div>
                                    </Link>
                                </article>
                            ))}
                        </div>
                    )}

                    <div className="text-center mt-12">
                        <Link
                            href="/blog"
                            className="inline-flex items-center space-x-2 text-navy-700 font-semibold hover:text-navy-800 transition-colors"
                        >
                            <span>View All Resources</span>
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default Home;
