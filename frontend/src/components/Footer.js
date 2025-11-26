import { Link } from 'react-router-dom';
import { Twitter, Facebook, Instagram, Mail } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("/Gemini_Generated_Image_7ax9sd7ax9sd7ax9.png")',
            filter: 'blur(3px)',
            transform: 'scale(1.05)',
            width: '100%',
            height: '100%'
          }}
          role="presentation"
          aria-hidden="true"
        ></div>
        <div className="absolute inset-0 bg-slate-900/85"></div>
      </div>

      {/* Footer Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Follow Us */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-all">
                <Twitter className="w-5 h-5 text-white" />
              </a>
              <a href="https://www.facebook.com/share/1DXxUd6Q74/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-all">
                <Facebook className="w-5 h-5 text-white" />
              </a>
              <a href="https://www.instagram.com/military_disability_nexus?igsh=MTFtMmtvODg3NmZlMA==&utm_source=ig_contact_invite" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-all">
                <Instagram className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>

          {/* Get Started */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Get Started</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/services" className="text-white/80 hover:text-white transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-white/80 hover:text-white transition-colors">
                  Resources
                </Link>
              </li>
              <li>
                <Link to="/forms" className="text-white/80 hover:text-white transition-colors">
                  Forms
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-white/80 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">About</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/about" className="text-white/80 hover:text-white transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-white/80 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8">
          <div className="text-center mb-4">
            <p className="text-white/60 text-sm mb-2">
              Copyright © {currentYear} Military Disability Nexus. All Rights Reserved.
            </p>
            <p className="text-white/40 text-xs mb-3">
              Professional medical documentation for VA disability claims | Nexus Letters | DBQs | Aid & Attendance
            </p>
            <div className="flex justify-center space-x-4 text-xs">
              <Link to="/terms" className="text-white/50 hover:text-white/80 transition-colors">
                Terms & Conditions
              </Link>
              <span className="text-white/30">|</span>
              <Link to="/privacy" className="text-white/50 hover:text-white/80 transition-colors">
                Privacy Policy
              </Link>
              <span className="text-white/30">|</span>
              <Link to="/disclaimer" className="text-white/50 hover:text-white/80 transition-colors">
                Disclaimer
              </Link>
            </div>
          </div>
          <div className="text-center">
            <Link to="/admin/login" className="text-white/20 hover:text-white/40 transition-colors text-xs inline-block">
              Admin
            </Link>
          </div>
        </div>
      </div>
      
      {/* Organization Schema - Global */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "MedicalBusiness",
          "name": "Military Disability Nexus",
          "description": "Professional medical documentation services for VA disability claims",
          "url": "https://militarydisabilitynexus.com",
          "logo": "https://militarydisabilitynexus.com/logo.png",
          "image": "https://militarydisabilitynexus.com/og-image.jpg",
          "email": "contact@militarydisabilitynexus.com",
          "telephone": "+1-307-301-2019",
          "areaServed": {
            "@type": "Country",
            "name": "United States"
          },
          "priceRange": "$$",
          "medicalSpecialty": "Veterans Medical Documentation",
          "sameAs": [
            "https://twitter.com/MilitaryDisabilityNexus",
            "https://www.facebook.com/share/1DXxUd6Q74/?mibextid=wwXIfr",
            "https://www.instagram.com/military_disability_nexus?igsh=MTFtMmtvODg3NmZlMA==&utm_source=ig_contact_invite"
          ]
        })}
      </script>
    </footer>
  );
};

export default Footer;
