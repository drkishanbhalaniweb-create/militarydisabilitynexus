import { useEffect, useState } from 'react';

const TableOfContents = ({ items, mobile = false }) => {
    const [activeId, setActiveId] = useState('');

    useEffect(() => {
        if (!items || items.length === 0) return;

        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -60% 0px',
            threshold: 0
        };

        const observerCallback = (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveId(entry.target.id);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        items.forEach((item) => {
            const element = document.getElementById(item.id);
            if (element) {
                observer.observe(element);
            }
        });

        // Also check on manual scroll to catch edges
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            
            // If we are at the very top, clear active
            if (scrollPosition < 200) {
                setActiveId('');
            }
        };
        
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            observer.disconnect();
            window.removeEventListener('scroll', handleScroll);
        };
    }, [items]);

    if (!items || items.length === 0) return null;

    if (mobile) {
        return (
            <div className="bg-[#Faf9f6] border-l-4 border-[#cca35e] p-6 rounded-r-2xl shadow-sm max-h-64 overflow-y-auto">
                <div className="text-xs font-bold tracking-[0.15em] text-slate-400 uppercase mb-4 flex items-center gap-3">
                    <span className="w-8 h-px bg-slate-300"></span>
                    On This Page
                </div>
                <ul className="list-none p-0 m-0 space-y-4">
                    {items.map((h, i) => {
                        const isActive = activeId === h.id;
                        return (
                            <li key={h.id}>
                                <a 
                                    href={`#${h.id}`} 
                                    className={`flex items-start gap-3 group no-underline transition-colors ${isActive ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        const element = document.getElementById(h.id);
                                        if (element) {
                                            element.scrollIntoView({ behavior: 'smooth' });
                                            setActiveId(h.id);
                                        }
                                    }}
                                >
                                    <span className={`${isActive ? 'text-[#cca35e]' : 'text-slate-400 group-hover:text-[#cca35e]'} font-bold text-sm leading-snug transition-colors`}>{i + 1}.</span>
                                    <span className={`text-sm font-medium leading-snug transition duration-300 ${isActive ? 'font-bold underline decoration-[#cca35e]/40 underline-offset-4' : 'group-hover:underline decoration-slate-300 underline-offset-4'}`}>
                                        {h.text}
                                    </span>
                                </a>
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    }

    return (
        <div className="p-2 max-h-[calc(100vh-160px)] overflow-y-auto subtle-scrollbar pr-4">
            <div className="text-[11px] font-bold tracking-[0.2em] text-slate-400 uppercase mb-6 flex items-center gap-3">
                <span className="w-6 h-px bg-slate-300"></span>
                On This Page
            </div>
            <ul className="list-none p-0 m-0 space-y-2.5">
                {items.map((h) => {
                    const isActive = activeId === h.id;
                    return (
                        <li key={h.id}>
                            <a 
                                href={`#${h.id}`} 
                                className={`flex items-start gap-2.5 group no-underline transition-all duration-300 font-mono text-[13px] leading-relaxed ${isActive ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    const element = document.getElementById(h.id);
                                    if (element) {
                                        const offset = 100;
                                        const bodyRect = document.body.getBoundingClientRect().top;
                                        const elementRect = element.getBoundingClientRect().top;
                                        const elementPosition = elementRect - bodyRect;
                                        const offsetPosition = elementPosition - offset;

                                        window.scrollTo({
                                            top: offsetPosition,
                                            behavior: 'smooth'
                                        });
                                        setActiveId(h.id);
                                    }
                                }}
                            >
                                <span className={`transition-colors duration-300 mt-1 ${isActive ? 'text-navy-700' : 'text-slate-300 group-hover:text-slate-400'}`}>
                                    {isActive ? '→' : '—'}
                                </span>
                                <span className={`transition-all duration-300 ${isActive ? 'translate-x-0.5 font-bold' : 'group-hover:translate-x-0.5'}`}>
                                    {h.text}
                                </span>
                            </a>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default TableOfContents;
