/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import zlib from 'zlib';
import {
  extractSkillsAndSummaryFromResumeText,
  extractTextFromDataUrl,
  extractTextFromPdfArrayBuffer,
  parsePdfTextOperators,
  decodeHexPdfString,
  unescapePdfLiteralString,
} from '../src/analyzer/resume-extractor';

describe('Resume Data Extractor (Skills & Summary)', () => {
  const sampleResume = `
Jane Doe
San Francisco, CA | jane.doe@example.com | (555) 123-4567
linkedin.com/in/janedoe | github.com/janedoe

PROFESSIONAL SUMMARY
Senior Software Engineer with 6+ years of experience architecting high-performance distributed systems, modern React frontends, and cloud-native infrastructure on AWS. Passionate about engineering velocity and API security.

TECHNICAL SKILLS
Languages: TypeScript, JavaScript, Python, Go, SQL
Frontend: React, Next.js, Redux, Tailwind CSS, HTML5, CSS3
Backend & Cloud: Node.js, Express.js, Docker, Kubernetes, AWS, PostgreSQL, Redis, Kafka
Tools & Testing: Git, Webpack, Jest, CI/CD, Vite

EXPERIENCE
Staff Engineer | Acme Cloud Inc. | 2022 - Present
- Architected microservices with Node.js and TypeScript handling 50M requests daily.
- Migrated legacy dashboard to Next.js and Tailwind CSS, decreasing load times by 45%.
- Implemented automated CI/CD pipelines with Docker and AWS ECS.

Software Engineer | Globex Systems | 2019 - 2022
- Developed RESTful APIs with Python and PostgreSQL.
- Maintained Kubernetes clusters and Kafka event streams.

EDUCATION
B.S. in Computer Science | University of California, Berkeley (2019)
`;

  it('extracts professional summary from explicit summary section', () => {
    const result = extractSkillsAndSummaryFromResumeText(sampleResume);

    expect(result.summary).toContain('Senior Software Engineer with 6+ years of experience');
    expect(result.summary).toContain('AWS. Passionate about engineering velocity and API security.');
    expect(result.summary).not.toContain('TECHNICAL SKILLS');
  });

  it('extracts and categorizes technical skills across languages, frontend, backend, and cloud', () => {
    const result = extractSkillsAndSummaryFromResumeText(sampleResume);

    // Common skills detected
    expect(result.skills).toContain('TypeScript');
    expect(result.skills).toContain('React');
    expect(result.skills).toContain('Next.js');
    expect(result.skills).toContain('Python');
    expect(result.skills).toContain('AWS');
    expect(result.skills).toContain('Docker');
    expect(result.skills).toContain('PostgreSQL');
    expect(result.skills).toContain('Kafka');

    // Categorization check
    expect(result.categorizedSkills.languages).toContain('TypeScript');
    expect(result.categorizedSkills.frontend).toContain('React');
    expect(result.categorizedSkills.backend).toContain('Node.js');
    expect(result.categorizedSkills.cloud_devops).toContain('AWS');
    expect(result.categorizedSkills.cloud_devops).toContain('Docker');
    expect(result.categorizedSkills.databases).toContain('PostgreSQL');
  });

  it('cleans bullet-pointed summary into coherent sentences', () => {
    const bulletedResume = `
Alex Morgan
alex@example.com

EXECUTIVE SUMMARY:
• Full-stack developer with 5+ years building scalable cloud apps.
• Expert in React, TypeScript, Node.js, and distributed microservices.
• Proven track record reducing API latencies by 40% across AWS environments.

SKILLS:
React, TypeScript, Node.js, AWS, PostgreSQL

EXPERIENCE
...
`;

    const result = extractSkillsAndSummaryFromResumeText(bulletedResume);
    expect(result.summary).toContain('Full-stack developer with 5+ years building scalable cloud apps.');
    expect(result.summary).toContain('Expert in React, TypeScript, Node.js');
    expect(result.summary).not.toContain('•');
  });

  it('extracts dynamic technical terms from categorized subsections and experience stacks', () => {
    const modernTechResume = `
Taylor Swift
taylor@example.com

SUMMARY
Backend architect specializing in modern high-throughput stacks.

TECHNICAL EXPERTISE
Frameworks: FastAPI, NestJS, Spring Boot, tRPC, Drizzle ORM
Databases: PostgreSQL, Redis, ClickHouse, Supabase
Infrastructure: Terraform, Kubernetes, Helm, ArgoCD, Prometheus

EXPERIENCE
Lead Engineer | TechCorp
- Built event-driven pipelines using Apache Spark and Celery with RabbitMQ.
- Technologies Used: Python, FastAPI, Docker, PostgreSQL, Redis, GitHub Actions.
`;

    const result = extractSkillsAndSummaryFromResumeText(modernTechResume);

    expect(result.skills).toContain('FastAPI');
    expect(result.skills).toContain('NestJS');
    expect(result.skills).toContain('Spring Boot');
    expect(result.skills).toContain('PostgreSQL');
    expect(result.skills).toContain('Redis');
    expect(result.skills).toContain('Terraform');
    expect(result.skills).toContain('Kubernetes');
    expect(result.skills).toContain('Helm');
    expect(result.skills).toContain('ArgoCD');
    expect(result.skills).toContain('Prometheus');
    expect(result.skills).toContain('Supabase');
    expect(result.skills).toContain('Apache Spark');
    expect(result.skills).toContain('RabbitMQ');
    expect(result.skills).toContain('GitHub Actions');
  });

  it('handles resume without explicit Summary label using introductory bio paragraph', () => {
    const resumeWithoutHeader = `
Alex Morgan
alex.morgan@test.com | Seattle, WA

Full-Stack Developer passionate about user-facing products, scalable GraphQL architectures, and resilient backend microservices with Go and TypeScript.

TECHNICAL SKILLS
Go, TypeScript, React, GraphQL, Docker, MongoDB

WORK EXPERIENCE
Developer at TechCorp...
`;

    const result = extractSkillsAndSummaryFromResumeText(resumeWithoutHeader);

    expect(result.summary).toContain('Full-Stack Developer passionate about user-facing products');
    expect(result.skills).toContain('Go');
    expect(result.skills).toContain('TypeScript');
    expect(result.skills).toContain('GraphQL');
  });

  it('synthesizes professional summary when resume has no summary text at all', () => {
    const bareResume = `
David Lee
david@test.com | (555) 987-6543
Full-Stack Engineer

SKILLS
React, TypeScript, Node.js, PostgreSQL, Docker, AWS

EXPERIENCE
Software Engineer at Delta Inc (2021 - 2024)
- Developed responsive web applications using React and Node.js.
`;

    const result = extractSkillsAndSummaryFromResumeText(bareResume);

    // Summary must be automatically synthesized and non-empty
    expect(result.summary).toBeDefined();
    expect(result.summary.length).toBeGreaterThan(40);
    expect(result.summary).toContain('Full-Stack Engineer');
    expect(result.summary).toContain('React');
  });

  it('extracts printable text from base64 dataUrl', async () => {
    const originalText = 'Jane Doe Software Engineer TypeScript React';
    const base64 = btoa(originalText);
    const dataUrl = `data:text/plain;base64,${base64}`;

    const extracted = await extractTextFromDataUrl(dataUrl);
    expect(extracted).toContain('Jane');
    expect(extracted).toContain('TypeScript');
    expect(extracted).toContain('React');
  });

  it('strictly filters out PDF metadata, URLs, usernames, and binary noise', () => {
    const rawNoisyResumeText = `
Vishwajit Sutar
https://www.linkedin.com/in/vishwajit-sutar-03324b2b0
github.com/VishwajitS7
leetcode.com/vishu31103
codeforces.com/profile/vishu31103
www.geeksforgeeks.org/user/vishu3go8b
vishwajit.vercel.app

TECHNICAL SKILLS
Languages: C++, Python, JavaScript, TypeScript
Web: React, Node.js, Express.js, Tailwind CSS
Databases: PostgreSQL, MongoDB, Redis

EXPERIENCE
Software Engineer at TechCorp
- Built scalable web applications with React and Node.js.

PDF Noise and Metadata:
ReportLab BaseFont WinAnsiEncoding MediaBox ProcSet ImageB ImageC ImageI PageMode UseNone CreationDate ModDate FlateDecode
Keywords unspecified MbfEU"Iegt.KQAAt LLEhfb gCFu& cfd9be%RA.=% u+DJ 97JWc1k2j Gau0E S9BLBi ZtF S8eRQ Ff6prVZhHjrS Qd09JUeHmgf
`;

    const result = extractSkillsAndSummaryFromResumeText(rawNoisyResumeText);

    // Valid technical skills must be extracted
    expect(result.skills).toContain('C++');
    expect(result.skills).toContain('Python');
    expect(result.skills).toContain('JavaScript');
    expect(result.skills).toContain('TypeScript');
    expect(result.skills).toContain('React');
    expect(result.skills).toContain('Node.js');
    expect(result.skills).toContain('PostgreSQL');
    expect(result.skills).toContain('MongoDB');
    expect(result.skills).toContain('Redis');

    // ALL noise, URLs, usernames, PDF keys, and binary garbage must be strictly filtered
    expect(result.skills).not.toContain('ReportLab');
    expect(result.skills).not.toContain('BaseFont');
    expect(result.skills).not.toContain('WinAnsiEncoding');
    expect(result.skills).not.toContain('MediaBox');
    expect(result.skills).not.toContain('ProcSet');
    expect(result.skills).not.toContain('FlateDecode');
    expect(result.skills).not.toContain('Keywords');
    expect(result.skills).not.toContain('unspecified');
    expect(result.skills).not.toContain('https');
    expect(result.skills).not.toContain('www.linkedin.com');
    expect(result.skills).not.toContain('github.com');
    expect(result.skills).not.toContain('VishwajitS7');
    expect(result.skills).not.toContain('leetcode.com');
    expect(result.skills).not.toContain('Gau0E');
    expect(result.skills).not.toContain('S9BLBi');
    expect(result.skills).not.toContain('MbfEU');
    expect(result.skills).not.toContain('Ff6prVZhHjrS');
  });

  it('extracts parenthetical sub-tools and contextual action bullet skills', () => {
    const resumeWithParenAndContext = `
Alex Mercer
alex@example.com

SUMMARY
Full-Stack Cloud Developer with 4+ years of experience.

TECHNICAL SKILLS
Cloud Infrastructure: AWS (S3, EC2, Lambda, ECS, RDS), Docker, Kubernetes
Data & Storage: ClickHouse, Pinecone, Redis

EXPERIENCE
Software Engineer | NextGen Apps
- Proficient in React, Node.js, Express, and PostgreSQL.
- Architected real-time streaming services (Go, gRPC, Kafka, Redis).
- Built search pipelines utilizing Elasticsearch and Python.
`;

    const result = extractSkillsAndSummaryFromResumeText(resumeWithParenAndContext);

    // Parenthetical skills
    expect(result.skills).toContain('AWS');
    expect(result.skills).toContain('S3');
    expect(result.skills).toContain('EC2');
    expect(result.skills).toContain('Lambda');
    expect(result.skills).toContain('ECS');
    expect(result.skills).toContain('RDS');
    expect(result.skills).toContain('ClickHouse');
    expect(result.skills).toContain('Pinecone');

    // Contextual action bullet skills
    expect(result.skills).toContain('React');
    expect(result.skills).toContain('Node.js');
    expect(result.skills).toContain('Express.js');
    expect(result.skills).toContain('PostgreSQL');
    expect(result.skills).toContain('Go');
    expect(result.skills).toContain('gRPC');
    expect(result.skills).toContain('Kafka');
    expect(result.skills).toContain('Elasticsearch');
  });

  it('supports diverse summary headers like Qualifications Summary and About Me', () => {
    const resumeWithAltHeaders = `
Jordan Patel
jordan@example.com

SUMMARY OF QUALIFICATIONS
• 8+ years of experience in distributed systems and cloud platform reliability.
• Proven track record designing high-availability architectures handling 100K RPS.
• Demonstrated leadership scaling engineering teams from 4 to 25 developers.

TECHNICAL SKILLS
Python, Go, Docker, Kubernetes, Terraform

EXPERIENCE
Platform Lead | CloudScale Inc.
`;

    const result = extractSkillsAndSummaryFromResumeText(resumeWithAltHeaders);
    expect(result.summary).toContain('8+ years of experience in distributed systems and cloud platform reliability.');
    expect(result.summary).toContain('Proven track record designing high-availability architectures');
    expect(result.summary).not.toContain('•');
  });
});

