const Robots = () => null;

export const getServerSideProps = async ({ res }) => {
    // Hardening Requirement #4: No Caching
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader(
        'Cache-Control',
        'no-store, no-cache, must-revalidate, proxy-revalidate'
    );

    // Hardening Requirement #2 & #5: Strict Rules & Canonical Sitemap
    const content = `User-agent: *
Allow: /
Allow: /_next/static/
Allow: /_next/image/

Disallow: /api/
Disallow: /admin/
Disallow: /dashboard/

User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: CCBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityUser
Allow: /

User-agent: anthropic-ai
Allow: /

Sitemap: https://www.militarydisabilitynexus.com/sitemap.xml`;

    res.write(content);
    res.end();

    return {
        props: {},
    };
};

export default Robots;
