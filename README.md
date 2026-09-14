# CareerSync

<p align="center">
  <strong>The intelligent career, job, and internship application management platform with automated ATS discovery, AI interview prep, and end-to-end timeline tracking</strong>
</p>

<p align="center">
  <a href="#key-features">Key Features</a> ·
  <a href="#quick-start">Quick Start</a> ·
  <a href="#architecture--tech-stack">Tech Stack</a> ·
  <a href="#interview-tracking--timeline">Interview Tracking</a> ·
  <a href="#ai-assistant--mcp-integration">AI &amp; MCP</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-CareerSync-6366F1?style=for-the-badge&logo=rocket" alt="CareerSync Platform">
  <img src="https://img.shields.io/badge/Next.js-15_App_Router-black?style=for-the-badge&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Prisma-SQLite-2D3748?style=for-the-badge&logo=prisma" alt="Prisma">
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker" alt="Docker Ready">
</p>

---

## Overview

**CareerSync** is a full-featured, self-hosted job and internship application management platform built for software engineers and tech professionals. It solves the fragmentation of modern recruiting cycles by consolidating application tracking, multi-stage interview prep, proactive recruiter follow-ups, automated job discovery, and AI-powered document matching into an executive command center.

CareerSync keeps your career data private and under your direct control, with flexible support for local LLMs (via **Ollama**) as well as hosted cloud providers (**OpenAI, DeepSeek, Google Gemini, OpenRouter**), along with a Model Context Protocol (**MCP**) server for direct integration with AI desktop assistants like Claude Desktop.

---

## Key Features

### 1. Executive Performance Dashboard
- **Executive KPIs**: Real-time tracking of total applications, response rate %, active interview pipelines, offers received, and pending follow-ups.
- **Application Funnel Visualization**: Conversion analysis displaying progression from Draft &rarr; Applied &rarr; Interviewing &rarr; Offer.
- **Role Distribution**: Breakdown of roles by category (Full-time, Internship, Contract, Part-time).
- **Upcoming Interviews Widget**: Interactive chronologically sorted agenda with one-click meeting link launchers.
- **Urgent Follow-Ups Hub**: Proactive reminder queue highlighting overdue, due today, and upcoming recruiter check-ins.

### 2. Multi-Stage Interview Tracking & Timeline
- **Multi-Round Lifecycle**: Track every stage from initial recruiter screen, technical interviews, take-homes, system design rounds, behavioral evaluations, to final executive debriefs.
- **Meeting Link Launchers**: Direct one-click access to Google Meet, Zoom, Microsoft Teams, or custom interview URLs.
- **Pre-Interview Prep & Feedback Notes**: Dedicated fields to record question prep, company research, and post-interview debrief notes.
- **Stage Status Indicators**: Color-coded round statuses (Scheduled, Completed, Cancelled, Rescheduled).

### 3. Proactive Follow-Up Reminders
- **Date-Driven Outreach**: Schedule follow-up targets right after applying or finishing an interview round.
- **Quick-Schedule Presets**: Rapidly schedule reminders (+3 Days, +1 Week, +2 Weeks) with a single click.
- **Urgency Tagging**: Automatic visual tagging on applications (`⚠️ Overdue`, `⏰ Due Today`, `📅 Upcoming`).
- **Contextual Notes & Resolution**: Save conversation context and mark reminders resolved when completed.

### 4. Advanced Search & Multi-Faceted Filtering
- **Live Deep Search**: Instantly filter applications by role title, company name, location, tags, and posting description.
- **Internship & Role Type Filters**: Dedicated toggle for Internships (`🎓 Internship`), Full-time, Contract, and Part-time positions.
- **Urgency Filters**: Quickly isolate applications with pending follow-ups or upcoming interviews.
- **Multi-Property Sorting**: Sort by newest, oldest, recently applied, due date, follow-up date, company name, or AI match score.

### 5. AI Career Assistant & MCP Server
- **Docked AI Assistant**: Persistent side-panel chat that contextually inspects your current page and active application.
- **AI Resume Review**: In-depth scored critique of your resume structure, keyword impact, and engineering accomplishments.
- **Tailored Cover Letter Generation**: Generates customized cover letters synthesized directly from your resume and target job requirements.
- **Job-Fit Match Analysis**: Evaluates your background against specific job postings, yielding a numerical score and gap analysis.
- **Model Context Protocol (MCP)**: Native MCP server exposing tools (`add_job`, `find_job`, `update_job`, `add_question`, `review_resume`) to Claude Desktop and AI agents.

### 6. Resume & Document Management
- **Structured Resume Builder**: Import resumes from PDF or Word (.docx) documents with automated AI section extraction.
- **PDF Export Engine**: Generate clean, ATS-friendly PDFs using either the **Professional** or **Simple** template.
- **Question Bank**: Repository of behavioral and technical interview questions with personal answers and tag management.

