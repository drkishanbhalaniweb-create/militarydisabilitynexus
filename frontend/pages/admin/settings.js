import { useState, useEffect } from 'react';
import AdminLayout from '../../src/components/admin/AdminLayout';
import ProtectedRoute from '../../src/components/admin/ProtectedRoute';
import { RefreshCcw, Save, Trash2, Globe, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import SEO from '../../src/components/SEO';
import { supabase } from '../../src/lib/supabase';

const AdminSettings = () => {
    const [loading, setLoading] = useState(false);
    const [rebuilding, setRebuilding] = useState(false);
    const [settings, setSettings] = useState({
        vercel_deploy_hook: ''
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            // Check if site_settings table exists by trying to fetch
            const { data, error } = await supabase
                .from('site_settings')
                .select('*')
                .eq('key', 'vercel_deploy_hook')
                .maybeSingle();

            if (!error && data) {
                setSettings({ vercel_deploy_hook: data.value });
            } else {
                // Fallback to localStorage if table doesn't exist or error
                const localHook = localStorage.getItem('vercel_deploy_hook');
                if (localHook) {
                    setSettings({ vercel_deploy_hook: localHook });
                }
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Save to localStorage as a primary/fallback for this browser
            localStorage.setItem('vercel_deploy_hook', settings.vercel_deploy_hook);

            // Try to save to Supabase site_settings table if it exists
            const { error } = await supabase
                .from('site_settings')
                .upsert({
                    key: 'vercel_deploy_hook',
                    value: settings.vercel_deploy_hook,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'key' });

            if (error) {
                console.warn('Could not save to Supabase table (site_settings likely missing), saved to browser only.');
                toast.info('Settings saved to this browser. Note: Admin users on other computers won\'t see this URL unless the database table is created.');
            } else {
                toast.success('Settings saved successfully!');
            }
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Failed to save settings to database.');
        } finally {
            setLoading(false);
        }
    };

    const handleRebuild = async () => {
        if (!settings.vercel_deploy_hook) {
            toast.error('Please enter a Vercel Deploy Hook URL first.');
            return;
        }

        if (!settings.vercel_deploy_hook.startsWith('https://api.vercel.com/v1/integrations/deploy/')) {
            toast.error('Invalid Vercel Deploy Hook URL. It should start with https://api.vercel.com/v1/integrations/deploy/');
            return;
        }

        setRebuilding(true);
        try {
            const response = await fetch(settings.vercel_deploy_hook, {
                method: 'POST',
            });

            if (response.ok) {
                toast.success('Successfully triggered a website rebuild! Your updates will appear in 2-3 minutes.');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to trigger rebuild');
            }
        } catch (error) {
            console.error('Rebuild error:', error);
            toast.error('Rebuild failed: ' + error.message);
        } finally {
            setRebuilding(false);
        }
    };

    return (
        <ProtectedRoute>
            <AdminLayout>
                <SEO title="Admin Settings" noindex={true} />
                <div className="max-w-4xl space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
                        <p className="text-slate-600 mt-2">Manage website configurations and deployments</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center">
                                <Globe className="w-5 h-5 mr-2 text-indigo-600" />
                                Website Deployment
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">
                                Trigger a manual rebuild of the public website to make new content live instantly.
                            </p>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
                                <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-blue-800">
                                    <p className="font-semibold mb-1">How does this affect SEO?</p>
                                    <p>
                                        Rebuilding actually **improves SEO**. It ensures that new pages (like blogs) are generated as static files immediately.
                                        Static pages are faster and much better for Google's crawlers compared to dynamic pages.
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleSave} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Vercel Deploy Hook URL
                                    </label>
                                    <div className="flex gap-4">
                                        <input
                                            type="url"
                                            value={settings.vercel_deploy_hook}
                                            onChange={(e) => setSettings({ ...settings, vercel_deploy_hook: e.target.value })}
                                            placeholder="https://api.vercel.com/v1/integrations/deploy/..."
                                            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                                        />
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
                                        >
                                            <Save className="w-4 h-4 mr-2" />
                                            {loading ? 'Saving...' : 'Save Hook'}
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-2">
                                        You can get this URL from: Vercel Project Settings {'>'} Git {'>'} Deploy Hooks
                                    </p>
                                </div>
                            </form>

                            <div className="pt-6 border-t border-slate-100">
                                <button
                                    onClick={handleRebuild}
                                    disabled={rebuilding || !settings.vercel_deploy_hook}
                                    className="w-full flex items-center justify-center px-6 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:shadow-none"
                                >
                                    <RefreshCcw className={`w-6 h-6 mr-3 ${rebuilding ? 'animate-spin' : ''}`} />
                                    {rebuilding ? 'Rebuilding Website...' : 'REBUILD WEBSITE NOW'}
                                </button>
                                <p className="text-center text-xs text-slate-500 mt-3 italic">
                                    Clicking this will make all new blogs, case studies, and services live on the public site immediately.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        </ProtectedRoute>
    );
};

export default AdminSettings;
