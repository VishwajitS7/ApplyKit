# ApplyKit — Job Application Autofill & Quick-Copy Chrome Extension

> **Fill once. Apply faster.**  
> A lightweight, privacy-first developer utility for students and job seekers who repeatedly fill out job applications.

---

## 🚀 Overview

Applying for jobs involves filling out the same 15–20 fields (name, links, education, skills, contact info) dozens or hundreds of times across different hiring portals (Greenhouse, Lever, Workday, Ashby, LinkedIn, and custom company sites).

**ApplyKit** eliminates this repetitive 5–10 second burden on every application:
1. **Fill your profile once** in a clean, local Notion/Linear-inspired dashboard.
2. **1-Click Quick Copy** any stored link (LinkedIn, GitHub, LeetCode, Portfolio, Email, Phone, Skills, Summary) with visual feedback.
3. **Global Keyboard Shortcuts** (`Ctrl+Shift+L` for LinkedIn, `Ctrl+Shift+G` for GitHub, `Ctrl+Shift+C` for LeetCode, `Ctrl+Shift+P` for Portfolio) that copy URLs instantly from any webpage.
4. **Smart Form Detection Engine** that inspects multiple signals (labels, placeholders, names, IDs, autocomplete, nearby text) to identify application fields.
5. **Autofill Preview with Confidence Scoring** so you see exactly what will be filled before applying.
6. **Strict Zero-Auto-Submit Safety Policy**: ApplyKit **never** clicks "Submit Application", **never** clicks "Apply", and **never** touches legal declarations, demographic surveys, work authorization, or salary questions.
7. **100% Local & Privacy-Preserving**: No backend, no accounts, no analytics, no external servers. Everything stays on your machine in `chrome.storage.local`.

---

## ✨ Key Features

### ⚡ 1-Click Quick Copy & Shortcuts
- Clean 2-column grid in the compact (390px) popup for instant access to:
  - **LinkedIn Profile URL** (`Ctrl/Cmd + Shift + L`)
  - **GitHub Profile URL** (`Ctrl/Cmd + Shift + G`)
  - **LeetCode Profile URL** (`Ctrl/Cmd + Shift + C`)
  - **Portfolio / Personal Website** (`Ctrl/Cmd + Shift + P`)
  - **Email Address**
  - **Phone Number**
  - **Skills List** (comma-separated for easy pasting)
  - **Professional Summary / Bio**
- Instant **"Copied ✓"** visual feedback for 1.5s without closing the popup.

### 🔍 Deterministic Field Detection & Mapping Engine
- Multi-signal analysis:
  - Associated `<label>` text (via `for` attribute and enclosing labels)
  - `placeholder`, `aria-label`, `aria-labelledby`
  - `name` and `id` attributes (with snake_case and kebab-case normalization)
  - `type` and `autocomplete` standards
  - Nearby container text and section headers
- Confidence scoring (0.0 to 1.0):
  - High confidence ($\ge 70\%$) matches pre-selected
  - Ambiguous matches flagged for user review
  - Unclassifiable elements safely ignored

### 🛡️ Ironclad Application Safety by Design
ApplyKit strictly enforces safety guards:
- ❌ **NEVER** submits forms or clicks "Submit", "Apply", "Send", or "Finish" buttons.
- ❌ **NEVER** checks legal declarations, terms of service, or "under penalty of perjury" agreements.
- ❌ **NEVER** answers demographic, diversity, gender, race, veteran, or disability questions.
- ❌ **NEVER** answers work authorization, citizenship, or visa sponsorship questions.
- ❌ **NEVER** autofills salary expectations or target compensation fields.
- ❌ **NEVER** touches password or financial/credential fields.
- ❌ **NEVER** overwrites existing non-empty fields without explicit user consent.

