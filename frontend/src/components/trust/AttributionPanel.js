import Link from 'next/link';
import { FilePenLine, Stethoscope, ShieldCheck } from 'lucide-react';

const AttributionPanel = ({
    author,
    reviewer,
    updatedLabel = null,
    className = '',
}) => (
    <section className={`rounded-2xl border border-slate-200 bg-slate-50 p-6 ${className}`}>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            <ShieldCheck className="h-4 w-4" />
            <span>Content Standards</span>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <FilePenLine className="h-4 w-4 text-navy-700" />
                    <span>Written By</span>
                </div>
                <div className="mt-2 text-lg font-bold text-slate-900">{author.name}</div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{author.role}</p>
                <Link href={author.href} className="mt-3 inline-flex text-sm font-semibold text-navy-700 hover:text-navy-800">
                    View editorial standards
                </Link>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Stethoscope className="h-4 w-4 text-navy-700" />
                    <span>Reviewed For Clinical Accuracy</span>
                </div>
                <div className="mt-2 text-lg font-bold text-slate-900">{reviewer.name}</div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{reviewer.role}</p>
                <Link href={reviewer.href} className="mt-3 inline-flex text-sm font-semibold text-navy-700 hover:text-navy-800">
                    View medical review policy
                </Link>
            </div>
        </div>

        {updatedLabel && (
            <p className="mt-4 text-sm text-slate-500">{updatedLabel}</p>
        )}
    </section>
);

export default AttributionPanel;
