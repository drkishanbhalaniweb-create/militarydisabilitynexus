export const formatBlogHTML = (htmlString, options = { extractToc: false }) => {
    if (!htmlString) {
        return options.extractToc ? { html: '', tocItems: [], hasToc: false } : '';
    }

    const customBlocks = ['stat-strip', 'faq-section', 'highlight-box', 'hook-block', 'denial-grid', 'definition-block', 'author-block', 'toc-block', 'alert-box', 'lead-magnet-block'];

    // 1. Parse Headings & Inject IDs
    let headings = [];
    let sourceHtml = htmlString.replace(/<h(2|3)([^>]*)>(.*?)<\/h\1>/gi, (match, level, attributes, innerHtml) => {
        const text = innerHtml.replace(/<[^>]*>?/gm, '').trim();
        if (!text) return match;
        
        let slug = '';
        // Extract existing id if any
        const idMatch = attributes.match(/id=['"]([^'"]+)['"]/i);
        if (idMatch) {
            slug = idMatch[1];
        } else {
            slug = text.toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^\w-]+/g, '')
                .replace(/--+/g, '-')
                .replace(/^-+/, '')
                .replace(/-+$/, '');
            attributes = ` id="${slug}" style="scroll-margin-top: 6rem;"${attributes}`;
        }
        
        // Only add h2 to TOC to avoid clutter
        if (level === '2') {
            headings.push({ id: slug, text });
        }
        
        return `<h${level}${attributes}>${innerHtml}</h${level}>`;
    });

    let hasToc = false;

    // 2. Generate TOC if toc-block exists and headings are present
    if (headings.length > 0 && sourceHtml.includes('<div class="toc-block"')) {
        hasToc = true;
        if (options.extractToc) {
            // Strip out the placeholder toc-block completely
            sourceHtml = sourceHtml.replace(/<div class="toc-block".*?<\/div>(?:<p><\/p>|<p><br><\/p>)?/is, '');
        } else {
            const tocItems = headings.map((h) => `
                <li class="mb-3 last:mb-0">
                    <a href="#${h.id}" class="flex items-start gap-3 group no-underline text-slate-600 hover:text-slate-900 transition-colors font-mono text-[14px]">
                        <span class="text-slate-300 font-bold group-hover:text-navy-700 transition-colors">—</span>
                        <span class="font-medium leading-snug group-hover:underline underline-offset-4 decoration-navy-700/40 transition duration-300">${h.text}</span>
                    </a>
                </li>
            `).join('');

            const tocHtml = `
            <div class="toc-block py-6 my-10 border-t border-b border-slate-100">
                <div class="text-[11px] font-bold tracking-[0.2em] text-slate-400 uppercase mb-6 flex items-center gap-3">
                    <span class="w-6 h-px bg-slate-300"></span>
                    In This Article
                </div>
                <ul class="list-none p-0 m-0">
                    ${tocItems}
                </ul>
            </div>`;


            // Replace the tip tap placeholder toc-block with our generated toc html
            sourceHtml = sourceHtml.replace(/<div class="toc-block".*?<\/div>(?:<p><\/p>|<p><br><\/p>)?/is, tocHtml);
        }
    }

    let processedHtml = '';
    let currentIdx = 0;

    // Use a unique marker to avoid regex escaping issues later
    const CARD_OPEN = '%%%CARD_OPEN%%%';
    const CARD_CLOSE = '%%%CARD_CLOSE%%%';

    processedHtml += CARD_OPEN;

    while (currentIdx < sourceHtml.length) {
        // Find the next custom block
        let nextBlockStart = -1;
        for (const block of customBlocks) {
            const idx = sourceHtml.indexOf(`<div class="${block}"`, currentIdx);
            if (idx !== -1 && (nextBlockStart === -1 || idx < nextBlockStart)) {
                nextBlockStart = idx;
            }
        }

        if (nextBlockStart === -1) {
            // No more custom blocks, append the rest
            processedHtml += sourceHtml.substring(currentIdx);
            break;
        }

        // Append text up to the block
        if (nextBlockStart > currentIdx) {
            processedHtml += sourceHtml.substring(currentIdx, nextBlockStart);
        }

        // Find the matching closing div for this block
        let closingDivIdx = -1;
        let openDivs = 0;
        let i = nextBlockStart;

        while (i < sourceHtml.length) {
            if (sourceHtml.startsWith('<div', i)) {
                openDivs++;
                i += 4;
            } else if (sourceHtml.startsWith('</div', i)) {
                openDivs--;
                if (openDivs === 0) {
                    closingDivIdx = i + 6; // length of "</div>"
                    break;
                }
                i += 5;
            } else {
                i++;
            }
        }

        if (closingDivIdx !== -1) {
            // We found the full block
            // Handle any trailing <p></p> that TipTap often inserts after blocks
            let realClosingIdx = closingDivIdx;
            const followingStr = sourceHtml.substring(closingDivIdx);
            if (followingStr.startsWith('<p></p>')) {
                realClosingIdx += 7;
            } else if (followingStr.startsWith('<p><br></p>')) {
                realClosingIdx += 11;
            }

            const blockContent = sourceHtml.substring(nextBlockStart, realClosingIdx);

            // Close the current card, insert the block, open a new card
            processedHtml += `${CARD_CLOSE}${blockContent}${CARD_OPEN}`;
            currentIdx = realClosingIdx;
        } else {
            // Broken HTML, append the rest and break
            processedHtml += sourceHtml.substring(currentIdx);
            break;
        }
    }

    processedHtml += CARD_CLOSE;

    // Replace the markers with actual HTML
    const actualCardOpen = '<div class="mb-6 prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-a:text-[#B91C3C] font-inter">';
    const actualCardClose = '</div>';

    // Clean up empty cards before replacing (remove spacing and <p></p> inside them)
    // A card is essentially empty if it contains only whitespace or a <p></p>
    processedHtml = processedHtml.replace(/%%%CARD_OPEN%%%(\s|<p><\/p>|<p><br><\/p>)*%%%CARD_CLOSE%%%/g, '');

    // Now replace the remaining markers
    processedHtml = processedHtml.split('%%%CARD_OPEN%%%').join(actualCardOpen);
    processedHtml = processedHtml.split('%%%CARD_CLOSE%%%').join(actualCardClose);

    if (options.extractToc) {
        return {
            html: processedHtml,
            tocItems: headings,
            hasToc: hasToc
        };
    }

    return processedHtml;
};
