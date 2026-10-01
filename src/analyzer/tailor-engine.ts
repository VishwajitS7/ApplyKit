import { UserProfile } from '../types/profile';
import { ExtractedJobRequirements } from './keyword-extractor';
import { ResumeMatchReport } from './resume-matcher';
import { findCanonicalSkill } from './skills-dictionary';

export interface CoverLetters {
  standard: string;
  short: string;
}

export interface ColdOutreach {
  recruiterInMail: string;
  hiringManagerEmail: {
    subject: string;
    body: string;
  };
  elevatorPitch: string;
}

export interface TailoredProfileResult {
  prioritizedSkills: string[];
  tailoredSummaries: {
    impact: string;
    specialist: string;
    adaptable: string;
  };
  coverLetters: CoverLetters;
  coldOutreach: ColdOutreach;
  highlightedKeywords: string[];
}

export function generateTailoredProfile(
  profile: UserProfile,
  jobReqs: ExtractedJobRequirements,
  matchReport: ResumeMatchReport
): TailoredProfileResult {
  const originalSkills = profile.professional.skills || [];
  const rawTitle = jobReqs.jobTitle || 'Software Engineer';
  
  // Extract company if present in title (e.g. "Software Engineer at Google")
  let targetTitle = rawTitle;
  let targetCompany = 'your team';
  if (rawTitle.includes(' at ')) {
    const parts = rawTitle.split(' at ');
    targetTitle = parts[0].trim();
    targetCompany = parts[1].trim();
  }

  // 1. Prioritize Tech Stack
  // Matching skills first (ordered by JD priority), then other skills
  const matchedCanonicalSet = new Set(matchReport.matchedSkills.map((s) => s.canonical));

  const matchingUserSkills: string[] = [];
  const otherUserSkills: string[] = [];

  // Preserve user's original casing/string format
  for (const rawSkill of originalSkills) {
    const canonical = findCanonicalSkill(rawSkill);
    const key = canonical ? canonical.canonical : rawSkill.trim();

    if (matchedCanonicalSet.has(key)) {
      matchingUserSkills.push(rawSkill);
    } else {
      otherUserSkills.push(rawSkill);
    }
  }

  // Sort matchingUserSkills according to the JD requirement frequency/score
  matchingUserSkills.sort((a, b) => {
    const canA = findCanonicalSkill(a)?.canonical || a;
    const canB = findCanonicalSkill(b)?.canonical || b;
    const scoreA = jobReqs.extractedSkills.find((s) => s.canonical === canA)?.score || 0;
    const scoreB = jobReqs.extractedSkills.find((s) => s.canonical === canB)?.score || 0;
    return scoreB - scoreA;
  });

  const prioritizedSkills = [...matchingUserSkills, ...otherUserSkills];

  // 2. Synthesize Tailored Summaries
  const topMatched = matchReport.matchedSkills.slice(0, 4).map((s) => s.canonical);
  const techStackString = topMatched.length > 0 ? topMatched.join(', ') : 'modern full-stack technologies';
  const primarySkill = topMatched[0] || prioritizedSkills[0] || 'Software Engineering';

  // Option 1: Impact & Scalability
  const impactSummary = [
    `${targetTitle} with proven experience designing and delivering scalable systems using ${techStackString}.`,
    `Passionate about clean architecture, high performance, and shipping reliable features from concept to production.`,
    `Demonstrated track record of cross-functional execution and technical excellence.`,
  ].join(' ');

  // Option 2: Core Stack Specialist
  const specialistSummary = [
    `Hands-on ${targetTitle} specializing in ${techStackString}.`,
    `Strong foundations in building robust APIs, responsive interfaces, and maintainable distributed systems.`,
    `Excels in fast-paced environments where code quality, performance, and user experience are paramount.`,
  ].join(' ');

  // Option 3: Adaptable & Full-Lifecycle
  const adaptableSummary = [
    `Results-driven ${targetTitle} experienced across the full development lifecycle with core strengths in ${techStackString}.`,
    `Quick to adapt to emerging technical challenges and passionate about continuous learning, modern development workflows, and delivering tangible impact.`,
  ].join(' ');

  // 3. Synthesize Cover Letters
  const candidateName = profile.personal.fullName || 'Candidate';
  const candidateEmail = profile.personal.email || '';
  const candidatePhone = profile.personal.phone || '';
  const portfolioLink = profile.profiles.portfolio || profile.profiles.github || profile.profiles.linkedin || '';
  const eduSnippet = profile.education.degree
    ? ` and background in ${profile.education.degree}${profile.education.college ? ` from ${profile.education.college}` : ''}`
    : '';

  const contactLine = [candidateEmail, candidatePhone].filter(Boolean).join(' | ');

  const standardCoverLetter = [
    `Dear Hiring Team at ${targetCompany},`,
    '',
    `I am writing to express my enthusiastic interest in the ${targetTitle} role. With hands-on experience building reliable applications using ${techStackString}${eduSnippet}, I am excited by the opportunity to contribute directly to ${targetCompany}'s engineering goals.`,
    '',
    `Throughout my technical experience, I have focused on writing clean, modular code and engineering resilient systems that scale. In particular, working with ${techStackString} has enabled me to deliver responsive user experiences and maintainable architectures while minimizing latency and technical debt. I thrive in fast-moving, high-standard engineering teams where continuous improvement and thoughtful design are valued.`,
    '',
    `I would welcome the opportunity to discuss how my technical skills and proactive mindset align with your team's upcoming milestones.${portfolioLink ? ` You can explore my recent projects and code at ${portfolioLink}.` : ''}`,
    '',
    'Sincerely,',
    candidateName,
    contactLine,
  ].filter((line, i) => !(line === '' && i === 9 && !contactLine)).join('\n');

  const shortCoverLetter = [
    `Hi ${targetCompany} team,`,
    '',
    `I'm excited to apply for the ${targetTitle} opening. My background centers on building production-grade software with ${techStackString}, with an emphasis on performance, maintainable code, and high-impact delivery.`,
    '',
    `Whether developing responsive interfaces, optimizing backend flows, or tackling architectural bottlenecks, I bring an owner's mindset to shipping reliable software.${portfolioLink ? ` You can view my portfolio and work at ${portfolioLink}.` : ''} I'd love to connect for a quick conversation to see how I can add value to your team.`,
    '',
    'Best regards,',
    candidateName,
  ].join('\n');

  // 4. Synthesize Cold Outreach
  const recruiterInMail = [
    `Hi there! I noticed the ${targetTitle} opening at ${targetCompany} and was immediately drawn to what your team is building.`,
    `I specialize in ${techStackString} and have built scalable, production-ready systems with a focus on code quality and performance.${portfolioLink ? ` Feel free to check out my work here: ${portfolioLink}.` : ''}`,
    `Would love to connect and share how my experience aligns with your team's goals! Best, ${candidateName}`,
  ].join(' ');

  const hiringManagerEmailSubject = `Application: ${targetTitle} - ${candidateName} (${primarySkill})`;
  const hiringManagerEmailBody = [
    `Hi ${targetCompany} Team,`,
    '',
    `I hope you're having a productive week.`,
    '',
    `I saw that you're hiring for a ${targetTitle} and wanted to reach out directly. My core background is in ${techStackString}, where I've delivered robust, user-facing applications and maintainable services.`,
    '',
    `A few highlights of what I can contribute:`,
    `• Deep hands-on experience building and shipping with ${techStackString}.`,
    `• Strong engineering habits: clean architecture, performance optimization, and automated testing.`,
    `• A proactive, communicative approach to solving ambiguous technical challenges.`,
    '',
    portfolioLink ? `You can explore my projects and code at ${portfolioLink}.\n\n` : '',
    `Would you be open to a brief 10-minute chat this week to discuss how I could help ${targetCompany} achieve its engineering objectives?`,
    '',
    'Best regards,',
    candidateName,
    contactLine,
  ].join('\n');

  const elevatorPitch = `${targetTitle} with core strengths in ${techStackString}. Passionate about clean architecture, high performance, and shipping impactful software for ${targetCompany}.${portfolioLink ? ` Portfolio: ${portfolioLink}` : ''} — ${candidateName}`;

  return {
    prioritizedSkills,
    tailoredSummaries: {
      impact: impactSummary,
      specialist: specialistSummary,
      adaptable: adaptableSummary,
    },
    coverLetters: {
      standard: standardCoverLetter,
      short: shortCoverLetter,
    },
    coldOutreach: {
      recruiterInMail,
      hiringManagerEmail: {
        subject: hiringManagerEmailSubject,
        body: hiringManagerEmailBody,
      },
      elevatorPitch,
    },
    highlightedKeywords: topMatched,
  };
}