### ⚛️ React & SPA Compatible Autofill
- Triggers native HTML input property descriptors (`HTMLInputElement.prototype`, `HTMLTextAreaElement.prototype`, `HTMLSelectElement.prototype`) to ensure React 16+, Vue, and Angular synthetic event listeners update component state properly.
- Dispatches sequence of `input`, `change`, and `blur` events with bubbling.
- Highlights populated fields briefly with an indigo pulse on the page.

### 🎨 Linear & Raycast-Inspired UI
- Minimalist, distraction-free aesthetic with crisp borders (`border-zinc-800`), font-mono badges, and subtle micro-interactions.
- Full **Dark**, **Light**, and **System** theme support.
- Streamlined **First-Time Onboarding** flow for new users.
- Actionable **Profile Completeness Bar** (e.g. *"Add your LeetCode profile"*).

### 💾 Data Ownership & Portability
- **JSON Export (`applykit-profile.json`)** with schema versioning.
- **JSON Import with Validation**: Sanitizes data and protects against corrupted or malicious backups.
- **Reset Profile** with confirmation dialog.

---

## 🏗️ Architecture

```
ApplyKit/
├── src/
│   ├── types/
│   │   ├── profile.ts            # UserProfile, Education, Documents, Settings
│   │   ├── detection.ts          # FieldType, DetectedField, ApplicationAdapter
│   │   └── messages.ts           # Extension runtime messaging contracts
│   │
│   ├── storage/
│   │   ├── profile-store.ts      # chrome.storage.local abstraction + fallback
│   │   └── schema-validator.ts   # JSON schema validation & profile sanitization
│   │
│   ├── content/
│   │   ├── content.ts            # Content script entrypoint & message dispatcher
│   │   ├── detector.ts           # Multi-signal DOM form detector & normalizer
│   │   ├── field-mapper.ts       # Deterministic rule & heuristic mapping engine
│   │   ├── autofill.ts           # Safe autofill engine with React synthetic event triggers
│   │   ├── safety-guard.ts       # Strict denylist (buttons, legal, demographics, salary)
│   │   └── adapters/
│   │       ├── base-adapter.ts   # ApplicationAdapter interface
│   │       └── generic.ts        # GenericApplicationAdapter implementation
│   │
│   ├── background/
│   │   └── service-worker.ts     # MV3 service worker & command listener
│   │
│   ├── popup/
│   │   ├── popup.html            # Popup entry HTML (390px × 560px)
│   │   ├── popup.tsx             # Popup React root
│   │   ├── components/           # QuickCopyGrid, DetectionCard, PreviewModal, etc.
│   │   └── pages/PopupApp.tsx    # State container
│   │
│   ├── options/
│   │   ├── options.html          # Full-page options dashboard entry
│   │   ├── options.tsx           # Options React root
│   │   ├── components/           # Section editors, ImportExport, ShortcutsGuide
│   │   └── pages/OptionsApp.tsx  # Options dashboard
│   │
│   └── utils/
│       ├── clipboard.ts          # Safe clipboard copy helper with fallback
│       ├── dom-helpers.ts        # safeCssEscape & DOM helpers
│       └── theme.ts              # Theme manager (dark/light/system)
│
├── public/
│   ├── manifest.json             # Manifest V3 configuration
│   └── icons/                    # icon16, icon32, icon48, icon128 PNGs
│
├── tests/
│   ├── detector.test.ts          # Detection heuristics unit tests
│   ├── field-mapper.test.ts      # Confidence scoring & normalization unit tests
│   ├── safety-guard.test.ts      # Safety exclusion unit tests
│   └── profile-store.test.ts     # Storage, completeness, and schema validation tests
│
├── test-form.html                # Realistic job application test page with harness
├── vite.config.ts                # Multi-target Vite production bundler
├── tailwind.config.js            # Design system tokens
└── package.json
```

---

## 🔒 Privacy Model & Permissions Rationale

ApplyKit requests the minimum set of permissions necessary:

