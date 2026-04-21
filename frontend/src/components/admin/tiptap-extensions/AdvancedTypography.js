import { Extension, Mark, mergeAttributes } from '@tiptap/core';

/**
 * FontSize Extension
 * Allows setting font size on text selections.
 */
export const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle'],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize.replace(/px/g, ''),
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size: ${attributes.fontSize}${attributes.fontSize.includes('px') || attributes.fontSize.includes('rem') ? '' : 'px'}`,
              };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize: (fontSize) => ({ chain }) => {
        return chain().setMark('textStyle', { fontSize }).run();
      },
      unsetFontSize: () => ({ chain }) => {
        return chain().setMark('textStyle', { fontSize: null }).run();
      },
    };
  },
});

/**
 * DropCap Mark
 * Special styling for the first letter of a paragraph.
 */
export const DropCap = Mark.create({
  name: 'dropCap',

  addAttributes() {
    return {
      class: {
        default: 'drop-cap',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span.drop-cap',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      toggleDropCap: () => ({ commands }) => {
        return commands.toggleMark(this.name);
      },
    };
  },
});