### 7. Automated ATS Job Board Discovery
- **Scheduled Board Scraping**: Query Greenhouse, Lever, and Ashby public job boards for target employers without needing private API keys.
- **Relevance Scoring**: Local algorithmic pre-filter ranks postings before invoking AI match scoring to conserve tokens.

### 8. Theme System
- **Dark, Light & System Modes**: Fully responsive, hydration-safe theme switching built with `next-themes` and Tailwind CSS.

---

## Tech Stack & Architecture

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router, Server Actions) | Fullstack React framework with SSR and streaming |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Type-safe domain models and server actions |
| **Database** | [SQLite](https://www.sqlite.org/) with [Prisma ORM](https://www.prisma.io/) | Lightweight, zero-config relational storage |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/) | Accessible, modern component design system |
| **AI Integration** | [Vercel AI SDK](https://sdk.vercel.ai/) & [Ollama](https://ollama.com/) | Unified LLM streaming across local and hosted models |
| **Agent Protocol** | [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) | Standardized agent tools for Claude Desktop |
| **PDF Generation** | [@react-pdf/renderer](https://react-pdf.org/) | Server-side and client-side vector PDF generation |
| **Data Viz** | [@nivo/bar](https://nivo.rocks/), [@nivo/pie](https://nivo.rocks/) | Responsive SVG charts and metrics visualizations |
| **Authentication** | [NextAuth.js v5 (Auth.js)](https://authjs.dev/) | Secure local session and credential management |

---

## Quick Start

### Option 1: Docker (Recommended)

Make sure [Docker](https://www.docker.com) is installed and running:

```sh
# Clone the repository
git clone https://github.com/your-username/CareerSync.git
cd CareerSync

# Start the application
docker compose up --build
```

Open [http://localhost:3737](http://localhost:3737) in your browser and create your account.

---

### Option 2: Local Development

Ensure you have **Node.js 20+** installed:

```sh
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env

# 3. Initialize the database and run migrations
npx prisma generate
npx prisma migrate deploy

# 4. Start the development server
npm run dev
```

Visit [http://localhost:3737](http://localhost:3737) to access CareerSync.

---

## Interview Tracking & Timeline

CareerSync includes a multi-round interview management engine:

1. **Schedule Rounds**: Navigate to any job application and select **Add Interview Round**.
2. **Choose Round Type**: Select from presets (*HR Phone Screen*, *Technical Interview 1 / 2*, *System Design*, *Behavioral*, *Final Interview*, *Offer Discussion*).
3. **Meeting Link Integration**: Provide your video conference URL (Google Meet, Zoom, Teams) to launch the call directly from the dashboard or job details page.
4. **Debrief & Notes**: Record post-interview impressions, questions asked, and salary expectations in the expandable round details.

---

## Proactive Follow-Up System

Never lose momentum with a recruiter or hiring manager:

- **Schedule Reminders**: Set a follow-up target on any application using the **Follow-Up Manager**.
- **Quick-Action Presets**: Choose **+3 Days**, **+1 Week**, or **+2 Weeks** to calculate dates instantly.
- **Actionable Dashboard Queue**: The Executive Dashboard surfaces any follow-ups that are overdue or due today so you can take prompt action.
- **One-Click Resolution**: Click **Mark as Followed Up** once you've sent your email or LinkedIn note.

---

## AI Assistant & MCP Integration

### In-App AI Assistant
Click the **AI Assistant** icon in the header to open the docked copilot. The assistant can:
- Parse pasted job postings to auto-fill application records.
- Conduct comprehensive resume audits against software engineering standards.
- Score your profile match against specific job descriptions.
- Compose tailored cover letters emphasizing relevant technical achievements.

### Connecting Claude Desktop via MCP
CareerSync provides a remote Model Context Protocol endpoint:

1. Navigate to **Settings &rarr; MCP Access** in CareerSync.
2. Click **Generate Token** and copy the configuration snippet.
3. Add the snippet to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "careersync": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "http://localhost:3737/api/mcp",
        "--header",
        "Authorization: Bearer <YOUR_TOKEN>"
      ]
    }
  }
}
```
4. Restart Claude Desktop. You can now tell Claude: *"Add this Software Engineer posting to CareerSync"* or *"Save this interview question to my CareerSync Question Bank"*.

---

## Supported AI Providers

Configure your preferred model under **Settings &rarr; AI Settings**:
- **Ollama (Local & Private)**: Run `qwen2.5`, `llama3.2`, or `mistral` locally with zero API costs.
- **OpenAI**: GPT-4o, GPT-4o-mini, etc.
- **DeepSeek**: DeepSeek Chat / DeepSeek Coder.
- **Google Gemini**: Gemini 1.5 Pro, Gemini 1.5 Flash.
- **OpenRouter**: Access dozens of open-source and proprietary models through a single API key.

---

## License

CareerSync is open-source software licensed under the [MIT License](./LICENSE).
