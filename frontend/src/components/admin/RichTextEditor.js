import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Bold, Italic, List, ListOrdered, Quote, Heading2, Heading3, Link as LinkIcon, Undo, Redo, LayoutGrid, AlertCircle, Info, MessageSquare, ImageIcon, Loader2, Baseline } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { uploadBlogImage, validateImage } from '../../lib/imageUpload';
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
    CHECKLIST: `<ul class="checklist"><li>I have a current, formal diagnosis.</li><li>I can clearly identify my in-service stressor.</li></ul><p></p>`
};

const MenuBar = ({ editor }) => {
    const fileInputRef = useRef(null);
    const [uploadingImage, setUploadingImage] = useState(false);

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

    const insertBlock = (htmlString) => {
        editor.chain().focus().insertContent(htmlString).run();
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
            editor.chain().focus().setImage({ src: result.url, alt: file.name }).run();
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
        <div className="flex flex-col gap-2 p-2 border-b border-slate-300 bg-slate-50 rounded-t-lg">
            <div className="flex flex-wrap items-center gap-1">
                <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded ${editor.isActive('bold') ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-200'}`} title="Bold"><Bold className="w-4 h-4" /></button>
                <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded ${editor.isActive('italic') ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-200'}`} title="Italic"><Italic className="w-4 h-4" /></button>
                <div className="w-px h-6 bg-slate-300 mx-1"></div>
                <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-2 rounded font-bold ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-200'}`} title="Heading 2"><Heading2 className="w-4 h-4" /></button>
                <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`p-2 rounded font-bold ${editor.isActive('heading', { level: 3 }) ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-200'}`} title="Heading 3"><Heading3 className="w-4 h-4" /></button>
                <div className="w-px h-6 bg-slate-300 mx-1"></div>
                <div className="flex items-center gap-1 group">
                    <button type="button" onClick={() => editor.chain().focus().unsetColor().run()} className={`p-2 rounded ${editor.isActive('textStyle') ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-200'}`} title="Remove Text Color"><Baseline className="w-4 h-4" /></button>
                    <input type="color" onInput={(e) => editor.chain().setColor(e.target.value).run()} value={editor.getAttributes('textStyle').color || '#cca35e'} className="w-6 h-6 p-0 border-0 bg-transparent rounded cursor-pointer self-center" title="Custom Text Color" />
                </div>
                <div className="w-px h-6 bg-slate-300 mx-1"></div>
                <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 rounded ${editor.isActive('bulletList') ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-200'}`} title="Bullet List"><List className="w-4 h-4" /></button>
                <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-2 rounded ${editor.isActive('orderedList') ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-200'}`} title="Numbered List"><ListOrdered className="w-4 h-4" /></button>
                <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`p-2 rounded ${editor.isActive('blockquote') ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-200'}`} title="Quote"><Quote className="w-4 h-4" /></button>
                <div className="w-px h-6 bg-slate-300 mx-1"></div>
                <div className="w-px h-6 bg-slate-300 mx-1"></div>
                <button type="button" onClick={setLink} className={`p-2 rounded ${editor.isActive('link') ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-200'}`} title="Add Link"><LinkIcon className="w-4 h-4" /></button>
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingImage} className="p-2 rounded text-slate-600 hover:bg-slate-200 disabled:opacity-50 flex items-center" title="Insert Image">
                    {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                </button>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" />
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
            </div>
        </div>
    );
};

const RichTextEditor = ({ value, onChange }) => {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            TextStyle,
            Color,
            Link.configure({
                openOnClick: false,
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-xl shadow-lg w-full object-cover my-8',
                },
            }),
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
                class: 'prose prose-slate max-w-none p-4 min-h-[400px] focus:outline-none',
            },
        },
    });

    return (
        <div className="w-full border border-slate-300 rounded-lg overflow-hidden bg-white">
            <MenuBar editor={editor} />
            <div className="tiptap-wrapper" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                <EditorContent editor={editor} />
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
                .tiptap-wrapper .ProseMirror .stat-strip,
                .tiptap-wrapper .ProseMirror .faq-section,
                .tiptap-wrapper .ProseMirror .highlight-box,
                .tiptap-wrapper .ProseMirror .hook-block,
                .tiptap-wrapper .ProseMirror .denial-grid,
                .tiptap-wrapper .ProseMirror .definition-block {
                    margin: 1.5rem 0;
                    padding: 1.5rem;
                    border: 2px dashed #cbd5e1;
                    border-radius: 0.5rem;
                    background: #f8fafc;
                    display: block;
                }
                
                /* Ensure img in tiptap can be resized naturally */
                .tiptap-wrapper .ProseMirror img {
                    max-width: 100%;
                    height: auto;
                }
            `}</style>
        </div>
    );
};

export default RichTextEditor;
