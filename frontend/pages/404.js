import Link from 'next/link';
import Layout from '../src/components/Layout';
import SEO from '../src/components/SEO';

export default function Custom404() {
    return (
        <Layout>
            <SEO title="Page Not Found - Military Disability Nexus" noindex={true} />
            <div className="text-center my-12 py-24 px-4 min-h-[60vh] flex flex-col justify-center bg-slate-50">
                <h1 className="text-5xl font-bold mb-6 text-slate-900">404 - Page Not Found</h1>
                <p className="text-xl mb-8 text-slate-600 max-w-lg mx-auto">The page you're looking for doesn't exist or has been moved.</p>
                <Link href="/" className="inline-block bg-[#B91C3C] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-red-700 transition-colors">
                    Go to Home
                </Link>
            </div>
        </Layout>
    );
}
