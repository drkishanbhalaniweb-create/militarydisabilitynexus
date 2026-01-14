import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  MessageSquare,
  LogOut,
  Menu,
  X,
  ClipboardList,
  Users,
  HelpCircle,
  BookOpen,
  Activity,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

const AdminLayout = ({ children }) => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('admin_users')
        .select('role')
        .eq('id', user.id)
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors

      // Ignore errors - user might not be in admin_users table yet
      if (data && data.role === 'super_admin') {
        setIsSuperAdmin(true);
      }
    } catch (error) {
      // Silently fail - user just won't see Admin Users link
      console.log('Admin users table not accessible yet');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Contacts', href: '/admin/contacts', icon: MessageSquare },
    { name: 'Form Submissions', href: '/admin/form-submissions', icon: ClipboardList },
    { name: 'Diagnostics', href: '/admin/diagnostics', icon: Activity },
    { name: 'Services', href: '/admin/services', icon: Briefcase },
    { name: 'Case Studies', href: '/admin/case-studies', icon: BookOpen },
    { name: 'Blog Posts', href: '/admin/blog', icon: FileText },
    { name: 'Community Q&A', href: '/admin/community', icon: HelpCircle },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
    ...(isSuperAdmin ? [{ name: 'Admin Users', href: '/admin/users', icon: Users }] : []),
  ];

  const isActive = (path) => router.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar - Desktop */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow bg-indigo-700 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 py-6">
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          </div>
          <nav className="flex-1 px-2 pb-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${isActive(item.href)
                    ? 'bg-indigo-800 text-white'
                    : 'text-indigo-100 hover:bg-indigo-600 hover:text-white'
                    }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="flex-shrink-0 flex border-t border-indigo-800 p-4">
            <button
              onClick={handleLogout}
              className="flex-shrink-0 w-full group flex items-center px-3 py-3 text-sm font-medium text-indigo-100 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-indigo-700 z-40">
        <div className="flex items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-indigo-700 pt-16">
          <nav className="px-2 pb-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg ${isActive(item.href)
                    ? 'bg-indigo-800 text-white'
                    : 'text-indigo-100 hover:bg-indigo-600 hover:text-white'
                    }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-3 text-sm font-medium text-indigo-100 rounded-lg hover:bg-indigo-600 hover:text-white"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </nav>
        </div>
      )}

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1 pt-16 md:pt-0">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
