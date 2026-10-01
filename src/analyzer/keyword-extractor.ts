import { SKILLS_DICTIONARY, TechSkill } from './skills-dictionary';

export interface ExtractedSkill {
  canonical: string;
  category: TechSkill['category'];
  frequency: number;
  isRequired: boolean;
  score: number;
}

export interface ExtractedJobRequirements {
  jobTitle: string;
  seniority: 'Intern' | 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Staff' | 'General';
  extractedSkills: ExtractedSkill[];
  totalSkillsFound: number;
}


const SENIORITY_PATTERNS: Array<{ level: ExtractedJobRequirements['seniority']; regex: RegExp }> = [
  { level: 'Intern', regex: /\b(intern|internship|co-op)\b/i },
  { level: 'Staff', regex: /\b(staff|principal|distinguished|director)\b/i },
  { level: 'Lead', regex: /\b(lead|tech\s*lead|team\s*lead|manager)\b/i },
  { level: 'Senior', regex: /\b(senior|sr\.?|sr\b|lead|experienced)\b/i },
  { level: 'Junior', regex: /\b(junior|jr\.?|entry\s*level|associate|new\s*grad)\b/i },
  { level: 'Mid', regex: /\b(mid\s*level|intermediate)\b/i },
];

const JOB_TITLE_PATTERNS = [
  /(?:senior\s+|lead\s+|staff\s+|junior\s+)?(?:full\s*stack|frontend|front\s*end|backend|back\s*end|software|devops|cloud|infrastructure|platform|site\s*reliability|data|machine\s*learning|ai|mobile|ios|android|qa|security)\s*(?:engineer|developer|architect|specialist)/i,
  /(?:engineering\s*manager|tech\s*lead|solutions\s*architect|technical\s*program\s*manager)/i,
];

export function extractJobRequirements(jdText: string, fallbackTitle?: string): ExtractedJobRequirements {
  const text = jdText || '';
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  // 1. Infer Job Title
  let jobTitle = fallbackTitle || '';
  if (!jobTitle) {
    for (const line of lines.slice(0, 10)) {
      for (const pattern of JOB_TITLE_PATTERNS) {
        const match = line.match(pattern);
        if (match) {
          jobTitle = match[0];
          break;
        }
      }
      if (jobTitle) break;
    }
  }
  if (!jobTitle) {
    jobTitle = 'Software Engineer';
  }

  // 2. Infer Seniority
  let seniority: ExtractedJobRequirements['seniority'] = 'General';
  for (const item of SENIORITY_PATTERNS) {
    if (item.regex.test(jobTitle) || item.regex.test(text.slice(0, 500))) {
      seniority = item.level;
      break;
    }
  }

  // Map canonical skill -> stats
  const skillOccurrences: Map<string, { skill: TechSkill; count: number; isRequired: boolean; weightedScore: number }> = new Map();

  // Normalize text for matching
  const normalizedLower = text.toLowerCase();

  for (const skill of SKILLS_DICTIONARY) {
    let totalMatches = 0;
    let isRequired = false;
    let weightedScore = 0;

    for (const alias of skill.aliases) {
      // Escape for regex
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Ensure word boundaries or clean token separation
      const regex = new RegExp(`(^|[^a-z0-9+#])${escaped}($|[^a-z0-9+#])`, 'gi');

      let match;
      while ((match = regex.exec(normalizedLower)) !== null) {
        totalMatches++;
        const matchIndex = match.index;

        // Check which section this match is in by finding the nearest preceding heading
        const contextBefore = normalizedLower.slice(Math.max(0, matchIndex - 600), matchIndex);
        const reqMatches = [...contextBefore.matchAll(/(?:requirements|qualifications|must\s*have|what\s*you(?:'ll|\s*will)\s*bring|basic\s*qualifications|minimum\s*qualifications|key\s*requirements)/gi)];
        const prefMatches = [...contextBefore.matchAll(/(?:preferred|nice\s*to\s*have|bonus|plus|desired\s*qualifications|good\s*to\s*have)/gi)];

        const lastReqIndex = reqMatches.length > 0 ? reqMatches[reqMatches.length - 1].index! : -1;
        const lastPrefIndex = prefMatches.length > 0 ? prefMatches[prefMatches.length - 1].index! : -1;

        if (lastReqIndex > lastPrefIndex) {
          weightedScore += 2.0;
          isRequired = true;
        } else if (lastPrefIndex > lastReqIndex) {
          weightedScore += 0.8;
        } else {
          weightedScore += 1.0;
        }
      }
    }

    if (totalMatches > 0) {
      skillOccurrences.set(skill.canonical, {
        skill,
        count: totalMatches,
        isRequired,
        weightedScore,
      });
    }
  }

  const extractedSkills: ExtractedSkill[] = Array.from(skillOccurrences.values())
    .map(({ skill, count, isRequired, weightedScore }) => ({
      canonical: skill.canonical,
      category: skill.category,
      frequency: count,
      isRequired,
      score: Math.round(weightedScore * 10) / 10,
    }))
    // Sort by weighted score descending, then by frequency
    .sort((a, b) => b.score - a.score || b.frequency - a.frequency);

  return {
    jobTitle: cleanJobTitle(jobTitle),
    seniority,
    extractedSkills,
    totalSkillsFound: extractedSkills.length,
  };
}

function cleanJobTitle(raw: string): string {
  return raw
    .replace(/^[\s\-–—:|•*]+/, '')
    .replace(/[\s\-–—:|•*]+$/, '')
    .trim();
}
