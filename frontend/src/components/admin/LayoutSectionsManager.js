import { useState } from 'react';
import { ArrowUp, ArrowDown, Eye, EyeOff, Edit2, Trash2, Plus, Settings, ChevronDown, ChevronUp, CheckCircle2, Circle, RotateCcw } from 'lucide-react';
import dynamic from 'next/dynamic';
import {
    getLayoutSectionsShapeError,
    isLayoutSectionVisible,
    moveLayoutSection,
    toggleLayoutSectionVisibility,
} from '../../lib/layoutSections';

const RichTextEditor = dynamic(() => import('./RichTextEditor'), { ssr: false });

const LayoutSectionsManager = ({
    sections,
    onSectionsChange,
    sectionEditors = {},
    contentIndicators = {},
    onAddCustomSection,
    onRemoveCustomSection,
    onUpdateCustomSection,
    onResetSections,
    sectionAliases = {},
}) => {
    const [expandedSectionId, setExpandedSectionId] = useState(null);

    if (sections == null) {
        return null;
    }

    const layoutShapeError = getLayoutSectionsShapeError(sections, { aliases: sectionAliases });
    if (layoutShapeError) {
        return (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-6 text-red-900">
                <h2 className="text-lg font-semibold">This saved page layout needs repair</h2>
                <p className="mt-2 text-sm">
                    {layoutShapeError} Editing is disabled so malformed layout data cannot be removed accidentally.
                </p>
                {onResetSections && (
                    <button
                        type="button"
                        onClick={onResetSections}
                        className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-2 text-xs font-semibold text-red-800 transition-colors hover:bg-red-100"
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Reset after reviewing the warning
                    </button>
                )}
            </div>
        );
    }

    const moveSection = (index, direction) => {
        const newSections = moveLayoutSection(sections, index, direction);
        if (newSections !== sections) onSectionsChange?.(newSections);
    };

    const toggleSectionVisibility = (index) => {
        const newSections = toggleLayoutSectionVisibility(sections, index);
        if (newSections !== sections) onSectionsChange?.(newSections);
    };

    const toggleExpand = (id) => {
        setExpandedSectionId(expandedSectionId === id ? null : id);
    };

    const addCustomSection = () => {
        const newSectionId = onAddCustomSection?.();
        if (newSectionId) {
            setExpandedSectionId(newSectionId);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4 mb-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex-1">
                    <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-indigo-600" />
                        Page Layout &amp; Sections
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                        Control the layout order of sections and insert custom rich text blocks anywhere. Click an editable section to change its content inline.
                    </p>
                </div>
                {onResetSections && (
                    <button
                        type="button"
                        onClick={onResetSections}
                        className="ml-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Reset to Default
                    </button>
                )}
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center bg-indigo-50/50 border border-indigo-100 rounded-lg p-3 text-xs text-indigo-900">
                    <span>Tip: rearrange any section below. Changes affect the public page after you save and the page cache refreshes.</span>
                    <button
                        type="button"
                        onClick={addCustomSection}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded flex items-center gap-1 transition-colors"
                    >
                        <Plus className="w-3 h-3" /> Add Text Box
                    </button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                    {sections.map((sec, idx) => {
                        const isExpanded = expandedSectionId === sec.id;
                        const hasContent = contentIndicators[sec.id];
                        const isCustom = sec.type === 'custom_rich_text';
                        const EditorComponent = sectionEditors[sec.id];
                        const canExpand = isCustom || Boolean(EditorComponent);
                        const isVisible = isLayoutSectionVisible(sec);

                        return (
                            <div key={sec.id} className={`transition-colors ${isExpanded ? 'bg-slate-50' : 'bg-white'}`}>
                                <div className="p-4 flex items-center justify-between gap-4">
                                    <button
                                        type="button"
                                        disabled={!canExpand}
                                        aria-expanded={canExpand ? isExpanded : undefined}
                                        className={`flex items-center gap-3 flex-1 text-left ${canExpand ? 'cursor-pointer group' : 'cursor-default'}`}
                                        onClick={() => toggleExpand(sec.id)}
                                    >
                                        <span className="text-xs font-mono text-slate-400 w-5 text-right">{idx + 1}.</span>

                                        {!isCustom && (
                                            <div title={hasContent ? "Content exists" : "Needs content"}>
                                                {hasContent ? (
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                ) : (
                                                    <Circle className="w-4 h-4 text-slate-300" />
                                                )}
                                            </div>
                                        )}

                                        <div className="flex-1">
                                            <div className="font-semibold text-slate-800 text-sm flex items-center gap-2 group-hover:text-indigo-600 transition-colors">
                                                {isCustom ? (
                                                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded">Custom Box</span>
                                                ) : (
                                                    <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-1.5 py-0.5 rounded">Standard</span>
                                                )}
                                                {sec.name}
                                            </div>
                                            {isCustom && sec.title && (
                                                <div className="text-xs text-slate-500 mt-0.5">Heading: {sec.title}</div>
                                            )}
                                        </div>

                                        {canExpand && (
                                            <div className="text-slate-400 group-hover:text-indigo-600 px-4">
                                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                            </div>
                                        )}
                                    </button>

                                    <div className="flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            disabled={idx === 0}
                                            onClick={(e) => { e.stopPropagation(); moveSection(idx, 'up'); }}
                                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 rounded transition-colors"
                                            title="Move Up"
                                        >
                                            <ArrowUp className="w-4 h-4" />
                                        </button>
                                        <button
                                            type="button"
                                            disabled={idx === sections.length - 1}
                                            onClick={(e) => { e.stopPropagation(); moveSection(idx, 'down'); }}
                                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 rounded transition-colors"
                                            title="Move Down"
                                        >
                                            <ArrowDown className="w-4 h-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); toggleSectionVisibility(idx); }}
                                            className={`p-1 rounded transition-colors ${isVisible ? 'text-indigo-600 hover:bg-indigo-50' : 'text-slate-400 hover:bg-slate-100'}`}
                                            title={isVisible ? 'Visible' : 'Hidden'}
                                            aria-label={isVisible ? `Hide ${sec.name}` : `Show ${sec.name}`}
                                        >
                                            {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                        </button>

                                        {isCustom && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); toggleExpand(sec.id); }}
                                                    className={`p-1.5 rounded transition-colors ${isExpanded ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
                                                    title="Edit Content"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); onRemoveCustomSection?.(sec.id); }}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    title="Delete Box"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {isExpanded && canExpand && (
                                    <div className="px-6 pb-6 pt-2 border-t border-slate-200/60">
                                        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-inner">
                                            {isCustom && (
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Section Heading (Optional)</label>
                                                        <input
                                                            type="text"
                                                            value={sec.title || ''}
                                                            onChange={(e) => onUpdateCustomSection?.(sec.id, 'title', e.target.value)}
                                                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none"
                                                            placeholder="e.g. Important Information"
                                                        />
                                                    </div>
                                                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                                                        <RichTextEditor
                                                            value={sec.content_html || ''}
                                                            onChange={(html) => onUpdateCustomSection?.(sec.id, 'content_html', html)}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {!isCustom && EditorComponent && (
                                                <div className="standard-section-editor">
                                                    {!hasContent && (
                                                        <div className="mb-4 bg-amber-50 text-amber-800 text-sm p-3 rounded-lg border border-amber-200 font-medium">
                                                            This section currently has no content. Set it up below to display it on the page.
                                                        </div>
                                                    )}
                                                    {EditorComponent()}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-center pt-2">
                    <button
                        type="button"
                        onClick={addCustomSection}
                        className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 border-dashed rounded-lg py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Add Custom Text Box
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LayoutSectionsManager;
