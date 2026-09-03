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
  if (req.method !== 'PUT' && req.method !== 'PATCH') {
    res.setHeader('Allow', ['PUT', 'PATCH']);
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

    // Verify requester is super_admin
    const { data: requesterProfile, error: profileError } = await supabaseAdmin
      .from('admin_users')
      .select('role, is_active')
      .eq('id', user.id)
      .single();

    if (profileError || !requesterProfile || requesterProfile.role !== 'super_admin' || !requesterProfile.is_active) {
      return res.status(403).json({ error: 'Forbidden: Only active super admins can update admin users' });
    }

    const { user_id, full_name, role, allowed_tabs, is_active } = req.body || {};

    if (!user_id) {
      return res.status(400).json({ error: 'Missing user_id' });
    }

    const updates = {
      updated_at: new Date().toISOString(),
    };

    if (full_name !== undefined) updates.full_name = full_name;
    if (role !== undefined) {
      const validRoles = ['super_admin', 'admin', 'editor'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: `Invalid role: ${role}` });
      }
      updates.role = role;
    }
    if (allowed_tabs !== undefined) {
      updates.allowed_tabs = role === 'super_admin' ? null : (Array.isArray(allowed_tabs) ? allowed_tabs : []);
    }
    if (is_active !== undefined) {
      updates.is_active = Boolean(is_active);
    }

    const { data: updatedAdmin, error: updateError } = await supabaseAdmin
      .from('admin_users')
      .update(updates)
      .eq('id', user_id)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({ error: updateError.message });
    }

    return res.status(200).json({
      success: true,
      message: 'Admin user updated successfully',
      user: updatedAdmin,
    });
  } catch (err) {
    console.error('Error in /api/admin/users/update:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
