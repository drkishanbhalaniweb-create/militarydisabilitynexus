import { BubbleMenu } from '@tiptap/react/menus';
import { useState, useCallback, useRef, useEffect } from 'react';
import {
    Plus,
    Minus,
    Trash2,
    ArrowUp,
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    Paintbrush,
} from 'lucide-react';

const TableBubbleMenu = ({ editor }) => {
    const [showColorPicker, setShowColorPicker] = useState(false);
    const colorPickerRef = useRef(null);

    // Close color picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (colorPickerRef.current && !colorPickerRef.current.contains(e.target)) {
                setShowColorPicker(false);
            }
        };
        if (showColorPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showColorPicker]);

    const applyHeaderColor = useCallback((color) => {
        if (!editor) return;
        // Apply background color to all header cells in the table
        const { state, view } = editor;
        const { tr } = state;
        let modified = false;

        state.doc.descendants((node, pos) => {
            if (node.type.name === 'tableHeader') {
                tr.setNodeMarkup(pos, undefined, {
                    ...node.attrs,
                    style: `background-color: ${color};`,
                });
                modified = true;
            }
        });

        if (modified) {
            view.dispatch(tr);
        }
        setShowColorPicker(false);
    }, [editor]);

    if (!editor) return null;

    const btnBase = 'flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap';
    const btnDefault = `${btnBase} text-slate-600 hover:bg-slate-100 hover:text-slate-900`;
    const btnDanger = `${btnBase} text-red-600 hover:bg-red-50 hover:text-red-700`;

    const HEADER_PRESETS = [
        { color: '#1e3a5f', label: 'Navy' },
        { color: '#0f172a', label: 'Dark' },
        { color: '#334155', label: 'Slate' },
        { color: '#7f1d1d', label: 'Crimson' },
        { color: '#1e40af', label: 'Blue' },
        { color: '#166534', label: 'Green' },
        { color: '#f8fafc', label: 'Light' },
    ];

    return (
        <BubbleMenu
            editor={editor}
            pluginKey="tableBubbleMenu"
            shouldShow={({ editor }) => {
                return editor.isActive('table');
            }}
            options={{
                placement: 'top',
            }}
        >
            <div className="flex items-center gap-0.5 bg-white border border-slate-200 rounded-lg shadow-lg p-1">
                {/* Row Operations */}
                <button
                    type="button"
                    onClick={() => editor.chain().focus().addRowBefore().run()}
                    className={btnDefault}
                    title="Add Row Above"
                >
                    <ArrowUp className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Row</span>
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().addRowAfter().run()}
                    className={btnDefault}
                    title="Add Row Below"
                >
                    <ArrowDown className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Row</span>
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().deleteRow().run()}
                    className={btnDanger}
                    title="Delete Row"
                >
                    <Minus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Row</span>
                </button>

                <div className="w-px h-5 bg-slate-200 mx-0.5"></div>

                {/* Column Operations */}
                <button
                    type="button"
                    onClick={() => editor.chain().focus().addColumnBefore().run()}
                    className={btnDefault}
                    title="Add Column Left"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Col</span>
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().addColumnAfter().run()}
                    className={btnDefault}
                    title="Add Column Right"
                >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Col</span>
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().deleteColumn().run()}
                    className={btnDanger}
                    title="Delete Column"
                >
                    <Minus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Col</span>
                </button>

                <div className="w-px h-5 bg-slate-200 mx-0.5"></div>

                {/* Header Color */}
                <div className="relative" ref={colorPickerRef}>
                    <button
                        type="button"
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className={`${btnDefault} ${showColorPicker ? 'bg-slate-100' : ''}`}
                        title="Header Color"
                    >
                        <Paintbrush className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Header</span>
                    </button>
                    {showColorPicker && (
                        <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl p-2 z-50 min-w-[160px]">
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">Presets</p>
                            <div className="flex flex-wrap gap-1.5 mb-2">
                                {HEADER_PRESETS.map((preset) => (
                                    <button
                                        key={preset.color}
                                        type="button"
                                        onClick={() => applyHeaderColor(preset.color)}
                                        className="w-6 h-6 rounded-md border border-slate-300 hover:scale-110 transition-transform cursor-pointer"
                                        style={{ backgroundColor: preset.color }}
                                        title={preset.label}
                                    />
                                ))}
                            </div>
                            <div className="border-t border-slate-100 pt-2 flex items-center gap-2">
                                <label className="text-[10px] font-medium text-slate-500">Custom:</label>
                                <input
                                    type="color"
                                    defaultValue="#1e3a5f"
                                    onChange={(e) => applyHeaderColor(e.target.value)}
                                    className="w-6 h-6 p-0 border-0 bg-transparent rounded cursor-pointer"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="w-px h-5 bg-slate-200 mx-0.5"></div>

                {/* Delete Table */}
                <button
                    type="button"
                    onClick={() => editor.chain().focus().deleteTable().run()}
                    className={btnDanger}
                    title="Delete Table"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </BubbleMenu>
    );
};

export default TableBubbleMenu;
