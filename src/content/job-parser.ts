export interface ParsedJobInfo {
  found: boolean;
  jobTitle?: string;
  companyName?: string;
  descriptionText: string;
  source: 'selected_text' | 'platform_selector' | 'generic_selector' | 'main_content' | 'none';
}

const KNOWN_JD_SELECTORS = [
  // Greenhouse
  '#content .content',
  '.job-description',
  '#job-details',
  '#app_body',
  // Lever
  '.posting-description',
  '.section-wrapper.accent-section',
  // Ashby
  '.ashby-job-posting-description',
  '[class*="JobPosting_jobDescription"]',
  // Workday
  '[data-automation-id="jobPostingDescription"]',
  '[data-automation-id="job-posting-details"]',
  // LinkedIn
  '.jobs-description__content',
  '.jobs-box__html-content',
  '.description__text',
  // Generic / Custom portals
  '[id*="job-description"]',
  '[id*="jobDescription"]',
  '[class*="job-description"]',
  '[class*="jobDescription"]',
  '[class*="job_description"]',
  'article[class*="job"]',
  'section[class*="description"]',
  'article',
  'main',
];

const KNOWN_TITLE_SELECTORS = [
  'h1.app-title',
  'h1[class*="job-title"]',
  'h1[class*="title"]',
  '.posting-headline h2',
  '[data-automation-id="jobPostingHeader"]',
  'h1',
];

export function extractJobDescriptionFromPage(): ParsedJobInfo {
  // 1. Check if user selected text
  const userSelection = window.getSelection()?.toString().trim();
  if (userSelection && userSelection.length > 50) {
    return {
      found: true,
      jobTitle: inferTitleFromPage(),
      descriptionText: cleanText(userSelection),
      source: 'selected_text',
    };
  }

  // 2. Try known platform selectors
  for (const selector of KNOWN_JD_SELECTORS) {
    try {
      const el = document.querySelector(selector);
      if (el && el.textContent && el.textContent.trim().length > 100) {
        // Exclude if it's strictly the form container without text
        const text = cleanText(el.textContent);
        if (text.length > 100) {
          return {
            found: true,
            jobTitle: inferTitleFromPage(),
            descriptionText: text,
            source: selector.includes('data-automation') || selector.includes('posting') ? 'platform_selector' : 'generic_selector',
          };
        }
      }
    } catch {
      // Invalid selector fallback
    }
  }

  return {
    found: false,
    descriptionText: '',
    source: 'none',
  };
}

function inferTitleFromPage(): string | undefined {
  for (const selector of KNOWN_TITLE_SELECTORS) {
    const el = document.querySelector(selector);
    if (el && el.textContent) {
      const text = el.textContent.trim();
      if (text.length > 2 && text.length < 80) {
        return text;
      }
    }
  }
  // Fallback to document title
  const docTitle = document.title;
  if (docTitle) {
    const parts = docTitle.split(/[-–—|:]/);
    if (parts[0] && parts[0].trim().length > 3) {
      return parts[0].trim();
    }
  }
  return undefined;
}

function cleanText(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, ' ') // Strip HTML tags
    .replace(/\s+/g, ' ')     // Collapse whitespace
    .trim()
    .slice(0, 15000);         // Cap at 15k chars
}
