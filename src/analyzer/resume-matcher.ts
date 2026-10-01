import { UserProfile } from '../types/profile';
import { ExtractedJobRequirements } from './keyword-extractor';
import { findCanonicalSkill, TechSkill } from './skills-dictionary';

export interface ResumeMatchReport {
  matchPercentage: number;
  matchedSkills: Array<{ canonical: string; category: TechSkill['category']; requiredByJob: boolean }>;
  missingSkills: Array<{ canonical: string; category: TechSkill['category']; frequency: number; isRequired: boolean }>;
  userExtraSkills: string[];
  suggestions: string[];
  summaryMatch: {
    containsJobTitle: boolean;
    missingKeyTermsInSummary: string[];
  };
}

export function analyzeResumeMatch(
  profile: UserProfile,
  jobReqs: ExtractedJobRequirements
): ResumeMatchReport {
  const userSkillStrings = profile.professional.skills || [];
  const userSummary = (profile.professional.summary || '').toLowerCase();

  // Normalize user skills to canonical names
  const userCanonicalMap = new Map<string, string>(); // canonical -> original user string
  for (const raw of userSkillStrings) {
    const canonical = findCanonicalSkill(raw);
    if (canonical) {
      userCanonicalMap.set(canonical.canonical, raw);
    } else {
      userCanonicalMap.set(raw.trim(), raw.trim());
    }
  }

  const matchedSkills: ResumeMatchReport['matchedSkills'] = [];
  const missingSkills: ResumeMatchReport['missingSkills'] = [];

  let requiredSkillCount = 0;
  let matchedRequiredSkillCount = 0;
  let totalScoreNumerator = 0;
  let totalScoreDenominator = 0;

  for (const extracted of jobReqs.extractedSkills) {
    const weight = extracted.isRequired ? 2.5 : 1.0;
    totalScoreDenominator += weight;

    if (extracted.isRequired) {
      requiredSkillCount++;
    }

    if (userCanonicalMap.has(extracted.canonical)) {
      matchedSkills.push({
        canonical: extracted.canonical,
        category: extracted.category,
        requiredByJob: extracted.isRequired,
      });
      totalScoreNumerator += weight;
      if (extracted.isRequired) {
        matchedRequiredSkillCount++;
      }
    } else {
      missingSkills.push({
        canonical: extracted.canonical,
        category: extracted.category,
        frequency: extracted.frequency,
        isRequired: extracted.isRequired,
      });
    }
  }

  // Calculate percentage
  let matchPercentage = 0;
  if (totalScoreDenominator > 0) {
    matchPercentage = Math.min(100, Math.round((totalScoreNumerator / totalScoreDenominator) * 100));
  } else {
    // If no specific tech skills were extracted from the JD, default to 85%
    matchPercentage = 85;
  }

  // Identify user skills not in JD
  const userExtraSkills: string[] = [];
  userCanonicalMap.forEach((orig, canonical) => {
    const foundInJd = jobReqs.extractedSkills.some((s) => s.canonical === canonical);
    if (!foundInJd) {
      userExtraSkills.push(orig);
    }
  });

  // Summary analysis
  const containsJobTitle = userSummary.includes(jobReqs.jobTitle.toLowerCase());
  const topJobSkills = jobReqs.extractedSkills.slice(0, 5).map((s) => s.canonical);
  const missingKeyTermsInSummary = topJobSkills.filter((term) => !userSummary.includes(term.toLowerCase()));

  // Generate actionable resume improvement suggestions
  const suggestions: string[] = [];

  // Top missing required skills
  const topMissingRequired = missingSkills.filter((s) => s.isRequired).slice(0, 3);
  if (topMissingRequired.length > 0) {
    const names = topMissingRequired.map((s) => `"${s.canonical}"`).join(', ');
    suggestions.push(`High priority: Add ${names} to your skills list or project highlights to clear ATS keyword filters.`);
  }

  // Missing high frequency skills
  const topMissingPreferred = missingSkills.filter((s) => !s.isRequired).slice(0, 3);
  if (topMissingPreferred.length > 0) {
    const names = topMissingPreferred.map((s) => `"${s.canonical}"`).join(', ');
    suggestions.push(`Bonus keywords: Mention experience with ${names} if applicable.`);
  }

  // Summary suggestion
  if (!containsJobTitle && jobReqs.jobTitle !== 'Software Engineer') {
    suggestions.push(`Align your summary by explicitly stating your target role as "${jobReqs.jobTitle}".`);
  }

  if (missingKeyTermsInSummary.length > 0 && userSummary.length > 0) {
    const missingSample = missingKeyTermsInSummary.slice(0, 2).map((s) => `"${s}"`).join(' and ');
    suggestions.push(`Weave ${missingSample} into your professional bio to emphasize immediate relevance.`);
  }

  if (matchedSkills.length > 0) {
    const topMatched = matchedSkills.slice(0, 4).map((s) => s.canonical).join(', ');
    suggestions.push(`Strong alignment: You have solid coverage on ${topMatched}.`);
  }

  return {
    matchPercentage,
    matchedSkills,
    missingSkills,
    userExtraSkills,
    suggestions,
    summaryMatch: {
      containsJobTitle,
      missingKeyTermsInSummary,
    },
  };
}
