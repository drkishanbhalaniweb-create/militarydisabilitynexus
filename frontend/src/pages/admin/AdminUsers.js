import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminUserForm from '../../components/admin/AdminUserForm';
import { UserPlus, Shield, ShieldCheck, Edit2, Power, PowerOff } from 'lucide-react';
import { toast } from 'sonner';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    checkPermissions();
    fetchAdminUsers();
  }, []);

  const checkPermissions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in');
        window.location.href = '/admin/login';
        return;
      }

      const { data, error } = await supabase
        .from('admin_users')
        .select('role, is_active')
        .eq('id', user.id)
        .maybeSingle(); // Use maybeSingle to avoid errors

      if (error) {
        console.error('Error checking permissions:', error);
        toast.error('Admin users table not set up yet. Please run the setup SQL.');
        window.location.href = '/admin/dashboard';
        return;
      }

      if (!data) {
        toast.error('You are not registered as an admin user. Please run the setup SQL.');
        window.location.href = '/admin/dashboard';
        return;
      }

      if (data.role !== 'super_admin' || !data.is_active) {
        toast.error('Only super admins can manage admin users');
        window.location.href = '/admin/dashboard';
        return;
      }

      setUserRole(data.role);
    } catch (error) {
      console.error('Error checking permissions:', error);
      toast.error('Failed to verify permissions');
      window.location.href = '/admin/dashboard';
    }
  };

  const fetchAdminUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching admin users:', error);
      toast.error('Failed to load admin users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    setCurrentUser(null);
    setShowForm(true);
  };

  const handleToggleActive = async (userId, currentStatus, userEmail) => {
    try {
      const { error } = await supabase
        .from('admin_users')
        .update({ is_active: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      toast.success(`User ${userEmail} ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchAdminUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user status');
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      super_admin: {
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: ShieldCheck,
        label: 'Super Admin',
      },
      admin: {
        color: 'bg-navy-100 text-navy-800 border-navy-200',
        icon: Shield,
        label: 'Admin',
      },
      editor: {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: Edit2,
        label: 'Editor',
      },
    };
    return badges[role] || badges.admin;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Users</h1>
            <p className="text-slate-600 mt-2">Manage admin accounts and permissions</p>
          </div>
          <button
            onClick={handleCreateUser}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2 transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            <span>Create Admin</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <p className="text-sm text-slate-600">Total Admins</p>
            <p className="text-2xl font-bold text-slate-900">{users.length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <p className="text-sm text-slate-600">Active</p>
            <p className="text-2xl font-bold text-green-600">
              {users.filter((u) => u.is_active).length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <p className="text-sm text-slate-600">Super Admins</p>
            <p className="text-2xl font-bold text-purple-600">
              {users.filter((u) => u.role === 'super_admin').length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <p className="text-sm text-slate-600">Inactive</p>
            <p className="text-2xl font-bold text-red-600">
              {users.filter((u) => !u.is_active).length}
            </p>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {users.map((user) => {
                  const roleBadge = getRoleBadge(user.role);
                  const RoleIcon = roleBadge.icon;

                  return (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {user.full_name}
                          </div>
                          <div className="text-sm text-slate-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center space-x-1 px-3 py-1 text-xs font-semibold rounded-full border ${roleBadge.color}`}
                        >
                          <RoleIcon className="w-3 h-3" />
                          <span>{roleBadge.label}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center space-x-1 px-3 py-1 text-xs font-semibold rounded-full ${
                            user.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {user.is_active ? (
                            <>
                              <Power className="w-3 h-3" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <PowerOff className="w-3 h-3" />
                              <span>Inactive</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {formatDate(user.last_login)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleToggleActive(user.id, user.is_active, user.email)}
                          className={`${
                            user.is_active
                              ? 'text-red-600 hover:text-red-900'
                              : 'text-green-600 hover:text-green-900'
                          } transition-colors`}
                        >
                          {user.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500">No admin users found</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Admin Form Modal */}
      {showForm && (
        <AdminUserForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            fetchAdminUsers();
          }}
        />
      )}
    </AdminLayout>
  );
};

export default AdminUsers;
