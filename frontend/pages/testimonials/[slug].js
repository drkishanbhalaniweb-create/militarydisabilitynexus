import { useRef, useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CalendarDays,
  CheckCircle,
  Clock,
  Copy,
  FileText,
  Play,
  ShieldCheck,
  Stethoscope,
  Volume2,
} from 'lucide-react';
import { toast } from 'sonner';
import Layout from '../../src/components/Layout';
import SEO from '../../src/components/SEO';
import StarRating from '../../src/components/testimonials/StarRating';
import VideoFacade from '../../src/components/testimonials/VideoFacade';
import TestimonialCard from '../../src/components/testimonials/TestimonialCard';
import { testimonialApi } from '../../src/lib/api';
import {
  formatDurationDisplay,
  generateVideoStructuredData,
  getTestimonialTagTone,
  parseDurationInput,
  extractYouTubeId,
  getYouTubeThumbnail,
} from '../../src/lib/testimonials';

export async function getStaticPaths() {
  try {
    const slugs = await testimonialApi.getVideoSlugs();

    const paths = (slugs || []).map((slug) => ({
      params: { slug },
    }));

    return {
      paths,
      fallback: 'blocking',
    };
  } catch (error) {
    console.error('Error fetching video testimonial slugs for getStaticPaths:', error);
    return {
      paths: [],
      fallback: 'blocking',
    };
  }
}

export async function getStaticProps({ params }) {
  try {
    const { slug } = params;
    const testimonial = await testimonialApi.getBySlug(slug);

    if (!testimonial || !testimonial.video_url) {
      return {
        notFound: true,
      };
    }

    // Fetch up to 2 other testimonials for related success stories
    const allTestimonials = await testimonialApi.getAll(6);
    const related = (allTestimonials || [])
      .filter((t) => t.id !== testimonial.id)
      .slice(0, 2);

    return {
      props: {
        testimonial,
        related,
      },
      revalidate: 3600, // Revalidate every hour
    };
  } catch (error) {
    console.error(`Error fetching testimonial spoke page for slug ${params?.slug}:`, error);
    return {
      notFound: true,
    };
  }
}

