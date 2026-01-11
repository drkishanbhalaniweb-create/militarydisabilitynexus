import Link from 'next/link';
import { useRouter } from 'next/router';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import Logo from './Logo';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => router.pathname === path;

  const navLinks = [
    { name: 'Services', path: '/services' },
    { name: 'Case Studies', path: '/case-studies' },
    { name: 'Blog', path: '/blog' },
    { name: 'Community', path: '/community' },
    { name: 'Forms', path: '/forms' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-all duration-300 ${scrolled
      ? 'bg-white/70 border-slate-200/50 shadow-lg'
      : 'bg-white/50 border-white/20'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex justify-between items-center transition-all duration-300 ${scrolled ? 'h-20' : 'h-24'
          }`}>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-4 group" data-testid="header-logo">
            <Logo className={`transition-all duration-300 ${scrolled ? 'w-24 h-24' : 'w-32 h-32'}`} />
            <div>
              <div className={`font-bold text-slate-900 transition-all duration-300 ${scrolled ? 'text-base' : 'text-lg'
                }`}>Military Disability Nexus</div>
              {!scrolled && (
                <div className="text-sm text-slate-500 transition-opacity duration-300">
                  Clinician-led expert medical opinions for VA disability claims
                </div>
              )}
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                data-testid={`nav-${link.name.toLowerCase()}`}
                className={`text-sm font-medium transition-colors ${isActive(link.path)
                  ? 'text-slate-900'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* CTA Button */}
          <Link
            href="/contact"
            data-testid="header-cta-button"
            className="hidden md:flex items-center space-x-2 text-white px-6 py-2.5 rounded-lg font-semibold transition-all hover:opacity-90"
            style={{ backgroundColor: '#B91C3C' }}
          >
            <span>Book a Call</span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            data-testid="mobile-menu-button"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white" data-testid="mobile-menu">
          <nav className="px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2 text-base font-medium transition-colors ${isActive(link.path)
                  ? 'text-slate-900'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center space-x-2 text-white px-6 py-3 rounded-lg font-semibold w-full"
              style={{ backgroundColor: '#B91C3C' }}
            >
              <span>Book a Call</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
