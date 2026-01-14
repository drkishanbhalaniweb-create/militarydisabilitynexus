import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Award, CheckCircle, Shield, ArrowRight, FileText, Clipboard } from 'lucide-react';
import { servicesApi } from '../../src/lib/api';
import SEO from '../../src/components/SEO';
import Layout from '../../src/components/Layout';

const Services = ({ services }) => {
    const getIconComponent = (iconName) => {
        const icons = {
            'file-text': FileText,
            'clipboard': Clipboard,
            'heart-pulse': CheckCircle,
            'users': Award,
            'lightbulb': Award,
            'file-search': Shield,
            'alert-triangle': CheckCircle,
        };
        return icons[iconName] || Shield;
    };

    return (
        <Layout>
            <SEO
                title="VA Medical Documentation Services USA | Military Disability Nexus"
                description="Veteran-focused medical documentation services from clinicians who review records and provide VA-compliant evidence to support disability claims nationwide."
                keywords="VA nexus letter, DBQ evaluation, aid and attendance, C&P exam coaching, 1151 claim, veteran medical services"
                canonical="/services"
                breadcrumbs={[
                    { name: 'Home', path: '/' },
                    { name: 'Services', path: '/services' }
                ]}
            />

            <div className="relative min-h-screen overflow-hidden">
                {/* Fixed Background Image with Glassmorphic Blur */}
                <div className="fixed inset-0 z-0 overflow-hidden">
                    <img
                        src="/wavefillservicep.png"
                        alt="Background pattern"
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{
                            filter: 'blur(4px)',
                            transform: 'scale(1.1)'
                        }}
                        role="presentation"
                        aria-hidden="true"
                    />
                    <div className="absolute inset-0 bg-white/50"></div>
                </div>

                {/* Content */}
                <div className="relative z-10">
                    {/* Hero Section */}
                    <section className="py-24">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                            <h1 className="text-5xl font-bold text-slate-900 mb-6">VA Disability Services</h1>
                            <p className="text-xl text-slate-700 max-w-2xl mx-auto">
                                Professional medical documentation for your VA disability claim
                            </p>
                        </div>
                    </section>

                    {/* Services Grid */}
                    <section className="pb-24">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            {!services || services.length === 0 ? (
                                <div className="text-center py-20">
                                    <p className="text-slate-600 text-lg">No services available at the moment.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    <h2 className="sr-only">Available Services</h2>
                                    {services.map((service) => {
                                        const IconComponent = getIconComponent(service.icon);
                                        return (
                                            <div
                                                key={service.id}
                                                className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-white/40 shadow-2xl hover:shadow-3xl transition-all hover:scale-105 group"
                                            >
                                                {/* Icon */}
                                                <div className="w-16 h-16 bg-gradient-to-br from-navy-600 to-navy-800 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                                                    <IconComponent className="w-8 h-8 text-white" />
                                                </div>

                                                {/* Title */}
                                                <h3 className="text-2xl font-bold text-slate-900 mb-3">{service.title}</h3>

                                                {/* Description */}
                                                <div className="text-slate-600 mb-6 leading-relaxed whitespace-pre-wrap">
                                                    {service.short_description.split('\n').map((line, i) => {
                                                        return line.trim() ? <p key={i} className="mb-2">{line}</p> : <br key={i} />;
                                                    })}
                                                </div>

                                                {/* Features */}
                                                {service.features && service.features.length > 0 && (
                                                    <div className="space-y-3 mb-6">
                                                        {service.features.slice(0, 3).map((feature, idx) => (
                                                            <div key={idx} className="flex items-start space-x-2">
                                                                <CheckCircle className="w-5 h-5 text-navy-700 mt-0.5 flex-shrink-0" />
                                                                <span className="text-sm text-slate-700">{feature}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Pricing */}
                                                {service.pricing && (
                                                    <div className="mb-6 p-4 bg-navy-50/80 backdrop-blur-sm rounded-lg border border-navy-100/50">
                                                        <div className="text-sm text-slate-600 mb-1">Starting at</div>
                                                        <div className="text-3xl font-bold text-navy-700">${service.pricing.base_price}</div>
                                                    </div>
                                                )}

                                                {/* CTA */}
                                                <Link
                                                    href={`/services/${service.slug}`}
                                                    className="inline-flex items-center space-x-2 text-navy-700 font-semibold hover:text-navy-800 transition-colors group-hover:translate-x-1"
                                                >
                                                    <span>Learn More</span>
                                                    <ArrowRight className="w-5 h-5" />
                                                </Link>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* CTA Section */}
                    <section className="pb-24">
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="bg-gradient-to-br from-navy-600 via-navy-700 to-navy-800 rounded-3xl p-12 text-center shadow-2xl relative overflow-hidden">
                                <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
                                <div className="relative z-10">
                                    <h2 className="text-4xl font-bold text-white mb-6">
                                        Ready to Get Started?
                                    </h2>
                                    <p className="text-xl text-white/90 mb-8">
                                        Contact us for a free consultation and let us help strengthen your VA claim
                                    </p>
                                    <Link
                                        href="/contact"
                                        className="inline-flex items-center space-x-2 bg-white text-navy-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-slate-50 transition-all hover:scale-105 shadow-xl"
                                    >
                                        <span>Contact Us</span>
                                        <ArrowRight className="w-5 h-5" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </Layout>
    );
};

export async function getStaticProps() {
    try {
        const services = await servicesApi.getAll();
        return {
            props: {
                services: services || [],
            },
            revalidate: 10, // Revalidate every 10 seconds
        };
    } catch (error) {
        console.error('Error fetching services for static props:', error);
        return {
            props: {
                services: [],
            },
            revalidate: 86400,
        };
    }
}

export default Services;
