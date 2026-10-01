import { SKILLS_DICTIONARY } from './skills-dictionary';
import { extractText as extractPdfText } from 'unpdf';

export interface ResumeExtractionResult {
  skills: string[];
  summary: string;
  categorizedSkills: {
    languages: string[];
    frontend: string[];
    backend: string[];
    cloud_devops: string[];
    databases: string[];
    testing: string[];
    ai_data: string[];
    architecture: string[];
    other: string[];
  };
  rawTextPreview: string;
  wordCount: number;
}

// Major resume section boundary patterns
const SECTION_BREAK_PATTERN =
  /(?:^|\n)\s*(?:#+\s*)?(?:experience|work\s*experience|professional\s*experience|employment\s*history|work\s*history|career\s*history|employment|education|academic\s*background|skills|technical\s*skills|core\s*competencies|key\s*skills|areas\s*of\s*expertise|projects|personal\s*projects|selected\s*projects|certifications|licenses|awards|honors|publications|activities|volunteering|languages|references)\b/i;

// Comprehensive summary header regex matching all common industry variations
const SUMMARY_HEADER_REGEX =
  /(?:^|\n)\s*(?:#+\s*)?(?:\*{1,2}|_{1,2})?(?:professional|executive|career|personal|candidate|core)?\s*(?:summary|overview|profile|objective|statement|highlights|qualifications|about\s*me|bio|biography|synopsis)(?:\s+of\s+qualifications)?(?:\*{1,2}|_{1,2})?\s*[:\-—|]?\s*\n?([\s\S]*?)(?=(?:^|\n)\s*(?:#+\s*)?(?:experience|work\s*experience|professional\s*experience|employment|work\s*history|career\s*history|education|academic|skills|technical\s*skills|core\s*competencies|key\s*skills|areas\s*of\s*expertise|projects|selected\s*projects|certifications|awards|honors|publications|languages|references)\b|$)/i;

// Skills section header regex matching any section dedicated to skills/tools/technologies
const SKILLS_SECTION_REGEX =
  /(?:^|\n)\s*(?:#+\s*)?(?:\*{1,2}|_{1,2})?(?:technical\s*skills|core\s*competencies|technical\s*competencies|skills\s*(?:&|and)\s*(?:technologies|tools|competencies|proficiencies)|skills\s*summary|key\s*skills|core\s*skills|skills|tools\s*(?:&|and)\s*technologies|technologies|proficiencies|areas\s*of\s*expertise|technical\s*expertise|toolbox|tech\s*stack|stack)(?:\*{1,2}|_{1,2})?\s*[:\-—|]?\s*\n?([\s\S]*?)(?=(?:^|\n)\s*(?:#+\s*)?(?:experience|work\s*experience|professional\s*experience|employment|work\s*history|career\s*history|education|projects|certifications|awards|summary|professional\s*summary|publications|references)\b|$)/gi;

// PDF internal structural markers and metadata keys that should never be extracted as text/skills
const PDF_METADATA_TOKENS = new Set([
  'reportlab', 'basefont', 'winansiencoding', 'mediabox', 'procset', 'imageb',
  'imagec', 'imagei', 'pagemode', 'usenone', 'creationdate', 'moddate',
  'flatedecode', 'fontdescriptor', 'xobject', 'keywords', 'unspecified',
  'producer', 'author', 'subject', 'catalog', 'length', 'annots', 'contents',
  'objstm', 'xref', 'trailer', 'startxref', 'stream', 'endstream', 'endobj',
  'fontname', 'fontbbox', 'fontfamily', 'capheight', 'ascent', 'descent',
  'stemv', 'italicangle', 'flags', 'filter', 'colorspace', 'devicergb',
  'devicegray', 'devicecmyk', 'type1', 'truetype', 'cidfonttype2', 'identity-h'
]);

// Comprehensive stop-words to prevent non-technical words, names, conversational terms, or web handles from becoming skills
const STOP_WORDS = new Set([
  'and', 'or', 'with', 'the', 'for', 'in', 'on', 'at', 'by', 'from', 'to', 'of', 'as',
  'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'using', 'used', 'use', 'via', 'including', 'such', 'like', 'etc', 'various', 'multiple',
  'proficient', 'experience', 'experienced', 'familiar', 'knowledge', 'strong', 'solid',
  'advanced', 'intermediate', 'basic', 'good', 'deep', 'hands', 'on', 'ability', 'skills',
  'technologies', 'tools', 'languages', 'frameworks', 'libraries', 'platforms', 'databases',
  'developer', 'engineer', 'architect', 'lead', 'senior', 'junior', 'intern', 'specialist',
  'software', 'hardware', 'web', 'mobile', 'full', 'stack', 'frontend', 'backend',
  'responsible', 'managed', 'developed', 'created', 'built', 'maintained', 'designed',
  'implemented', 'improved', 'increased', 'decreased', 'optimized', 'delivered', 'collaborated',
  'worked', 'led', 'participated', 'contributed', 'assisted', 'supported', 'authored',
  'team', 'project', 'company', 'organization', 'client', 'users', 'customers', 'business',
  'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september',
  'october', 'november', 'december', 'present', 'year', 'years', 'month', 'months',
  'bachelor', 'master', 'phd', 'degree', 'university', 'college', 'school', 'institute',
  'high', 'level', 'performance', 'solution', 'solutions', 'system', 'systems', 'application',
  'applications', 'product', 'products', 'process', 'processes', 'environment', 'environments',
  'management', 'leadership', 'communication', 'collaboration', 'stakeholder', 'strategy',
  'california', 'texas', 'york', 'washington', 'london', 'toronto', 'chicago', 'india',
  'united', 'states', 'america', 'remote', 'onsite', 'hybrid', 'fulltime', 'parttime',
  'overview', 'summary', 'profile', 'objective', 'education', 'experience', 'history',
  'department', 'director', 'manager', 'consultant', 'analyst', 'associate', 'operations',
  // Web & URL noise
  'https', 'http', 'www', 'com', 'org', 'net', 'app', 'io', 'dev', 'edu', 'gov', 'co', 'in',
  'url', 'link', 'links', 'website', 'portfolio', 'email', 'phone', 'location', 'address',
  'github', 'linkedin', 'leetcode', 'codeforces', 'geeksforgeeks', 'hackerrank', 'kaggle',
  'unspecified', 'keywords', 'interests', 'hobbies', 'references', 'declaration', 'curriculum', 'vitae', 'resume',
  ...Array.from(PDF_METADATA_TOKENS),
]);

/**
 * Validates whether a candidate term can legitimately be considered a technical skill.
 * Rejects random binary hashes, URL handles, PDF metadata keys, and non-technical strings.
 */
export function isValidTechSkillCandidate(term: string): boolean {
  if (!term) return false;
  const clean = term.trim();
  if (clean.length < 2 || clean.length > 32) return false;

  const lower = clean.toLowerCase();

  // 1. Must not be in stop-words or PDF metadata tokens
  if (STOP_WORDS.has(lower) || PDF_METADATA_TOKENS.has(lower)) return false;

  // 2. Reject URLs, domains, paths, and email addresses
  if (
    lower.startsWith('http') ||
    lower.startsWith('www.') ||
    lower.includes('.com') ||
    lower.includes('.org') ||
    lower.includes('.net') ||
    lower.includes('.app') ||
    lower.includes('.dev') ||
    lower.includes('.io') ||
    lower.includes('@') ||
    clean.includes('/') ||
    clean.includes('\\')
  ) {
    return false;
  }

  // 3. If it matches SKILLS_DICTIONARY directly (canonical or alias), it is a validated technical skill
  const isDictSkill = SKILLS_DICTIONARY.some(
    (s) => s.canonical.toLowerCase() === lower || s.aliases.includes(lower)
  );
  if (isDictSkill) return true;

  // 4. Reject forbidden binary or punctuation characters (quotes, percent, ampersand, equals, question mark, etc.)
  if (/["%&=?@!*^${}[\]~<>;]/.test(clean)) {
    return false;
  }

  // 5. Reject tokens with digits interspersed between letters (e.g. S9BLBi, Ff6pr, Qd09, VishwajitS7, BjEWLZ2d8erM)
  if (/[a-zA-Z]+[0-9]+[a-zA-Z]+/.test(clean)) {
    return false;
  }

  // 6. Must have at least one vowel (a, e, i, o, u, y) unless it is a recognized uppercase tech acronym
  const hasVowel = /[aeiouy]/i.test(clean);
  const isKnownAcronym = /^(?:c|c\+\+|c#|sql|r|go|php|aws|gcp|npm|sdk|cli|jwt|sso|ci|cd|tdd|bdd|api|apis|etl|elt|k8s|iac|css|css3|html|html5|xml|json|yaml|rest|grpc|crud|saas|paas|iaas|cdn|dns|waf|wasm|s3|ec2|ecs|eks|rds|db|ui|ai|ml|qa|pr)$/i.test(
    clean
  );

  if (!hasVowel && !isKnownAcronym) {
    return false;
  }

  // 7. If uppercase acronym >= 3 chars, it must match our known technical acronym whitelist
  if (/^[A-Z]{3,}$/.test(clean) && !isKnownAcronym) {
    return false;
  }

  return true;
}

/**
 * Enhanced extraction engine: analyzes technical terms, matches comprehensive dictionary,
 * deep-mines explicit skill sections, detects action bullet stacks, and reliably extracts or
 * synthesizes a high-impact professional summary.
 */
export function extractSkillsAndSummaryFromResumeText(rawText: string): ResumeExtractionResult {
  const text = (rawText || '').trim();

  // 1. Sanitize text for skill extraction by scrubbing URLs, email addresses, and social links
  const textForSkills = text
    .replace(/https?:\/\/[^\s)\]]+/gi, ' ')
    .replace(/www\.[^\s)\]]+/gi, ' ')
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, ' ')
    .replace(/\b[a-zA-Z0-9_-]+\.(?:vercel\.app|netlify\.app|pages\.dev|github\.io|herokuapp\.com)\b/gi, ' ')
    .replace(/\b(?:github|linkedin|leetcode|codeforces|geeksforgeeks|hackerrank)\.com\/[^\s)\]]+/gi, ' ')
    .replace(/\b(?:github|linkedin|leetcode|codeforces|geeksforgeeks|hackerrank)\.com\b/gi, ' ');

  const normalizedLower = textForSkills.toLowerCase();

  // ----------------------------------------------------
  // 1. EXTRACT ALL TECHNICAL SKILLS BY ANALYZING TERMS
  // ----------------------------------------------------
  const matchedCanonicalSkills = new Set<string>();
  const categorized: ResumeExtractionResult['categorizedSkills'] = {
    languages: [],
    frontend: [],
    backend: [],
    cloud_devops: [],
    databases: [],
    testing: [],
    ai_data: [],
    architecture: [],
    other: [],
  };

  // Helper to safely add skill candidates
  const addSkill = (term: string, categoryOverride?: string) => {
    let clean = term.trim();
    // Strip surrounding quotes, parenthesis, or stray punctuation
    clean = clean.replace(/^[('"`\s]+|[)'"`\s.,;:!]+$/g, '');
    // Remove trailing version numbers like "Python 3.11" -> "Python"
    clean = clean.replace(/\s+v?[0-9]+(?:\.[0-9]+)*$/, '');

    // Validate technical skill candidate
    if (!isValidTechSkillCandidate(clean)) return;

    const lower = clean.toLowerCase();

    // Check if it matches an alias in the dictionary to use canonical casing
    const dictMatch = SKILLS_DICTIONARY.find(
      (s) => s.canonical.toLowerCase() === lower || s.aliases.includes(lower)
    );

    const canonicalName = dictMatch ? dictMatch.canonical : clean;
    const resolvedCat =
      dictMatch?.category ||
      (categoryOverride && categoryOverride in categorized
        ? categoryOverride
        : findCategoryForSkill(canonicalName));

    // Check case-insensitive duplication
    const existing = Array.from(matchedCanonicalSkills).find(
      (s) => s.toLowerCase() === canonicalName.toLowerCase()
    );

    if (!existing) {
      matchedCanonicalSkills.add(canonicalName);
      if (resolvedCat in categorized) {
        categorized[resolvedCat as keyof typeof categorized].push(canonicalName);
      } else {
        categorized.other.push(canonicalName);
      }
    }
  };

  // Pass 1: Comprehensive Boundary-Aware Dictionary Match across text
  for (const skill of SKILLS_DICTIONARY) {
    for (const alias of skill.aliases) {
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Look for word boundaries or special tech separators (+, #, /, -, .)
      const regex = new RegExp(`(^|[^a-z0-9+#])${escaped}($|[^a-z0-9+#])`, 'i');
      if (regex.test(normalizedLower)) {
        addSkill(skill.canonical, skill.category);
        break;
      }
    }
  }

  // Pass 2: Deep Parse ALL Explicit Skills Sections
  const skillsMatches = textForSkills.matchAll(SKILLS_SECTION_REGEX);
  for (const match of skillsMatches) {
    if (match[1]) {
      parseTokensFromSkillsSection(match[1], addSkill);
    }
  }

  // Pass 3: Extract from "Tech Stack:", "Technologies Used:", "Environment:", etc.
  const stackMatches = textForSkills.matchAll(
    /(?:technologies(?:\s+used)?|tech\s+stack|environment|stack|tools(?:\s+used)?|key\s+technologies|built\s+with|developed\s+with)\s*[:\-—]\s*([^\n\r]+)/gi
  );
  for (const match of stackMatches) {
    if (match[1]) {
      parseTokensFromSkillsSection(match[1], addSkill);
    }
  }

  // Pass 4: Action Bullet Contextual Tech Analysis
  const techTriggerMatches = textForSkills.matchAll(
    /(?:proficient\s+in|experienced\s+with|experience\s+with|skilled\s+in|hands-on\s+(?:with|in)|expertise\s+in|familiar\s+with|working\s+knowledge\s+of|specializing\s+in|specialized\s+in|focused\s+on|developed\s+(?:using|with)|built\s+(?:using|with)|implemented\s+(?:using|with)|utilizing|using)\s+([^;\n\r]{3,140})(?=(?:\.\s+[A-Z]|\.$|;|\n|\r|$))/gi
  );
  for (const match of techTriggerMatches) {
    if (match[1]) {
      const rawClause = match[1];
      const items = rawClause.split(/[,&+]|\band\b|\bor\b|(?:\s+(?:on|in|with|via|for|across)\s+)/i);
      for (const item of items) {
        const candidate = item.trim();
        if (!candidate || !isValidTechSkillCandidate(candidate)) continue;
        const lower = candidate.toLowerCase();
        const isDictMatch = SKILLS_DICTIONARY.some(
          (s) => s.canonical.toLowerCase() === lower || s.aliases.includes(lower)
        );
        const isKnownTech =
          isDictMatch ||
          /\.(?:js|ts|py|io)$/i.test(candidate) ||
          /(?:DB|SQL|ORM|UI|CSS|JS|TS|CD|CI|ML|AI|API|SDK|CLI)$/i.test(candidate);

        // Only add from action bullet sentences if it is a validated technical skill
        if (isKnownTech) {
          addSkill(candidate);
        }
      }
    }
  }

  // Case-sensitive check for short languages like 'Go' when delimited by technical punctuation
  if (/(?:^|[,\s/|&•\-–—:])Go(?:[,\s/|&•\-–—.]|$)/.test(textForSkills)) {
    addSkill('Go', 'languages');
  }

  // Pass 5: Parenthetical Tech Listings in Bullet Points
  const parenMatches = textForSkills.matchAll(/\(([^)]{3,120})\)/g);
  for (const match of parenMatches) {
    const inner = match[1];
    if (inner.includes(',') || inner.includes('/') || inner.includes(';')) {
      const items = inner.split(/[,;/]+/);
      for (const item of items) {
        const candidate = item.trim();
        if (!candidate || !isValidTechSkillCandidate(candidate)) continue;
        const lower = candidate.toLowerCase();
        const isDictMatch = SKILLS_DICTIONARY.some(
          (s) => s.canonical.toLowerCase() === lower || s.aliases.includes(lower)
        );
        const isKnownTech =
          isDictMatch ||
          /\.(?:js|ts|py|io)$/i.test(candidate) ||
          /(?:DB|SQL|ORM|UI|CSS|JS|TS|CD|CI|ML|AI|API|SDK|CLI)$/i.test(candidate);

        if (isKnownTech) {
          addSkill(candidate);
        }
      }
    }
  }

  // Pass 6: Dynamic Tech-Term Mining (Strict CamelCase & Tech Syntax Mining)
  // ONLY match CamelCase terms that either match our dictionary OR end in a recognized tech suffix (DB, SQL, ORM, UI, CSS, JS, TS, CD, CI, ML, AI, Hub, Lab)
  const camelCaseTerms = textForSkills.match(/\b([A-Z][a-z]+(?:[A-Z][a-z]*)+)\b/g);
  if (camelCaseTerms) {
    for (const term of camelCaseTerms) {
      if (!isValidTechSkillCandidate(term)) continue;

      const lower = term.toLowerCase();
      const isDictMatch = SKILLS_DICTIONARY.some(
        (s) => s.canonical.toLowerCase() === lower || s.aliases.includes(lower)
      );
      const hasTechSuffix = /(?:DB|SQL|ORM|UI|CSS|JS|TS|CD|CI|ML|AI|Hub|Lab)$/.test(term);

      if (isDictMatch || hasTechSuffix) {
        addSkill(term);
      }
    }
  }

  // Tech extensions: Next.js, Vue.js, Node.js, Three.js, Socket.io
  const extensionTerms = textForSkills.match(/\b([A-Za-z0-9_-]+\.(?:js|ts|py|io|ai|sh|rs|rb))\b/gi);
  if (extensionTerms) {
    for (const term of extensionTerms) {
      if (isValidTechSkillCandidate(term)) {
        addSkill(term);
      }
    }
  }

  // Tech symbols: C++, C#, .NET, ASP.NET, CI/CD, RESTful, OAuth2
  const symbolTerms = textForSkills.match(/\b(C\+\+|C#|\.NET|ASP\.NET|CI\/CD|RESTful|OAuth2)\b/gi);
  if (symbolTerms) {
    for (const term of symbolTerms) {
      if (isValidTechSkillCandidate(term)) {
        addSkill(term);
      }
    }
  }

  // Whitelisted uppercase technical acronyms
  const techAcronyms = textForSkills.match(
    /\b(REST|GraphQL|gRPC|CRUD|SDK|CLI|JWT|SSO|SaaS|PaaS|IaaS|CDN|DNS|WAF|TCP\/IP|HTTP|HTTPS|WebRTC|WASM|ETL|ELT|ORM|ODM|API|APIs|BEM|SSR|SSG|ISR|TDD|BDD|VCS|K8s|IaC)\b/g
  );
  if (techAcronyms) {
    for (const acronym of techAcronyms) {
      if (isValidTechSkillCandidate(acronym)) {
        addSkill(acronym);
      }
    }
  }

  const allSkills = Array.from(matchedCanonicalSkills);

  // ----------------------------------------------------
  // 2. EXTRACT OR SYNTHESIZE PROFESSIONAL SUMMARY
  // ----------------------------------------------------
  let summary = '';

  // Stage 1: Explicit Summary Header
  const summaryMatch = text.match(SUMMARY_HEADER_REGEX);
  if (summaryMatch && summaryMatch[1]) {
    const rawMatch = summaryMatch[1];
    const cleaned = cleanExtractedSummary(rawMatch);
    if (cleaned.length >= 35) {
      summary = cleaned;
    }
  }

  // Stage 2: Opening Bio Paragraph (Common when resume lacks explicit "Summary" header)
  if (!summary || summary.length < 35) {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const candidateLines: string[] = [];

    for (let i = 0; i < Math.min(lines.length, 25); i++) {
      const line = lines[i];
      const lower = line.toLowerCase();

      // Stop once we hit major sections
      if (SECTION_BREAK_PATTERN.test(line)) {
        break;
      }

      // Skip contact information lines (emails, URLs, phone numbers, addresses)
      if (
        lower.includes('@') ||
        lower.includes('linkedin.com') ||
        lower.includes('github.com') ||
        lower.includes('portfolio') ||
        /^\+?[0-9\s\-().]{8,}$/.test(line) ||
        lower.startsWith('phone:') ||
        lower.startsWith('email:') ||
        lower.startsWith('location:') ||
        lower.startsWith('address:') ||
        lower.startsWith('http://') ||
        lower.startsWith('https://')
      ) {
        continue;
      }

      // If it looks like a candidate's name or title line (short header)
      if (line.length < 35 && !line.includes('.')) {
        continue;
      }

      // If line is substantial and narrative
      if (line.length >= 25) {
        candidateLines.push(line);
      }
    }

    if (candidateLines.length > 0) {
      const joined = cleanExtractedSummary(candidateLines.join(' '));
      if (joined.length >= 35) {
        summary = joined;
      }
    }
  }

  // Stage 3: Intelligent Synthesis Fallback
  if (!summary || summary.length < 35) {
    const inferredTitle = inferCandidateTitle(text);
    const yearsExp = inferYearsOfExperience(text);

    // Pick top skills across different categories (languages, frontend, backend, cloud)
    const highlightSkills = [
      ...categorized.languages.slice(0, 2),
      ...categorized.frontend.slice(0, 2),
      ...categorized.backend.slice(0, 2),
      ...categorized.cloud_devops.slice(0, 2),
      ...categorized.databases.slice(0, 1),
    ].slice(0, 6);

    const topSkillsList = highlightSkills.length > 0 ? highlightSkills.join(', ') : allSkills.slice(0, 5).join(', ');

    if (allSkills.length > 0) {
      const expPrefix = yearsExp ? ` with ${yearsExp}` : '';
      summary = `Accomplished ${inferredTitle}${expPrefix} specializing in ${topSkillsList}. Proven track record designing resilient systems, architecting scalable applications, and driving technical excellence across cross-functional engineering teams.`;
    } else {
      summary = `Dedicated ${inferredTitle} with a passion for software development, robust system design, and continuous technical growth. Eager to bring technical rigor and collaborative problem-solving to high-impact projects.`;
    }
  }

  return {
    skills: allSkills,
    summary,
    categorizedSkills: categorized,
    rawTextPreview: text.slice(0, 500) + (text.length > 500 ? '...' : ''),
    wordCount: text.split(/\s+/).filter(Boolean).length,
  };
}

/**
 * Parses comma, bullet, pipe, or newline delimited tokens from a dedicated skills section,
 * intelligently extracting parenthetical sub-tools and category contexts.
 */
function parseTokensFromSkillsSection(
  sectionText: string,
  addSkillFn: (term: string, cat?: string) => void
): void {
  const lines = sectionText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  for (const line of lines) {
    let currentCategory: string | undefined = undefined;
    let contentToParse = line;

    // Check for subsection prefix like "Languages:", "Frontend:", "Databases:", "DevOps:"
    const colonMatch = line.match(/^\s*([A-Za-z\s/&]+)\s*[:\-]\s*(.*)$/);
    if (colonMatch) {
      const header = colonMatch[1].toLowerCase();
      contentToParse = colonMatch[2];

      if (header.includes('language')) currentCategory = 'languages';
      else if (header.includes('front') || header.includes('web') || header.includes('ui')) currentCategory = 'frontend';
      else if (header.includes('back') || header.includes('api') || header.includes('server')) currentCategory = 'backend';
      else if (header.includes('cloud') || header.includes('devops') || header.includes('infra') || header.includes('tool')) currentCategory = 'cloud_devops';
      else if (header.includes('data') || header.includes('db') || header.includes('store')) currentCategory = 'databases';
      else if (header.includes('test') || header.includes('qa')) currentCategory = 'testing';
      else if (header.includes('ai') || header.includes('ml') || header.includes('machine')) currentCategory = 'ai_data';
      else if (header.includes('architect') || header.includes('design') || header.includes('method')) currentCategory = 'architecture';
    }

    // 1. Extract parenthetical tool groups first: e.g. "AWS (S3, EC2, Lambda, ECS, RDS)"
    const parenMatches = contentToParse.matchAll(/([A-Za-z0-9+#.\s/-]+)\s*\(([^()]+)\)/g);
    for (const pm of parenMatches) {
      const parentTool = pm[1].trim();
      const innerTools = pm[2].split(/[,/|;]+/);
      if (isValidTechSkillCandidate(parentTool)) {
        addSkillFn(parentTool, currentCategory);
      }
      for (const it of innerTools) {
        const cleanedInner = it.trim();
        if (isValidTechSkillCandidate(cleanedInner)) {
          addSkillFn(cleanedInner, currentCategory);
        }
      }
    }

    // 2. Remove parenthetical portions so remaining tokens can be split safely
    const cleanContent = contentToParse.replace(/\(([^()]+)\)/g, '');

    // 3. Split remaining tokens by comma, bullet, pipe, semicolon, or slash
    const rawTokens = cleanContent
      .split(/[,•|·;–—\t]+/)
      .map((t) => t.trim().replace(/^[-*•]\s*/, ''))
      .filter(Boolean);

    for (const rawToken of rawTokens) {
      if (isValidTechSkillCandidate(rawToken)) {
        addSkillFn(rawToken, currentCategory);
      }
    }
  }
}

/**
 * Infers a suitable category for an unlisted technical term.
 */
export function findCategoryForSkill(skillName: string): string {
  const lower = skillName.toLowerCase();
  if (/^(c|c\+\+|c#|python|java|javascript|typescript|go|rust|ruby|php|kotlin|swift|dart|scala|r|julia|solidity|elixir|haskell|clojure|lua|perl)$/i.test(lower)) {
    return 'languages';
  }
  if (/(react|vue|angular|svelte|next|nuxt|tailwind|bootstrap|css|html|ui|redux|zustand|webpack|vite|remix|astro|material|chakra|radix|shadcn|storybook|framer|three\.?js|canvas|webgl)/i.test(lower)) {
    return 'frontend';
  }
  if (/(node|express|fastapi|django|flask|spring|rails|net|api|graphql|grpc|kafka|rabbitmq|microservice|nest|trpc|hono|fastify|celery|bull|temporal|restful|websocket|socket)/i.test(lower)) {
    return 'backend';
  }
  if (/(aws|azure|gcp|cloud|docker|kubernetes|k8s|terraform|ansible|ci|cd|jenkins|linux|nginx|helm|argocd|prometheus|grafana|datadog|splunk|sentry|sonarqube|vercel|cloudflare|openshift|podman|pulumi)/i.test(lower)) {
    return 'cloud_devops';
  }
  if (/(sql|postgres|mysql|mongo|redis|dynamo|db|database|sqlite|prisma|orm|cassandra|supabase|firebase|clickhouse|duckdb|cockroach|snowflake|bigquery|neo4j|couchbase|drizzle)/i.test(lower)) {
    return 'databases';
  }
  if (/(jest|vitest|cypress|playwright|test|qa|junit|selenium|pytest|mock|tdd|postman|swagger)/i.test(lower)) {
    return 'testing';
  }
  if (/(ai|ml|learning|torch|tensor|llm|gpt|vision|nlp|data|spark|pandas|numpy|langchain|llama|vector|pinecone|weaviate|chroma|qdrant|hugging|opencv|scikit)/i.test(lower)) {
    return 'ai_data';
  }
  if (/(agile|scrum|kanban|git|system design|architecture|security|oauth|jwt|sso|iam)/i.test(lower)) {
    return 'architecture';
  }
  return 'other';
}

/**
 * Clean up extracted summary text, stripping markdown, bullet points, and PDF metadata noise,
 * and ensuring proper grammatical sentence structure and punctuation.
 */
export function cleanExtractedSummary(raw: string): string {
  // Strip markdown bold, italics, and heading markers
  const cleanedText = raw
    .replace(/\*{1,3}|_{1,3}/g, '')
    .replace(/^[#\s]+/gm, '')
    .replace(/https?:\/\/[^\s)\]]+/gi, '')
    .replace(/www\.[^\s)\]]+/gi, '');

  const lines = cleanedText
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*•▪▫–—\d.)]+\s*/, '').trim())
    .filter((line) => {
      if (!line || line.length < 3) return false;
      const lower = line.toLowerCase();
      // Remove lines that are just PDF internal tokens or URLs
      if (PDF_METADATA_TOKENS.has(lower) || lower.includes('@') || lower.includes('.com/')) {
        return false;
      }
      return true;
    });

  if (lines.length === 0) return '';

  // Ensure each sentence or bullet point ends with terminal punctuation
  const punctuatedLines = lines.map((line) => {
    if (/[.!?:;]$/.test(line)) return line;
    return line + '.';
  });

  return punctuatedLines
    .join(' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([.,;:!?])/g, '$1')
    .trim();
}

/**
 * Infers candidate job title from resume text (first few lines or common title matches).
 */
export function inferCandidateTitle(text: string): string {
  const match = text.match(
    /\b(?:Senior\s+|Staff\s+|Lead\s+|Principal\s+|Junior\s+)?(?:Full-?Stack|Frontend|Backend|Software(?:\s+Development)?|DevOps|Cloud|Infrastructure|Platform|Site Reliability|Mobile|Data|AI|Machine Learning|Security|Systems)\s*(?:Engineer|Developer|Architect|Specialist|Lead)(?:\s+Intern)?\b/i
  );
  if (match) return match[0];
  return 'Software Engineer';
}

/**
 * Infers years of experience if mentioned in the resume (e.g. "6+ years of experience").
 */
export function inferYearsOfExperience(text: string): string | null {
  const match = text.match(/\b([0-9]+\+?\s*(?:-\s*[0-9]+\s*)?years?(?:\s+of)?\s+experience)\b/i);
  return match ? match[1] : null;
}

/**
 * Extracts plain text from an uploaded file (.txt, .md, .pdf, or .docx).
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();

  // Plain text or markdown
  if (fileName.endsWith('.txt') || fileName.endsWith('.md') || file.type.startsWith('text/')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed reading text file'));
      reader.readAsText(file);
    });
  }

  // PDF extraction
  if (fileName.endsWith('.pdf') || file.type === 'application/pdf') {
    return extractTextFromPdfFile(file);
  }

  // Fallback text reader
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      resolve(cleanExtractedText(text));
    };
    reader.onerror = () => resolve('');
    reader.readAsText(file);
  });
}

/**
 * Client-side PDF text stream extractor with native FlateDecode zlib decompression.
 */
export async function extractTextFromPdfFile(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    return await extractTextFromPdfArrayBuffer(arrayBuffer);
  } catch (err) {
    console.warn('[ApplyKit] Direct PDF stream extraction failed:', err);
    return '';
  }
}

/**
 * Extracts plain text from a base64 DataURL (such as stored in profile.documents.resume.data).
 */
export async function extractTextFromDataUrl(dataUrl: string): Promise<string> {
  try {
    const base64Index = dataUrl.indexOf(';base64,');
    if (base64Index === -1) return '';

    const mimeType = dataUrl.slice(5, base64Index).toLowerCase();
    const base64 = dataUrl.slice(base64Index + 8);
    const binary = atob(base64);

    // If PDF, parse and decompress streams
    if (mimeType.includes('pdf') || binary.startsWith('%PDF-')) {
      const uint8 = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        uint8[i] = binary.charCodeAt(i);
      }
      return await extractTextFromPdfArrayBuffer(uint8.buffer);
    }

    // For plain text, decode base64
    return cleanExtractedText(binary);
  } catch (err) {
    console.warn('[ApplyKit] Failed decoding dataUrl:', err);
    return '';
  }
}

/**
 * Parses all PDF text objects (BT ... ET), decompressing FlateDecode streams when encountered.
 * Supports both literal strings and ReportLab/CID hex-encoded strings with UTF-16BE and Latin1 encodings.
 */
export async function extractTextFromPdfArrayBuffer(arrayBuffer: ArrayBuffer): Promise<string> {
  const uint8 = new Uint8Array(arrayBuffer);

  // 1. Industry-standard Mozilla PDF.js engine via unpdf (full CMap, font mapping, ligatures, multi-page)
  try {
    const { text } = await extractPdfText(uint8.slice());
    const combined = Array.isArray(text) ? text.join('\n\n') : (text || '');
    if (combined && combined.trim().length >= 25) {
      return combined.trim();
    }
  } catch (err) {
    console.warn('[ApplyKit] unpdf extraction fallback:', err);
  }

  // 2. Direct stream scanner fallback
  try {
    const latin1String = new TextDecoder('latin1').decode(uint8);
    const extractedPieces: string[] = [];

    // 1. Scan for stream blocks with dictionary metadata: << ... >> \s* stream (\r\n|\n|\r)
    const streamHeaderRegex = /<<([\s\S]*?)>>\s*stream(?:\r\n|\n|\r)/g;
    let match: RegExpExecArray | null;

    while ((match = streamHeaderRegex.exec(latin1String)) !== null) {
      const dictText = match[1];
      const headerEndIndex = match.index + match[0].length;

      // Check if dictionary has explicit /Length <number>
      const lengthMatch = dictText.match(/\/Length\s+(\d+)\b/);
      let streamBytes: Uint8Array | null = null;

      if (lengthMatch) {
        const declaredLen = parseInt(lengthMatch[1], 10);
        if (declaredLen > 0 && headerEndIndex + declaredLen <= uint8.length) {
          const afterStream = latin1String.slice(headerEndIndex + declaredLen, headerEndIndex + declaredLen + 30);
          if (/^\s*endstream\b/.test(afterStream)) {
            streamBytes = uint8.slice(headerEndIndex, headerEndIndex + declaredLen);
          }
        }
      }

      // Fallback if declared length missing or indirect ref: find next endstream keyword
      if (!streamBytes) {
        const endstreamPos = latin1String.indexOf('endstream', headerEndIndex);
        if (endstreamPos !== -1) {
          let endIndex = endstreamPos;
          while (
            endIndex > headerEndIndex &&
            (uint8[endIndex - 1] === 0x0a || uint8[endIndex - 1] === 0x0d || uint8[endIndex - 1] === 0x20)
          ) {
            endIndex--;
          }
          streamBytes = uint8.slice(headerEndIndex, endIndex);
        }
      }

      if (streamBytes && streamBytes.length > 0) {
        const isFlate =
          /\/Filter\s*(?:\/\w*\s*)*\/FlateDecode\b/.test(dictText) ||
          (streamBytes.length >= 2 && streamBytes[0] === 0x78);

        let decompressed = '';
        if (isFlate) {
          decompressed = await decompressZlib(streamBytes);
        }

        if (decompressed) {
          parsePdfTextOperators(decompressed, extractedPieces);
        } else {
          parsePdfTextOperators(new TextDecoder('latin1').decode(streamBytes), extractedPieces);
        }
      }
    }

    // 2. Bare stream fallback if no dictionary headers matched
    if (extractedPieces.length === 0) {
      const bareStreamRegex = /stream(?:\r\n|\n|\r)/g;
      let bareMatch: RegExpExecArray | null;
      while ((bareMatch = bareStreamRegex.exec(latin1String)) !== null) {
        const startPos = bareMatch.index + bareMatch[0].length;
        const endPos = latin1String.indexOf('endstream', startPos);
        if (endPos > startPos) {
          let cleanEnd = endPos;
          while (
            cleanEnd > startPos &&
            (uint8[cleanEnd - 1] === 0x0a || uint8[cleanEnd - 1] === 0x0d || uint8[cleanEnd - 1] === 0x20)
          ) {
            cleanEnd--;
          }
          const bytes = uint8.slice(startPos, cleanEnd);
          if (bytes.length >= 2 && bytes[0] === 0x78) {
            const dec = await decompressZlib(bytes);
            if (dec) parsePdfTextOperators(dec, extractedPieces);
          } else {
            parsePdfTextOperators(new TextDecoder('latin1').decode(bytes), extractedPieces);
          }
        }
      }
    }

    // 3. Also check for uncompressed BT ... ET blocks anywhere in the file
    parsePdfTextOperators(latin1String, extractedPieces);

    if (extractedPieces.length > 0) {
      return extractedPieces.join(' ').replace(/\s+/g, ' ').trim();
    }

    return '';
  } catch (err) {
    console.warn('[ApplyKit] Failed parsing PDF stream text:', err);
    return '';
  }
}

/**
 * Decompresses zlib/deflate bytes using native DecompressionStream or Node zlib fallback.
 */
async function decompressZlib(bytes: Uint8Array): Promise<string> {
  const safeBytes = bytes.byteOffset === 0 ? bytes : bytes.slice();

  // Node.js environment (e.g. vitest runner)
  if (typeof process !== 'undefined' && process.versions?.node) {
    try {
      const zlibMod = await import(/* @vite-ignore */ 'node:zlib');
      const zlib = zlibMod.default || zlibMod;
      const bufNode = Buffer.from(safeBytes);
      try {
        return zlib.inflateSync(bufNode).toString('latin1');
      } catch {
        return zlib.inflateRawSync(bufNode).toString('latin1');
      }
    } catch {
      // Fallback to browser stream API below
    }
  }

  // Browser native DecompressionStream (Chrome, Edge, Firefox, Safari)
  if (typeof DecompressionStream !== 'undefined') {
    try {
      const ds = new DecompressionStream('deflate');
      const stream = new Blob([safeBytes as any]).stream().pipeThrough(ds);
      const response = new Response(stream);
      const ab = await response.arrayBuffer();
      return new TextDecoder('latin1').decode(ab);
    } catch {
      try {
        const dsRaw = new DecompressionStream('deflate-raw');
        const streamRaw = new Blob([safeBytes as any]).stream().pipeThrough(dsRaw);
        const responseRaw = new Response(streamRaw);
        const abRaw = await responseRaw.arrayBuffer();
        return new TextDecoder('latin1').decode(abRaw);
      } catch {
        // Could not decompress
      }
    }
  }

  return '';
}

/**
 * Extracts text strings from PDF text operators (BT ... ET), capturing:
 * - Literal strings: (text) Tj, (text) ', aw ac (text) "
 * - Hexadecimal strings: <hex> Tj, <hex> ', aw ac <hex> "
 * - TJ arrays: [ (str) -120 <hex> 10 (str) ] TJ
 */
export function parsePdfTextOperators(content: string, outPieces: string[]): void {
  const btRegex = /BT[\s\S]*?ET/g;
  let match: RegExpExecArray | null;

  const processBlock = (block: string) => {
    // 1. Array strings: [(str) -120 <hex>] TJ
    const tjRegex = /\[([\s\S]*?)\]\s*TJ/g;
    let tjMatch: RegExpExecArray | null;
    while ((tjMatch = tjRegex.exec(block)) !== null) {
      const inner = tjMatch[1];
      const tokenRegex = /\((?:[^()\\]|\\.)*\)|<[0-9a-fA-F\s]+>|[-+]?\d*\.?\d+/g;
      let token: RegExpExecArray | null;
      let currentText = '';

      while ((token = tokenRegex.exec(inner)) !== null) {
        const val = token[0];
        if (val.startsWith('(') && val.endsWith(')')) {
          currentText += unescapePdfLiteralString(val.slice(1, -1));
        } else if (val.startsWith('<') && val.endsWith('>')) {
          currentText += decodeHexPdfString(val.slice(1, -1));
        } else {
          const num = parseFloat(val);
          // Large negative kerning indicates a word break / space
          if (num < -120 && currentText.length > 0 && !currentText.endsWith(' ')) {
            currentText += ' ';
          }
        }
      }

      const clean = currentText.trim();
      if (clean && !PDF_METADATA_TOKENS.has(clean.toLowerCase())) {
        outPieces.push(clean);
      }
    }

    // 2. Individual literal strings: (text) Tj or ' or "
    const literalTjRegex = /\(((?:[^()\\]|\\.)*)\)\s*(?:Tj|'|")/g;
    let litMatch: RegExpExecArray | null;
    while ((litMatch = literalTjRegex.exec(block)) !== null) {
      const clean = unescapePdfLiteralString(litMatch[1]).trim();
      if (clean && !PDF_METADATA_TOKENS.has(clean.toLowerCase())) {
        outPieces.push(clean);
      }
    }

    // 3. Individual hex strings: <hex> Tj or ' or "
    const hexTjRegex = /<([0-9a-fA-F\s]+)>\s*(?:Tj|'|")/g;
    let hexMatch: RegExpExecArray | null;
    while ((hexMatch = hexTjRegex.exec(block)) !== null) {
      const clean = decodeHexPdfString(hexMatch[1]).trim();
      if (clean && !PDF_METADATA_TOKENS.has(clean.toLowerCase())) {
        outPieces.push(clean);
      }
    }
  };

  let foundBt = false;
  while ((match = btRegex.exec(content)) !== null) {
    foundBt = true;
    processBlock(match[0]);
  }

  // Fallback: if no BT ... ET enclosing blocks were found, attempt on entire content
  if (!foundBt) {
    processBlock(content);
  }
}

/**
 * Decodes hexadecimal PDF strings (<...>), supporting UTF-16BE (with or without BOM) and standard ASCII.
 */
export function decodeHexPdfString(hexStr: string): string {
  const clean = hexStr.replace(/[^0-9a-fA-F]/g, '');
  if (!clean) return '';
  const padded = clean.length % 2 !== 0 ? clean + '0' : clean;
  const bytes = new Uint8Array(padded.length / 2);
  for (let i = 0; i < padded.length; i += 2) {
    bytes[i / 2] = parseInt(padded.substring(i, i + 2), 16);
  }

  // UTF-16BE BOM check (0xFE 0xFF)
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    let result = '';
    for (let i = 2; i + 1 < bytes.length; i += 2) {
      const code = (bytes[i] << 8) | bytes[i + 1];
      if (code >= 32) result += String.fromCharCode(code);
    }
    return result;
  }

  // Implicit UTF-16BE check (common in ReportLab TrueType / CID fonts)
  if (bytes.length >= 2 && bytes.length % 2 === 0) {
    let nullCount = 0;
    for (let i = 0; i < bytes.length; i += 2) {
      if (bytes[i] === 0x00 && bytes[i + 1] >= 32 && bytes[i + 1] <= 126) {
        nullCount++;
      }
    }
    if (nullCount >= Math.max(1, Math.floor(bytes.length / 4))) {
      let result = '';
      for (let i = 0; i + 1 < bytes.length; i += 2) {
        const code = (bytes[i] << 8) | bytes[i + 1];
        if (code >= 32) result += String.fromCharCode(code);
      }
      return result;
    }
  }

  // Fallback to UTF-8 or Latin1
  try {
    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    return new TextDecoder('latin1').decode(bytes);
  }
}

/**
 * Unescapes literal PDF strings, decoding octal escapes and UTF-16BE sequences.
 */
export function unescapePdfLiteralString(raw: string): string {
  const hasOctalBom = raw.startsWith('\\376\\377');
  const hasRawBom = raw.length >= 2 && raw.charCodeAt(0) === 0xfe && raw.charCodeAt(1) === 0xff;

  const unescaped = raw
    .replace(/\\([0-7]{1,3})/g, (_, octal) => String.fromCharCode(parseInt(octal, 8)))
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\b/g, '\b')
    .replace(/\\f/g, '\f')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\');

  if (
    hasOctalBom ||
    hasRawBom ||
    (unescaped.length >= 2 && unescaped.charCodeAt(0) === 0xfe && unescaped.charCodeAt(1) === 0xff)
  ) {
    const start =
      hasRawBom || (unescaped.charCodeAt(0) === 0xfe && unescaped.charCodeAt(1) === 0xff) ? 2 : 0;
    let result = '';
    for (let i = start; i + 1 < unescaped.length; i += 2) {
      const code = (unescaped.charCodeAt(i) << 8) | unescaped.charCodeAt(i + 1);
      if (code >= 32) result += String.fromCharCode(code);
    }
    return result;
  }

  return unescaped;
}

function cleanExtractedText(raw: string): string {
  const matches = raw.match(/[A-Za-z0-9.,;:!?'"()\-_/@#&%+=]{2,}/g);
  if (!matches) return '';
  return matches.join(' ');
}

