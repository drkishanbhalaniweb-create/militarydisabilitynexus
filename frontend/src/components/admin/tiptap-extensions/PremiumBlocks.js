import { Node, mergeAttributes } from '@tiptap/core';

/**
 * GlobalWrapperDiv preserves any <div> that uses our premium blog CSS classes.
 * It strictly allows block content (like paragraphs and headings) inside it.
 */
export const GlobalWrapperDiv = Node.create({
  name: 'globalWrapperDiv',
  group: 'block',
  content: 'block+',
  
  addAttributes() {
    return {
      class: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div',
        getAttrs: (element) => {
          const cls = element.className || '';
          const allowedWrappers = [
            'stat-strip', 'stat-item', 
            'faq-section', 'faq-block', 'faq-answer', 
            'highlight-box', 'hook-block', 
            'denial-grid', 'denial-card', 'denial-header', 'denial-body', 
            'definition-block', 'definition-content'
          ];
          
          if (allowedWrappers.some(c => cls.includes(c))) {
            return { class: cls };
          }
          return false;
        },
      },
      // Also allow ul.checklist as a standard wrapper if needed
      {
        tag: 'ul.checklist',
        getAttrs: () => ({ class: 'checklist' })
      }
    ];
  },

  renderHTML({ HTMLAttributes }) {
    // If it's a checklist, render as ul
    if (HTMLAttributes.class === 'checklist') {
      return ['ul', HTMLAttributes, 0];
    }
    return ['div', HTMLAttributes, 0];
  },
});

/**
 * GlobalInlineSpan preserves any <span> that uses our premium blog CSS classes (e.g. badges, numbers).
 * It strictly allows inline content (text) inside it.
 */
export const GlobalInlineSpan = Node.create({
  name: 'globalInlineSpan',
  group: 'inline',
  inline: true,
  content: 'inline*',
  
  addAttributes() {
    return {
      class: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span',
        getAttrs: (element) => {
          const cls = element.className || '';
          const allowedSpans = [
            'stat-num', 'stat-lbl', 
            'section-label', 
            'card-num', 
            'def-label'
          ];
          
          if (allowedSpans.some(c => cls.includes(c))) {
            return { class: cls };
          }
          return false;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', HTMLAttributes, 0];
  },
});
