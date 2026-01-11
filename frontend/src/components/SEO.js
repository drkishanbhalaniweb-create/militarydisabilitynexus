import Head from 'next/head';

// Production site URL - used for canonical URLs and OG tags
const SITE_URL = 'https://www.militarydisabilitynexus.com';

const SEO = ({
  title,
  description,
  keywords,
  ogImage = '/android-chrome-512x512.png',
  article = false,
  publishedTime,
  modifiedTime,
  author = 'Military Disability Nexus',
  canonical,
  structuredData,
  faqSchema,
  breadcrumbs
}) => {
  // Always use production URL for SEO purposes
  const siteUrl = SITE_URL;
  // In Next.js SSR, window might be undefined initially, but Head handles it.
  // For canonical, we can rely on the passed canonical or default to siteUrl.
  // Ideally, we pass the current path from the parent page or use useRouter, 
  // but for now, we'll rely on the default or prop.
  const canonicalUrl = canonical || siteUrl;

  // Truncate description to 130 characters to avoid SEO penalties
  const metaDescription = description && description.length > 130
    ? `${description.substring(0, 127)}...`
    : description;

  return (
    <Head>
      {/* Basic Meta Tags - only render if explicitly provided */}
      {title && <title>{title} | Military Disability Nexus</title>}
      {metaDescription && <meta name="description" content={metaDescription} />}
      {keywords && <meta name="keywords" content={keywords} />}
      {canonical && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:type" content={article ? 'article' : 'website'} />
      {title && <meta property="og:title" content={title} />}
      {metaDescription && <meta property="og:description" content={metaDescription} />}
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={`${siteUrl}${ogImage}`} />
      <meta property="og:site_name" content="Military Disability Nexus" />

      {/* Article specific */}
      {article && (
        <>
          <meta property="article:author" content={author} />
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
        </>
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      {title && <meta name="twitter:title" content={title} />}
      {metaDescription && <meta name="twitter:description" content={metaDescription} />}
      <meta name="twitter:image" content={`${siteUrl}${ogImage}`} />

      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content={author} />
      <meta name="language" content="English" />

      {/* Structured Data (JSON-LD) */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}

      {/* FAQ Schema */}
      {faqSchema && faqSchema.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": faqSchema.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": faq.answer
                }
              }))
            })
          }}
        />
      )}

      {/* Breadcrumb Schema */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": breadcrumbs.map((crumb, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "name": crumb.name,
                "item": `${siteUrl}${crumb.path}`
              }))
            })
          }}
        />
      )}
    </Head>
  );
};

export default SEO;
