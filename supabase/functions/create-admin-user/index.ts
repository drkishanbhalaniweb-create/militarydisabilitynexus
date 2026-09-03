import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateAdminRequest {
  email: string;
  password: string;
  full_name: string;
  role: 'super_admin' | 'admin' | 'editor';
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase Admin Client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify requester is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized: Invalid token');
    }

    // Check if requester is super admin
    const { data: requesterAdmin, error: adminCheckError } = await supabaseAdmin
      .from('admin_users')
      .select('role, is_active')
      .eq('id', user.id)
      .single();

    if (adminCheckError || !requesterAdmin) {
      throw new Error('Unauthorized: User is not an admin');
    }

    if (requesterAdmin.role !== 'super_admin' || !requesterAdmin.is_active) {
      throw new Error('Unauthorized: Only active super admins can create admin users');
    }

    // Parse request body
    const requestData: CreateAdminRequest & { allowed_tabs?: string[] } = await req.json();
    const { email, password, full_name, role, allowed_tabs } = requestData;

    // Validate input
    if (!email || !password || !full_name || !role) {
      throw new Error('Missing required fields: email, password, full_name, role');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Validate password strength
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Validate role
    const validRoles = ['super_admin', 'admin', 'editor'];
    if (!validRoles.includes(role)) {
      throw new Error('Invalid role. Must be: super_admin, admin, or editor');
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('admin_users')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create user in auth.users
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name,
        role,
      },
    });

    if (createError) {
      console.error('Error creating auth user:', createError);
      throw new Error(`Failed to create user: ${createError.message}`);
    }

    if (!newUser.user) {
      throw new Error('Failed to create user: No user returned');
    }

    const assignedTabs = role === 'super_admin' ? null : (Array.isArray(allowed_tabs) ? allowed_tabs : []);

    // Create entry in admin_users table
    const { error: insertError } = await supabaseAdmin
      .from('admin_users')
      .insert({
        id: newUser.user.id,
        email,
        full_name,
        role,
        allowed_tabs: assignedTabs,
        created_by: user.id,
        is_active: true,
      });

    if (insertError) {
      console.error('Error inserting admin user:', insertError);
      
      // Rollback: Delete auth user if admin_users insert fails
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      
      throw new Error(`Failed to create admin user: ${insertError.message}`);
    }

    // Log in audit_logs
    try {
      await supabaseAdmin.from('audit_logs').insert({
        user_id: user.id,
        user_email: user.email,
        action: 'create_admin_user',
        resource_type: 'admin_user',
        resource_id: newUser.user.id,
        changes: {
          email,
          full_name,
          role,
        },
        phi_accessed: false,
      });
    } catch (auditError) {
      console.error('Error logging to audit:', auditError);
      // Don't fail the request if audit logging fails
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Admin user created successfully',
        user: {
          id: newUser.user.id,
          email,
          full_name,
          role,
          is_active: true,
          created_at: new Date().toISOString(),
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      }
    );
  } catch (error) {
    console.error('Error in create-admin-user function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An unexpected error occurred',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
