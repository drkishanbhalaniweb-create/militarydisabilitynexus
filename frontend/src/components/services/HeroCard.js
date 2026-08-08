import Link from 'next/link';

const HeroCard = ({ heading, description, subDescription, badge, primaryCta, secondaryCta }) => {
    return (
        <section className="bg-slate-900 text-white rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
                {badge && (
                    <div className="mb-4">
                        {badge}
                    </div>
                )}
                <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}>
                    {heading}
                </h1>
                {subDescription && (
                    <p className="text-sm text-slate-400 mb-2">{subDescription}</p>
                )}
                {description && (
                    <p className="text-lg md:text-xl text-slate-300 leading-relaxed">{description}</p>
                )}
                <div className="flex flex-wrap gap-3 mt-8">
                    {primaryCta && (
                        primaryCta.onClick ? (
                            <button
                                onClick={primaryCta.onClick}
                                className="text-white px-8 py-4 rounded-xl font-semibold text-center transition-all hover:shadow-lg hover:brightness-110"
                                style={{ backgroundColor: '#B91C3C' }}
                            >
                                {primaryCta.label}
                            </button>
                        ) : primaryCta.href ? (
                            <Link
                                href={primaryCta.href}
                                className="text-white px-8 py-4 rounded-xl font-semibold text-center transition-all hover:shadow-lg hover:brightness-110 flex items-center justify-center"
                                style={{ backgroundColor: '#B91C3C' }}
                            >
                                {primaryCta.label}
                            </Link>
                        ) : null
                    )}
                    {secondaryCta && secondaryCta.href && (
                        <Link
                            href={secondaryCta.href}
                            className="bg-white/10 border border-white/20 text-white px-8 py-4 rounded-xl font-semibold text-center hover:bg-white/15 transition-all"
                        >
                            {secondaryCta.label}
                        </Link>
                    )}
                </div>
            </div>
        </section>
    );
};

export default HeroCard;
