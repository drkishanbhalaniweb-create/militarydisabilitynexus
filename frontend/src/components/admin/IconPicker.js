import { useState, useEffect } from 'react';
import DynamicIcon from '../ui/dynamic-icon';
import { HelpCircle } from 'lucide-react';

const STANDARD_ICONS = [
    { name: 'Brain', desc: 'Neurology & Brain' },
    { name: 'HeartPulse', desc: 'Mental Health & PTSD' },
    { name: 'Activity', desc: 'Gastrointestinal & Nephrology' },
    { name: 'Wind', desc: 'Respiratory / Lungs' },
    { name: 'Bone', desc: 'Musculoskeletal & Spine' },
    { name: 'Sparkles', desc: 'Dermatology & Skin' },
    { name: 'Ear', desc: 'Audiology & Tinnitus' },
    { name: 'Ribbon', desc: 'Oncology & Cancer' },
    { name: 'Venus', desc: 'OB-GYN & Female' },
    { name: 'Mars', desc: 'Male Reproductive' },
    { name: 'Zap', desc: 'Nerve & Migraines' },
    { name: 'Moon', desc: 'Sleep & Night' },
    { name: 'Flame', desc: 'GERD & Burning' },
    { name: 'Pill', desc: 'IBS & Medication' },
    { name: 'FileText', desc: 'Guides & Documents' }
];

export default function IconPicker({
    label = 'Select Icon',
    value = '',
    onChange,
    required = false,
    helpText = null
}) {
    // Check if the current value matches any of the standard icons (case-insensitive)
    const activeIcon = value ? String(value).trim() : '';
    const isStandard = STANDARD_ICONS.some(
        (icon) => icon.name.toLowerCase() === activeIcon.toLowerCase()
    );

    const handleSelectIcon = (iconName) => {
        onChange(iconName);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-700">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
                {activeIcon && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-medium text-slate-600">
                        <span>Active:</span>
                        <DynamicIcon name={activeIcon} className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="font-semibold text-slate-800">{activeIcon}</span>
                    </div>
                )}
            </div>

            {/* Visual Grid of Common Icons */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                {STANDARD_ICONS.map((icon) => {
                    const isSelected = activeIcon.toLowerCase() === icon.name.toLowerCase();
                    return (
                        <button
                            key={icon.name}
                            type="button"
                            onClick={() => handleSelectIcon(icon.name)}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                                isSelected
                                    ? 'bg-indigo-50/80 border-indigo-500 shadow-sm ring-2 ring-indigo-500/20'
                                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                            title={icon.desc}
                        >
                            <DynamicIcon
                                name={icon.name}
                                className={`w-6 h-6 mb-2 transition-transform duration-200 ${
                                    isSelected
                                        ? 'text-indigo-600 scale-110'
                                        : 'text-slate-500 group-hover:scale-105'
                                }`}
                            />
                            <span
                                className={`text-xs font-semibold truncate max-w-full ${
                                    isSelected ? 'text-indigo-900' : 'text-slate-600'
                                }`}
                            >
                                {icon.name}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Custom Input Fallback */}
            <div className="pt-2 border-t border-dashed border-slate-200">
                <div className="flex items-center gap-2">
                    <div className="flex-1">
                        <label className="block text-xs font-semibold text-slate-500 mb-1">
                            Or enter a custom Lucide icon name:
                        </label>
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder="e.g. Brain, Zap, Stethoscope"
                            required={required}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-shadow"
                        />
                    </div>
                    <div className="flex items-center justify-center w-10 h-10 mt-5 border border-slate-200 rounded-lg bg-slate-50">
                        {activeIcon ? (
                            <DynamicIcon name={activeIcon} className="w-5 h-5 text-slate-600" />
                        ) : (
                            <HelpCircle className="w-5 h-5 text-slate-300" />
                        )}
                    </div>
                </div>
                {helpText && (
                    <p className="text-xs text-slate-400 mt-1">{helpText}</p>
                )}
            </div>
        </div>
    );
}
