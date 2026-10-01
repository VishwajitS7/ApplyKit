export interface PersonalInfo {
  fullName: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  location?: string;
}

export interface CustomProfileLink {
  id: string;
  name: string;
  url: string;
}

export interface OnlineProfiles {
  linkedin?: string;
  github?: string;
  leetcode?: string;
  portfolio?: string;
  other?: CustomProfileLink[];
}

export interface EducationInfo {
  college?: string;
  degree?: string;
  branch?: string;
  graduationYear?: string;
  cgpa?: string;
}

export interface ProfessionalInfo {
  skills?: string[];
  summary?: string;
}

export interface ResumeDocument {
  name: string;
  lastUpdated?: string;
  sizeBytes?: number;
  type?: string;
  data?: string; // base64 representation if stored locally
}

export interface DocumentsInfo {
  resume?: ResumeDocument;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  overwriteNonEmpty: boolean;
  hasCompletedOnboarding: boolean;
}

export type SnippetCategory = 'general' | 'behavioral' | 'technical' | 'logistics';

export interface AnswerSnippet {
  id: string;
  title: string;
  category: SnippetCategory;
  content: string;
  tags?: string[];
  shortcut?: string;
  updatedAt?: string;
}

export interface ProfilePersona {
  id: string;
  name: string;
  title?: string;
  skills: string[];
  summary: string;
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  isDefault?: boolean;
  createdAt?: string;
}

export interface UserProfile {
  personal: PersonalInfo;
  profiles: OnlineProfiles;
  education: EducationInfo;
  professional: ProfessionalInfo;
  documents: DocumentsInfo;
  settings: UserSettings;
  snippets?: AnswerSnippet[];
  personas?: ProfilePersona[];
  activePersonaId?: string;
}

export function getEffectiveProfile(profile: UserProfile): UserProfile {
  if (!profile.personas || profile.personas.length === 0 || !profile.activePersonaId) {
    return profile;
  }

  const activePersona = profile.personas.find((p) => p.id === profile.activePersonaId);
  if (!activePersona) {
    return profile;
  }

  return {
    ...profile,
    profiles: {
      ...profile.profiles,
      portfolio: activePersona.portfolioUrl || profile.profiles.portfolio,
      github: activePersona.githubUrl || profile.profiles.github,
      linkedin: activePersona.linkedinUrl || profile.profiles.linkedin,
    },
    professional: {
      skills:
        activePersona.skills && activePersona.skills.length > 0
          ? activePersona.skills
          : profile.professional.skills,
      summary: activePersona.summary || profile.professional.summary,
    },
  };
}

export interface ProfileExportData {
  version: 1;
  exportedAt: string;
  profile: UserProfile;
}

export interface CompletenessResult {
  percentage: number;
  totalFields: number;
  completedFields: number;
  missingFields: Array<{ key: string; label: string; priority: number }>;
  nextSuggestion: string;
}
