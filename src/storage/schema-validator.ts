import { UserProfile, ProfileExportData, AnswerSnippet, SnippetCategory, ProfilePersona } from '../types/profile';

export const CURRENT_SCHEMA_VERSION = 1;

export const DEFAULT_PERSONAS: ProfilePersona[] = [
  {
    id: 'fullstack',
    name: 'Full-Stack Engineer',
    title: 'Full-Stack Software Engineer',
    skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'GraphQL', 'Docker'],
    summary:
      'Full-stack software engineer experienced in architecting scalable web applications, robust APIs, and modern frontend interfaces.',
    isDefault: true,
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'frontend',
    name: 'Frontend Specialist',
    title: 'Senior Frontend Engineer',
    skills: ['React', 'TypeScript', 'Next.js', 'CSS/Tailwind', 'Web Performance', 'Accessibility'],
    summary:
      'Frontend specialist focused on crafting responsive, accessible, and high-performance user interfaces with modern web standards.',
    isDefault: false,
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'devops',
    name: 'DevOps / Cloud Specialist',
    title: 'DevOps & Cloud Engineer',
    skills: ['AWS', 'Kubernetes', 'Docker', 'CI/CD', 'Terraform', 'Linux', 'Monitoring'],
    summary:
      'Cloud and DevOps engineer dedicated to resilient infrastructure automation, container orchestration, and reliable CI/CD pipelines.',
    isDefault: false,
    createdAt: '2025-01-01T00:00:00.000Z',
  },
];

