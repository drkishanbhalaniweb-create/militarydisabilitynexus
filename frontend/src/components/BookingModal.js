import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Loader2, ShieldCheck, ArrowRight } from 'lucide-react';
import { paymentApi } from '../lib/payment';

const BookingModal = ({ isOpen, onClose, serviceType = 'cp_exam_prep', price = 15000 }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Create a temporary form submission for lead tracking
            // In a real app, you might want a specialized lead table
            // Here we use the checkout session metadata as well

            const successUrl = `${window.location.origin}/cp-exam-coaching/success?session_id={CHECKOUT_SESSION_ID}`;
            const cancelUrl = `${window.location.origin}/cp-exam-coaching`;

            const session = await paymentApi.createCheckoutSession({
                formSubmissionId: 'lead_' + Date.now(), // Generate a temp ID
                serviceType,
                amount: price,
                priceId: 'price_1StIpmGp9b54FZ4D8DdGZXwg', // Force the exact Stripe Product
                isRushService: false,
                customerEmail: formData.email,
                successUrl,
                cancelUrl,
            });

            if (session?.url) {
                window.location.href = session.url;
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('There was an error starting the checkout process. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none bg-white rounded-[2rem] shadow-2xl">
                <div className="bg-navy-900 px-8 py-10 text-white relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
                    <DialogHeader>
                        <DialogTitle className="text-2xl md:text-3xl font-extrabold mb-2">
                            Ready to feel prepared?
                        </DialogTitle>
                        <DialogDescription className="text-navy-100 text-lg opacity-90 leading-relaxed">
                            Enter your details below to proceed to secure payment and schedule your session.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-slate-700 font-bold ml-1">Full Name</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="John Doe"
                                required
                                value={formData.name}
                                onChange={handleInputChange}
                                className="h-14 rounded-xl border-slate-200 focus:border-navy-500 focus:ring-navy-500 text-lg px-4"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-700 font-bold ml-1">Email Address</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="john@example.com"
                                required
                                value={formData.email}
                                onChange={handleInputChange}
                                className="h-14 rounded-xl border-slate-200 focus:border-navy-500 focus:ring-navy-500 text-lg px-4"
                            />
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-slate-600 leading-snug">
                            Secure checkout via <span className="font-bold">Stripe</span>. Your information is protected and HIPAA compliant.
                        </p>
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-16 rounded-2xl bg-red-700 hover:bg-red-800 text-white font-extrabold text-xl transition-all shadow-lg hover:shadow-red-200 active:scale-95"
                        style={{ backgroundColor: '#B91C3C' }}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                Continue to Payment
                                <ArrowRight className="ml-2 h-6 w-6" />
                            </>
                        )}
                    </Button>

                    <p className="text-center text-slate-400 text-sm">
                        Total Price: <span className="font-bold text-slate-600">$150.00</span>
                    </p>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default BookingModal;
