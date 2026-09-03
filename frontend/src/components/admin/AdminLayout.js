import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import {
  ADMIN_NAV_SECTIONS,
  isTabAllowed,
  canAccessPath,
  getFirstAllowedRoute
} from '../../lib/adminNavConfig';
import { LogOut, Menu, X, Shield, ShieldCheck, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect, useMemo } from 'react';

const AdminLayout = ({ children }) => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminProfile, setAdminProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    loadAdminProfile();
  }, []);

  const loadAdminProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoadingProfile(false);
        return;
      }

      const { data, error } = await supabase
        .from('admin_users')
        .select('id, email, full_name, role, allowed_tabs, is_active')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.warn('Could not load admin user profile:', error.message);
      }

      const profile = data || {
        id: user.id,
        email: user.email,
        role: 'admin',
        allowed_tabs: null,
        is_active: true
      };

      setAdminProfile(profile);
    } catch (err) {
      console.error('Error in loadAdminProfile:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  // Route guarding: protect against unauthorized direct URL visits
  useEffect(() => {
    if (loadingProfile || !adminProfile) return;

    if (!canAccessPath(adminProfile, router.pathname)) {
      toast.error('Access restricted: You do not have permission to view that section.');
      const fallbackRoute = getFirstAllowedRoute(adminProfile);
      router.replace(fallbackRoute);
    }
  }, [router.pathname, adminProfile, loadingProfile, router]);

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

  // Filter navigation sections based on permissions
  const filteredSections = useMemo(() => {
    if (!adminProfile) return [];

    return ADMIN_NAV_SECTIONS.map(section => ({
      ...section,
      items: section.items.filter(item => isTabAllowed(adminProfile, item.id))
    })).filter(section => section.items.length > 0);
  }, [adminProfile]);

  const isActive = (path) => {
    if (path === '/admin/dashboard') {
      return router.pathname === path;
    }
    return router.pathname.startsWith(path);
  };

  const getRoleIcon = () => {
    if (!adminProfile) return null;
    if (adminProfile.role === 'super_admin') return <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />;
    if (adminProfile.role === 'editor') return <Edit2 className="w-3.5 h-3.5 text-green-300" />;
    return <Shield className="w-3.5 h-3.5 text-indigo-200" />;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar - Desktop */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow bg-indigo-700 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-5 border-b border-indigo-600/60">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Admin Panel</h1>
              <p className="text-xs text-indigo-200 mt-0.5">Military Disability Nexus</p>
            </div>
          </div>

          {/* User badge */}
          {adminProfile && (
            <div className="px-4 py-3 bg-indigo-800/40 border-b border-indigo-600/40 flex items-center justify-between">
              <div className="truncate pr-2">
                <p className="text-xs font-medium text-white truncate">
                  {adminProfile.full_name || adminProfile.email}
                </p>
                <div className="flex items-center space-x-1 mt-0.5">
                  {getRoleIcon()}
                  <span className="text-[11px] font-medium text-indigo-200 capitalize">
                    {adminProfile.role?.replace('_', ' ') || 'Admin'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Categorized Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-5">
            {filteredSections.map((section) => (
              <div key={section.title} className="space-y-1">
                <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-indigo-200/80">
                  {section.title}
                </div>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        active
                          ? 'bg-indigo-800 text-white shadow-sm font-semibold'
                          : 'text-indigo-100 hover:bg-indigo-600/70 hover:text-white'
                      }`}
                    >
                      <Icon className={`mr-3 h-4 w-4 shrink-0 ${active ? 'text-white' : 'text-indigo-200'}`} />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Logout */}
          <div className="flex-shrink-0 flex border-t border-indigo-600/60 p-3">
            <button
              onClick={handleLogout}
              className="w-full group flex items-center px-3 py-2.5 text-sm font-medium text-indigo-100 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Header Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-indigo-700 z-40 border-b border-indigo-600">
        <div className="flex items-center justify-between px-4 py-3.5">
          <div>
            <h1 className="text-lg font-bold text-white">Admin Panel</h1>
            {adminProfile && (
              <span className="text-[11px] text-indigo-200 capitalize">
                {adminProfile.role?.replace('_', ' ')}
              </span>
            )}
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-indigo-100 hover:text-white hover:bg-indigo-600 rounded-lg transition-colors"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-indigo-700 pt-16 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-3 py-4 space-y-5">
            {filteredSections.map((section) => (
              <div key={section.title} className="space-y-1">
                <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-indigo-200/80">
                  {section.title}
                </div>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg ${
                        active
                          ? 'bg-indigo-800 text-white font-semibold'
                          : 'text-indigo-100 hover:bg-indigo-600 hover:text-white'
                      }`}
                    >
                      <Icon className="mr-3 h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
          <div className="p-4 border-t border-indigo-600">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-indigo-800/80 rounded-lg hover:bg-indigo-900 transition-colors"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1 pt-14 md:pt-0">
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
