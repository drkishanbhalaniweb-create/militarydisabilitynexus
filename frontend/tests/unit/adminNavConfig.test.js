import { describe, it, expect } from 'vitest';
import {
  isTabAllowed,
  canAccessPath,
  getFirstAllowedRoute,
  getTabIdFromPath
} from '../../src/lib/adminNavConfig';

describe('adminNavConfig permissions & route guarding', () => {
  const superAdmin = {
    role: 'super_admin',
    allowed_tabs: null,
    is_active: true
  };

  const arraLimitedAdmin = {
    email: 'arra@militarydisabilitynexus.com',
    role: 'admin',
    allowed_tabs: ['contacts', 'captured-emails', 'form-submissions', 'diagnostics'],
    is_active: true
  };

  const editorUser = {
    role: 'editor',
    allowed_tabs: null,
    is_active: true
  };

  it('allows super_admin access to all tabs including user management', () => {
    expect(isTabAllowed(superAdmin, 'dashboard')).toBe(true);
    expect(isTabAllowed(superAdmin, 'contacts')).toBe(true);
    expect(isTabAllowed(superAdmin, 'blog')).toBe(true);
    expect(isTabAllowed(superAdmin, 'users')).toBe(true);
    expect(isTabAllowed(superAdmin, 'settings')).toBe(true);
    expect(canAccessPath(superAdmin, '/admin/users')).toBe(true);
    expect(canAccessPath(superAdmin, '/admin/blog/new')).toBe(true);
  });

  it('restricts limited admin (arra) to authorized tabs only', () => {
    // Permitted tabs
    expect(isTabAllowed(arraLimitedAdmin, 'contacts')).toBe(true);
    expect(isTabAllowed(arraLimitedAdmin, 'captured-emails')).toBe(true);
    expect(isTabAllowed(arraLimitedAdmin, 'form-submissions')).toBe(true);
    expect(isTabAllowed(arraLimitedAdmin, 'diagnostics')).toBe(true);

    // Blocked tabs
    expect(isTabAllowed(arraLimitedAdmin, 'blog')).toBe(false);
    expect(isTabAllowed(arraLimitedAdmin, 'services')).toBe(false);
    expect(isTabAllowed(arraLimitedAdmin, 'pricing-tiers')).toBe(false);
    expect(isTabAllowed(arraLimitedAdmin, 'users')).toBe(false);
    expect(isTabAllowed(arraLimitedAdmin, 'settings')).toBe(false);
  });

  it('properly validates route paths for restricted admin', () => {
    expect(canAccessPath(arraLimitedAdmin, '/admin/contacts')).toBe(true);
    expect(canAccessPath(arraLimitedAdmin, '/admin/captured-emails')).toBe(true);
    expect(canAccessPath(arraLimitedAdmin, '/admin/form-submissions')).toBe(true);
    expect(canAccessPath(arraLimitedAdmin, '/admin/diagnostics')).toBe(true);

    // Blocked routes
    expect(canAccessPath(arraLimitedAdmin, '/admin/blog')).toBe(false);
    expect(canAccessPath(arraLimitedAdmin, '/admin/blog/new')).toBe(false);
    expect(canAccessPath(arraLimitedAdmin, '/admin/services/edit/123')).toBe(false);
    expect(canAccessPath(arraLimitedAdmin, '/admin/users')).toBe(false);
  });

  it('correctly maps nested paths to tab IDs', () => {
    expect(getTabIdFromPath('/admin/contacts')).toBe('contacts');
    expect(getTabIdFromPath('/admin/blog/edit/some-slug')).toBe('blog');
    expect(getTabIdFromPath('/admin/services/new')).toBe('services');
    expect(getTabIdFromPath('/admin/pricing-tiers/tier-1')).toBe('pricing-tiers');
  });

  it('determines the correct fallback route for limited admins', () => {
    expect(getFirstAllowedRoute(superAdmin)).toBe('/admin/dashboard');
    expect(getFirstAllowedRoute(arraLimitedAdmin)).toBe('/admin/contacts');
  });

  it('supports legacy editor role with CMS defaults', () => {
    expect(isTabAllowed(editorUser, 'blog')).toBe(true);
    expect(isTabAllowed(editorUser, 'services')).toBe(true);
    expect(isTabAllowed(editorUser, 'contacts')).toBe(false);
    expect(isTabAllowed(editorUser, 'users')).toBe(false);
  });
});
