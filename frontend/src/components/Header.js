import Link from 'next/link';
import { useRouter } from 'next/router';
import { Menu, X, ChevronDown, FileText, ClipboardCheck, Heart, Search, AlertTriangle } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import Logo from './Logo';

const serviceLinks = [
    {
        name: 'Nexus Letter / IMO',
        description: 'Independent medical opinions linking conditions to service',
        href: '/services/independent-medical-opinion-nexus-letter',
        icon: FileText,
    },
    {
        name: 'DBQ Evaluation',
        description: 'Disability Benefits Questionnaires for VA claims',
        href: '/services/disability-benefits-questionnaire-dbq',
        icon: ClipboardCheck,
    },
    {
        name: 'Aid & Attendance',
        description: 'Medical documentation for housebound & caregiver benefits',
        href: '/services/aid-and-attendance',
        icon: Heart,
    },
    {
        name: 'Claim Readiness Review',
        description: 'Pre-filing analysis of your medical records',
        href: '/services/claim-readiness-review',
        icon: Search,
    },
    {
        name: '1151 Claim (VA Malpractice)',
        description: 'Expert opinions for VA medical negligence cases',
        href: '/services/va-medical-malpractice-1151-case',
        icon: AlertTriangle,
    },
];

const Header = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [servicesOpen, setServicesOpen] = useState(false);
    const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
    const router = useRouter();
    const dropdownRef = useRef(null);
    const timeoutRef = useRef(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdown on route change
    useEffect(() => {
        setServicesOpen(false);
        setMobileMenuOpen(false);
        setMobileServicesOpen(false);
    }, [router.asPath]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setServicesOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isActive = (path) => router.pathname === path;
    const isServicesActive = router.pathname.startsWith('/services');

    const handleMouseEnter = useCallback(() => {
        clearTimeout(timeoutRef.current);
        setServicesOpen(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        timeoutRef.current = setTimeout(() => {
            setServicesOpen(false);
        }, 150);
    }, []);

    const navLinks = [
        { name: 'Case Studies', path: '/case-studies' },
        { name: 'Testimonials', path: '/testimonials' },
        { name: 'Blog', path: '/blog' },
        { name: 'Community', path: '/community' },
        { name: 'Forms', path: '/forms' },
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
                        {/* Services Mega-Menu Trigger */}
                        <div
                            ref={dropdownRef}
                            className="relative"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            <button
                                onClick={() => setServicesOpen(!servicesOpen)}
                                className={`flex items-center gap-1 text-sm font-medium transition-colors ${isServicesActive
                                    ? 'text-slate-900'
                                    : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                aria-expanded={servicesOpen}
                                aria-haspopup="true"
                                data-testid="nav-services"
                            >
                                Services
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${servicesOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Panel */}
                            <div
                                className={`absolute top-full left-1/2 -translate-x-1/2 pt-3 transition-all duration-200 ${servicesOpen
                                    ? 'opacity-100 translate-y-0 pointer-events-auto'
                                    : 'opacity-0 -translate-y-1 pointer-events-none'
                                    }`}
                                style={{ width: '380px' }}
                            >
                                <div className="bg-white rounded-xl shadow-xl border border-slate-200/80 overflow-hidden ring-1 ring-black/5">
                                    <div className="p-2">
                                        {serviceLinks.map((service) => {
                                            const Icon = service.icon;
                                            return (
                                                <Link
                                                    key={service.href}
                                                    href={service.href}
                                                    className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors group"
                                                >
                                                    <div className="w-9 h-9 rounded-lg bg-navy-50 flex items-center justify-center flex-shrink-0 group-hover:bg-navy-100 transition-colors mt-0.5">
                                                        <Icon className="w-4.5 h-4.5 text-navy-700" strokeWidth={1.8} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-sm font-semibold text-slate-900 group-hover:text-navy-700 transition-colors">
                                                            {service.name}
                                                        </div>
                                                        <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                                                            {service.description}
                                                        </div>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                    <div className="border-t border-slate-100 px-3 py-2.5 bg-slate-50/50">
                                        <Link
                                            href="/services"
                                            className="flex items-center justify-between text-sm font-medium text-navy-700 hover:text-navy-800 transition-colors px-2 py-1"
                                        >
                                            <span>View All Services</span>
                                            <span className="text-navy-400">→</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                href={link.path}
                                data-testid={`nav-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
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
                    <nav className="px-4 py-6 space-y-1">
                        {/* Mobile Services Accordion */}
                        <div>
                            <button
                                onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                                className={`flex items-center justify-between w-full py-2 text-base font-medium transition-colors ${isServicesActive
                                    ? 'text-slate-900'
                                    : 'text-slate-600'
                                    }`}
                            >
                                <span>Services</span>
                                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileServicesOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {mobileServicesOpen && (
                                <div className="pl-4 pb-2 space-y-1">
                                    {serviceLinks.map((service) => (
                                        <Link
                                            key={service.href}
                                            href={service.href}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="block py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
                                        >
                                            {service.name}
                                        </Link>
                                    ))}
                                    <Link
                                        href="/services"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block py-2 text-sm font-medium text-navy-700"
                                    >
                                        View All Services →
                                    </Link>
                                </div>
                            )}
                        </div>

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
                            className="flex items-center justify-center space-x-2 text-white px-6 py-3 rounded-lg font-semibold w-full mt-4"
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
