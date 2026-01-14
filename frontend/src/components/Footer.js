import Link from 'next/link';
import { Linkedin, Facebook, Instagram, Mail } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const handleLinkClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

              <a href="https://www.linkedin.com/company/military-disability-nexus/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-all" aria-label="LinkedIn">
                <Linkedin className="w-5 h-5 text-white" />
              </a>
              <a href="https://www.facebook.com/share/1DXxUd6Q74/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-all" aria-label="Facebook">
                <Facebook className="w-5 h-5 text-white" />
              </a>
              <a href="https://www.instagram.com/military_disability_nexus?igsh=MTFtMmtvODg3NmZlMA==&utm_source=ig_contact_invite" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-all" aria-label="Instagram">
                <Instagram className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>

          {/* Get Started */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Get Started</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/services/claim-readiness-review" onClick={handleLinkClick} className="text-white/80 hover:text-white transition-colors">
                  Claim Readiness Review
                </Link>
              </li>
              <li>
                <Link href="/services/independent-medical-opinion-nexus-letter" onClick={handleLinkClick} className="text-white/80 hover:text-white transition-colors">
                  Nexus Letter/IMO
                </Link>
              </li>
              <li>
                <Link href="/services/disability-benefits-questionnaire-dbq" onClick={handleLinkClick} className="text-white/80 hover:text-white transition-colors">
                  DBQ
                </Link>
              </li>
              <li>
                <Link href="/services/aid-and-attendance" onClick={handleLinkClick} className="text-white/80 hover:text-white transition-colors">
                  Aid & Attendance Claims
                </Link>
              </li>
              <li>
                <Link href="/services/va-medical-malpractice-1151-case" onClick={handleLinkClick} className="text-white/80 hover:text-white transition-colors">
                  1151 Claims
                </Link>
              </li>

            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">About</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/about" onClick={handleLinkClick} className="text-white/80 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/blog" onClick={handleLinkClick} className="text-white/80 hover:text-white transition-colors">
                  Blogs
                </Link>
              </li>
              <li>
                <Link href="/community" onClick={handleLinkClick} className="text-white/80 hover:text-white transition-colors">
                  Community Q&A
                </Link>
              </li>
              <li>
                <Link href="/case-studies" onClick={handleLinkClick} className="text-white/80 hover:text-white transition-colors">
                  Case Studies
                </Link>
              </li>
              <li>
                <Link href="/contact" onClick={handleLinkClick} className="text-white/80 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/forms" onClick={handleLinkClick} className="text-white/80 hover:text-white transition-colors">
                  Forms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8">
          <div className="text-center mb-4">
            <p className="text-white/60 text-sm mb-2">
              Copyright © <span suppressHydrationWarning>{currentYear}</span> Military Disability Nexus. All Rights Reserved.
            </p>
            <p className="text-white/40 text-xs mb-3">
              Professional medical documentation for VA disability claims | Nexus Letters | DBQs | Aid & Attendance
            </p>
            <div className="flex justify-center space-x-4 text-xs">
              <Link href="/terms" onClick={handleLinkClick} className="text-white/50 hover:text-white/80 transition-colors">
                Terms & Conditions
              </Link>
              <span className="text-white/30">|</span>
              <Link href="/privacy" onClick={handleLinkClick} className="text-white/50 hover:text-white/80 transition-colors">
                Privacy Policy
              </Link>
              <span className="text-white/30">|</span>
              <Link href="/disclaimer" onClick={handleLinkClick} className="text-white/50 hover:text-white/80 transition-colors">
                Disclaimer
              </Link>
            </div>
          </div>
          <div className="text-center">
            <Link href="/admin/login" onClick={handleLinkClick} className="text-white/20 hover:text-white/40 transition-colors text-xs inline-block">
              Admin
            </Link>
          </div>
        </div>
      </div>


    </footer>
  );
};

export default Footer;
