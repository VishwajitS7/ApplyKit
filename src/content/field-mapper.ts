import { FieldType, FieldSignal } from '../types/detection';
import { UserProfile } from '../types/profile';

interface RuleDefinition {
  type: FieldType;
  primaryRegex: RegExp;
  secondaryRegex?: RegExp;
  strongConfidence: number;
  secondaryConfidence: number;
  autocompleteValues?: string[];
  inputTypeMatches?: string[];
}

const FIELD_RULES: RuleDefinition[] = [
  // 1. LinkedIn
  {
    type: 'linkedin',
    primaryRegex: /\b(linkedin|linked\s*in)\b/i,
    secondaryRegex: /\b(professional\s*profile|professional\s*link|social\s*profile)\b/i,
    strongConfidence: 0.98,
    secondaryConfidence: 0.65,
  },
  // 2. GitHub
  {
    type: 'github',
    primaryRegex: /\b(github|git\s*hub)\b/i,
    secondaryRegex: /\b(code\s*repository|git\s*profile|open\s*source\s*profile)\b/i,
    strongConfidence: 0.98,
    secondaryConfidence: 0.65,
  },
  // 3. LeetCode
  {
    type: 'leetcode',
    primaryRegex: /\b(leetcode|leet\s*code|hackerrank|codeforces)\b/i,
    secondaryRegex: /\b(coding\s*profile|competitive\s*programming)\b/i,
    strongConfidence: 0.98,
    secondaryConfidence: 0.72,
  },
  // 4. Portfolio / Personal Website
  {
    type: 'portfolio',
    primaryRegex: /\b(portfolio|personal\s*website|personal\s*site|personal\s*url|personal\s*link)\b/i,
    secondaryRegex: /\b(website|homepage|web\s*site|other\s*link)\b/i,
    strongConfidence: 0.95,
    secondaryConfidence: 0.60,
  },
  // 5. Email
  {
    type: 'email',
    primaryRegex: /\b(email|e-mail|email\s*address|electronic\s*mail)\b/i,
    secondaryRegex: /\b(contact\s*email|mail)\b/i,
    strongConfidence: 0.99,
    secondaryConfidence: 0.85,
    autocompleteValues: ['email'],
    inputTypeMatches: ['email'],
  },
  // 6. Phone
  {
    type: 'phone',
    primaryRegex: /\b(phone|mobile|cell|telephone|contact\s*number|phone\s*number|mobile\s*number)\b/i,
    secondaryRegex: /\b(contact|cellphone)\b/i,
    strongConfidence: 0.98,
    secondaryConfidence: 0.70,
    autocompleteValues: ['tel', 'tel-national', 'tel-country-code'],
    inputTypeMatches: ['tel'],
  },
  // 7. Full Name
  {
    type: 'fullName',
    primaryRegex: /\b(full\s*name|candidate\s*name|applicant\s*name|your\s*name|complete\s*name)\b/i,
    secondaryRegex: /^(name|legal\s*name)$/i,
    strongConfidence: 0.95,
    secondaryConfidence: 0.75,
    autocompleteValues: ['name'],
  },
  // 8. First Name
  {
    type: 'firstName',
    primaryRegex: /\b(first\s*name|given\s*name|forename|fname)\b/i,
    strongConfidence: 0.95,
    secondaryConfidence: 0.80,
    autocompleteValues: ['given-name'],
  },
  // 9. Last Name
  {
    type: 'lastName',
    primaryRegex: /\b(last\s*name|family\s*name|surname|lname)\b/i,
    strongConfidence: 0.95,
    secondaryConfidence: 0.80,
    autocompleteValues: ['family-name'],
  },
  // 10. College / University
  {
    type: 'college',
    primaryRegex: /\b(college|university|institution|school\s*name|alma\s*mater)\b/i,
    secondaryRegex: /\b(institute|school)\b/i,
    strongConfidence: 0.92,
    secondaryConfidence: 0.65,
  },
  // 11. Degree
  {
    type: 'degree',
    primaryRegex: /\b(degree|highest\s*degree|qualification|educational\s*qualification|education\s*level)\b/i,
    secondaryRegex: /\b(program|course\s*of\s*study)\b/i,
    strongConfidence: 0.90,
    secondaryConfidence: 0.65,
  },
  // 12. Branch / Major
  {
    type: 'branch',
    primaryRegex: /\b(branch|major|field\s*of\s*study|specialization|discipline|department)\b/i,
    secondaryRegex: /\b(stream|focus\s*area)\b/i,
    strongConfidence: 0.92,
    secondaryConfidence: 0.68,
  },
  // 13. Graduation Year
  {
    type: 'graduationYear',
    primaryRegex: /\b(graduation\s*year|year\s*of\s*graduation|passing\s*year|year\s*of\s*passing|grad\s*year|batch)\b/i,
    secondaryRegex: /\b(completion\s*year|end\s*year)\b/i,
    strongConfidence: 0.95,
    secondaryConfidence: 0.70,
  },
  // 14. CGPA / GPA
  {
    type: 'cgpa',
    primaryRegex: /\b(cgpa|gpa|grade\s*point|percentage|marks|academic\s*score|academic\s*percentage)\b/i,
    secondaryRegex: /\b(score|grade)\b/i,
    strongConfidence: 0.94,
    secondaryConfidence: 0.60,
  },
  // 15. Skills
  {
    type: 'skills',
    primaryRegex: /\b(skills|technical\s*skills|key\s*skills|technologies|core\s*skills|areas\s*of\s*expertise)\b/i,
    secondaryRegex: /\b(competencies|tech\s*stack|tools)\b/i,
    strongConfidence: 0.92,
    secondaryConfidence: 0.65,
  },
  // 16. Professional Summary / Bio / Cover Letter / Notes
  {
    type: 'summary',
    primaryRegex: /\b(professional\s*summary|about\s*you|about\s*me|bio\b|brief\s*bio|cover\s*letter|cover\s*letter\s*note|cover\s*letter\s*text|short\s*intro)\b/i,
    secondaryRegex: /\b(summary|overview|introduction|comments|additional\s*info|additional\s*information|additional\s*comments|candidate\s*note)\b/i,
    strongConfidence: 0.90,
    secondaryConfidence: 0.65,
  },
];

