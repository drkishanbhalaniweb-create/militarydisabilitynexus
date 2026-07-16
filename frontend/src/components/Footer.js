import Link from 'next/link';
import { Linkedin, Facebook, Instagram } from 'lucide-react';

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
            backgroundImage: 'url("/Gemini_Generated_Image_7ax9sd7ax9sd7ax9.webp")',
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
          {/* FOLLOW US */}
          <div>
            <h3 className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-6">FOLLOW US</h3>
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

          {/* SERVICES & COMPANY stacked */}
          <div className="space-y-12">
            <div>
              <h3 className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-6">SERVICES</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/services/claim-readiness-review" onClick={handleLinkClick} className="text-slate-300 hover:text-white transition-colors">
                    Claim Readiness Review
                  </Link>
                </li>
                <li>
                  <Link href="/services/independent-medical-opinion-nexus-letter" onClick={handleLinkClick} className="text-slate-300 hover:text-white transition-colors">
                    Nexus Letter / IMO
                  </Link>
                </li>
                <li>
                  <Link href="/services/disability-benefits-questionnaire-dbq" onClick={handleLinkClick} className="text-slate-300 hover:text-white transition-colors">
                    Disability Benefits Questionnaire (DBQ)
                  </Link>
                </li>
                <li>
                  <Link href="/services/aid-and-attendance" onClick={handleLinkClick} className="text-slate-300 hover:text-white transition-colors">
                    Aid & Attendance Claims
                  </Link>
                </li>
                <li>
                  <Link href="/services/va-1151-claim" onClick={handleLinkClick} className="text-slate-300 hover:text-white transition-colors">
                    1151 Claims
                  </Link>
                </li>
                <li>
                  <Link href="/services/tdiu-unemployability-medical-documentation" onClick={handleLinkClick} className="text-slate-300 hover:text-white transition-colors">
                    TDIU
                  </Link>
                </li>
                <li>
                  <Link href="/services/attorney-advocate-partnership" onClick={handleLinkClick} className="text-slate-300 hover:text-white transition-colors">
                    Attorney & Advocate Partnership Program
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-6">COMPANY</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/about" onClick={handleLinkClick} className="text-slate-300 hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/methodology" onClick={handleLinkClick} className="text-slate-300 hover:text-white transition-colors">
                    Methodology & Editorial Standards
                  </Link>
                </li>
                <li>
                  <Link href="/corrections-policy" onClick={handleLinkClick} className="text-slate-300 hover:text-white transition-colors">
                    Corrections Policy
                  </Link>
                </li>
                <li>
                  <Link href="/community-guidelines" onClick={handleLinkClick} className="text-slate-300 hover:text-white transition-colors">
                    Community Guidelines
                  </Link>
                </li>
                <li>
                  <Link href="/contact" onClick={handleLinkClick} className="text-slate-300 hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* RESOURCES */}
          <div>
            <h3 className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-6">RESOURCES</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/case-studies" onClick={handleLinkClick} className="text-slate-300 hover:text-white transition-colors">
                  Case Studies
                </Link>
              </li>
              <li>
                <Link href="/blog" onClick={handleLinkClick} className="text-slate-300 hover:text-white transition-colors">
                  Blogs
                </Link>
              </li>
              <li>
                <Link href="/community" onClick={handleLinkClick} className="text-slate-300 hover:text-white transition-colors">
                  Community Q&A
                </Link>
              </li>
              <li>
                <Link href="/testimonials" onClick={handleLinkClick} className="text-slate-300 hover:text-white transition-colors">
                  Testimonials
                </Link>
              </li>
              <li>
                <Link href="/forms" onClick={handleLinkClick} className="text-slate-300 hover:text-white transition-colors">
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
        </div>
      </div>


    </footer>
  );
};

export default Footer;
