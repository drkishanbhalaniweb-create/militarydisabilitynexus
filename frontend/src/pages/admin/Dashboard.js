import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import AdminLayout from '../../components/admin/AdminLayout';
import { MessageSquare, Briefcase, FileText, Upload } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    contacts: 0,
    services: 0,
    blogPosts: 0,
    files: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [contacts, services, blogPosts, files] = await Promise.all([
        supabase.from('contacts').select('id', { count: 'exact', head: true }),
        supabase.from('services').select('id', { count: 'exact', head: true }),
        supabase.from('blog_posts').select('id', { count: 'exact', head: true }),
        supabase.from('file_uploads').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        contacts: contacts.count || 0,
        services: services.count || 0,
        blogPosts: blogPosts.count || 0,
        files: files.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { name: 'Total Contacts', value: stats.contacts, icon: MessageSquare, color: 'bg-navy-600' },
    { name: 'Services', value: stats.services, icon: Briefcase, color: 'bg-indigo-500' },
    { name: 'Blog Posts', value: stats.blogPosts, icon: FileText, color: 'bg-purple-500' },
    { name: 'Files Uploaded', value: stats.files, icon: Upload, color: 'bg-orange-500' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-2">Welcome to your admin panel</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.name} className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">{stat.name}</p>
                      <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/admin/contacts"
              className="p-4 border-2 border-slate-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
            >
              <h3 className="font-semibold text-slate-900">View Contacts</h3>
              <p className="text-sm text-slate-600 mt-1">Manage form submissions</p>
            </a>
            <a
              href="/admin/services"
              className="p-4 border-2 border-slate-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
            >
              <h3 className="font-semibold text-slate-900">Manage Services</h3>
              <p className="text-sm text-slate-600 mt-1">Add or edit services</p>
            </a>
            <a
              href="/admin/blog"
              className="p-4 border-2 border-slate-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
            >
              <h3 className="font-semibold text-slate-900">Manage Blog</h3>
              <p className="text-sm text-slate-600 mt-1">Create and edit posts</p>
            </a>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
