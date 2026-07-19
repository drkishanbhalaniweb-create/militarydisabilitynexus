import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import CustomTableHeader from './tiptap-extensions/CustomTableHeader';
import TableBubbleMenu from './tiptap-extensions/TableBubbleMenu';
import { FontSize, DropCap } from './tiptap-extensions/AdvancedTypography';
import { Bold, Italic, List, ListOrdered, Quote, Heading2, Heading3, Link as LinkIcon, Undo, Redo, LayoutGrid, AlertCircle, Info, MessageSquare, ImageIcon, Loader2, Baseline, PaintBucket, Type, AlignLeft, AlignCenter, AlignRight, AlignJustify, Table as TableIcon, FileUp, Upload, X, Percent } from 'lucide-react';
import { useCallback, useRef, useState, useEffect } from 'react';
import { uploadBlogImage, validateImage } from '../../lib/imageUpload';
import { uploadLeadMagnetPdf, validatePdf } from '../../lib/pdfUpload';
import { GlobalWrapperDiv, GlobalInlineSpan } from './tiptap-extensions/PremiumBlocks';
import { toast } from 'sonner';

// Hardcoded templates based on the premium SEO-optimized layout
const TEMPLATES = {
    STAT_STRIP: `<div class="stat-strip"><div class="stat-item"><span class="stat-num">36%</span><span class="stat-lbl">of VA claims denied</span></div><div class="stat-item"><span class="stat-num">#1</span><span class="stat-lbl">reason for denial</span></div></div><p></p>`,
    FAQ_SECTION: `<div class="faq-section"><span class="section-label">FAQ</span><div class="faq-block"><h3>What does a claim require?</h3><div class="faq-answer"><p>A valid PTSD diagnosis, an in-service stressor, and a medical nexus.</p></div></div></div><p></p>`,
    HIGHLIGHT_BOX: `<div class="highlight-box"><span class="section-label">Section 01</span><h2>Claim Readiness Check</h2><p>Before you submit, conduct a structured pre-filing self-assessment.</p></div><p></p>`,
    HOOK_BLOCK: `<div class="hook-block"><p>Every mission requires intelligence before action. <strong>Filing a disability claim is no different.</strong></p></div><p></p>`,
    DENIAL_GRID: `<div class="denial-grid"><div class="denial-card"><span class="card-num">Reason 01</span><h4>No Formal Diagnosis</h4><p>The VA requires a formal diagnosis from a licensed professional.</p></div></div><p></p>`,
    DEFINITION_BLOCK: `<div class="definition-block"><span class="def-label">Definition</span><h3>What Is a PTSD Nexus Letter?</h3><p>An independent medical opinion linking your condition to your service.</p></div><p></p>`,
    QUOTABLE: `<p class="quotable">A denial from the VA is not a verdict on whether your condition is real. <strong>Understanding why claims fail is the first step.</strong></p><p></p>`,
    CHECKLIST: `<ul class="checklist"><li>I have a current, formal diagnosis.</li><li>I can clearly identify my in-service stressor.</li></ul><p></p>`,
    TOC_BLOCK: `<div class="toc-block"><p class="text-slate-500 text-sm font-semibold italic text-center">Table of contents will automatically generate here when viewed.</p></div><p></p>`,
    ALERT_BOX: `<div class="alert-box"><p><strong>⚠️ Warning or Pattern Title</strong></p><p>Describe the specific issue, pattern, or warning here in a couple of sentences.</p></div><p></p>`,
    CUSTOM_BOX: `<div class="custom-box"><h3>Heading</h3><p>Body</p></div><p></p>`,
    RATING_BOX: `<div class="rating-box"><div class="rating-badge"><span class="rating-value">10</span><span class="rating-label">PERCENT</span></div><div class="rating-content"><p>FEV-1 of 71 to 80 percent predicted, or FEV-1/FVC of 71 to 80 percent, or intermittent inhalational or oral bronchodilator therapy.</p><p>The veteran who reaches for an albuterol rescue inhaler now and then, or whose breathing tests show mild reduction. Either one, documented, supports a compensable rating.</p></div></div><p></p>`
};

