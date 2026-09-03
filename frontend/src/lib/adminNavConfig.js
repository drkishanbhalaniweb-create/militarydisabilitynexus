import {
  LayoutDashboard,
  MessageSquare,
  Mail,
  ClipboardList,
  Activity,
  Briefcase,
  DollarSign,
  Layers,
  HeartPulse,
  BookOpen,
  Quote,
  Stethoscope,
  FileText,
  HelpCircle,
  Settings,
  Users
} from 'lucide-react';

export const ADMIN_NAV_SECTIONS = [
  {
    title: 'Overview',
    items: [
      {
        id: 'dashboard',
        name: 'Dashboard',
        href: '/admin/dashboard',
        icon: LayoutDashboard,
        description: 'System overview and metrics'
      }
    ]
  },
  {
    title: 'Inquiries & Leads',
    items: [
      {
        id: 'contacts',
        name: 'Contacts',
        href: '/admin/contacts',
        icon: MessageSquare,
        description: 'General contact form inquiries'
      },
      {
        id: 'captured-emails',
        name: 'Captured Emails',
        href: '/admin/captured-emails',
        icon: Mail,
        description: 'Lead magnet and newsletter captures'
      },
      {
        id: 'form-submissions',
        name: 'Form Submissions',
        href: '/admin/form-submissions',
        icon: ClipboardList,
        description: 'Intake and questionnaire submissions'
      },
      {
        id: 'diagnostics',
        name: 'Diagnostics',
        href: '/admin/diagnostics',
        icon: Activity,
        description: 'Symptom diagnostic tool submissions'
      }
    ]
  },
  {
    title: 'Clinical & Content CMS',
    items: [
      {
        id: 'services',
        name: 'Services',
        href: '/admin/services',
        icon: Briefcase,
        description: 'Clinical service offerings and descriptions'
      },
      {
        id: 'pricing-tiers',
        name: 'Pricing Tiers',
        href: '/admin/pricing-tiers',
        icon: DollarSign,
        description: 'Pricing plans and checkout tiers'
      },
      {
        id: 'body-systems',
        name: 'Body Systems',
        href: '/admin/body-systems',
        icon: Layers,
        description: 'Anatomical categories and taxonomies'
      },
      {
        id: 'conditions',
        name: 'Conditions',
        href: '/admin/conditions',
        icon: HeartPulse,
        description: 'Disability condition library & rating guides'
      },
      {
        id: 'case-studies',
        name: 'Case Studies',
        href: '/admin/case-studies',
        icon: BookOpen,
        description: 'Veteran success stories and nexus outcomes'
      },
      {
        id: 'testimonials',
        name: 'Testimonials',
        href: '/admin/testimonials',
        icon: Quote,
        description: 'Client reviews and social proof'
      },
      {
        id: 'clinical-profiles',
        name: 'Clinical Profiles',
        href: '/admin/clinical-profiles',
        icon: Stethoscope,
        description: 'Medical expert and clinician bios'
      },
      {
        id: 'blog',
        name: 'Blog Posts',
        href: '/admin/blog',
        icon: FileText,
        description: 'Educational articles and VA claims guides'
      },
      {
        id: 'community',
        name: 'Community Q&A',
        href: '/admin/community',
        icon: HelpCircle,
        description: 'Veteran forum questions and expert answers'
      }
    ]
  },
  {
    title: 'Administration',
    items: [
      {
        id: 'settings',
        name: 'Settings',
        href: '/admin/settings',
        icon: Settings,
        description: 'Global site and admin configuration'
      },
      {
        id: 'users',
        name: 'Admin Users',
        href: '/admin/users',
        icon: Users,
        superAdminOnly: true,
        description: 'Manage admin accounts, roles, and permissions'
      }
    ]
  }
];

export const PRESET_PERMISSION_SETS = {
  INQUIRIES_AND_LEADS: ['contacts', 'captured-emails', 'form-submissions', 'diagnostics'],
  CONTENT_CMS: [
    'services',
    'pricing-tiers',
    'body-systems',
    'conditions',
    'case-studies',
    'testimonials',
    'clinical-profiles',
    'blog',
    'community'
  ],
  FULL_ADMIN: [
    'dashboard',
    'contacts',
    'captured-emails',
    'form-submissions',
    'diagnostics',
    'services',
    'pricing-tiers',
    'body-systems',
    'conditions',
    'case-studies',
    'testimonials',
    'clinical-profiles',
    'blog',
    'community',
    'settings'
  ]
};

// Flatten all tab definitions for quick lookup
export const ALL_ADMIN_TABS = ADMIN_NAV_SECTIONS.flatMap(section => section.items);

/**
 * Check if a tab is allowed for a given admin user profile
 */
export function isTabAllowed(adminProfile, tabId) {
  if (!adminProfile) return false;

  const tabDef = ALL_ADMIN_TABS.find(t => t.id === tabId);
  if (!tabDef) return false;

  // Super admin has unrestricted access to everything
  if (adminProfile.role === 'super_admin') {
    return true;
  }

  // Super-admin only tabs (like user management) cannot be granted to non-super-admins
  if (tabDef.superAdminOnly) {
    return false;
  }

  // If the user has a customized allowed_tabs list, respect it explicitly
  if (Array.isArray(adminProfile.allowed_tabs)) {
    return adminProfile.allowed_tabs.includes(tabId);
  }

  // Legacy role-based defaults when allowed_tabs is not defined:
  if (adminProfile.role === 'admin') {
    return tabId !== 'users';
  }

  if (adminProfile.role === 'editor') {
    return PRESET_PERMISSION_SETS.CONTENT_CMS.includes(tabId) || tabId === 'dashboard';
  }

  return false;
}

/**
 * Maps any pathname under /admin to its corresponding tab ID
 */
export function getTabIdFromPath(pathname) {
  if (!pathname || !pathname.startsWith('/admin')) return null;

  const subPath = pathname.replace(/^\/admin\/?/, '').split('/')[0];
  if (!subPath || subPath === 'dashboard') return 'dashboard';

  // Handle standard tabs
  const matched = ALL_ADMIN_TABS.find(tab => {
    const tabSubPath = tab.href.replace(/^\/admin\/?/, '').split('/')[0];
    return tabSubPath === subPath;
  });

  return matched ? matched.id : subPath;
}

/**
 * Checks if the user is authorized to access a given URL path
 */
export function canAccessPath(adminProfile, pathname) {
  if (!adminProfile) return false;
  if (adminProfile.role === 'super_admin') return true;

  const tabId = getTabIdFromPath(pathname);
  if (!tabId) return false;

  return isTabAllowed(adminProfile, tabId);
}

/**
 * Finds the first authorized route for an admin profile
 */
export function getFirstAllowedRoute(adminProfile) {
  if (!adminProfile) return '/admin/login';
  if (adminProfile.role === 'super_admin') return '/admin/dashboard';

  for (const section of ADMIN_NAV_SECTIONS) {
    for (const item of section.items) {
      if (isTabAllowed(adminProfile, item.id)) {
        return item.href;
      }
    }
  }

  return '/admin/login';
}
