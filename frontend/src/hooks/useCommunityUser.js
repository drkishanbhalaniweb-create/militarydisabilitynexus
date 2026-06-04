import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * useCommunityUser
 *
 * Manages the lightweight community identity used for Q&A participation.
 *
 * Resolution order:
 *  1. `community_user_id` cookie  → fetch from community_users table
 *  2. Supabase Auth session       → lookup linked community_user by supabase_user_id
 *
 * Provides:
 *  - communityUser   — the full row or null
 *  - isLoading       — true while the initial lookup is in flight
 *  - isVerified      — true if the community_user is linked to a Supabase Auth account
 *  - isAdmin         — true if role === 'admin'
 *  - login(email, displayName)  — creates / retrieves identity via API
 *  - logout()        — clears the cookie and resets state
 */
export function useCommunityUser() {
  const [communityUser, setCommunityUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      setIsLoading(true);
      try {
        // 1. Check cookie
        const cookieMatch = document.cookie.match(
          /(?:^|;\s*)community_user_id=([^;]+)/
        );
        if (cookieMatch) {
          const userId = cookieMatch[1];
          const { data } = await supabase
            .from('community_users')
            .select('*')
            .eq('id', userId)
            .single();

          if (!cancelled && data) {
            setCommunityUser(data);
            setIsLoading(false);
            return;
          }
        }

        // 2. Fallback: Supabase Auth session
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data } = await supabase
            .from('community_users')
            .select('*')
            .eq('supabase_user_id', user.id)
            .single();

          if (!cancelled && data) {
            setCommunityUser(data);
            // Persist cookie so future loads skip the auth round-trip
            document.cookie = `community_user_id=${data.id}; path=/; max-age=${30 * 24 * 60 * 60}; samesite=lax`;
          }
        }
      } catch (err) {
        console.error('[useCommunityUser] Error loading user:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadUser();
    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Create or retrieve a community identity via the API.
   * On success the cookie is set server-side (httpOnly) and state is updated.
   */
  const login = useCallback(async (email, displayName) => {
    const res = await fetch('/api/community/identity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, display_name: displayName }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || 'Failed to create identity');
    }

    const data = await res.json();
    setCommunityUser(data);
    return data;
  }, []);

  /**
   * Clear the community identity cookie and reset state.
   */
  const logout = useCallback(() => {
    document.cookie = 'community_user_id=; path=/; max-age=0';
    setCommunityUser(null);
  }, []);

  return {
    communityUser,
    isLoading,
    isVerified: communityUser?.is_verified || false,
    isAdmin: communityUser?.role === 'admin',
    login,
    logout,
  };
}

export default useCommunityUser;
