import { useState, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import {
  X,
  Loader2,
  Eye,
  EyeOff,
  Shield,
  ShieldCheck,
  Edit2,
  CheckSquare,
  Square,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { ADMIN_NAV_SECTIONS, PRESET_PERMISSION_SETS } from '../../lib/adminNavConfig';

const AdminUserForm = ({ onClose, onSuccess, userToEdit = null }) => {
  const isEditing = Boolean(userToEdit);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Filter out super-admin only tabs (like 'users') from grantable checkboxes
  const grantableSections = useMemo(() => {
    return ADMIN_NAV_SECTIONS.map(section => ({
      ...section,
      items: section.items.filter(item => !item.superAdminOnly)
    })).filter(section => section.items.length > 0);
  }, []);

  const [formData, setFormData] = useState({
    email: userToEdit?.email || '',
    password: '',
    confirmPassword: '',
    full_name: userToEdit?.full_name || '',
    role: userToEdit?.role || 'admin',
  });

  const [selectedTabs, setSelectedTabs] = useState(() => {
    if (userToEdit?.allowed_tabs && Array.isArray(userToEdit.allowed_tabs)) {
      return userToEdit.allowed_tabs;
    }
    if (userToEdit?.role === 'editor') {
      return PRESET_PERMISSION_SETS.CONTENT_CMS;
    }
    // Default to Inquiries & Leads for new admins or standard list
    return PRESET_PERMISSION_SETS.INQUIRIES_AND_LEADS;
  });

  const [errors, setErrors] = useState({});

  const roles = [
    {
      value: 'super_admin',
      label: 'Super Admin',
      description: 'Unrestricted access to all features, settings, and user management',
      icon: ShieldCheck,
      color: 'text-amber-500',
    },
    {
      value: 'admin',
      label: 'Admin (Configurable Access)',
      description: 'Access can be customized to specific tabs (Inquiries, Leads, etc.)',
      icon: Shield,
      color: 'text-indigo-600',
    },
    {
      value: 'editor',
      label: 'Editor (Content Only)',
      description: 'Dedicated to writing and updating blog articles and service content',
      icon: Edit2,
      color: 'text-emerald-600',
    },
  ];

  const toggleTab = (tabId) => {
    setSelectedTabs(prev => {
      if (prev.includes(tabId)) {
        return prev.filter(id => id !== tabId);
      } else {
        return [...prev, tabId];
      }
    });
  };

  const applyPreset = (presetName) => {
    if (presetName === 'inquiries') {
      setSelectedTabs([...PRESET_PERMISSION_SETS.INQUIRIES_AND_LEADS]);
      toast.info('Applied preset: Inquiries & Leads');
    } else if (presetName === 'cms') {
      setSelectedTabs([...PRESET_PERMISSION_SETS.CONTENT_CMS]);
      toast.info('Applied preset: Content & Clinical CMS');
    } else if (presetName === 'all') {
      const allGrantable = grantableSections.flatMap(s => s.items.map(i => i.id));
      setSelectedTabs(allGrantable);
      toast.info('Selected all grantable tabs');
    } else if (presetName === 'clear') {
      setSelectedTabs([]);
      toast.info('Cleared all tab permissions');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!isEditing) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (!formData.full_name) {
      newErrors.full_name = 'Full name is required';
    } else if (formData.full_name.length < 2) {
      newErrors.full_name = 'Full name must be at least 2 characters';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    if (formData.role !== 'super_admin' && selectedTabs.length === 0) {
      newErrors.permissions = 'Please select at least one permitted tab for this user';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active authenticated session');
      }

      const assignedTabs = formData.role === 'super_admin' ? null : selectedTabs;

      if (isEditing) {
        // Update existing admin
        const res = await fetch('/api/admin/users/update', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            user_id: userToEdit.id,
            full_name: formData.full_name,
            role: formData.role,
            allowed_tabs: assignedTabs
          })
        });

        const result = await res.json();
        if (!res.ok) {
          throw new Error(result.error || 'Failed to update admin user');
        }

        toast.success(`Admin user ${formData.email} updated successfully!`);
      } else {
        // Create new admin
        const res = await fetch('/api/admin/users/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            full_name: formData.full_name,
            role: formData.role,
            allowed_tabs: assignedTabs
          })
        });

        const result = await res.json();
        if (!res.ok) {
          throw new Error(result.error || 'Failed to create admin user');
        }

        toast.success(`Admin user ${formData.email} created successfully!`);
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving admin user:', error);
      toast.error(error.message || 'Failed to save admin user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {isEditing ? 'Edit Admin Permissions' : 'Create Admin User'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure credentials, role, and granular section permissions
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Full Name & Email Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.full_name ? 'border-red-500' : 'border-slate-300'
                }`}
                placeholder="e.g. Arra"
              />
              {errors.full_name && (
                <p className="mt-1 text-xs text-red-600">{errors.full_name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                disabled={isEditing}
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.email ? 'border-red-500' : 'border-slate-300'
                } ${isEditing ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                placeholder="arra@militarydisabilitynexus.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Password (only on create) */}
          {!isEditing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-3.5 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10 ${
                      errors.password ? 'border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="Minimum 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Confirm Password *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-3.5 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-slate-300'
                  }`}
                  placeholder="Re-enter password"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            </div>
          )}

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              Account Role *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {roles.map((role) => {
                const RoleIcon = role.icon;
                const isSelected = formData.role === role.value;
                return (
                  <label
                    key={role.value}
                    className={`flex flex-col p-3.5 border-2 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center space-x-2">
                        <RoleIcon className={`w-4 h-4 ${role.color}`} />
                        <span className="font-semibold text-xs text-slate-900">{role.label}</span>
                      </div>
                      <input
                        type="radio"
                        name="role"
                        value={role.value}
                        checked={isSelected}
                        onChange={handleChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{role.description}</p>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Granular Permissions Section (Active for non-super admins) */}
          {formData.role !== 'super_admin' ? (
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    Permitted Tabs & Sections
                  </h3>
                  <p className="text-xs text-slate-500">
                    Select which tabs this admin is authorized to see and access
                  </p>
                </div>
                {/* Quick Preset Buttons */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => applyPreset('inquiries')}
                    className="px-2.5 py-1 text-xs font-semibold bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors"
                  >
                    Inquiries & Leads Only
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('cms')}
                    className="px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-md hover:bg-emerald-200 transition-colors"
                  >
                    CMS Only
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('all')}
                    className="px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('clear')}
                    className="px-2 py-1 text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {errors.permissions && (
                <p className="text-xs font-semibold text-red-600">{errors.permissions}</p>
              )}

              {/* Categorized Permission Checkboxes */}
              <div className="space-y-4">
                {grantableSections.map(section => (
                  <div key={section.title} className="space-y-2">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      {section.title}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {section.items.map(item => {
                        const Icon = item.icon;
                        const isChecked = selectedTabs.includes(item.id);
                        return (
                          <div
                            key={item.id}
                            onClick={() => toggleTab(item.id)}
                            className={`flex items-start p-2.5 rounded-lg border cursor-pointer transition-all ${
                              isChecked
                                ? 'bg-white border-indigo-500 shadow-xs'
                                : 'bg-white/60 border-slate-200 hover:border-slate-300 opacity-80'
                            }`}
                          >
                            <div className="mr-2.5 mt-0.5 text-indigo-600">
                              {isChecked ? (
                                <CheckSquare className="w-4 h-4 text-indigo-600" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-300" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <Icon className="w-3.5 h-3.5 text-slate-600" />
                                <span className="text-xs font-semibold text-slate-900">{item.name}</span>
                              </div>
                              <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-xs text-amber-800">
                <strong>Super Admin accounts have full access</strong> to all system sections, including settings, user management, and sensitive clinical records. Tab restrictions do not apply.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors shadow-xs"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? 'Save Changes' : 'Create Admin User'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminUserForm;
