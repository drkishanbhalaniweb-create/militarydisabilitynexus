# SEO Maintenance Guide

## Quick Reference for Adding New Pages

When creating new pages, follow this checklist to maintain SEO best practices:

### 1. SEO Component
Always import and use the SEO component at the top of your page:

```javascript
import SEO from '../components/SEO';

const YourPage = () => {
  return (
    <>
      <SEO 
        title="Your Page Title (50-60 characters)"
        description="Your meta description with benefits, USPs, and call-to-actions (120-160 characters)"
        keywords="keyword1, keyword2, keyword3"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Your Page Name",
          "description": "Your page description"
        }}
      />
      
      {/* Your page content */}
    </>
  );
};
```

### 2. Heading Structure
Every page MUST have:
- **One H1 tag** - Main page title (most important)
- **Multiple H2 tags** - Section headings
- **H3-H6 tags** - Sub-sections as needed

```javascript
<h1>Main Page Title</h1>

<section>
  <h2>Section Title</h2>
  <p>Content...</p>
</section>

<section>
  <h2>Another Section</h2>
  <h3>Subsection</h3>
  <p>Content...</p>
</section>
```

### 3. Meta Description Guidelines
- **Length:** 120-160 characters (optimal)
- **Include:** Benefits, USPs, call-to-actions
- **Avoid:** Duplicate descriptions across pages
- **Use:** Active voice and compelling language

**Good Examples:**
```
"Professional medical documentation services for VA disability claims. Expert nexus letters, DBQs, and medical consultations from licensed clinicians. 7-10 day turnaround."
```

**Bad Examples:**
```
"Welcome to our website." (too short, not descriptive)
"We offer services." (too vague)
```

### 4. Internal Linking
Add relevant internal links to:
- Related services
- Blog posts
- Contact page
- Forms page

```javascript
<Link to="/services">View Our Services</Link>
<Link to="/contact">Contact Us</Link>
<Link to="/blog">Read Our Blog</Link>
```

### 5. Structured Data Types

#### For Service Pages:
```javascript
structuredData={{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Service Name",
  "description": "Service description",
  "provider": {
    "@type": "Organization",
    "name": "Military Disability Nexus"
  },
  "offers": {
    "@type": "Offer",
    "price": "225",
    "priceCurrency": "USD"
  }
}}
```

#### For Blog Posts:
```javascript
structuredData={{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "Post Title",
  "description": "Post excerpt",
  "author": {
    "@type": "Person",
    "name": "Author Name"
  },
  "datePublished": "2025-01-01",
  "publisher": {
    "@type": "Organization",
    "name": "Military Disability Nexus"
  }
}}
```

#### For Organization/About Pages:
```javascript
structuredData={{
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  "name": "Military Disability Nexus",
  "description": "Professional medical documentation services",
  "url": "https://your-domain.com",
  "telephone": "contact@militarydisabilitynexus.com",
  "areaServed": "US"
}}
```

### 6. Content Guidelines
- **Minimum:** 200 words per page
- **Optimal:** 500-1000 words for main pages
- **Include:** Keywords naturally (don't stuff)
- **Format:** Use paragraphs, lists, and headings
- **Readability:** Write for humans first, search engines second

### 7. Image Optimization
When adding images:
```javascript
<img 
  src="/image.jpg" 
  alt="Descriptive alt text with keywords"
  loading="lazy"
  width="800"
  height="600"
/>
```

**Alt Text Guidelines:**
- Describe the image content
- Include relevant keywords naturally
- Keep it under 125 characters
- Don't start with "Image of" or "Picture of"

### 8. Canonical URLs
The SEO component automatically handles canonical URLs, but you can override:
```javascript
<SEO 
  canonical="https://your-domain.com/preferred-url"
/>
```

## Common SEO Mistakes to Avoid

### ❌ Don't:
1. Use duplicate meta descriptions
2. Stuff keywords unnaturally
3. Create pages with less than 200 words
4. Forget H1 tags
5. Use multiple H1 tags per page
6. Create broken internal links
7. Use generic titles like "Home" or "Page"
8. Ignore mobile responsiveness
9. Use images without alt text
10. Create thin content pages

### ✅ Do:
1. Write unique meta descriptions for each page
2. Use keywords naturally in content
3. Create comprehensive, valuable content
4. Use one descriptive H1 per page
5. Use H2-H6 for proper content hierarchy
6. Test all internal links regularly
7. Create descriptive, unique titles
8. Ensure mobile-first design
9. Add descriptive alt text to all images
10. Focus on user value and experience

## SEO Checklist for New Pages

Before publishing a new page, verify:

- [ ] SEO component imported and configured
- [ ] Title tag is unique and descriptive (50-60 chars)
- [ ] Meta description is compelling (120-160 chars)
- [ ] One H1 tag present
- [ ] Multiple H2 tags for sections
- [ ] At least 200 words of content
- [ ] Internal links to related pages
- [ ] Structured data added (if applicable)
- [ ] Images have alt text
- [ ] Mobile responsive
- [ ] No broken links
- [ ] Canonical URL set (if needed)
- [ ] Keywords used naturally
- [ ] Content provides value to users

## Testing Your SEO

### 1. Manual Checks
- View page source and verify meta tags
- Check heading structure (H1, H2, etc.)
- Test internal links
- Verify mobile responsiveness

### 2. Online Tools
- **Google Search Console:** Monitor indexing and performance
- **Google Rich Results Test:** Validate structured data
- **PageSpeed Insights:** Check performance
- **Mobile-Friendly Test:** Verify mobile optimization
- **Schema Validator:** Validate structured data

### 3. Browser Extensions
- **SEO Meta in 1 Click:** Quick meta tag overview
- **Lighthouse:** Comprehensive SEO audit
- **Detailed SEO Extension:** In-depth analysis

## Monitoring SEO Performance

### Weekly:
- Check Google Search Console for errors
- Review new indexed pages
- Monitor Core Web Vitals

### Monthly:
- Analyze organic traffic trends
- Review keyword rankings
- Check for broken links
- Update outdated content

### Quarterly:
- Comprehensive SEO audit
- Competitor analysis
- Content gap analysis
- Technical SEO review

## Resources

### Official Documentation:
- [Google Search Central](https://developers.google.com/search)
- [Schema.org](https://schema.org/)
- [MDN Web Docs - SEO](https://developer.mozilla.org/en-US/docs/Glossary/SEO)

### Tools:
- [Google Search Console](https://search.google.com/search-console)
- [Google Analytics](https://analytics.google.com/)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Rich Results Test](https://search.google.com/test/rich-results)

### Learning:
- [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Moz Beginner's Guide to SEO](https://moz.com/beginners-guide-to-seo)
- [Ahrefs SEO Blog](https://ahrefs.com/blog/)

## Need Help?

If you encounter SEO issues:
1. Check this guide first
2. Review the SEO_IMPROVEMENTS.md file
3. Test with online tools
4. Consult Google Search Console
5. Review competitor pages for inspiration

Remember: SEO is an ongoing process, not a one-time task. Regular monitoring and updates are essential for maintaining and improving search rankings.