export const DEFAULT_ANSWER_SNIPPETS: AnswerSnippet[] = [
  {
    id: 'snip-why-us',
    title: 'Why This Company & Role?',
    category: 'general',
    content:
      "I am deeply inspired by {company}'s focus on high-impact engineering and user-centric products. The {role} position directly aligns with my passion for building resilient, scalable systems with {skills}. I would love the opportunity to contribute my technical rigor and curiosity to help your team hit its engineering milestones.",
    tags: ['motivation', 'culture', 'company'],
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'snip-notice-period',
    title: 'Notice Period & Availability',
    category: 'logistics',
    content:
      'I am available to start immediately upon completing the interview process and finalizing offer details.',
    tags: ['availability', 'timeline'],
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'snip-relocation',
    title: 'Relocation & Work Preference',
    category: 'logistics',
    content:
      'Open to fully remote, hybrid, or on-site arrangements. Willing to relocate for the right opportunity.',
    tags: ['location', 'remote', 'hybrid'],
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'snip-proudest-project',
    title: 'Proudest Technical Project',
    category: 'technical',
    content:
      'Architected and deployed a full-stack platform utilizing modern web standards, modular state management, and optimized database indexing. Engineered end-to-end responsiveness, offline resilience, and automated testing, reducing latency by over 40% and ensuring zero data loss.',
    tags: ['project', 'architecture', 'scalability'],
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'snip-challenge',
    title: 'Overcoming a Technical Challenge',
    category: 'behavioral',
    content:
      'When faced with a complex production bottleneck, I isolated the root cause through systematic profiling and synthetic load tests. Rather than applying a quick patch, I refactored the underlying data flow, documented the architecture for the team, and added regression tests to permanently prevent future occurrences.',
    tags: ['problem-solving', 'debugging', 'leadership'],
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'snip-work-auth',
    title: 'Work Authorization Summary',
    category: 'logistics',
    content:
      'Legally authorized to work without requiring current or future sponsorship.',
    tags: ['authorization', 'visa'],
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
];

export const DEFAULT_USER_PROFILE: UserProfile = {
  personal: {
    fullName: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
  },
  profiles: {
    linkedin: '',
    github: '',
    leetcode: '',
    portfolio: '',
    other: [],
  },
  education: {
    college: '',
    degree: '',
    branch: '',
    graduationYear: '',
    cgpa: '',
  },
  professional: {
    skills: [],
    summary: '',
  },
  documents: {
    resume: undefined,
  },
  settings: {
    theme: 'system',
    overwriteNonEmpty: false,
    hasCompletedOnboarding: false,
  },
  snippets: DEFAULT_ANSWER_SNIPPETS,
  personas: DEFAULT_PERSONAS,
  activePersonaId: 'fullstack',
};

function sanitizeString(val: unknown): string {
  if (typeof val !== 'string') return '';
  // Strip control characters while preserving valid newlines/spaces
  return val.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();
}

function sanitizeStringArray(val: unknown): string[] {
  if (!Array.isArray(val)) return [];
  return val
    .map((item) => sanitizeString(item))
    .filter((item) => item.length > 0);
}

export function validateAndSanitizeProfile(raw: unknown): { valid: boolean; profile?: UserProfile; errors?: string[] } {
  const errors: string[] = [];

  if (!raw || typeof raw !== 'object') {
    return { valid: false, errors: ['Profile data must be an object'] };
  }

  const obj = raw as Record<string, any>;
  const base = JSON.parse(JSON.stringify(DEFAULT_USER_PROFILE)) as UserProfile;

  // Personal
  if (obj.personal && typeof obj.personal === 'object') {
    base.personal.fullName = sanitizeString(obj.personal.fullName);
    base.personal.firstName = sanitizeString(obj.personal.firstName);
    base.personal.lastName = sanitizeString(obj.personal.lastName);
    base.personal.email = sanitizeString(obj.personal.email);
    base.personal.phone = sanitizeString(obj.personal.phone);
    base.personal.location = sanitizeString(obj.personal.location);

    // Auto-split name if first/last are missing
    if (base.personal.fullName && (!base.personal.firstName || !base.personal.lastName)) {
      const parts = base.personal.fullName.split(/\s+/).filter(Boolean);
      if (parts.length > 0 && !base.personal.firstName) {
        base.personal.firstName = parts[0];
      }
      if (parts.length > 1 && !base.personal.lastName) {
        base.personal.lastName = parts.slice(1).join(' ');
      }
    }
  }

  // Profiles
  if (obj.profiles && typeof obj.profiles === 'object') {
    base.profiles.linkedin = sanitizeString(obj.profiles.linkedin);
    base.profiles.github = sanitizeString(obj.profiles.github);
    base.profiles.leetcode = sanitizeString(obj.profiles.leetcode);
    base.profiles.portfolio = sanitizeString(obj.profiles.portfolio);

    if (Array.isArray(obj.profiles.other)) {
      base.profiles.other = obj.profiles.other
        .filter((link: any) => link && typeof link === 'object')
        .map((link: any, idx: number) => ({
          id: sanitizeString(link.id) || `link-${idx}-${Date.now()}`,
          name: sanitizeString(link.name) || 'Custom Link',
          url: sanitizeString(link.url),
        }))
        .filter((link: any) => Boolean(link.url));
    }
  }

  // Education
  if (obj.education && typeof obj.education === 'object') {
    base.education.college = sanitizeString(obj.education.college);
    base.education.degree = sanitizeString(obj.education.degree);
    base.education.branch = sanitizeString(obj.education.branch);
    base.education.graduationYear = sanitizeString(obj.education.graduationYear);
    base.education.cgpa = sanitizeString(obj.education.cgpa);
  }

  // Professional
  if (obj.professional && typeof obj.professional === 'object') {
    base.professional.skills = sanitizeStringArray(obj.professional.skills);
    base.professional.summary = sanitizeString(obj.professional.summary);
  }

  // Documents
  if (obj.documents && typeof obj.documents === 'object' && obj.documents.resume) {
    const resume = obj.documents.resume;
    if (typeof resume === 'object') {
      base.documents.resume = {
        name: sanitizeString(resume.name) || 'resume.pdf',
        lastUpdated: sanitizeString(resume.lastUpdated) || new Date().toISOString(),
        sizeBytes: typeof resume.sizeBytes === 'number' ? resume.sizeBytes : undefined,
        type: sanitizeString(resume.type) || 'application/pdf',
        data: typeof resume.data === 'string' ? resume.data : undefined,
      };
    }
  }

  // Settings
  if (obj.settings && typeof obj.settings === 'object') {
    if (['light', 'dark', 'system'].includes(obj.settings.theme)) {
      base.settings.theme = obj.settings.theme;
    }
    if (typeof obj.settings.overwriteNonEmpty === 'boolean') {
      base.settings.overwriteNonEmpty = obj.settings.overwriteNonEmpty;
    }
    if (typeof obj.settings.hasCompletedOnboarding === 'boolean') {
      base.settings.hasCompletedOnboarding = obj.settings.hasCompletedOnboarding;
    }
  }

  // Snippets
  if (Array.isArray(obj.snippets)) {
    const validCategories: SnippetCategory[] = ['general', 'behavioral', 'technical', 'logistics'];
    base.snippets = obj.snippets
      .filter((s: any) => s && typeof s === 'object')
      .map((s: any, idx: number) => {
        const cat: SnippetCategory = validCategories.includes(s.category) ? s.category : 'general';
        return {
          id: sanitizeString(s.id) || `snip-${idx}-${Date.now()}`,
          title: sanitizeString(s.title) || 'Untitled Snippet',
          category: cat,
          content: sanitizeString(s.content),
          tags: sanitizeStringArray(s.tags),
          shortcut: sanitizeString(s.shortcut) || undefined,
          updatedAt: sanitizeString(s.updatedAt) || new Date().toISOString(),
        };
      })
      .filter((s: AnswerSnippet) => s.content.length > 0 || s.title.length > 0);
  } else {
    base.snippets = DEFAULT_ANSWER_SNIPPETS;
  }

  // Personas
  if (Array.isArray(obj.personas)) {
    base.personas = obj.personas
      .filter((p: any) => p && typeof p === 'object')
      .map((p: any, idx: number) => ({
        id: sanitizeString(p.id) || `persona-${idx}-${Date.now()}`,
        name: sanitizeString(p.name) || `Role Persona ${idx + 1}`,
        title: sanitizeString(p.title) || undefined,
        skills: sanitizeStringArray(p.skills),
        summary: sanitizeString(p.summary),
        portfolioUrl: sanitizeString(p.portfolioUrl) || undefined,
        githubUrl: sanitizeString(p.githubUrl) || undefined,
        linkedinUrl: sanitizeString(p.linkedinUrl) || undefined,
        isDefault: typeof p.isDefault === 'boolean' ? p.isDefault : idx === 0,
        createdAt: sanitizeString(p.createdAt) || new Date().toISOString(),
      }))
      .filter((p: ProfilePersona) => p.name.length > 0);

    if (base.personas.length === 0) {
      base.personas = DEFAULT_PERSONAS;
    }
  } else {
    base.personas = DEFAULT_PERSONAS;
  }

  if (typeof obj.activePersonaId === 'string' && obj.activePersonaId) {
    const exists = base.personas.some((p) => p.id === obj.activePersonaId);
    base.activePersonaId = exists ? obj.activePersonaId : base.personas[0]?.id;
  } else {
    const defaultPersona = base.personas.find((p) => p.isDefault) || base.personas[0];
    base.activePersonaId = defaultPersona?.id || 'persona-default';
  }

  return { valid: true, profile: base, errors };
}

export function validateExportData(rawJson: string): { valid: boolean; data?: ProfileExportData; error?: string } {
  try {
    const parsed = JSON.parse(rawJson);
    if (!parsed || typeof parsed !== 'object') {
      return { valid: false, error: 'Imported file does not contain valid JSON object' };
    }

    if (!parsed.version || typeof parsed.version !== 'number') {
      return { valid: false, error: 'Missing or invalid schema version' };
    }

    if (parsed.version > CURRENT_SCHEMA_VERSION) {
      return {
        valid: false,
        error: `Incompatible backup version (${parsed.version}). This version of ApplyKit supports up to version ${CURRENT_SCHEMA_VERSION}.`,
      };
    }

    const { valid, profile, errors } = validateAndSanitizeProfile(parsed.profile);
    if (!valid || !profile) {
      return { valid: false, error: errors?.join(', ') || 'Invalid profile structure' };
    }

    return {
      valid: true,
      data: {
        version: CURRENT_SCHEMA_VERSION,
        exportedAt: parsed.exportedAt || new Date().toISOString(),
        profile,
      },
    };
  } catch (err) {
    return { valid: false, error: `JSON Parse error: ${(err as Error).message}` };
  }
}