export interface MappingResult {
  type: FieldType;
  confidence: number;
  matchedRule?: string;
}

export function mapSignalsToFieldType(signals: FieldSignal[]): MappingResult {
  // Check exact HTML type or autocomplete matches first (high signal)
  for (const signal of signals) {
    if (signal.source === 'type') {
      const text = signal.text.toLowerCase();
      if (text === 'email') return { type: 'email', confidence: 0.99, matchedRule: 'type=email' };
      if (text === 'tel') return { type: 'phone', confidence: 0.98, matchedRule: 'type=tel' };
    }
    if (signal.source === 'autocomplete') {
      const text = signal.text.toLowerCase();
      for (const rule of FIELD_RULES) {
        if (rule.autocompleteValues?.includes(text)) {
          return { type: rule.type, confidence: 0.98, matchedRule: `autocomplete=${text}` };
        }
      }
    }
  }

  // Aggregate signals with weighting
  // Prioritize: label (weight 3), name/id (weight 2), placeholder/aria (weight 2), nearbyText (weight 1)
  const candidateScores: Map<FieldType, { score: number; bestMatch: string }> = new Map();

  for (const signal of signals) {
    const rawText = signal.text.trim();
    if (!rawText) continue;

    const normalizedText = rawText.replace(/[_-]+/g, ' ');

    for (const rule of FIELD_RULES) {
      let matchConfidence = 0;

      if (rule.primaryRegex.test(rawText) || rule.primaryRegex.test(normalizedText)) {
        matchConfidence = rule.strongConfidence;
      } else if (
        (rule.secondaryRegex && rule.secondaryRegex.test(rawText)) ||
        (rule.secondaryRegex && rule.secondaryRegex.test(normalizedText))
      ) {
        matchConfidence = rule.secondaryConfidence;
      }

      if (matchConfidence > 0) {
        // Apply signal weight multiplier
        const weightedScore = matchConfidence * (signal.weight || 1);
        const existing = candidateScores.get(rule.type);
        if (!existing || weightedScore > existing.score) {
          candidateScores.set(rule.type, {
            score: weightedScore,
            bestMatch: `${signal.source}: "${rawText.slice(0, 30)}"`,
          });
        }
      }
    }
  }

  // Find highest candidate
  let bestType: FieldType = 'unknown';
  let bestScore = 0;
  let bestMatchDesc = '';

  candidateScores.forEach((val, type) => {
    // Normalize score to 0.0 - 1.0 (since max weight is 3)
    const normalized = Math.min(1.0, Math.round((val.score / 3) * 100) / 100);
    if (normalized > bestScore) {
      bestScore = normalized;
      bestType = type;
      bestMatchDesc = val.bestMatch;
    }
  });

  if (bestScore < 0.40) {
    return { type: 'unknown', confidence: 0 };
  }

  return {
    type: bestType,
    confidence: bestScore,
    matchedRule: bestMatchDesc,
  };
}

export function getProfileValueForField(type: FieldType, profile: UserProfile): string {
  switch (type) {
    case 'fullName':
      return profile.personal.fullName || '';
    case 'firstName':
      return (
        profile.personal.firstName ||
        profile.personal.fullName.split(' ')[0] ||
        ''
      );
    case 'lastName':
      return (
        profile.personal.lastName ||
        profile.personal.fullName.split(' ').slice(1).join(' ') ||
        ''
      );
    case 'email':
      return profile.personal.email || '';
    case 'phone':
      return profile.personal.phone || '';
    case 'linkedin':
      return profile.profiles.linkedin || '';
    case 'github':
      return profile.profiles.github || '';
    case 'leetcode':
      return profile.profiles.leetcode || '';
    case 'portfolio':
      return profile.profiles.portfolio || '';
    case 'college':
      return profile.education.college || '';
    case 'degree':
      return profile.education.degree || '';
    case 'branch':
      return profile.education.branch || '';
    case 'graduationYear':
      return profile.education.graduationYear || '';
    case 'cgpa':
      return profile.education.cgpa || '';
    case 'skills':
      return (profile.professional.skills || []).join(', ');
    case 'summary':
      return profile.professional.summary || '';
    default:
      return '';
  }
}

export function getHumanReadableLabelForType(type: FieldType): string {
  switch (type) {
    case 'fullName': return 'Full Name';
    case 'firstName': return 'First Name';
    case 'lastName': return 'Last Name';
    case 'email': return 'Email Address';
    case 'phone': return 'Phone Number';
    case 'linkedin': return 'LinkedIn Profile URL';
    case 'github': return 'GitHub Profile URL';
    case 'leetcode': return 'LeetCode Profile URL';
    case 'portfolio': return 'Portfolio / Website';
    case 'college': return 'College / University';
    case 'degree': return 'Degree';
    case 'branch': return 'Branch / Major';
    case 'graduationYear': return 'Graduation Year';
    case 'cgpa': return 'CGPA / GPA';
    case 'skills': return 'Skills';
    case 'summary': return 'Professional Summary';
    default: return 'Unknown Field';
  }
}
