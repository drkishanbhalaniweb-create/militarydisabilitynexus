export const formatBlogHTML = (htmlString) => {
    if (!htmlString) return '';

    const customBlocks = ['stat-strip', 'faq-section', 'highlight-box', 'hook-block', 'denial-grid', 'definition-block', 'author-block', 'toc-block', 'alert-box'];

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

    // 2. Generate TOC if toc-block exists and headings are present
    if (headings.length > 0 && sourceHtml.includes('<div class="toc-block"')) {
        const tocItems = headings.map((h, i) => `
            <li class="mb-5 last:mb-0">
                <a href="#${h.id}" class="flex items-start gap-3 md:gap-4 group no-underline text-slate-600 hover:text-slate-900 transition-colors">
                    <span class="text-[#cca35e] font-bold text-lg leading-snug">${i + 1}.</span>
                    <span class="text-base md:text-lg font-medium leading-snug group-hover:underline underline-offset-4 decoration-[#cca35e]/40 transition duration-300">${h.text}</span>
                </a>
            </li>
        `).join('');

        const tocHtml = `
        <div class="toc-block bg-[#Faf9f6] border-l-4 border-[#cca35e] p-8 md:p-10 rounded-r-2xl shadow-sm my-12">
            <div class="text-xs font-bold tracking-[0.15em] text-slate-400 uppercase mb-6 flex items-center gap-3">
                <span class="w-8 h-px bg-slate-300"></span>
                In This Article
            </div>
            <ul class="list-none p-0 m-0">
                ${tocItems}
            </ul>
        </div>`;

        // Replace the tip tap placeholder toc-block with our generated toc html
        sourceHtml = sourceHtml.replace(/<div class="toc-block".*?<\/div>(?:<p><\/p>|<p><br><\/p>)?/is, tocHtml);
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
    const actualCardOpen = '<div class="bg-white rounded-2xl p-8 md:p-12 shadow-lg mb-10 prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-a:text-[#B91C3C]">';
    const actualCardClose = '</div>';

    // Clean up empty cards before replacing (remove spacing and <p></p> inside them)
    // A card is essentially empty if it contains only whitespace or a <p></p>
    processedHtml = processedHtml.replace(/%%%CARD_OPEN%%%(\s|<p><\/p>|<p><br><\/p>)*%%%CARD_CLOSE%%%/g, '');

    // Now replace the remaining markers
    processedHtml = processedHtml.split('%%%CARD_OPEN%%%').join(actualCardOpen);
    processedHtml = processedHtml.split('%%%CARD_CLOSE%%%').join(actualCardClose);

    return processedHtml;
};
