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
Disallow: /api/
Disallow: /_next/
Disallow: /admin/
Disallow: /dashboard/

Sitemap: https://www.militarydisabilitynexus.com/sitemap.xml`;

    res.write(content);
    res.end();

    return {
        props: {},
    };
};

export default Robots;
