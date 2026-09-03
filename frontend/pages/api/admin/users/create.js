import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }

    const token = authHeader.replace(/^Bearer\s+/i, '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    // Verify requester is an active super_admin
    const { data: requesterProfile, error: profileError } = await supabaseAdmin
      .from('admin_users')
      .select('role, is_active')
      .eq('id', user.id)
      .single();

    if (profileError || !requesterProfile) {
      return res.status(403).json({ error: 'Forbidden: Admin user record not found' });
    }

    if (requesterProfile.role !== 'super_admin' || !requesterProfile.is_active) {
      return res.status(403).json({ error: 'Forbidden: Only active super admins can create admin users' });
    }

    const { email, password, full_name, role, allowed_tabs } = req.body || {};

    if (!email || !password || !full_name || !role) {
      return res.status(400).json({ error: 'Missing required fields: email, password, full_name, role' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address format' });
    }

    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    const validRoles = ['super_admin', 'admin', 'editor'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
    }

    // Check if user already exists in admin_users
    const { data: existingAdmin } = await supabaseAdmin
      .from('admin_users')
      .select('id, email')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (existingAdmin) {
      return res.status(409).json({ error: 'An admin account with this email already exists' });
    }

    // Create user in Supabase Auth
    const { data: newAuthUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        role,
      },
    });

    if (createError || !newAuthUser?.user) {
      return res.status(400).json({ error: createError?.message || 'Failed to create auth user' });
    }

    const assignedTabs = role === 'super_admin' ? null : (Array.isArray(allowed_tabs) ? allowed_tabs : []);

    // Insert user into admin_users table
    const { error: insertError } = await supabaseAdmin
      .from('admin_users')
      .insert({
        id: newAuthUser.user.id,
        email: email.toLowerCase().trim(),
        full_name,
        role,
        allowed_tabs: assignedTabs,
        created_by: user.id,
        is_active: true,
      });

    if (insertError) {
      // Rollback auth user creation if table insert fails
      await supabaseAdmin.auth.admin.deleteUser(newAuthUser.user.id);
      return res.status(500).json({ error: `Failed to create admin profile: ${insertError.message}` });
    }

    // Best-effort audit log
    try {
      await supabaseAdmin.from('audit_logs').insert({
        user_id: user.id,
        user_email: user.email,
        action: 'create_admin_user',
        resource_type: 'admin_user',
        resource_id: newAuthUser.user.id,
        changes: {
          email: email.toLowerCase().trim(),
          full_name,
          role,
          allowed_tabs: assignedTabs,
        },
        phi_accessed: false,
      });
    } catch {
      // Don't fail user creation if audit log table is missing
    }

    return res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      user: {
        id: newAuthUser.user.id,
        email: email.toLowerCase().trim(),
        full_name,
        role,
        allowed_tabs: assignedTabs,
        is_active: true,
      },
    });
  } catch (err) {
    console.error('Error in /api/admin/users/create:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