const FONTS = [
    { label: 'Default (Inter)', value: 'Inter' },
    { label: '--- Sans Serif ---', value: 'SANS_HEADER', disabled: true },
    { label: 'Montserrat', value: 'Montserrat' },
    { label: 'Outfit', value: 'Outfit' },
    { label: 'Roboto', value: 'Roboto' },
    { label: 'Open Sans', value: 'Open Sans' },
    { label: 'Lato', value: 'Lato' },
    { label: 'Poppins', value: 'Poppins' },
    { label: 'Oswald', value: 'Oswald' },
    { label: 'Source Sans 3', value: 'Source Sans 3' },
    { label: 'Arial', value: 'Arial' },
    { label: 'System Sans', value: 'sans-serif' },
    { label: '--- Serif ---', value: 'SERIF_HEADER', disabled: true },
    { label: 'Playfair Display', value: 'Playfair Display' },
    { label: 'EB Garamond', value: 'EB Garamond' },
    { label: 'Merriweather', value: 'Merriweather' },
    { label: 'Lora', value: 'Lora' },
    { label: 'Spectral', value: 'Spectral' },
    { label: 'Times New Roman', value: 'Times New Roman' },
    { label: 'System Serif', value: 'serif' },
    { label: '--- Other ---', value: 'OTHER_HEADER', disabled: true },
    { label: 'Monospace', value: 'monospace' }
];

const FONT_SIZES = [
    { label: '12px', value: '12' },
    { label: '14px', value: '14' },
    { label: '16px', value: '16' },
    { label: '18px', value: '18' },
    { label: '20px', value: '20' },
    { label: '24px', value: '24' },
    { label: '30px', value: '30' },
    { label: '36px', value: '36' },
    { label: '48px', value: '48' },
    { label: '60px', value: '60' },
    { label: '72px', value: '72' },
];

const DEFAULT_LEAD_MAGNET = {
    title: '',
    description: '',
    cta: 'Email me the free template',
    thumbnailUrl: '',
};

const escapeHtml = (value = '') => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const escapeAttribute = escapeHtml;

const normalizeLeadMagnetText = (value = '') => value.trim().replace(/\s+/g, ' ');

