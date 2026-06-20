import { useState, useEffect, useCallback } from 'react';
import { pricingTierApi } from '../../lib/api';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '../ui/dialog';
import { Check, AlertTriangle, Star, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const PricingModal = ({ isOpen, onClose, isMentalHealth = false }) => {
    const [tiers, setTiers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasFetched, setHasFetched] = useState(false);

    const fetchTiers = useCallback(async () => {
        if (hasFetched) return;
        setLoading(true);
        try {
            const data = await pricingTierApi.getAll();
            setTiers(data);
            setHasFetched(true);
        } catch (error) {
            console.error('Failed to load pricing tiers:', error);
        } finally {
            setLoading(false);
        }
    }, [hasFetched]);

    useEffect(() => {
        if (isOpen && !hasFetched) {
            fetchTiers();
        }
    }, [isOpen, hasFetched, fetchTiers]);

    const getDisplayPrice = (tier) => {
        let price = tier.base_price;
        if (isMentalHealth && tier.mental_health_price) {
            price = tier.mental_health_price;
        }
        if (price && typeof price === 'string') {
            if (tier.slug === 'nurse-practitioner') {
                return price.replace(/(\$\d[\d,]*)(?!\+)/g, '$1+');
            } else {
                return price.replace(/\+/g, '');
            }
        }
        return price;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden border-none bg-white rounded-[2rem] shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-navy-900 px-8 py-8 text-white relative">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20" />
                    <DialogHeader>
                        <DialogTitle className="text-2xl md:text-3xl font-extrabold mb-2">
                            Pricing Structure
                        </DialogTitle>
                        <DialogDescription className="text-navy-100 text-base opacity-90 leading-relaxed">
                            Choose the provider tier that best matches the complexity of your claim.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-6 md:p-8 space-y-6">
                    {/* Mental Health Warning */}
                    {isMentalHealth && (
                        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-bold text-amber-900">Mental Health Pricing</p>
                                <p className="text-sm text-amber-800 mt-1">
                                    Mental health conditions require specialized expertise and more detailed medical opinions. Pricing reflects the additional complexity involved.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* How Pricing Works */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                        <p className="text-sm font-bold text-slate-900 mb-1">How pricing works</p>
                        <p className="text-sm text-slate-600">
                            Pricing varies by provider qualification and claim complexity. At the Internist/Specialist level, all claim theories (presumptive, direct, secondary to multiple conditions) are included in a single nexus letter. Example: veteran claiming migraine with evidence of presumptive, direct, secondary to tinnitus, PTSD, and pain from an Internist— all addressed in one opinion at $945.
                        </p>
                    </div>

                    {/* Tier Cards */}
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-navy-600" />
                        </div>
                    ) : tiers.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-slate-500">Pricing information is currently being updated. Please contact us for details.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {tiers.map((tier) => {
                                const featured = tier.is_featured;
                                return (
                                    <div
                                        key={tier.id}
                                        className={`relative rounded-2xl p-6 flex flex-col transition-transform duration-200 ${
                                            featured
                                                ? 'bg-navy-900 text-white shadow-xl scale-[1.02] border-2 border-navy-700'
                                                : 'bg-white border-2 border-slate-200 hover:border-slate-300 hover:shadow-md'
                                        }`}
                                    >
                                        {/* Featured Badge */}
                                        {featured && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-400 text-amber-900 text-xs font-bold rounded-full shadow-sm">
                                                    <Star className="w-3 h-3 fill-amber-900" /> Most Chosen
                                                </span>
                                            </div>
                                        )}

                                        {/* Tier Name & Provider */}
                                        <div className="mb-4">
                                            <h3 className={`text-lg font-bold ${featured ? 'text-white' : 'text-slate-900'}`}>
                                                {tier.name}
                                            </h3>
                                            {tier.provider_description && (
                                                <p className={`text-sm mt-1 ${featured ? 'text-navy-200' : 'text-slate-500'}`}>
                                                    {tier.provider_description}
                                                </p>
                                            )}
                                        </div>

                                        {/* Price */}
                                        <div className="mb-4">
                                            <span className={`text-3xl font-extrabold ${featured ? 'text-white' : 'text-slate-900'}`}>
                                                {getDisplayPrice(tier)}
                                            </span>
                                            {tier.note && (
                                                <p className={`text-xs mt-1 ${featured ? 'text-navy-300' : 'text-slate-500'}`}>
                                                    {tier.note}
                                                </p>
                                            )}
                                        </div>

                                        {/* Best For */}
                                        {tier.best_for && (
                                            <div className={`p-3 rounded-lg mb-4 text-sm ${
                                                featured
                                                    ? 'bg-navy-800 text-navy-100'
                                                    : 'bg-slate-50 text-slate-700'
                                            }`}>
                                                <span className="font-semibold">Best for: </span>
                                                {tier.best_for}
                                            </div>
                                        )}

                                        {/* Features */}
                                        {(tier.features || []).length > 0 && (
                                            <ul className="space-y-2 mb-6 flex-grow">
                                                {tier.features.map((feature, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm">
                                                        <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                                                            featured ? 'text-emerald-400' : 'text-emerald-600'
                                                        }`} />
                                                        <span className={featured ? 'text-navy-100' : 'text-slate-600'}>
                                                            {feature}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                        {/* CTA */}
                                        <Link
                                            href={`/forms?service=independent-medical-opinion-nexus-letter&tier=${tier.slug}`}
                                            onClick={onClose}
                                            className={`mt-auto w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-colors ${
                                                featured
                                                    ? 'bg-white text-navy-900 hover:bg-slate-100'
                                                    : 'bg-navy-900 text-white hover:bg-navy-800'
                                            }`}
                                        >
                                            Get Started <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Footer Note */}
                    <p className="text-center text-xs text-slate-400 pt-2">
                        All consultations are free. Pricing applies only after you decide to proceed.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PricingModal;
