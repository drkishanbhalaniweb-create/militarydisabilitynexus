import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Stethoscope, ExternalLink } from 'lucide-react';

const ClinicalProfilePicker = ({ 
    label = 'Clinical Profile',
    value = null,
    onChange,
    helpText = null,
}) => {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProfile, setSelectedProfile] = useState(null);

    useEffect(() => {
        fetchProfiles();
    }, []);

    useEffect(() => {
        if (value && profiles.length > 0) {
            const found = profiles.find(p => p.id === value);
            setSelectedProfile(found || null);
        } else {
            setSelectedProfile(null);
        }
    }, [value, profiles]);

    const fetchProfiles = async () => {
        try {
            const { data, error } = await supabase
                .from('clinical_profiles')
                .select('*')
                .eq('is_active', true)
                .order('display_order', { ascending: true });

            if (error) throw error;
            setProfiles(data || []);
        } catch (error) {
            console.error('Error fetching clinical profiles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (e) => {
        const selectedId = e.target.value || null;
        onChange(selectedId);
    };

    return (
        <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
                {label}
            </label>
            <select
                value={value || ''}
                onChange={handleSelect}
                disabled={loading}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
                <option value="">None (use default)</option>
                {profiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                        {profile.full_name}{profile.credentials ? `, ${profile.credentials}` : ''}
                    </option>
                ))}
            </select>

            {/* Mini preview of selected profile */}
            {selectedProfile && (
                <div className="mt-3 flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    {selectedProfile.photo_url ? (
                        <img
                            src={selectedProfile.photo_url}
                            alt={selectedProfile.full_name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                            <Stethoscope className="w-5 h-5 text-indigo-600" />
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-slate-900 truncate">
                            {selectedProfile.full_name}
                            {selectedProfile.credentials && (
                                <span className="font-normal text-slate-500">, {selectedProfile.credentials}</span>
                            )}
                        </div>
                        {selectedProfile.linkedin_url && (
                            <a
                                href={selectedProfile.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 mt-0.5"
                            >
                                <ExternalLink className="w-3 h-3" />
                                LinkedIn
                            </a>
                        )}
                    </div>
                </div>
            )}

            {helpText && (
                <p className="text-xs text-slate-500 mt-2">{helpText}</p>
            )}

            {loading && (
                <p className="text-xs text-slate-400 mt-1">Loading profiles…</p>
            )}

            {!loading && profiles.length === 0 && (
                <p className="text-xs text-slate-400 mt-1">
                    No clinical profiles created yet.{' '}
                    <a href="/admin/clinical-profiles/new" className="text-indigo-600 hover:underline">
                        Create one
                    </a>
                </p>
            )}
        </div>
    );
};

export default ClinicalProfilePicker;
