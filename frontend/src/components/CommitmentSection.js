import { useRouter } from 'next/router';

const CommitmentSection = () => {
  const router = useRouter();

  // Only show on the home page
  const isHomePage = router.pathname === '/';

  // Don't render anything if not on home page
  if (!isHomePage) {
    return null;
  }

  return (
    <>
      {/* Our Commitment to Veterans - Only on Home page */}
      <section className="relative bg-white py-12 sm:py-16 w-full">

        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-navy-700 to-navy-800 rounded-3xl p-10 sm:p-16 shadow-2xl hover:shadow-navy-500/30 transition-shadow duration-300 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Our Commitment to Veterans
            </h2>
            <p className="text-lg sm:text-xl text-white/95 leading-relaxed mb-8 max-w-3xl mx-auto">
              Every member of our team is here for one reason — to serve those who've served. We're honored to help veterans receive the fair, evidence-based recognition they've earned for their service and sacrifices.
            </p>
            <p className="text-lg sm:text-xl font-medium italic text-white">
              Thank you for your service. It's our privilege to support you in return.
            </p>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-slate-500 text-center leading-relaxed mt-8 max-w-4xl mx-auto">
            Military Disability Nexus is not affiliated with the Department of Veterans Affairs (VA) and does not provide legal advice, legal representation, or claim-filing services. We do not act as an accredited VSO, claims agent, or attorney, and we do not communicate with the VA on your behalf.
          </p>
        </div>
      </section>
    </>
  );
};

export default CommitmentSection;
