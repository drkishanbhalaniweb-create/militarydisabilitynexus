export const formatBlogHTML = (htmlString) => {
    if (!htmlString) return '';

    const customBlocks = ['stat-strip', 'faq-section', 'highlight-box', 'hook-block', 'denial-grid', 'definition-block', 'author-block'];

    let processedHtml = '';
    let currentIdx = 0;

    // Use a unique marker to avoid regex escaping issues later
    const CARD_OPEN = '%%%CARD_OPEN%%%';
    const CARD_CLOSE = '%%%CARD_CLOSE%%%';

    processedHtml += CARD_OPEN;

    while (currentIdx < htmlString.length) {
        // Find the next custom block
        let nextBlockStart = -1;
        for (const block of customBlocks) {
            const idx = htmlString.indexOf(`<div class="${block}"`, currentIdx);
            if (idx !== -1 && (nextBlockStart === -1 || idx < nextBlockStart)) {
                nextBlockStart = idx;
            }
        }

        if (nextBlockStart === -1) {
            // No more custom blocks, append the rest
            processedHtml += htmlString.substring(currentIdx);
            break;
        }

        // Append text up to the block
        if (nextBlockStart > currentIdx) {
            processedHtml += htmlString.substring(currentIdx, nextBlockStart);
        }

        // Find the matching closing div for this block
        let closingDivIdx = -1;
        let openDivs = 0;
        let i = nextBlockStart;

        while (i < htmlString.length) {
            if (htmlString.startsWith('<div', i)) {
                openDivs++;
                i += 4;
            } else if (htmlString.startsWith('</div', i)) {
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
            const followingStr = htmlString.substring(closingDivIdx);
            if (followingStr.startsWith('<p></p>')) {
                realClosingIdx += 7;
            } else if (followingStr.startsWith('<p><br></p>')) {
                realClosingIdx += 11;
            }

            const blockContent = htmlString.substring(nextBlockStart, realClosingIdx);

            // Close the current card, insert the block, open a new card
            processedHtml += `${CARD_CLOSE}${blockContent}${CARD_OPEN}`;
            currentIdx = realClosingIdx;
        } else {
            // Broken HTML, append the rest and break
            processedHtml += htmlString.substring(currentIdx);
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
