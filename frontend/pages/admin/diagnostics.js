import React, { useState, useEffect } from 'react';
import { FileText, TrendingUp, Users, DollarSign, Calendar, Filter, Trash2 } from 'lucide-react';
import { supabase } from '../../src/lib/supabase';
import { toast } from 'sonner';
import { RECOMMENDATIONS } from '../../src/lib/diagnosticConfig';
import AdminLayout from '../../src/components/admin/AdminLayout';
import ProtectedRoute from '../../src/components/admin/ProtectedRoute';
import SEO from '../../src/components/SEO';

const Diagnostics = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        converted: 0,
        avgScore: 0,
        byRecommendation: {}
    });
    const [filter, setFilter] = useState('all'); // all, converted, not_converted
    const [dateRange, setDateRange] = useState('7'); // days

    useEffect(() => {
        fetchDiagnostics();
    }, [filter, dateRange]);

    const fetchDiagnostics = async () => {
        try {
            setLoading(true);

            // Calculate date filter
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - parseInt(dateRange));

            let query = supabase
                .from('diagnostic_sessions')
                .select('*')
                .gte('created_at', startDate.toISOString())
                .order('created_at', { ascending: false });

            // Apply conversion filter
            if (filter === 'converted') {
                query = query.eq('converted_to_booking', true);
            } else if (filter === 'not_converted') {
                query = query.eq('converted_to_booking', false);
            }

            const { data, error } = await query;

            if (error) throw error;

            setSessions(data || []);
            calculateStats(data || []);
        } catch (error) {
            console.error('Error fetching diagnostics:', error);
            toast.error('Failed to load diagnostic data');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        const total = data.length;
        const converted = data.filter(s => s.converted_to_booking).length;
        const avgScore = total > 0
            ? (data.reduce((sum, s) => sum + (s.total_score || 0), 0) / total).toFixed(1)
            : 0;

        const byRecommendation = data.reduce((acc, session) => {
            const rec = session.recommendation || 'UNKNOWN';
            acc[rec] = (acc[rec] || 0) + 1;
            return acc;
        }, {});

        setStats({ total, converted, avgScore, byRecommendation });
    };

    const conversionRate = stats.total > 0
        ? ((stats.converted / stats.total) * 100).toFixed(1)
        : 0;

    const getRecommendationColor = (category) => {
        const rec = RECOMMENDATIONS[category];
        return rec ? rec.color : '#6b7280';
    };

    const getRecommendationLabel = (category) => {
        return category.replace(/_/g, ' ').toLowerCase();
    };

    const handleReset = async () => {
        if (!window.confirm('Are you sure you want to completely RESET all diagnostic data? This action cannot be undone and will delete all session history.')) {
            return;
        }

        try {
            setLoading(true);

            // Loop to delete in batches (Supabase fetch is limited to 1000, and URL length limits .in() clause)
            const BATCH_SIZE = 100;
            let hasMore = true;
            let totalDeleted = 0;

            while (hasMore) {
                // 1. Fetch a batch of IDs
                const { data: records, error: fetchError } = await supabase
                    .from('diagnostic_sessions')
                    .select('id')
                    .range(0, BATCH_SIZE - 1);

                if (fetchError) throw fetchError;

                if (!records || records.length === 0) {
                    hasMore = false;
                    break;
                }

                const idsToDelete = records.map(r => r.id);

                // 2. Delete this batch
                const { error: deleteError } = await supabase
                    .from('diagnostic_sessions')
                    .delete()
                    .in('id', idsToDelete);

                if (deleteError) throw deleteError;

                totalDeleted += records.length;

                // If we fetched fewer than batch size, we are done
                if (records.length < BATCH_SIZE) {
                    hasMore = false;
                }
            }

            if (totalDeleted > 0) {
                toast.success(`Successfully deleted ${totalDeleted} diagnostic sessions.`);
            } else {
                toast.info('No data found to reset.');
            }

            fetchDiagnostics(); // Refresh to show empty state
        } catch (error) {
            console.error('Error resetting diagnostics:', error);
            toast.error(`Failed to reset data: ${error.message || 'Unknown error'}`);
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute>
            <AdminLayout>
                <SEO title="Diagnostic Analytics" noindex={true} />
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Diagnostic Analytics</h1>
                            <p className="text-slate-600 mt-1">VA Claim Readiness Diagnostic sessions and conversions</p>
                        </div>
                        <button
                            onClick={handleReset}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Reset Data</span>
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex flex-wrap gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    <Filter className="w-4 h-4 inline mr-1" />
                                    Conversion Status
                                </label>
                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-500"
                                >
                                    <option value="all">All Sessions</option>
                                    <option value="converted">Converted to Booking</option>
                                    <option value="not_converted">Not Converted</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    <Calendar className="w-4 h-4 inline mr-1" />
                                    Date Range
                                </label>
                                <select
                                    value={dateRange}
                                    onChange={(e) => setDateRange(e.target.value)}
                                    className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-500"
                                >
                                    <option value="7">Last 7 days</option>
                                    <option value="30">Last 30 days</option>
                                    <option value="90">Last 90 days</option>
                                    <option value="365">Last year</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-600 text-sm font-medium">Total Sessions</span>
                                <Users className="w-5 h-5 text-navy-600" />
                            </div>
                            <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-600 text-sm font-medium">Conversions</span>
                                <DollarSign className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="text-3xl font-bold text-slate-900">{stats.converted}</div>
                            <div className="text-sm text-slate-500 mt-1">{conversionRate}% conversion rate</div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-600 text-sm font-medium">Avg Score</span>
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="text-3xl font-bold text-slate-900">{stats.avgScore}</div>
                            <div className="text-sm text-slate-500 mt-1">out of 10</div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-600 text-sm font-medium">Revenue Potential</span>
                                <DollarSign className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="text-3xl font-bold text-slate-900">
                                ${(stats.total - stats.converted) * 225}
                            </div>
                            <div className="text-sm text-slate-500 mt-1">from unconverted</div>
                        </div>
                    </div>

                    {/* Recommendation Distribution */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">Score Distribution</h2>
                        <div className="space-y-3">
                            {Object.entries(stats.byRecommendation).map(([category, count]) => {
                                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                                return (
                                    <div key={category}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium text-slate-700 capitalize">
                                                {getRecommendationLabel(category)}
                                            </span>
                                            <span className="text-sm text-slate-600">
                                                {count} ({percentage.toFixed(0)}%)
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-full h-2">
                                            <div
                                                className="h-2 rounded-full transition-all"
                                                style={{
                                                    width: `${percentage}%`,
                                                    backgroundColor: getRecommendationColor(category)
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Sessions Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200">
                            <h2 className="text-xl font-bold text-slate-900">Recent Sessions</h2>
                        </div>

                        {loading ? (
                            <div className="p-8 text-center text-slate-600">
                                Loading diagnostic sessions...
                            </div>
                        ) : sessions.length === 0 ? (
                            <div className="p-8 text-center text-slate-600">
                                No diagnostic sessions found for the selected filters.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Score</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Recommendation</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Converted</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Session ID</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {sessions.map((session) => (
                                            <tr key={session.id} className="hover:bg-slate-50">
                                                <td className="px-6 py-4 text-sm text-slate-900">
                                                    {new Date(session.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className="font-bold text-slate-900">{session.total_score}</span>
                                                    <span className="text-slate-500">/10</span>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span
                                                        className="px-3 py-1 rounded-full text-xs font-medium capitalize"
                                                        style={{
                                                            backgroundColor: `${getRecommendationColor(session.recommendation)}20`,
                                                            color: getRecommendationColor(session.recommendation)
                                                        }}
                                                    >
                                                        {getRecommendationLabel(session.recommendation)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    {session.converted_to_booking ? (
                                                        <span className="text-green-600 font-medium">✓ Yes</span>
                                                    ) : (
                                                        <span className="text-slate-400">No</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-500 font-mono">
                                                    {session.session_id.substring(0, 20)}...
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </AdminLayout>
        </ProtectedRoute>
    );
};

export default Diagnostics;
