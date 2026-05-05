import { useEffect, useId, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AlertCircle, CheckCircle2, FileText, Loader2, Mail } from 'lucide-react';

const HYDRATED_ATTRIBUTE = 'data-lead-magnet-hydrated';

const getBlockProps = (element) => ({
  pdfPath: element.getAttribute('data-pdf-path') || '',
  title: element.getAttribute('data-title') || 'Free PDF Template',
  description: element.getAttribute('data-description') || '',
  cta: element.getAttribute('data-cta') || 'Email me the free template',
  thumbnailUrl: element.getAttribute('data-thumbnail-url') || '',
  fileName: element.getAttribute('data-file-name') || '',
});

const LeadMagnetForm = ({
  pdfPath,
  title,
  description,
  cta,
  thumbnailUrl,
  fileName,
}) => {
  const emailInputId = useId();
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [startedAt] = useState(() => Date.now());
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('submitting');
    setMessage('');

    try {
      const response = await fetch('/api/lead-magnet-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          pdfPath,
          title,
          fileName,
          sourcePath: window.location.pathname,
          meta: {
            honeypot,
            startedAt,
            submittedAt: Date.now(),
          },
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Unable to send the PDF.');
      }

      setStatus('success');
      setMessage('Check your email for the download link.');
      setEmail('');
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Unable to send the PDF.');
    }
  };

  return (
    <section className="not-prose my-10 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-0 sm:grid-cols-[168px_1fr]">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt=""
            className="h-44 w-full object-cover sm:h-full"
            loading="lazy"
          />
        ) : (
          <div className="flex h-44 items-center justify-center bg-slate-100 sm:h-full">
            <FileText className="h-14 w-14 text-slate-400" />
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start gap-3">
            <div className="mt-1 hidden rounded bg-red-50 p-2 text-[#B91C3C] sm:block">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xl font-bold text-slate-950">{title}</h3>
              {description && (
                <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row">
            <label className="sr-only" htmlFor={emailInputId}>
              Email address
            </label>
            <input
              id={emailInputId}
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              disabled={status === 'submitting'}
            />
            <input
              type="text"
              value={honeypot}
              onChange={(event) => setHoneypot(event.target.value)}
              tabIndex="-1"
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
            />
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#B91C3C] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#991b33] disabled:opacity-60"
            >
              {status === 'submitting' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              <span>{status === 'submitting' ? 'Sending...' : cta}</span>
            </button>
          </form>

          {message && (
            <div
              className={`mt-4 flex items-start gap-2 rounded-md px-3 py-2 text-sm ${
                status === 'success'
                  ? 'bg-green-50 text-green-800'
                  : 'bg-red-50 text-red-800'
              }`}
            >
              {status === 'success' ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              )}
              <span>{message}</span>
            </div>
          )}

          {fileName && (
            <p className="mt-3 text-xs text-slate-400">{fileName}</p>
          )}
        </div>
      </div>
    </section>
  );
};

const LeadMagnetHydrator = () => {
  const markerRef = useRef(null);

  useEffect(() => {
    const scope =
      markerRef.current?.previousElementSibling ||
      markerRef.current?.parentElement ||
      document;

    const blocks = Array.from(
      scope.querySelectorAll(`.lead-magnet-block[data-pdf-path]:not([${HYDRATED_ATTRIBUTE}])`)
    );

    const roots = blocks.map((block) => {
      block.setAttribute(HYDRATED_ATTRIBUTE, 'true');
      const props = getBlockProps(block);
      block.innerHTML = '';

      const root = createRoot(block);
      root.render(<LeadMagnetForm {...props} />);

      return { block, root };
    });

    return () => {
      roots.forEach(({ block, root }) => {
        root.unmount();
        block.removeAttribute(HYDRATED_ATTRIBUTE);
      });
    };
  }, []);

  return <span ref={markerRef} className="hidden" aria-hidden="true" />;
};

export default LeadMagnetHydrator;
