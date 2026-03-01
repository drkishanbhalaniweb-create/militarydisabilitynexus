import React, { useState } from 'react';
import Link from 'next/link';
import {
    CheckCircle,
    Clock,
    Phone,
    Video,
    User,
    MessageCircle,
    Calendar,
    ArrowRight,
    Mail,
    AlertCircle,
    HelpCircle,
    Quote,
    XCircle
} from 'lucide-react';
import SEO from '../src/components/SEO';
import Layout from '../src/components/Layout';
import OptimizedImage from '../src/components/OptimizedImage';
import BookingModal from '../src/components/BookingModal';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '../src/components/ui/accordion';

const CPExamCoaching = () => {
    const price = 15000; // Price in cents for logic
    const displayPrice = 150;
    const duration = "60 minutes";
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

    const openBooking = (e) => {
        if (e) e.preventDefault();
        setIsBookingModalOpen(true);
    };

    const faqs = [
        {
            question: "Do you talk to the examiner or VA for me?",
            answer: "No. We never speak to examiners or the VA on your behalf. Our role is to coach and educate you so you can speak for yourself clearly and honestly in the exam."
        },
        {
            question: "Is this legal advice or representation?",
            answer: "No. We do not provide legal advice or represent you before the VA. For legal questions or representation, please contact an accredited representative or attorney."
        },
        {
            question: "Can you guarantee my exam will go well or my claim will be approved?",
            answer: "No one ethically can. We cannot control who your examiner is or how the VA decides your claim. We focus on helping you feel more prepared and able to communicate your experience clearly."
        },
        {
            question: "When should I schedule my session?",
            answer: "Ideally within 1–3 weeks of your exam date so the information feels fresh. If your exam is sooner than that, a focused session can still help you feel more grounded."
        },
        {
            question: "What do I need to bring?",
            answer: "Any exam notices, decision letters, or notes you've made about your symptoms and limitations. If you don't have everything organized yet, that's okay—we'll work with what you have."
        },
        {
            question: "Is the $150 fee just for this one session?",
            answer: "Yes. The C&P coaching session is a one-time $150 fee for a 60-minute consult. If you decide you'd like additional sessions, those are completely optional and booked separately."
        }
    ];

    return (
        <Layout>
            <SEO
                title="C&P Exam Coaching - One-on-One Preparation"
                description="Reduce anxiety and feel prepared for your Compensation and Pension (C&P) exam with expert coaching. Learn how to communicate your symptoms clearly and honestly."
                keywords="C&P exam coaching, VA claim prep, compensation and pension exam, veteran exam help"
            />

            <div className="bg-white min-h-screen">
                {/* Contact Top Bar */}
                <div className="bg-slate-50 border-b border-slate-100 py-3">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-wrap justify-center md:justify-between items-center gap-4 text-sm font-medium text-slate-600">
                            <div className="flex items-center gap-6">
                                <a href="mailto:contact@militarydisabilitynexus.com" className="flex items-center gap-2 hover:text-navy-600 transition-colors">
                                    <Mail className="w-4 h-4" />
                                    <span>Need help deciding? <span className="underline">Email us</span></span>
                                </a>
                                <a href="tel:+18882159785" className="flex items-center gap-2 hover:text-navy-600 transition-colors">
                                    <Phone className="w-4 h-4" />
                                    <span>Questions? Call: +1 888 215-9785</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hero Section */}
                <section className="relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className="inline-flex items-center gap-2 bg-navy-50 text-navy-700 px-4 py-2 rounded-full text-sm font-bold mb-8 tracking-wide">
                                    <Calendar className="w-4 h-4" />
                                    UPCOMING C&P EXAM COACHING · {duration} · ${displayPrice}
                                </div>

                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.1] mb-8">
                                    Your C&P Exam Feels High-Stakes. <br />
                                    <span className="text-navy-600">You Don't Have to Walk In Alone.</span>
                                </h1>

                                <p className="text-xl md:text-2xl text-slate-600 leading-relaxed mb-10 max-w-2xl">
                                    If your stomach drops every time you think about your exam, you're not weak and you're not overreacting. This session is about calming your nerves, clarifying what matters, and helping you talk about your reality without minimizing or exaggerating.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button
                                        onClick={openBooking}
                                        className="inline-flex justify-center items-center px-8 py-5 rounded-2xl bg-red-700 text-white font-bold text-lg hover:bg-red-800 transition-all shadow-xl hover:shadow-red-200 hover:-translate-y-0.5 active:translate-y-0 text-center"
                                        style={{ backgroundColor: '#B91C3C' }}
                                    >
                                        Schedule My C&P Coaching Session – ${displayPrice}
                                    </button>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute -inset-4 bg-navy-100/50 rounded-[3rem] -z-10 blur-2xl" />
                                <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/20">
                                    <OptimizedImage
                                        src="/c&p_exam.jpeg"
                                        alt="C&P Exam Coaching"
                                        className="w-full h-auto aspect-[4/3] object-cover"
                                        priority={true}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Anxiety/Thinking Section */}
                <section className="py-24 bg-slate-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
                        <h2 className="text-sm font-bold text-navy-600 uppercase tracking-widest mb-4">Reassuring, one-on-one preparation</h2>
                        <h3 className="text-3xl md:text-4xl font-bold text-slate-900">If you're thinking things like…</h3>
                    </div>

                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-8">
                        {[
                            "What if I freeze and forget everything I meant to say?",
                            "What if they don't believe me—or think I'm exaggerating?",
                            "My last exam was a mess. I don't want that to happen again."
                        ].map((thought, i) => (
                            <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                                <HelpCircle className="w-10 h-10 text-slate-300 mb-6" />
                                <p className="text-lg font-medium text-slate-800 italic">"{thought}"</p>
                            </div>
                        ))}
                    </div>

                    <div className="max-w-3xl mx-auto px-4 mt-16 pb-8">
                        <div className="bg-navy-900 rounded-3xl p-8 md:p-10 text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
                            <div className="flex gap-4 items-start">
                                <AlertCircle className="w-8 h-8 text-white/60 flex-shrink-0 mt-1" />
                                <p className="text-lg md:text-xl leading-relaxed">
                                    <span className="font-bold text-white">Important:</span> We don't give you a script or tell you what to say. We help you communicate your real experience clearly and honestly so you feel more grounded going into the exam.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Session Details */}
                <section className="py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">C&P Exam Coaching Session</h2>
                                <div className="flex items-center gap-4 mb-8">
                                    <span className="text-3xl font-bold text-navy-700">${displayPrice}</span>
                                    <span className="text-slate-400">|</span>
                                    <span className="text-xl text-slate-600 italic">{duration}</span>
                                </div>
                                <p className="text-lg text-slate-700 mb-10 leading-relaxed">
                                    A calm, structured conversation focused on your upcoming exam—what to expect, how to describe your symptoms and limitations, and how to walk in feeling more prepared.
                                </p>

                                <div className="space-y-6">
                                    {[
                                        { icon: Video, text: "Phone or secure video" },
                                        { icon: User, text: "1:1 private session" },
                                        { icon: CheckCircle, text: "Veteran-centered approach" }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-navy-600 border border-slate-100 shadow-sm">
                                                <item.icon className="w-6 h-6" />
                                            </div>
                                            <span className="text-lg font-semibold text-slate-800">{item.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-[2.5rem] p-8 md:p-12 shadow-inner border border-slate-200/50">
                                <h3 className="text-2xl font-bold text-slate-900 mb-10">What we'll actually do together</h3>
                                <div className="space-y-12">
                                    {[
                                        {
                                            title: "1 · Understand the exam",
                                            subtitle: "What the C&P exam is (and isn't)",
                                            desc: "We talk about who the examiner is, what their job is, how C&P exams fit into the larger claim, and common myths that only increase anxiety."
                                        },
                                        {
                                            title: "2 · Talk about your reality",
                                            subtitle: "Describing symptoms & bad days",
                                            desc: "We practice describing pain, mental health symptoms, sleep, flare-ups, and limitations in terms of how they affect your daily life—especially on your worst days."
                                        },
                                        {
                                            title: "3 · Stay grounded",
                                            subtitle: "Managing nerves in the moment",
                                            desc: "We walk through simple strategies for staying focused during the exam, handling follow-up questions, and not walking out thinking, 'I forgot to say everything that mattered.'"
                                        }
                                    ].map((step, i) => (
                                        <div key={i} className="relative pl-10">
                                            <div className="absolute left-0 top-0 h-full w-px bg-slate-200" />
                                            <div className="absolute left-[-4px] top-1 h-2 w-2 rounded-full bg-navy-600" />
                                            <h4 className="text-navy-600 font-bold uppercase tracking-wider text-sm mb-2">{step.title}</h4>
                                            <h5 className="text-xl font-bold text-slate-900 mb-3">{step.subtitle}</h5>
                                            <p className="text-slate-600 leading-relaxed">{step.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* What Changes Section */}
                <section className="py-24 bg-navy-50 border-y border-navy-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6">How this session helps</h2>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                            We can't control who you get as an examiner or how the VA decides your claim. But we can help change how prepared, grounded, and clear you feel going into the room.
                        </p>
                    </div>

                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12">
                        {/* Before */}
                        <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-200">
                            <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                                <span className="w-2 h-8 bg-slate-300 rounded-full" />
                                Before Coaching
                            </h3>
                            <ul className="space-y-6">
                                {[
                                    "I'm anxious and can't stop replaying worst-case scenarios.",
                                    "I don't know what they're actually looking for.",
                                    "My last exam felt rushed and I walked out regretting what I didn't say.",
                                    "I'm worried I'll sound like I'm complaining or exaggerating."
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-4 text-slate-400">
                                        <XCircle className="w-5 h-5 text-slate-200 mt-1 flex-shrink-0" />
                                        <span className="text-lg italic leading-snug">"{item}"</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* After */}
                        <div className="bg-white rounded-3xl p-10 shadow-xl border-t-4 border-t-navy-600 border-x border-b border-slate-200 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-navy-50 rounded-bl-full -mr-12 -mt-12" />
                            <h3 className="text-2xl font-bold text-navy-700 mb-8 flex items-center gap-3">
                                <span className="w-2 h-8 bg-navy-600 rounded-full" />
                                After Coaching
                            </h3>
                            <ul className="space-y-6">
                                {[
                                    "I know what the exam is trying to figure out and how my story fits in.",
                                    "I have words to describe my bad days without feeling dramatic or fake.",
                                    "I feel calmer and more grounded about what I can control.",
                                    "Even if I'm still nervous, I'm not walking in blind."
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-4">
                                        <CheckCircle className="w-5 h-5 text-navy-600 mt-1 flex-shrink-0" />
                                        <span className="text-lg font-medium text-slate-800 leading-snug">"{item}"</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Who this is for */}
                <section className="py-24 bg-white overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
                        <div className="order-2 lg:order-1">
                            <div className="relative">
                                <div className="absolute -top-10 -left-10 w-32 h-32 bg-navy-50 rounded-full opacity-50" />
                                <div className="relative bg-white rounded-3xl p-10 shadow-2xl border border-slate-100 z-10">
                                    <Quote className="w-12 h-12 text-navy-100 mb-6" />
                                    <p className="text-xl md:text-2xl text-slate-700 leading-relaxed italic mb-8 font-medium">
                                        "I walked into my last exam feeling scattered and walked out wishing I'd said things differently. After this session, I still had nerves—but I knew what to expect and how to explain what my days actually look like. It felt like I could finally advocate for myself without sounding over the top."
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-navy-100 flex items-center justify-center font-bold text-navy-700">AV</div>
                                        <div>
                                            <div className="font-bold text-slate-900">Army veteran</div>
                                            <div className="text-navy-600 text-sm font-semibold uppercase tracking-widest">Feedback ★★★★★</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="order-1 lg:order-2">
                            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 uppercase tracking-tight">Who this is for</h2>
                            <p className="text-xl text-slate-600 mb-10">Many veterans describe this session as the first time they've felt truly prepared for a C&P exam instead of just "hoping it goes okay."</p>

                            <div className="space-y-6">
                                {[
                                    "You have a C&P exam scheduled and feel anxious, confused, or like you're walking into something that could change your future.",
                                    "You're used to 'sucking it up' and have a hard time talking about pain, mental health, or limitations without downplaying them.",
                                    "You've had past exams that felt rushed, dismissive, or like you didn't really say what you needed to say.",
                                    "You want calm, straightforward preparation—not scare tactics, hype, or guarantees."
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-4">
                                        <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200">
                                            <ArrowRight className="w-3 h-3 text-slate-400" />
                                        </div>
                                        <p className="text-lg text-slate-700 leading-snug">{item}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-24 bg-slate-50">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Questions you might have</h2>
                            <p className="text-lg text-slate-600">Common things veterans ask about our coaching</p>
                        </div>

                        <Accordion type="single" collapsible className="space-y-4">
                            {faqs.map((faq, i) => (
                                <AccordionItem key={i} value={`faq - ${i} `} className="bg-white px-6 rounded-2xl border border-slate-200 shadow-sm items-center overflow-hidden">
                                    <AccordionTrigger className="text-left text-lg font-bold py-6 hover:no-underline hover:text-navy-700 transition-colors">
                                        {faq.question}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-lg text-slate-600 leading-relaxed pb-6">
                                        {faq.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>

                        <div className="mt-16 p-8 bg-white/50 border border-slate-200 rounded-2xl text-center">
                            <p className="text-xs text-slate-500 italic uppercase tracking-wider">
                                Disclaimer: Military Disability Nexus is not affiliated with the Department of Veterans Affairs (VA) and does not provide legal representation or legal advice. We provide education and coaching only.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-24 bg-white">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center bg-gradient-to-br from-navy-800 to-navy-900 rounded-[3rem] p-12 md:p-20 text-white shadow-2xl shadow-navy-200 relative overflow-hidden">
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mb-32" />
                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-5xl font-extrabold mb-8 leading-tight">
                                Want to feel calmer and more prepared before your C&P exam?
                            </h2>
                            <p className="text-xl md:text-2xl text-navy-100 mb-12 max-w-2xl mx-auto">
                                A single 60-minute coaching session can help you understand what's coming, find words for what your days are really like, and walk into your exam feeling less alone and more grounded.
                            </p>

                            <div className="space-y-6">
                                <button
                                    onClick={openBooking}
                                    className="inline-flex justify-center items-center px-10 py-5 rounded-2xl bg-white text-navy-900 font-bold text-xl hover:bg-slate-50 transition-all shadow-xl hover:scale-105"
                                >
                                    Schedule My C&P Coaching Session – ${displayPrice}
                                </button>

                                <div className="flex flex-col items-center gap-2">
                                    <p className="text-navy-200 text-lg">Prefer email first? Send us a message:</p>
                                    <a href="mailto:contact@militarydisabilitynexus.com" className="text-white font-bold text-lg hover:underline underline-offset-8">
                                        contact@militarydisabilitynexus.com
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <style jsx>{`
    .shadow - red - 200 {
    box - shadow: 0 20px 25px - 5px rgba(185, 28, 60, 0.2), 0 10px 10px - 5px rgba(185, 28, 60, 0.1);
}
`}</style>
            <BookingModal
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                price={price}
            />
        </Layout>
    );
};

export default CPExamCoaching;
