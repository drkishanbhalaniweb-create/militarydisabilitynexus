import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, Lock, GraduationCap, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import SEO from '../components/SEO';
import ProgressBar from '../components/diagnostic/ProgressBar';
import QuestionCard from '../components/diagnostic/QuestionCard';
import { QUESTIONS, TOTAL_QUESTIONS } from '../lib/diagnosticConfig';
import { 
  calculateTotalScore, 
  getRecommendationCategory,
  formatDiagnosticData,
  isComplete 
} from '../lib/diagnosticScoring';
import { supabase } from '../lib/supabase';

const Diagnostic = () => {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === TOTAL_QUESTIONS - 1;

  // Handle answer selection
  const handleAnswer = async (questionId, answerText, points) => {
    // Record answer
    const newAnswers = {
      ...answers,
      [questionId]: points
    };
    setAnswers(newAnswers);

    // Wait for visual feedback
    await new Promise(resolve => setTimeout(resolve, 400));

    // If last question, calculate and save results
    if (isLastQuestion) {
      await completeDignostic(newAnswers);
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
      // Calculate score and recommendation
      const score = calculateTotalScore(finalAnswers);
      const recommendation = getRecommendationCategory(score);

      // Format data for database
      const diagnosticData = formatDiagnosticData(finalAnswers, score, recommendation);

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
        navigate('/diagnostic/results', {
          state: {
            answers: finalAnswers,
            score,
            recommendation,
            sessionId: data?.session_id
          }
        });
      }, 500);

    } catch (error) {
      console.error('Error completing diagnostic:', error);
      toast.error('An error occurred. Please try again.');
    }
  };

  // Start diagnostic
  const handleStart = () => {
    setStarted(true);
  };

  // Intro screen
  if (!started) {
    return (
      <>
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
      </>
    );
  }

  // Question screen
  return (
    <>
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
            category={currentQuestion.category}
          />

          {/* Question Card */}
          <div className={`
            bg-white rounded-2xl p-8 shadow-lg transition-opacity duration-300
            ${isTransitioning ? 'opacity-0' : 'opacity-100'}
          `}>
            <QuestionCard
              question={currentQuestion}
              onAnswer={handleAnswer}
              selectedAnswer={answers[currentQuestion.id] !== undefined ? 
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
    </>
  );
};

export default Diagnostic;