const MenuBar = ({ editor }) => {
    const fileInputRef = useRef(null);
    const thumbnailInputRef = useRef(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingPdf, setUploadingPdf] = useState(false);
    const [isLeadMagnetOpen, setIsLeadMagnetOpen] = useState(false);
    const [leadMagnetDraft, setLeadMagnetDraft] = useState(DEFAULT_LEAD_MAGNET);
    const [pdfFile, setPdfFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState('');

    const setLink = useCallback(() => {
        if (!editor) return;
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    const setAltTag = useCallback(() => {
        if (!editor) return;
        const currentAttributes = editor.getAttributes('image');
        if (!currentAttributes.src) {
            toast.error("Please select an image first");
            return;
        }
        const newAlt = window.prompt('Image Alt Tag (SEO)', currentAttributes.alt || '');
        if (newAlt !== null) {
            editor.chain().focus().updateAttributes('image', { alt: newAlt }).run();
        }
    }, [editor]);

    const insertBlock = (htmlString) => {
        editor.chain().focus().insertContent(htmlString).run();
    };

    const resetLeadMagnetModal = () => {
        setLeadMagnetDraft(DEFAULT_LEAD_MAGNET);
        setPdfFile(null);
        setThumbnailFile(null);
        setThumbnailPreview('');
        if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
    };

    const openLeadMagnetModal = () => {
        resetLeadMagnetModal();
        setIsLeadMagnetOpen(true);
    };

    const closeLeadMagnetModal = () => {
        if (uploadingPdf) return;
        setIsLeadMagnetOpen(false);
        resetLeadMagnetModal();
    };

    const handlePdfSelect = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const validation = validatePdf(file);
        if (!validation.valid) {
            toast.error(validation.errors.join(', '));
            event.target.value = '';
            return;
        }

        setPdfFile(file);
    };

    const handleThumbnailSelect = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const validation = validateImage(file);
        if (!validation.valid) {
            toast.error(validation.errors.join(', '));
            event.target.value = '';
            return;
        }

        setThumbnailFile(file);
        if (typeof window !== 'undefined') {
            setThumbnailPreview(URL.createObjectURL(file));
        }
    };

    const insertLeadMagnetBlock = async () => {
        const title = normalizeLeadMagnetText(leadMagnetDraft.title);
        const description = normalizeLeadMagnetText(leadMagnetDraft.description);
        const cta = normalizeLeadMagnetText(leadMagnetDraft.cta) || DEFAULT_LEAD_MAGNET.cta;

        if (!title || !description) {
            toast.error('Add a title and description for the PDF block.');
            return;
        }

        if (!pdfFile) {
            toast.error('Choose a PDF to upload.');
            return;
        }

        setUploadingPdf(true);
        try {
            const pdf = await uploadLeadMagnetPdf(pdfFile);
            let thumbnailUrl = leadMagnetDraft.thumbnailUrl.trim();

            if (thumbnailFile) {
                const thumbnail = await uploadBlogImage(thumbnailFile, 'lead-magnet-thumbnails');
                thumbnailUrl = thumbnail.url;
            }

            const blockHtml = `
                <div
                    class="lead-magnet-block"
                    data-pdf-path="${escapeAttribute(pdf.path)}"
                    data-title="${escapeAttribute(title)}"
                    data-description="${escapeAttribute(description)}"
                    data-cta="${escapeAttribute(cta)}"
                    data-thumbnail-url="${escapeAttribute(thumbnailUrl)}"
                    data-file-name="${escapeAttribute(pdf.originalName)}"
                >
                    <p><strong>${escapeHtml(title)}</strong></p>
                    <p>${escapeHtml(description)}</p>
                    <p>${escapeHtml(cta)}</p>
                </div><p></p>
            `;

            insertBlock(blockHtml);
            toast.success('PDF lead magnet inserted');
            setIsLeadMagnetOpen(false);
            resetLeadMagnetModal();
        } catch (error) {
            console.error('PDF upload error:', error);
            toast.error('Failed to upload PDF: ' + error.message);
        } finally {
            setUploadingPdf(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validation = validateImage(file);
        if (!validation.valid) {
            toast.error(validation.errors.join(', '));
            return;
        }

        setUploadingImage(true);
        try {
            const result = await uploadBlogImage(file, 'blog-inline');
            const altText = window.prompt('Enter Image Alt Text (SEO)', file.name) || file.name;
            editor.chain().focus().setImage({ src: result.url, alt: altText }).run();
            toast.success('Image inserted');
        } catch (error) {
            console.error('Image upload error:', error);
            toast.error('Failed to upload image');
        } finally {
            setUploadingImage(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    if (!editor) return null;

    return (
        <>
        <div className="flex flex-col gap-2 p-2 border-b border-slate-300 bg-slate-50 rounded-t-lg">
            <div className="flex flex-wrap items-center gap-1">
                {/* Text Styles */}
                <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded ${editor.isActive('bold') ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-200'}`} title="Bold"><Bold className="w-4 h-4" /></button>
                <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded ${editor.isActive('italic') ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-200'}`} title="Italic"><Italic className="w-4 h-4" /></button>
                
                <div className="w-px h-6 bg-slate-300 mx-1"></div>

                {/* Alignment */}
                <div className="flex items-center gap-1">
                    <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`p-2 rounded ${editor.isActive({ textAlign: 'left' }) ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-200'}`} title="Align Left"><AlignLeft className="w-4 h-4" /></button>
                    <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`p-2 rounded ${editor.isActive({ textAlign: 'center' }) ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-200'}`} title="Align Center"><AlignCenter className="w-4 h-4" /></button>
                    <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`p-2 rounded ${editor.isActive({ textAlign: 'right' }) ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-200'}`} title="Align Right"><AlignRight className="w-4 h-4" /></button>
                    <button type="button" onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={`p-2 rounded ${editor.isActive({ textAlign: 'justify' }) ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-200'}`} title="Justify"><AlignJustify className="w-4 h-4" /></button>
                </div>

                <div className="w-px h-6 bg-slate-300 mx-1"></div>
                
                {/* Font Family Selector */}
                <div className="flex items-center gap-1 bg-white border border-slate-300 rounded px-2 h-9" title="Font Family">
                    <Type className="w-3.5 h-3.5 text-slate-400" />
                    <select 
                        onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
                        value={editor.getAttributes('textStyle').fontFamily || 'Inter'}
                        className="text-xs bg-transparent border-none focus:ring-0 cursor-pointer pr-6 min-w-[120px]"
                    >
                        {FONTS.map(font => (
                            <option key={font.value} value={font.value} disabled={font.disabled}>{font.label}</option>
                        ))}
                    </select>
                </div>

                {/* Font Size Selector */}
                <div className="flex items-center gap-1 bg-white border border-slate-300 rounded px-2 h-9" title="Font Size">
                    <span className="text-[10px] font-bold text-slate-400">AA</span>
                    <select 
                        onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}
                        value={editor.getAttributes('textStyle').fontSize || '16'}
                        className="text-xs bg-transparent border-none focus:ring-0 cursor-pointer pr-6 min-w-[60px]"
                    >
                        {FONT_SIZES.map(size => (
                            <option key={size.value} value={size.value}>{size.label}</option>
                        ))}
                    </select>
                </div>

                <div className="w-px h-6 bg-slate-300 mx-1"></div>

                {/* Drop Cap Toggle */}
                <button 
                  type="button" 
                  onClick={() => editor.chain().focus().toggleDropCap().run()} 
                  className={`px-2 py-1 flex items-center gap-1 rounded text-xs font-bold border transition-colors ${editor.isActive('dropCap') ? 'bg-navy-600 text-white border-navy-700' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
                  title="Drop Cap (Big starting letter)"
                >
                    <span className="text-lg leading-none">D</span>rop Cap
                </button>

                <div className="w-px h-6 bg-slate-300 mx-1"></div>

                <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-2 rounded font-bold ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-200'}`} title="Heading 2"><Heading2 className="w-4 h-4" /></button>
                <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`p-2 rounded font-bold ${editor.isActive('heading', { level: 3 }) ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-200'}`} title="Heading 3"><Heading3 className="w-4 h-4" /></button>
                
                <div className="w-px h-6 bg-slate-300 mx-1"></div>
                
                {/* Color Pickers */}
                <div className="flex items-center gap-1 group" title="Text Color">
                    <button type="button" onClick={() => editor.chain().focus().unsetColor().run()} className={`p-2 rounded ${editor.isActive('textStyle') ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-200'}`} title="Remove Text Color"><Baseline className="w-4 h-4" /></button>
                    <input type="color" onInput={(e) => editor.chain().setColor(e.target.value).run()} value={editor.getAttributes('textStyle').color || '#000000'} className="w-6 h-6 p-0 border-0 bg-transparent rounded cursor-pointer self-center" />
                </div>
                
                <div className="flex items-center gap-1 group" title="Box Background Color">
                    <button type="button" onClick={() => {
                        if (editor.isActive('globalWrapperDiv')) {
                             editor.chain().focus().updateAttributes('globalWrapperDiv', { style: null }).run();
                        }
                    }} className="p-2 rounded text-slate-600 hover:bg-slate-200"><PaintBucket className="w-4 h-4" /></button>
                    <input type="color" onInput={(e) => {
                        if (editor.isActive('globalWrapperDiv')) {
                            const color = e.target.value;
                            const currentStyle = editor.getAttributes('globalWrapperDiv').style || '';
                            let newStyle = currentStyle.replace(/background-color:[^;]+;?/i, '');
                            newStyle += ` background-color: ${color} !important;`;
                            editor.chain().focus().updateAttributes('globalWrapperDiv', { style: newStyle.trim() }).run();
                        } else {
                            toast.error("Click inside a box component first!");
                        }
                    }} value={(editor.isActive('globalWrapperDiv') && editor.getAttributes('globalWrapperDiv').style?.match(/background-color:\s*([^; !]+)/i)?.[1]) || '#f8fafc'} className="w-6 h-6 p-0 border-0 bg-transparent rounded cursor-pointer self-center" />
                </div>

                <div className="w-px h-6 bg-slate-300 mx-1"></div>
                
                <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 rounded ${editor.isActive('bulletList') ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-200'}`} title="Bullet List"><List className="w-4 h-4" /></button>
                <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-2 rounded ${editor.isActive('orderedList') ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-200'}`} title="Numbered List"><ListOrdered className="w-4 h-4" /></button>
                <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`p-2 rounded ${editor.isActive('blockquote') ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-200'}`} title="Quote"><Quote className="w-4 h-4" /></button>
                
                <div className="w-px h-6 bg-slate-300 mx-1"></div>

                {/* Table */}
                <button type="button" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} className={`p-2 rounded ${editor.isActive('table') ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-200'}`} title="Insert Table">
                    <TableIcon className="w-4 h-4" />
                </button>

                <div className="w-px h-6 bg-slate-300 mx-1"></div>
                
                <button type="button" onClick={setLink} className={`p-2 rounded ${editor.isActive('link') ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-200'}`} title="Add Link"><LinkIcon className="w-4 h-4" /></button>
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingImage} className="p-2 rounded text-slate-600 hover:bg-slate-200 disabled:opacity-50 flex items-center" title="Insert Image">
                    {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                </button>
                <button type="button" onClick={setAltTag} className={`p-2 rounded ${editor.isActive('image') ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-200'}`} title="Set Image Alt Tag">
                    <span className="text-[10px] font-bold">ALT</span>
                </button>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml" className="hidden" />

                <button
                    type="button"
                    onClick={openLeadMagnetModal}
                    disabled={uploadingPdf}
                    className="px-2 py-1.5 rounded text-xs font-semibold border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-50 flex items-center gap-1"
                    title="Upload PDF lead magnet"
                >
                    {uploadingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4" />}
                    PDF
                </button>
                
                <div className="flex-1"></div>
                
                <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="p-2 rounded text-slate-600 hover:bg-slate-200 disabled:opacity-50"><Undo className="w-4 h-4" /></button>
                <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="p-2 rounded text-slate-600 hover:bg-slate-200 disabled:opacity-50"><Redo className="w-4 h-4" /></button>
            </div>
            
            {/* Custom UI Blocks Toolbar */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-300">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 mr-2">Components:</span>
                <button type="button" onClick={() => insertBlock(TEMPLATES.STAT_STRIP)} className="px-2 py-1 text-xs bg-red-50 text-[#B91C3C] border border-red-200 rounded hover:bg-red-100 flex items-center gap-1">
                    <LayoutGrid className="w-3 h-3" /> Stat Strip
                </button>
                <button type="button" onClick={() => insertBlock(TEMPLATES.FAQ_SECTION)} className="px-2 py-1 text-xs bg-red-50 text-[#B91C3C] border border-red-200 rounded hover:bg-red-100 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> FAQ Block
                </button>
                <button type="button" onClick={() => insertBlock(TEMPLATES.HIGHLIGHT_BOX)} className="px-2 py-1 text-xs bg-red-50 text-[#B91C3C] border border-red-200 rounded hover:bg-red-100 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Highlight Box
                </button>
                <button type="button" onClick={() => insertBlock(TEMPLATES.DENIAL_GRID)} className="px-2 py-1 text-xs bg-red-50 text-[#B91C3C] border border-red-200 rounded hover:bg-red-100 flex items-center gap-1">
                    <LayoutGrid className="w-3 h-3" /> Denial Card
                </button>
                <button type="button" onClick={() => insertBlock(TEMPLATES.DEFINITION_BLOCK)} className="px-2 py-1 text-xs bg-red-50 text-[#B91C3C] border border-red-200 rounded hover:bg-red-100 flex items-center gap-1">
                    <Info className="w-3 h-3" /> Definition Block
                </button>
                <button type="button" onClick={() => insertBlock(TEMPLATES.TOC_BLOCK)} className="px-2 py-1 text-xs bg-red-50 text-[#B91C3C] border border-red-200 rounded hover:bg-red-100 flex items-center gap-1">
                    <ListOrdered className="w-3 h-3" /> TOC
                </button>
                <button type="button" onClick={() => insertBlock(TEMPLATES.ALERT_BOX)} className="px-2 py-1 text-xs bg-red-50 text-[#B91C3C] border border-red-200 rounded hover:bg-red-100 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Alert Box
                </button>
                <button type="button" onClick={() => insertBlock(TEMPLATES.CUSTOM_BOX)} className="px-2 py-1 text-xs bg-red-50 text-[#B91C3C] border border-red-200 rounded hover:bg-red-100 flex items-center gap-1">
                    <LayoutGrid className="w-3 h-3" /> Custom Box
                </button>
                <button type="button" onClick={() => insertBlock(TEMPLATES.RATING_BOX)} className="px-2 py-1 text-xs bg-red-50 text-[#B91C3C] border border-red-200 rounded hover:bg-red-100 flex items-center gap-1" title="Disability Rating Box">
                    <Percent className="w-3 h-3" /> Rating Box
                </button>
            </div>
        </div>

        {isLeadMagnetOpen && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 p-4">
                <div className="w-full max-w-2xl rounded-lg bg-white shadow-2xl border border-slate-200 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Upload PDF Lead Magnet</h3>
                            <p className="text-sm text-slate-500">Create a gated download block inside this post.</p>
                        </div>
                        <button
                            type="button"
                            onClick={closeLeadMagnetModal}
                            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded"
                            aria-label="Close PDF upload modal"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-5 space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                PDF File *
                            </label>
                            <label className="flex items-center justify-between gap-3 rounded-lg border-2 border-dashed border-slate-300 px-4 py-4 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/40 transition-colors">
                                <div className="flex items-center gap-3 min-w-0">
                                    <Upload className="w-5 h-5 text-slate-400 flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 truncate">
                                            {pdfFile ? pdfFile.name : 'Choose a PDF template'}
                                        </p>
                                        <p className="text-xs text-slate-500">PDF up to 25MB</p>
                                    </div>
                                </div>
                                <span className="text-xs font-semibold text-indigo-700">Browse</span>
                                <input
                                    type="file"
                                    accept="application/pdf,.pdf"
                                    onChange={handlePdfSelect}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    value={leadMagnetDraft.title}
                                    onChange={(e) => setLeadMagnetDraft({ ...leadMagnetDraft, title: e.target.value })}
                                    placeholder="VA Claim Checklist Template"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    CTA Text *
                                </label>
                                <input
                                    type="text"
                                    value={leadMagnetDraft.cta}
                                    onChange={(e) => setLeadMagnetDraft({ ...leadMagnetDraft, cta: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Description *
                            </label>
                            <textarea
                                value={leadMagnetDraft.description}
                                onChange={(e) => setLeadMagnetDraft({ ...leadMagnetDraft, description: e.target.value })}
                                rows="3"
                                placeholder="A free template veterans can use to organize evidence before filing."
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Thumbnail Image
                                </label>
                                <button
                                    type="button"
                                    onClick={() => thumbnailInputRef.current?.click()}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg text-left hover:bg-slate-50 flex items-center gap-3"
                                >
                                    <ImageIcon className="w-5 h-5 text-slate-400" />
                                    <span className="text-sm text-slate-700 truncate">
                                        {thumbnailFile ? thumbnailFile.name : 'Upload optional preview image'}
                                    </span>
                                </button>
                                <input
                                    ref={thumbnailInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                                    onChange={handleThumbnailSelect}
                                    className="hidden"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Or Thumbnail URL
                                </label>
                                <input
                                    type="url"
                                    value={leadMagnetDraft.thumbnailUrl}
                                    onChange={(e) => setLeadMagnetDraft({ ...leadMagnetDraft, thumbnailUrl: e.target.value })}
                                    placeholder="https://..."
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        {thumbnailPreview && (
                            <div className="rounded-lg border border-slate-200 overflow-hidden bg-slate-50">
                                <img
                                    src={thumbnailPreview}
                                    alt="Lead magnet thumbnail preview"
                                    className="w-full h-36 object-cover"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-200 bg-slate-50">
                        <button
                            type="button"
                            onClick={closeLeadMagnetModal}
                            disabled={uploadingPdf}
                            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-white disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={insertLeadMagnetBlock}
                            disabled={uploadingPdf}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {uploadingPdf && <Loader2 className="w-4 h-4 animate-spin" />}
                            <span>{uploadingPdf ? 'Uploading...' : 'Insert PDF Block'}</span>
                        </button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
};

const RichTextEditor = ({ value, onChange }) => {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            TextStyle,
            FontFamily,
            FontSize,
            DropCap,
            Color,
            Link.configure({
                openOnClick: false,
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-xl shadow-lg w-full object-cover my-8',
                },
            }),
            Table.configure({
                resizable: false,
                HTMLAttributes: {
                    class: 'tiptap-table',
                },
            }),
            TableRow,
            TableCell,
            CustomTableHeader,
            GlobalWrapperDiv,
            GlobalInlineSpan,
        ],
        content: value,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onChange(html);
        },
        editorProps: {
            attributes: {
                class: 'prose prose-slate max-w-none px-12 py-10 min-h-[400px] focus:outline-none',
            },
        },
    });

    // Support async loading of content - Tiptap doesn't do this by default
    useEffect(() => {
        if (editor && value !== undefined && value !== editor.getHTML()) {
            // Only update if the user isn't actively typing to prevent cursor resets
            // OR if the editor is currently empty (initial load case)
            if (!editor.isFocused || (editor.isEmpty && value)) {
                // Set content without triggering another update loop
                editor.commands.setContent(value, false);
            }
        }
    }, [value, editor]);

    return (
        <div className="w-full border border-slate-300 rounded-lg overflow-hidden bg-white">
            <MenuBar editor={editor} />
            <div className="tiptap-wrapper" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                <EditorContent editor={editor} />
                {editor && <TableBubbleMenu editor={editor} />}
            </div>
            
            {/* Minimal styling overrides purely for the admin panel editor view so block elements look acceptable */}
            <style jsx global>{`
                .tiptap-wrapper .ProseMirror p.is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: #adb5bd;
                    pointer-events: none;
                    height: 0;
                }
                
                /* Render basic UI boundaries inside the editor so the user can see what they are typing in */
                .highlight-box {
                    margin: 2.5rem 0;
                    padding: 3rem;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 1.5rem;
                    background: #1e3a5f;
                    color: #fff;
                    display: block;
                    box-shadow: 
                      0 25px 50px -12px rgba(15, 23, 42, 0.15),
                      0 10px 20px -10px rgba(0, 0, 0, 0.1);
                }

                .tiptap-wrapper .ProseMirror .stat-strip,
                .tiptap-wrapper .ProseMirror .faq-section,
                .tiptap-wrapper .ProseMirror .hook-block,
                .tiptap-wrapper .ProseMirror .denial-grid,
                .tiptap-wrapper .ProseMirror .definition-block,
                .tiptap-wrapper .ProseMirror .alert-box,
                .tiptap-wrapper .ProseMirror .toc-block,
                .tiptap-wrapper .ProseMirror .lead-magnet-block {
                    margin: 1.5rem 0;
                    padding: 1.5rem;
                    border: 2px dashed #cbd5e1;
                    border-radius: 0.5rem;
                    background: #f8fafc;
                    display: block;
                }

                .tiptap-wrapper .ProseMirror .custom-box {
                    margin: 1.5rem 0;
                    padding: 2rem;
                    border: 1px solid #EAE5DA;
                    border-radius: 1rem;
                    background: #FAF6F0;
                    display: flex !important;
                    flex-direction: column !important;
                    justify-content: center !important;
                    aspect-ratio: 1 / 1 !important;
                    box-sizing: border-box !important;
                    max-width: 350px;
                }
                .tiptap-wrapper .ProseMirror .custom-box h3 {
                    color: #29435f !important;
                    font-family: 'Inter', sans-serif !important;
                    font-size: 1.125rem !important;
                    font-weight: 700 !important;
                    margin-top: 0 !important;
                    margin-bottom: 0.75rem !important;
                }
                .tiptap-wrapper .ProseMirror .custom-box p {
                    color: #475569 !important;
                    font-size: 0.9375rem !important;
                    line-height: 1.625 !important;
                    margin-bottom: 0 !important;
                }

                /* Editor-specific typography for custom blocks */
                .tiptap-wrapper .ProseMirror .highlight-box p,
                .tiptap-wrapper .ProseMirror .definition-block p,
                .tiptap-wrapper .ProseMirror .alert-box p {
                    margin-bottom: 1rem;
                }

                /* Fix bold text line-break in editor */
                .tiptap-wrapper .ProseMirror .alert-box strong,
                .tiptap-wrapper .ProseMirror .note strong {
                    display: inline !important;
                }
                
                .tiptap-wrapper .ProseMirror .alert-box > p:first-child > strong:only-child,
                .tiptap-wrapper .ProseMirror .note > p:first-child > strong:only-child {
                    display: block !important;
                    margin-bottom: 0.5rem;
                }
                
                .tiptap-wrapper .ProseMirror .highlight-box ul,
                .tiptap-wrapper .ProseMirror .definition-block ul,
                .tiptap-wrapper .ProseMirror .alert-box ul,
                .tiptap-wrapper .ProseMirror .highlight-box ol,
                .tiptap-wrapper .ProseMirror .definition-block ol,
                .tiptap-wrapper .ProseMirror .alert-box ol {
                    padding-left: 1.5rem;
                    margin-bottom: 1rem;
                }

                .tiptap-wrapper .ProseMirror .highlight-box ul,
                .tiptap-wrapper .ProseMirror .definition-block ul,
                .tiptap-wrapper .ProseMirror .alert-box ul {
                    list-style-type: disc;
                }

                .tiptap-wrapper .ProseMirror .highlight-box ol,
                .tiptap-wrapper .ProseMirror .definition-block ol,
                .tiptap-wrapper .ProseMirror .alert-box ol {
                    list-style-type: decimal;
                }
                
                /* Ensure img in tiptap can be resized naturally */
                .tiptap-wrapper .ProseMirror img {
                    max-width: 100%;
                    height: auto;
                }
                
                /* Custom Font Rendering in Editor */
                .tiptap-wrapper .ProseMirror {
                    font-family: 'Inter', sans-serif;
                }

                /* Drop Cap Styling in Editor */
                .tiptap-wrapper .ProseMirror .drop-cap {
                  float: left;
                  font-size: 4.8rem;
                  line-height: 0.8;
                  margin-right: 14px;
                  margin-top: 10px;
                  font-weight: 700;
                  font-family: 'Playfair Display', serif;
                  display: inline-block;
                }

                /* Table Styling in Editor */
                .tiptap-wrapper .ProseMirror .tiptap-table {
                    border-collapse: collapse;
                    width: 100%;
                    margin: 1.5rem 0;
                    table-layout: fixed;
                    overflow: hidden;
                }

                .tiptap-wrapper .ProseMirror .tiptap-table td,
                .tiptap-wrapper .ProseMirror .tiptap-table th {
                    border: 1px solid #e2e8f0;
                    padding: 0.625rem 0.75rem;
                    vertical-align: top;
                    position: relative;
                    min-width: 80px;
                }

                .tiptap-wrapper .ProseMirror .tiptap-table th {
                    background-color: #1e3a5f;
                    color: #ffffff;
                    font-weight: 600;
                    font-size: 0.875rem;
                    text-align: left;
                }

                .tiptap-wrapper .ProseMirror .tiptap-table td {
                    font-size: 0.875rem;
                    color: #334155;
                }

                .tiptap-wrapper .ProseMirror .tiptap-table tr:nth-child(even) td {
                    background-color: #f8fafc;
                }

                .tiptap-wrapper .ProseMirror .tiptap-table td.selectedCell,
                .tiptap-wrapper .ProseMirror .tiptap-table th.selectedCell {
                    background-color: #dbeafe;
                    outline: 2px solid #3b82f6;
                    outline-offset: -2px;
                }

                /* Rating Box Styling in Editor */
                .tiptap-wrapper .ProseMirror .rating-box {
                    margin: 1.5rem 0;
                    padding: 1.75rem;
                    border: 1px solid #e2e8f0;
                    border-radius: 0.75rem;
                    background: #ffffff;
                    display: grid !important;
                    grid-template-columns: auto 1fr !important;
                    column-gap: 1.25rem !important;
                    row-gap: 0.75rem !important;
                    align-items: start !important;
                    box-shadow: 
                      0 4px 6px -1px rgba(0, 0, 0, 0.05),
                      0 2px 4px -1px rgba(0, 0, 0, 0.025);
                }

                .tiptap-wrapper .ProseMirror .rating-box > *:not(.rating-badge) {
                    grid-column: 2 !important;
                }

                .tiptap-wrapper .ProseMirror .rating-badge {
                    grid-column: 1 !important;
                    grid-row: 1 / span 2 !important;
                    display: flex !important;
                    flex-direction: column !important;
                    align-items: center !important;
                    justify-content: center !important;
                    background: #1e3a5f !important;
                    color: #ffffff !important;
                    border-radius: 0.5rem;
                    width: 96px !important;
                    height: 56px !important;
                    text-align: center !important;
                }

                .tiptap-wrapper .ProseMirror .rating-badge p {
                    display: flex !important;
                    flex-direction: column !important;
                    align-items: center !important;
                    justify-content: center !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    line-height: 1.1 !important;
                    background: transparent !important;
                }

                .tiptap-wrapper .ProseMirror .rating-value {
                    font-family: 'Inter', sans-serif !important;
                    font-size: 1.5rem !important;
                    font-weight: 800 !important;
                    line-height: 1 !important;
                    display: block !important;
                }

                .tiptap-wrapper .ProseMirror .rating-label {
                    font-family: 'DM Mono', monospace !important;
                    font-size: 8px !important;
                    font-weight: 700 !important;
                    letter-spacing: 0.1em !important;
                    margin-top: 1px !important;
                    text-transform: uppercase !important;
                    display: block !important;
                }

                .tiptap-wrapper .ProseMirror .rating-content {
                    width: 100% !important;
                }

                .tiptap-wrapper .ProseMirror .rating-content p {
                    font-size: 0.95rem !important;
                    color: #334155 !important;
                    line-height: 1.65 !important;
                    margin-top: 0 !important;
                    margin-bottom: 12px !important;
                }

                .tiptap-wrapper .ProseMirror .rating-content p:last-child {
                    margin-bottom: 0 !important;
                }

                .tiptap-wrapper .ProseMirror .tiptap-table p {
                    margin: 0;
                }
            `}</style>
        </div>
    );
};

export default RichTextEditor;
