import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Clock, DollarSign } from 'lucide-react';
import { servicesApi } from '../lib/api';
import SEO from '../components/SEO';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';

const ServiceDetail = () => {
  const { slug } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      try {
        // Clean the slug - take only the first part before any comma
        const cleanSlug = slug.split(',')[0].trim();
        const data = await servicesApi.getBySlug(cleanSlug);
        setService(data);
      } catch (error) {
        console.error('Error fetching service:', error);
        setService(null);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Service not found</h2>
          <p className="text-slate-600 mb-4">The requested service could not be loaded.</p>
          <div className="space-x-4">
            <Link to="/services" className="text-indigo-600 hover:text-indigo-700">
              Back to Services
            </Link>
            <button 
              onClick={() => window.location.reload()} 
              className="text-slate-600 hover:text-slate-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Structured data for service
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service.title,
    "description": service.short_description,
    "provider": {
      "@type": "Organization",
      "name": "Military Disability Nexus",
      "url": typeof window !== 'undefined' ? window.location.origin : ''
    },
    "serviceType": service.category,
    "offers": {
      "@type": "Offer",
      "price": service.base_price_usd,
      "priceCurrency": "USD"
    }
  };

  return (
    <>
      <SEO 
        title={service.title}
        description={service.short_description}
        keywords={`${service.title}, ${service.category}, VA disability, medical documentation`}
        structuredData={structuredData}
      />
      <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-br from-navy-700 to-navy-800 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/services"
            className="inline-flex items-center space-x-2 text-navy-100 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Services</span>
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">{service.title}</h1>
          <p className="text-xl text-navy-100">{service.short_description}</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <div className="bg-white rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Overview</h2>
              <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {service.full_description.split('\n').map((line, i) => {
                  // Check if line starts with bullet point markers
                  if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')) {
                    return (
                      <div key={i} className="flex gap-2 mb-2">
                        <span className="flex-shrink-0">•</span>
                        <span>{line.trim().replace(/^[•\-*]\s*/, '')}</span>
                      </div>
                    );
                  }
                  // Regular paragraph
                  return line.trim() ? <p key={i} className="mb-3">{line}</p> : <br key={i} />;
                })}
              </div>
            </div>

            {/* What's Included */}
            <div className="bg-white rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">What's Included</h2>
              <div className="space-y-4">
                {service.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-navy-600 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-white rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
              <Accordion type="single" collapsible className="w-full">
                {service.faqs.map((faq, idx) => (
                  <AccordionItem key={idx} value={`item-${idx}`}>
                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent>
                      <div className="text-slate-600 whitespace-pre-wrap">
                        {faq.answer.split('\n').map((line, i) => {
                          // Check if line starts with bullet point markers
                          if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')) {
                            return (
                              <div key={i} className="flex gap-2 mb-1">
                                <span className="flex-shrink-0">•</span>
                                <span>{line.trim().replace(/^[•\-*]\s*/, '')}</span>
                              </div>
                            );
                          }
                          // Regular paragraph
                          return line.trim() ? <p key={i} className="mb-3">{line}</p> : <br key={i} />;
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl p-8 shadow-xl" style={{ border: '2px solid #B91C3C' }}>
              <div className="mb-6">
                <div className="text-sm text-slate-500 mb-2">Starting at</div>
                <div className="text-4xl font-bold text-slate-900 mb-1">
                  ${service.base_price_usd?.toLocaleString() || 'N/A'}
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-3 text-slate-700">
                  <Clock className="w-5 h-5 text-navy-600" />
                  <span>{service.duration}</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-700">
                  <CheckCircle className="w-5 h-5 text-navy-600" />
                  <span>One on One consultation with Expert</span>
                </div>
              </div>

              {service.slug === 'claim-readiness-review' ? (
                <Link
                  to="/claim-readiness-review"
                  data-testid="book-now-button"
                  className="w-full text-white px-6 py-4 rounded-full font-semibold text-center transition-all hover:shadow-lg block"
                  style={{ backgroundColor: '#B91C3C' }}
                >
                  Book Now - $225
                </Link>
              ) : service.slug === 'aid-attendance' ? (
                <div className="space-y-3">
                  <Link
                    to="/aid-attendance-form"
                    data-testid="aid-attendance-form-button"
                    className="w-full text-white px-6 py-4 rounded-full font-semibold text-center transition-all hover:shadow-lg block"
                    style={{ backgroundColor: '#B91C3C' }}
                  >
                    Complete Aid & Attendance Form
                  </Link>
                  <Link
                    to="/contact"
                    data-testid="book-now-button"
                    className="w-full bg-white text-navy-600 px-6 py-4 rounded-full font-semibold text-center hover:bg-slate-50 transition-all border-2 border-navy-600 block"
                  >
                    General Inquiry
                  </Link>
                </div>
              ) : (
                <Link
                  to="/contact"
                  data-testid="book-now-button"
                  className="w-full text-white px-6 py-4 rounded-full font-semibold text-center transition-all hover:shadow-lg block"
                  style={{ backgroundColor: '#B91C3C' }}
                >
                  Get a Free Consultation
                </Link>
              )}

              {(service.slug === 'claim-readiness-review' || service.slug === 'aid-attendance') && (
                <p className="text-sm text-slate-500 mt-4 text-center">
                  {service.slug === 'claim-readiness-review'
                    ? 'Pay now and get your comprehensive review in 5-7 days'
                    : 'Complete our specialized form for faster processing'
                  }
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default ServiceDetail;