| Permission | Why It Is Needed |
| :--- | :--- |
| `storage` | To store your profile data locally on your device via `chrome.storage.local`. |
| `clipboardWrite` | To copy your stored URLs and profile values directly to your clipboard upon click or shortcut. |
| `activeTab` | Grants temporary access to inspect form fields only on the tab where you actively open ApplyKit. |
| `scripting` | Executes the safe autofill sequence on detected inputs without requiring broad site privileges. |
| `commands` | Powers customizable global keyboard shortcuts (`Ctrl+Shift+L`, `Ctrl+Shift+G`, etc.). |

ApplyKit **never** requests `tabs`, `history`, `cookies`, `webRequest`, or background network permissions.

---

## 🛠️ Local Development & Setup

### Prerequisites
- Node.js >= 18
- npm >= 9

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Tests
```bash
npm test
```
Runs the Vitest suite covering all 27 unit tests across detection, mapping, safety exclusions, and storage validation.

### 3. Start Development Server
```bash
npm run dev
```
Starts the Vite dev server at `http://localhost:5173/`. You can view:
- Options Dashboard: `http://localhost:5173/options.html`
- Popup UI: `http://localhost:5173/popup.html`
- Test Job Application: `http://localhost:5173/test-form.html`

### 4. Build the Extension
```bash
npm run build
```
Generates a production-ready, bundled extension in `dist/`.

---

## 📦 How to Load in Chrome / Brave / Edge

1. Open your Chromium browser and go to:
   - Chrome: `chrome://extensions`
   - Brave: `brave://extensions`
   - Edge: `edge://extensions`
2. Toggle on **Developer mode** (top-right corner).
3. Click **Load unpacked** (top-left).
4. Select the `dist/` directory inside this project (`d:\ApplyKit\dist`).
5. ApplyKit is now installed! Pin it to your extension toolbar for instant access.

---

## 🧪 Testing the Complete Flow

1. Open `test-form.html` in your browser (either locally or via `http://localhost:5173/test-form.html`).
2. Click the **ApplyKit** extension icon in your browser toolbar.
3. You will see:
   - **✨ Application detected** with detected field counts.
4. Click **Review & Autofill Form**.
5. Inspect the preview modal:
   - Notice that benign candidate fields (Full Name, Email, Phone, LinkedIn, GitHub, LeetCode, Portfolio, College, Degree, Graduation Year, Skills, Summary) are recognized.
   - Notice that sensitive questions (Work Authorization, Salary Expectation, Legal Declarations) are **completely excluded**.
6. Click **Autofill Selected**.
7. Observe that fields are cleanly populated, input events are triggered, and the **Submit Application** button remains **UNTOUCHED**.
8. Verify the verification badge in the bottom-left of `test-form.html` shows:
   - `Submit button: UNTOUCHED ✓ (Safe)`
   - `Safety compliance: ✅ PASS (No sensitive fields touched)`

---

---

## 🎯 ATS Job Description Analyzer & Resume Tailor

ApplyKit integrates a privacy-preserving ATS matching and resume tailoring engine:
1. **Automated JD Detection**: Content script extracts job requirements and titles from Greenhouse, Lever, Ashby, Workday, LinkedIn, or text selection.
2. **450+ Skills Dictionary**: High-performance tokenizer classifies technical skills across required and preferred sections.
3. **ATS Compatibility Scoring**: Calculates a weighted percentage match and lists matched vs. missing skills.
4. **1-Click Skill Absorption**: Missing skills from the job description can be added to your profile with one click.
5. **Tech Stack Prioritization**: Dynamically reorders candidate skills to prioritize technologies sought by the role.
6. **Multi-Tone Summary Synthesis**: Generates 3 role-tailored summaries (*Impact-Driven*, *Core Specialist*, and *Adaptable*) with 1-click copy or autofill injection.
7. **Cold Outreach & Cover Letter Generator**:
   - **Cover Letters**: Synthesizes 3-paragraph formal and modern concise cover letters tailored to the target role, company, and matching tech stack. Exportable as Markdown (`.md`) or 1-click clipboard copy.
   - **LinkedIn InMail**: ~100-word punchy recruiter connection request referencing the specific position and technical strengths.
   - **Hiring Manager Cold Email**: Complete with high-open-rate subject lines and structured value propositions.
   - **Quick Pitch / Elevator DM**: 2-3 sentence elevator pitch for fast networking on Twitter, Telegram, or Slack.