describe('PDF Stream and Hex Extraction', () => {
  it('decodes ASCII and UTF-16BE hex strings', () => {
    expect(decodeHexPdfString('5669736877616a6974205375746172')).toBe('Vishwajit Sutar');
    // UTF-16BE with BOM
    expect(decodeHexPdfString('feff005600690073006800770061006a00690074')).toBe('Vishwajit');
    // Implicit UTF-16BE
    expect(decodeHexPdfString('005600690073006800770061006a00690074002000530075007400610072')).toBe('Vishwajit Sutar');
  });

  it('unescapes literal strings including octal UTF-16BE BOM', () => {
    expect(unescapePdfLiteralString('Hello \\(World\\)')).toBe('Hello (World)');
    expect(unescapePdfLiteralString('\\376\\377\\000R\\000e\\000a\\000c\\000t')).toBe('React');
  });

  it('parses PDF text operators with TJ arrays, hex, and kerning word breaks', () => {
    const stream = `
      BT
      /F1 12 Tf
      <005600690073006800770061006a00690074> Tj
      (Senior Full-Stack Engineer) Tj
      [ <0050007900740068006f006e> -150 <0054007900700065005300630072006900700074> -150 <0044006f0063006b00650072> ] TJ
      ET
    `;
    const pieces: string[] = [];
    parsePdfTextOperators(stream, pieces);

    expect(pieces).toContain('Vishwajit');
    expect(pieces).toContain('Senior Full-Stack Engineer');
    expect(pieces).toContain('Python TypeScript Docker');
  });

  it('extracts text from zlib FlateDecode compressed PDF array buffer', async () => {
    const rawStream = `
      BT
      /F1 12 Tf
      (PROFESSIONAL SUMMARY) Tj
      (Full-Stack Developer with 5+ years of experience architecting React, TypeScript, and AWS cloud applications.) Tj
      (TECHNICAL SKILLS) Tj
      (Languages: Python, TypeScript, Go, SQL) Tj
      (Frontend: React, Next.js, Redux, Tailwind CSS) Tj
      (Cloud: Docker, Kubernetes, AWS) Tj
      ET
    `;
    const compressed = zlib.deflateSync(Buffer.from(rawStream, 'latin1'));

    const mockPdf = Buffer.concat([
      Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\n', 'latin1'),
      Buffer.from(`2 0 obj\n<<\n/Length ${compressed.length}\n/Filter /FlateDecode\n>>\nstream\r\n`, 'latin1'),
      compressed,
      Buffer.from('\r\nendstream\nendobj\n%%EOF', 'latin1'),
    ]);

    const extractedText = await extractTextFromPdfArrayBuffer(mockPdf.buffer);
    expect(extractedText).toContain('PROFESSIONAL SUMMARY');
    expect(extractedText).toContain('Full-Stack Developer with 5+ years of experience');
    expect(extractedText).toContain('React, Next.js');

    // Feed extracted text into skill extractor
    const result = extractSkillsAndSummaryFromResumeText(extractedText);
    expect(result.skills).toContain('React');
    expect(result.skills).toContain('TypeScript');
    expect(result.skills).toContain('Python');
    expect(result.skills).toContain('AWS');
    expect(result.skills).toContain('Docker');
    expect(result.summary).toContain('Full-Stack Developer with 5+ years of experience');
  });

  it('extracts resume text from base64 PDF data URL', async () => {
    const rawStream = `
      BT
      (Vishwajit Sutar) Tj
      (Software Engineer specializing in Go, Docker, and Kubernetes.) Tj
      ET
    `;
    const compressed = zlib.deflateSync(Buffer.from(rawStream, 'latin1'));
    const mockPdf = Buffer.concat([
      Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Length ' + compressed.length + '\n/Filter /FlateDecode\n>>\nstream\r\n', 'latin1'),
      compressed,
      Buffer.from('\r\nendstream\nendobj\n%%EOF', 'latin1'),
    ]);

    const base64 = mockPdf.toString('base64');
    const dataUrl = `data:application/pdf;base64,${base64}`;

    const text = await extractTextFromDataUrl(dataUrl);
    expect(text).toContain('Vishwajit Sutar');
    expect(text).toContain('Software Engineer specializing in Go, Docker, and Kubernetes.');

    const result = extractSkillsAndSummaryFromResumeText(text);
    expect(result.skills).toContain('Go');
    expect(result.skills).toContain('Docker');
    expect(result.skills).toContain('Kubernetes');
  });
});


