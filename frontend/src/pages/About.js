import { Award, Target, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const About = () => {
  return (
    <>
      <SEO 
        title="About Us - Clinician-Led VA Medical Documentation"
        description="Military Disability Nexus provides clinician-led expert medical opinions for VA disability claims. Licensed professionals helping veterans nationwide with nexus letters, DBQs, and medical consultations."
        keywords="VA medical experts, clinician-led nexus letters, veteran medical documentation, licensed medical professionals"
      />
    <div className="relative min-h-screen overflow-hidden">
      {/* Fixed Background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("/Gemini_Generated_Image_f6860of6860of686.png")',
            filter: 'blur(4px)',
            transform: 'scale(1.1)',
            width: '100%',
            height: '100%'
          }}
          role="presentation"
          aria-hidden="true"
        ></div>
        <div className="absolute inset-0 bg-white/50"></div>
      </div>

      <div className="relative z-10">
      {/* Hero */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-slate-900 mb-6 drop-shadow-sm">🎖 Who We Are</h1>
          <p className="text-xl text-slate-700">
            Clinician-led expert medical opinions for VA disability claims
          </p>
        </div>
      </section>

      {/* Who We Are */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 md:p-12 shadow-2xl border border-white/40">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">
              Military Disability Nexus
            </h2>
            <p className="text-lg text-slate-700 leading-relaxed mb-6">
              Military Disability Nexus is a clinician-led expert company that helps veterans build strong, medically sound evidence for their VA disability claims.
            </p>
            <p className="text-lg text-slate-700 leading-relaxed mb-6">
              Our mission is simple: To bridge the gap between medicine and the VA — giving veterans the clear, credible documentation they need to receive the benefits they've earned.
            </p>
            <p className="text-lg text-slate-700 leading-relaxed mb-6">
              We're not a law firm or a claims representative. We're a team of subject matter experts and clinicians professionals who understand both the clinical and regulatory sides of the VA process.
            </p>
            <p className="text-lg text-slate-700 leading-relaxed">
              Our clinicians know how to interpret complex medical histories and translate them into clear, VA-ready documentation that decision-makers can rely on.
            </p>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 md:p-12 shadow-2xl border border-white/40">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-8 h-8 text-navy-700" />
              <h2 className="text-3xl font-bold text-slate-900">⚖ Our Mission</h2>
            </div>
            <p className="text-lg text-slate-700 leading-relaxed mb-6">
              To empower veterans through credible, expert-authored medical documentation that tells the truth of their service and their health — clearly, professionally, and respectfully.
            </p>
            <p className="text-lg text-slate-700 leading-relaxed">
              We believe veterans shouldn't lose benefits because of incomplete or confusing medical evidence. Our role is to make the medical side of your claim understandable, accurate, and VA-ready.
            </p>
          </div>
        </div>
      </section>

      {/* Why Clinician-Led Matters */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 md:p-12 shadow-2xl border border-white/40">
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-8 h-8 text-navy-700" />
              <h2 className="text-3xl font-bold text-slate-900">Why "Clinician-Led" Matters</h2>
            </div>
            <p className="text-lg text-slate-700 leading-relaxed mb-6">
              Too often, veterans rely on general assistance or legal support that lacks medical depth.
            </p>
            <p className="text-lg text-slate-700 leading-relaxed mb-6">
              At Military Disability Nexus, every review, opinion, and consultation is led by Subject Matter Expert and/or Licensed Clinicians - who understand anatomy, pathophysiology, causation, and diagnosis from the inside out.
            </p>
            <p className="text-lg text-slate-700 leading-relaxed">
              That means every word we write and every opinion we issue is grounded in real medical expertise, not guesswork or templates.
            </p>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 md:p-12 shadow-2xl border border-white/40">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">What We Offer</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-navy-700 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Nexus Letters</h3>
                  <p className="text-slate-700">Expert medical opinions linking your condition to service</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-navy-700 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">DBQ Evaluations</h3>
                  <p className="text-slate-700">Comprehensive disability benefits questionnaires</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-navy-700 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Aid & Attendance</h3>
                  <p className="text-slate-700">Medical evaluations for pension benefits</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-navy-700 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">C&P Exam Coaching</h3>
                  <p className="text-slate-700">Preparation guidance for compensation exams</p>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <Link
                to="/services"
                className="inline-flex items-center space-x-2 text-navy-700 font-semibold hover:text-navy-800 transition-colors"
              >
                <span>View All Services</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-navy-700 via-navy-800 to-navy-900 rounded-3xl p-12 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
            <div className="relative z-10">
              <h2 className="text-4xl font-bold text-white mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Contact us for a free consultation and let us help strengthen your VA claim
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center space-x-2 bg-white text-navy-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-slate-50 transition-all hover:scale-105 shadow-xl"
              >
                <span>Contact Us</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      </div>
    </div>
    </>
  );
};

export default About;
