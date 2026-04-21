import Link from 'next/link';
import { FilePenLine, Stethoscope, ShieldCheck, ExternalLink } from 'lucide-react';

const ClinicalAuthorCard = ({
    author = null,
    reviewer = null,
    updatedLabel = null,
    className = '',
}) => {
    if (!author && !reviewer) return null;

    const renderProfileCard = (profile, icon, roleLabel) => {
        const Icon = icon;
        const displayName = profile.full_name + (profile.credentials ? `, ${profile.credentials}` : '');
        const bioExcerpt = profile.bio
            ? profile.bio.length > 160
                ? profile.bio.substring(0, 160).trim() + '…'
                : profile.bio
            : '';

        return (
            <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Icon className="h-4 w-4 text-navy-700" />
                    <span>{roleLabel}</span>
                </div>

                <div className="mt-3 flex items-start gap-3">
                    {profile.photo_url ? (
                        <img
                            src={profile.photo_url}
                            alt={profile.full_name}
                            className="w-12 h-12 rounded-full object-cover border border-slate-200 flex-shrink-0"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                            <Stethoscope className="w-6 h-6 text-slate-400" />
                        </div>
                    )}
                    <div className="min-w-0">
                        <div className="text-lg font-bold text-slate-900">{displayName}</div>
                        {bioExcerpt && (
                            <p className="mt-1 text-sm leading-relaxed text-slate-600">{bioExcerpt}</p>
                        )}
                    </div>
                </div>

                <div className="mt-3 flex items-center gap-4">
                    <Link
                        href={`/clinician/${profile.slug}`}
                        className="inline-flex text-sm font-semibold text-navy-700 hover:text-navy-800"
                    >
                        View full profile →
                    </Link>
                    {profile.linkedin_url && (
                        <a
                            href={profile.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            LinkedIn
                        </a>
                    )}
                </div>
            </div>
        );
    };

    return (
        <section className={`rounded-2xl border border-slate-200 bg-slate-50 p-6 ${className}`}>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                <ShieldCheck className="h-4 w-4" />
                <span>Content Standards</span>
            </div>

            <div className={`mt-5 grid gap-4 ${author && reviewer ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
                {author && renderProfileCard(author, FilePenLine, 'Written By')}
                {reviewer && renderProfileCard(reviewer, Stethoscope, 'Reviewed For Clinical Accuracy')}
            </div>

            {updatedLabel && (
                <p className="mt-4 text-sm text-slate-500">{updatedLabel}</p>
            )}
        </section>
    );
};

export default ClinicalAuthorCard;