---

## 📚 Smart Answer Vault & Snippet Library

ApplyKit eliminates the fatigue of answering open-ended application essay prompts:
1. **Pre-Loaded Behavioral & Logistics Answers**: Comes standard with ready-to-use snippets for *Notice Period & Availability*, *Relocation & Remote Preferences*, *Why This Company & Role?*, *Proudest Technical Project*, *Overcoming Challenges*, and *Work Authorization*.
2. **Dynamic Token Interpolation**: Use `{company}`, `{role}`, `{skills}`, and `{fullName}` tokens in any snippet. When viewing an active job application page or using the popup, tokens are automatically replaced with the detected company and role details.
3. **Popup Quick-Copy Switcher**: Instantly switch between `⚡ Quick Links` and `📚 Answer Vault` directly in the extension popup with instant search and 1-click copy.
4. **Full Options Dashboard Manager**: Search, filter by category (`General`, `Technical`, `Behavioral`, `Logistics`), create, edit, tag, and delete snippets. Also displayed in the dedicated web Master Profile.

---

## 🌐 Dedicated Cloud Web Platform (`http://localhost:5173/`)

ApplyKit includes a dedicated modern web platform for end-to-end application lifecycle tracking and resume tailoring:
1. **Visual Kanban Pipeline**: Drag and organize job applications across *Wishlist*, *Applied*, *Interviewing*, *Offer*, and *Archived*.
2. **Searchable & Filterable Table View**: Quick filtering, company search, salary details, and date tracking.
3. **Application Metrics Ribbon**: Real-time conversion tracking (Total Tracked, Applied, Active Interviews, Offers, and Response Rate %) plus top in-demand skills aggregation across your pipeline.
4. **Interactive Interview Rounds**: Add interview stages, upcoming dates, and preparation notes directly to any tracked application.
5. **ATS Resume Studio**: Paste any job description to evaluate ATS compatibility, identify gaps, and generate tailored summaries on the big screen.
6. **Master Candidate Profile**: Edit and maintain your unified credentials with real-time profile completeness tracking.
7. **Pluggable Cloud Sync Engine**:
   - **Local Gateway (Default)**: Zero-setup offline-first storage using the `BroadcastChannel` API for instantaneous cross-tab synchronization with the Chrome Extension.
   - **Firebase / Firestore**: Support for custom Firebase projects.
   - **Custom REST API**: Support for personal webhooks or enterprise ingestion endpoints.
   - **Full JSON Backup**: 1-click export and import of all applications and candidate profiles.

---

## 🧪 Testing the Complete Flow

1. **Extension Autofill**:
   - Open `test-form.html` in your browser (or via `http://localhost:5173/test-form.html`).
   - Click the **ApplyKit** extension icon in your browser toolbar.
   - Click **Review & Autofill Form**, verify that sensitive fields are safely omitted, and click **Autofill Selected**.
   - After filling, click **Log Application** in the extension popup to sync it with your Cloud Tracker.

2. **Dedicated Web Platform**:
   - Navigate to `http://localhost:5173/` in any browser tab.
   - View your application appearing instantly on the **Kanban Board** and **Metrics Ribbon**.
   - Test switching between Kanban and Table views.
   - Open the **ATS Resume Studio** tab to analyze job postings and generate tailored summaries.
   - Click the **Cloud Settings** icon to test manual sync or export a JSON backup.

---

## 📄 License

MIT License. Free and open source for all students and job seekers.