const VideoTestimonialSpokePage = ({ testimonial, related = [] }) => {
  const router = useRouter();
  const videoFacadeRef = useRef(null);
  const [activeMomentIndex, setActiveMomentIndex] = useState(null);
  const [initialSeekTime, setInitialSeekTime] = useState(0);
  const [copied, setCopied] = useState(false);

  const veteranName = testimonial.name?.trim() || 'Veteran';

  const isVerticalOrSquarish = ['4:5', '1:1', '3:4', '9:16'].includes(
    testimonial.video_aspect_ratio || '4:5'
  );

  const keyMoments = useMemo(() => {
    if (Array.isArray(testimonial.video_key_moments)) {
      return testimonial.video_key_moments;
    }
    return [];
  }, [testimonial.video_key_moments]);

  // Support jumping to Google Key Moments timestamps from search results via query parameter (?t=45) or URL hash (#t=45)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeStr = null;

    // Check query parameter directly from URL search first, then router.query fallback
    try {
      const searchParams = new URLSearchParams(window.location.search);
      timeStr = searchParams.get('t');
    } catch {
      // ignore
    }

    if (!timeStr && router.isReady && router.query.t) {
      timeStr = Array.isArray(router.query.t) ? router.query.t[0] : router.query.t;
    }

    // Fallback to URL hash (#t=45)
    if (!timeStr && window.location.hash && window.location.hash.startsWith('#t=')) {
      timeStr = window.location.hash.replace('#t=', '');
    }

    if (timeStr) {
      const parsedSeconds = parseDurationInput(timeStr);
      if (parsedSeconds > 0) {
        setInitialSeekTime(parsedSeconds);
        if (Array.isArray(testimonial.video_key_moments)) {
          const matchIdx = testimonial.video_key_moments.findIndex(
            (m) => Math.abs(Number(m.startOffset) - parsedSeconds) < 2
          );
          if (matchIdx !== -1) {
            setActiveMomentIndex(matchIdx);
          }
        }
      }
    }
  }, [router.isReady, router.query.t, testimonial.video_key_moments]);

  const handleVideoTimeUpdate = (time) => {
    if (!keyMoments || keyMoments.length === 0) return;
    const currentSec = Math.floor(time);
    const matchIdx = keyMoments.findIndex((m, idx) => {
      const start = Number(m.startOffset) || 0;
      const next = keyMoments[idx + 1];
      const end = Number(m.endOffset) || (next ? Number(next.startOffset) : Infinity);
      return currentSec >= start && currentSec < end;
    });
    const targetIdx = matchIdx !== -1 ? matchIdx : null;
    if (targetIdx !== activeMomentIndex) {
      setActiveMomentIndex(targetIdx);
    }
  };

  const handleSeek = (startSeconds, index = null) => {
    if (index !== null) {
      setActiveMomentIndex(index);
    } else if (Array.isArray(keyMoments) && keyMoments.length > 0) {
      const matchIdx = keyMoments.findIndex((m, idx) => {
        const next = keyMoments[idx + 1];
        const start = Number(m.startOffset) || 0;
        const end = Number(m.endOffset) || (next ? Number(next.startOffset) : Infinity);
        return startSeconds >= start && startSeconds < end;
      });
      if (matchIdx !== -1) {
        setActiveMomentIndex(matchIdx);
      }
    }

    if (videoFacadeRef.current) {
      videoFacadeRef.current.currentTime = startSeconds;
      if (typeof window !== 'undefined' && videoFacadeRef.current.videoElement) {
        const rect = videoFacadeRef.current.videoElement.getBoundingClientRect();
        if (rect.top < 0 || rect.bottom > window.innerHeight) {
          videoFacadeRef.current.videoElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  };

  const handleCopyTranscript = async () => {
    if (!testimonial.video_transcript) return;
    try {
      await navigator.clipboard.writeText(testimonial.video_transcript);
      setCopied(true);
      toast.success('Transcript copied to clipboard');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Could not copy transcript');
    }
  };

  const pageTitle = testimonial.condition_tag
    ? `${veteranName} - ${testimonial.condition_tag.trim()} VA Disability Review & Video Breakdown`
    : `${veteranName} - Veteran Video Review & VA Claim Breakdown`;

  const metaDescription = testimonial.feedback
    ? `${veteranName} (${testimonial.branch || 'Veteran'}) shares their experience with Military Disability Nexus: "${testimonial.feedback.slice(0, 160)}..."`
    : `Watch veteran ${veteranName}'s real video testimonial and medical review case study for their VA disability claim.`;

  const videoId = useMemo(() => extractYouTubeId(testimonial.video_url), [testimonial.video_url]);
  const ogImageUrl = useMemo(
    () => {
      const raw = testimonial.video_thumbnail_url || (videoId ? getYouTubeThumbnail(videoId) : null);
      if (raw && (raw.startsWith('http://') || raw.startsWith('https://'))) {
        return raw;
      }
      return raw ? `https://www.militarydisabilitynexus.com${raw.startsWith('/') ? '' : '/'}${raw}` : 'https://www.militarydisabilitynexus.com/android-chrome-512x512.png';
    },
    [videoId, testimonial.video_thumbnail_url]
  );

  const structuredData = useMemo(() => {
    return generateVideoStructuredData({ testimonial });
  }, [testimonial]);

  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Testimonials', path: '/testimonials' },
    { name: veteranName, path: `/testimonials/${testimonial.slug}` },
  ];

  const formattedDate = useMemo(() => {
    if (!testimonial.created_at) return null;
    try {
      const d = new Date(testimonial.created_at);
      return !Number.isNaN(d.getTime())
        ? d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : null;
    } catch {
      return null;
    }
  }, [testimonial.created_at]);

  return (
    <Layout>
      <SEO
        title={pageTitle}
        description={metaDescription}
        canonical={`/testimonials/${testimonial.slug}`}
        ogImage={ogImageUrl}
        structuredData={structuredData}
        breadcrumbs={breadcrumbs}
      />

      <div className="min-h-screen bg-slate-50">
        {/* Navigation Breadcrumb Bar */}
        <div className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <Link
                href="/testimonials"
                className="inline-flex items-center gap-1.5 font-semibold text-slate-600 transition-colors hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to All Testimonials</span>
              </Link>
              {formattedDate && (
                <div className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                  <CalendarDays className="h-3.5 w-3.5" />
                  <span>Recorded {formattedDate}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* HERO SECTION - Video as Main Content (Google Search Dec 2023 Guideline) */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-navy-800 to-slate-800 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(185,28,60,0.18),transparent_30%)]" />
          <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <div
              className={`grid items-start gap-8 lg:gap-12 ${
                isVerticalOrSquarish
                  ? 'grid-cols-1 lg:grid-cols-[420px_1fr]'
                  : 'grid-cols-1 lg:grid-cols-[1.2fr_0.8fr]'
              }`}
            >
              {/* VIDEO COLUMN - Squarish vertical or landscape player */}
              <div className="mx-auto w-full max-w-md lg:max-w-none">
                <div className="overflow-hidden rounded-2xl border border-white/20 bg-black/40 shadow-2xl backdrop-blur-sm">
                  <VideoFacade
                    ref={videoFacadeRef}
                    videoUrl={testimonial.video_url}
                    aspectRatio={testimonial.video_aspect_ratio || '4:5'}
                    thumbnailUrl={testimonial.video_thumbnail_url}
                    duration={testimonial.video_duration}
                    initialStart={initialSeekTime}
                    onTimeUpdate={handleVideoTimeUpdate}
                    title={`${veteranName}'s Experience`}
                    priority={true}
                    className="w-full"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-white/70">
                  <span className="inline-flex items-center gap-1">
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>Click play to watch video with sound</span>
                  </span>
                  {testimonial.video_duration && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{formatDurationDisplay(testimonial.video_duration)}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* VETERAN CASE DETAILS & SUMMARY */}
              <div className="flex flex-col justify-center">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/90">
                    Veteran Case Study
                  </span>
                  {testimonial.claim_outcome && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-xs font-bold text-emerald-300">
                      <Award className="h-3.5 w-3.5" />
                      <span>{testimonial.claim_outcome}</span>
                    </span>
                  )}
                </div>

                <h1 className="mt-4 text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
                  {testimonial.name || veteranName}
                </h1>

                <div className="mt-2 flex flex-wrap items-center gap-4">
                  {testimonial.branch && (
                    <span className="text-base font-semibold uppercase tracking-wider text-white/80">
                      {testimonial.branch}
                    </span>
                  )}
                  <StarRating value={testimonial.rating} size={22} />
                </div>

                {testimonial.condition_tag && (
                  <div className="mt-4 inline-flex items-center gap-2">
                    <span className="text-xs font-medium text-white/70 uppercase tracking-wider">
                      Medical Condition:
                    </span>
                    <span className="rounded-md bg-white/15 px-3 py-1 text-sm font-semibold text-white">
                      {testimonial.condition_tag}
                    </span>
                  </div>
                )}

                {/* Key quote / feedback preview */}
                <div className="mt-6 rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur">
                  <p className="text-base leading-relaxed text-white/90 sm:text-lg italic">
                    &ldquo;{testimonial.feedback}&rdquo;
                  </p>
                </div>

                {/* Quick actions */}
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    href="/forms?view=schedule"
                    className="inline-flex items-center justify-center rounded-xl px-6 py-3.5 font-bold text-white shadow-lg transition-all hover:brightness-110"
                    style={{ backgroundColor: '#B91C3C' }}
                  >
                    <span>Start Your Claim Review</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link
                    href="/services"
                    className="inline-flex items-center justify-center rounded-xl border border-white/25 px-6 py-3.5 font-semibold text-white/90 transition-colors hover:bg-white/10"
                  >
                    Explore Nexus Services
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MAIN BODY: Key Moments, Verbatim Transcript, Clinician Commentary */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.15fr_0.85fr]">
              {/* LEFT COLUMN: Key Moments & Full Verbatim Transcript */}
              <div className="space-y-10">
                {/* GOOGLE KEY MOMENTS INTERACTIVE JUMP LIST */}
                {keyMoments.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-red-700" />
                        <h2 className="text-xl font-bold text-slate-900">
                          Video Key Moments
                        </h2>
                      </div>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Google Indexed Timestamps
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      Click any moment to jump directly to that point in the veteran&apos;s story.
                    </p>

                    <div className="mt-6 divide-y divide-slate-100">
                      {keyMoments.map((moment, index) => {
                        const isActive = activeMomentIndex === index;
                        return (
                          <button
                            key={`moment-${index}`}
                            type="button"
                            onClick={() => handleSeek(moment.startOffset, index)}
                            className={`flex w-full items-center justify-between py-3.5 text-left transition-colors hover:bg-slate-50 px-2 rounded-lg ${
                              isActive ? 'bg-red-50 text-red-800' : 'text-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="inline-flex h-8 w-16 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-slate-700">
                                {formatDurationDisplay(moment.startOffset)}
                              </span>
                              <span className="font-medium text-sm sm:text-base">
                                {moment.name}
                              </span>
                            </div>
                            <Play className="h-4 w-4 text-slate-400 group-hover:text-red-600" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* VERBATIM TRANSCRIPT (Crawlable for Google SEO & Accessibility) */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-slate-700" />
                      <h2 className="text-xl font-bold text-slate-900">
                        Full Verbatim Transcript
                      </h2>
                    </div>
                    {testimonial.video_transcript && (
                      <button
                        type="button"
                        onClick={handleCopyTranscript}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        <span>{copied ? 'Copied!' : 'Copy Transcript'}</span>
                      </button>
                    )}
                  </div>

                  <div className="mt-6 prose prose-slate max-w-none text-slate-700 leading-relaxed">
                    {testimonial.video_transcript ? (
                      testimonial.video_transcript
                        .split(/\n{2,}/)
                        .map((para, i) => {
                          const timestampRegex = /(\[?\b(?:(?:\d{1,2}:)?\d{1,2}:\d{2})\b\]?|\(\b(?:(?:\d{1,2}:)?\d{1,2}:\d{2})\b\))/g;
                          const parts = para.split(timestampRegex);
                          return (
                            <p key={`para-${i}`}>
                              {parts.map((part, pIdx) => {
                                const cleanTs = part.replace(/^(\[|\()|(\]|\))$/g, '').trim();
                                const isTs = /^(?:(?:\d{1,2}:)?\d{1,2}:\d{2})$/.test(cleanTs);
                                if (isTs) {
                                  const sec = parseDurationInput(cleanTs);
                                  return (
                                    <button
                                      key={`ts-${i}-${pIdx}`}
                                      type="button"
                                      onClick={() => handleSeek(sec)}
                                      title={`Jump to ${cleanTs}`}
                                      className="inline-flex items-center gap-1 rounded bg-red-50 hover:bg-red-100 text-[#B91C3C] font-semibold text-xs px-2 py-0.5 mx-1 transition-colors border border-red-200 cursor-pointer align-baseline"
                                    >
                                      <Play className="h-3 w-3 fill-current" />
                                      <span>{cleanTs}</span>
                                    </button>
                                  );
                                }
                                return part;
                              })}
                            </p>
                          );
                        })
                    ) : (
                      <p className="italic text-slate-500">
                        &ldquo;{testimonial.feedback}&rdquo;
                      </p>
                    )}
                  </div>

                  {testimonial.tags?.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-slate-100">
                      <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Topics & Services Discussed:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {testimonial.tags.map((tag) => (
                          <span
                            key={tag}
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${getTestimonialTagTone(
                              tag
                            )}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: Clinician Commentary (E-E-A-T) & VA Claim Guidance */}
              <div className="space-y-8">
                {/* CLINICIAN NOTES (Dr. Kishan Bhalani) */}
                <div className="rounded-2xl border-2 border-navy-100 bg-gradient-to-b from-white to-slate-50 p-6 shadow-sm sm:p-8">
                  <div className="flex items-center gap-2 text-[#B91C3C]">
                    <Stethoscope className="h-6 w-6" />
                    <span className="text-xs font-bold uppercase tracking-[0.2em]">
                      Clinical Case Review
                    </span>
                  </div>

                  <h3 className="mt-3 text-xl font-bold text-slate-900">
                    Medical Commentary by Dr. Kishan Bhalani, M.D.
                  </h3>

                  <p className="mt-1 text-xs text-slate-500 font-medium">
                    Licensed Physician & VA Disability Medical Opinion Specialist
                  </p>

                  <div className="mt-5 space-y-4 text-sm leading-relaxed text-slate-700">
                    {testimonial.clinician_notes ? (
                      testimonial.clinician_notes
                        .split(/\n{2,}/)
                        .map((notePara, idx) => (
                          <p key={`note-${idx}`}>{notePara.trim()}</p>
                        ))
                    ) : (
                      <p>
                        In claims involving {testimonial.condition_tag || 'service-connected disabilities'}, establishing the medical nexus requires robust review of service treatment records, post-service diagnostic evidence, and peer-reviewed medical rationale demonstrating that the condition is &ldquo;at least as likely as not&rdquo; related to military service.
                      </p>
                    )}
                  </div>

                  <div className="mt-6 rounded-xl bg-slate-100 p-4 border border-slate-200 text-xs text-slate-600 space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-slate-800">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      <span>VA Medical Nexus Standard</span>
                    </div>
                    <p>
                      Every medical opinion provided adheres strictly to 38 CFR evidentiary requirements, incorporating comprehensive clinical citation and objective medical reasoning.
                    </p>
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <Link
                      href="/about"
                      className="text-xs font-bold text-[#B91C3C] hover:text-[#991530] inline-flex items-center gap-1"
                    >
                      <span>Read Dr. Bhalani&apos;s Clinical Background & Credentials</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>

                {/* CLAIM ACCELERATION CARD */}
                <div className="rounded-2xl bg-gradient-to-br from-navy-800 to-slate-900 p-6 text-white shadow-xl sm:p-8">
                  <h3 className="text-xl font-bold text-white">
                    Need Similar Evidence for Your Claim?
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/85">
                    Avoid delays and denials with a thorough, clinician-drafted Independent Medical Opinion tailored to your military records and current diagnoses.
                  </p>

                  <ul className="mt-5 space-y-2.5 text-xs text-white/90">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>Exhaustive military service treatment record audit</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>Peer-reviewed medical journal citations</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>Clear &ldquo;at least as likely as not&rdquo; standard</span>
                    </li>
                  </ul>

                  <Link
                    href="/forms?view=schedule"
                    className="mt-6 inline-flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-bold text-white shadow-lg transition-all hover:brightness-110"
                    style={{ backgroundColor: '#B91C3C' }}
                  >
                    <span>Schedule Case Review</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* RELATED SUCCESS STORIES */}
        {related.length > 0 && (
          <section className="border-t border-slate-200 py-16 bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    More Veteran Success Stories
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    See how other veterans secured their rightful VA disability ratings.
                  </p>
                </div>
                <Link
                  href="/testimonials"
                  className="text-sm font-bold text-[#B91C3C] hover:text-[#991530] inline-flex items-center gap-1"
                >
                  <span>View All Reviews</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {related.map((item) => (
                  <TestimonialCard key={item.id} testimonial={item} compact={true} />
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default VideoTestimonialSpokePage;
