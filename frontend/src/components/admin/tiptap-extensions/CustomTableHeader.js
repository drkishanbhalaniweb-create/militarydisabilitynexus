import { TableHeader } from '@tiptap/extension-table-header';

/**
 * Extends the default TableHeader to support inline style attributes.
 * This lets us persist header background-color through the HTML round-trip.
 */
const CustomTableHeader = TableHeader.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            style: {
                default: null,
                parseHTML: (element) => element.getAttribute('style'),
                renderHTML: (attributes) => {
                    if (!attributes.style) return {};
                    return { style: attributes.style };
                },
            },
        };
    },
});

export default CustomTableHeader;
