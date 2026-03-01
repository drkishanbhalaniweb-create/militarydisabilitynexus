import { useState } from 'react';
import { useRouter } from 'next/router';
import { FileText, Clock, Lock, GraduationCap, Building2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import SEO from '../../src/components/SEO';
import Layout from '../../src/components/Layout';
import ProgressBar from '../../src/components/diagnostic/ProgressBar';
import QuestionCard from '../../src/components/diagnostic/QuestionCard';
import { QUESTIONS, TOTAL_QUESTIONS } from '../../src/lib/diagnosticConfig';
import {
    calculateTotalScore,
    getRecommendationCategory,
    formatDiagnosticData,
} from '../../src/lib/diagnosticScoring';
import { supabase } from '../../src/lib/supabase';

const Diagnostic = () => {
    const router = useRouter();
    const [started, setStarted] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [showLeadCapture, setShowLeadCapture] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentQuestion = QUESTIONS[currentQuestionIndex] || QUESTIONS[QUESTIONS.length - 1];
    const isLastQuestion = currentQuestionIndex >= TOTAL_QUESTIONS - 1;

    // Handle answer selection
    const handleAnswer = async (questionId, answerText, points) => {
        if (isTransitioning || showLeadCapture) return;

        // Record answer
        const newAnswers = {
            ...answers,
            [questionId]: points
        };
        setAnswers(newAnswers);

        // Wait for visual feedback
        await new Promise(resolve => setTimeout(resolve, 400));

        // If last question, show lead capture instead of completing immediately
        if (isLastQuestion) {
            setIsTransitioning(true);
            setTimeout(() => {
                setShowLeadCapture(true);
                setIsTransitioning(false);
            }, 300);
        } else {
            // Move to next question
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentQuestionIndex(prev => prev + 1);
                setIsTransitioning(false);
            }, 300);
        }
    };

    // Complete diagnostic and save to database
    const completeDignostic = async (finalAnswers) => {
        try {
            setIsSubmitting(true);
            // Calculate score and recommendation
            const score = calculateTotalScore(finalAnswers);
            const recommendation = getRecommendationCategory(score);

            // Format data for database
            const diagnosticData = {
                ...formatDiagnosticData(finalAnswers, score, recommendation),
                first_name: firstName.trim() || null,
                email: email.trim() || null
            };

            // Save to Supabase
            const { data, error } = await supabase
                .from('diagnostic_sessions')
                .insert(diagnosticData)
                .select()
                .single();

            if (error) {
                console.error('Error saving diagnostic:', error);
                toast.error('Failed to save results. Redirecting anyway...');
            }

            // Store session ID in localStorage for results page
            if (data) {
                localStorage.setItem('diagnostic_session_id', data.session_id);
            }

            // Redirect to results page
            setTimeout(() => {
                router.push({
                    pathname: '/diagnostic/results',
                    query: {
                        answers: JSON.stringify(finalAnswers), // Next.js query params are strings
                        score,
                        recommendation,
                        sessionId: data?.session_id
                    }
                });
            }, 500);

        } catch (error) {
            console.error('Error completing diagnostic:', error);
            toast.error('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle lead capture submit
    const handleLeadSubmit = async (e) => {
        e.preventDefault();

        // Basic email validation
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            toast.error("Please enter a valid email address.");
            return;
        }

        await completeDignostic(answers);
    };

    // Start diagnostic
    const handleStart = () => {
        setStarted(true);
    };

    // Intro screen
    if (!started) {
        return (
            <Layout>
                <SEO
                    title="VA Claim Readiness Diagnostic"
                    description="Take our free 5-question diagnostic to assess if your VA disability claim is ready to file. Get personalized recommendations in 2 minutes."
                    keywords="VA claim diagnostic, claim readiness, VA disability assessment, claim preparation"
                />

                <div className="min-h-screen bg-gradient-to-br from-navy-50 via-slate-50 to-slate-100 py-12 px-4">
                    <div className="max-w-3xl mx-auto">
                        {/* Header */}
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-navy-600 to-navy-800 rounded-full mb-6 shadow-lg">
                                <FileText className="w-10 h-10 text-white" />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                                Before You File a VA Disability Claim,<br />Know If It's Actually Ready
                            </h1>
                            <p className="text-lg md:text-xl text-slate-600 mb-8">
                                Answer five quick questions to see if your VA claim is ready to file — or if there are gaps that could lead to denial.
                            </p>
                        </div>

                        {/* Trust Indicators */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="flex items-start">
                                    <Clock className="w-6 h-6 text-navy-600 mr-3 mt-1 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-semibold text-slate-900">Takes ~2 minutes</h3>
                                        <p className="text-sm text-slate-600">Quick assessment, immediate results</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <Lock className="w-6 h-6 text-navy-600 mr-3 mt-1 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-semibold text-slate-900">No email required</h3>
                                        <p className="text-sm text-slate-600">Anonymous and private</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <GraduationCap className="w-6 h-6 text-navy-600 mr-3 mt-1 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-semibold text-slate-900">Educational & veteran-first</h3>
                                        <p className="text-sm text-slate-600">Honest, objective guidance</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <Building2 className="w-6 h-6 text-navy-600 mr-3 mt-1 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-semibold text-slate-900">Not affiliated with the VA</h3>
                                        <p className="text-sm text-slate-600">Independent assessment</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Start Button */}
                        <button
                            onClick={handleStart}
                            className="w-full text-white px-8 py-5 rounded-xl font-bold text-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                            style={{ backgroundColor: '#163b63' }}
                        >
                            Start Diagnostic
                        </button>

                        <p className="text-center text-sm text-slate-500 mt-4">
                            Free • No signup required • Instant results
                        </p>
                    </div>
                </div>
            </Layout>
        );
    }

    // Lead Capture Screen
    if (showLeadCapture) {
        return (
            <Layout>
                <SEO
                    title="VA Claim Readiness Diagnostic - Get Results"
                    description="Enter your email to receive your personalized VA claim readiness assessment and recommendations."
                />

                <div className="min-h-screen bg-gradient-to-br from-navy-50 via-slate-50 to-slate-100 py-12 px-4">
                    <div className="max-w-xl mx-auto">
                        <div className={`
                            bg-white rounded-2xl p-8 md:p-10 shadow-xl transition-opacity duration-300
                            ${isTransitioning ? 'opacity-0' : 'opacity-100'}
                        `}>
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                                    <FileText className="w-8 h-8 text-green-600" />
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                                    Your Results Are Ready
                                </h2>
                                <p className="text-slate-600">
                                    Where should we send your personalized claim readiness assessment and action plan?
                                </p>
                            </div>

                            <form onSubmit={handleLeadSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-1">
                                        First Name (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 transition-colors"
                                        placeholder="Enter your first name"
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                                        Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 transition-colors"
                                        placeholder="you@example.com"
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full flex items-center justify-center space-x-2 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                                    style={{ backgroundColor: '#B91C3C' }}
                                >
                                    <span>{isSubmitting ? 'Analyzing Results...' : 'See My Results'}</span>
                                    {!isSubmitting && <ArrowRight className="w-5 h-5" />}
                                </button>

                                <p className="text-xs text-center text-slate-500 mt-4 flex items-center justify-center">
                                    <Lock className="w-3 h-3 mr-1" />
                                    Your information is secure and will never be shared.
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    // Question screen
    return (
        <Layout>
            <SEO
                title={`VA Claim Readiness Diagnostic - Question ${currentQuestionIndex + 1}`}
                description="Answer questions about your VA disability claim preparation to get personalized readiness assessment."
            />

            <div className="min-h-screen bg-gradient-to-br from-navy-50 via-slate-50 to-slate-100 py-12 px-4">
                <div className="max-w-3xl mx-auto">
                    {/* Progress Bar */}
                    <ProgressBar
                        currentStep={currentQuestionIndex + 1}
                        totalSteps={TOTAL_QUESTIONS}
                        category={currentQuestion?.category || ''}
                    />

                    {/* Question Card */}
                    <div className={`
                    bg-white rounded-2xl p-8 shadow-lg transition-opacity duration-300
                    ${isTransitioning ? 'opacity-0' : 'opacity-100'}
                  `}>
                        <QuestionCard
                            question={currentQuestion}
                            onAnswer={handleAnswer}
                            selectedAnswer={currentQuestion && answers[currentQuestion.id] !== undefined ?
                                currentQuestion.options.find(opt => opt.points === answers[currentQuestion.id])?.text :
                                null
                            }
                        />
                    </div>

                    {/* Helper Text */}
                    <p className="text-center text-sm text-slate-500 mt-6">
                        Your answers are private and not shared with anyone
                    </p>
                </div>
            </div>
        </Layout>
    );
};

export default Diagnostic;
