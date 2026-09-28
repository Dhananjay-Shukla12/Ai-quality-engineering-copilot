# AI Quality Engineering Copilot

An AI-powered Quality Engineering project built with Playwright and TypeScript.

It combines traditional test automation with Gemini to help generate test cases, create Playwright tests, analyze failures, and automatically repair failed tests.

## What It Does

```text
User Story
    ↓
AI Test Planning
    ↓
Playwright Test Generation
    ↓
Test Execution
    ↓
Failure Analysis
    ↓
AI Test Repair
    ↓
Validation & Rerun
    ↓
PASS ✅
```

## Key Features

- AI-generated test cases from user stories
- Playwright + TypeScript automation
- Page Object Model
- Reusable Playwright fixtures
- API testing
- AI failure analysis using logs and screenshots
- AI-generated test repair
- TypeScript validation before rerunning repaired tests
- GitHub Actions CI/CD

## Tech Stack

`Playwright` · `TypeScript` · `Gemini API` · `Zod` · `Node.js` · `GitHub Actions`

## Project Structure

```text
ai-quality-engineering-copilot/
├── ai/          # Gemini-powered AI modules
├── api/         # API testing
├── fixtures/    # Playwright fixtures
├── pages/       # Page Objects
├── scripts/     # AI and self-healing workflows
├── test-data/   # Test data
└── tests/       # UI, API and generated tests
```

## Getting Started

Clone the repository and install dependencies:

```bash
git clone https://github.com/Dhananjay-Shukla12/Ai-quality-engineering-copilot.git
cd Ai-quality-engineering-copilot
npm install
npx playwright install
```

Create a `.env` file:

```env
GEMINI_API_KEY=your_api_key_here
```

## Run Tests

Run the complete Playwright suite:

```bash
npx playwright test
```

Run TypeScript validation:

```bash
npx tsc --noEmit
```

Run the AI self-healing workflow:

```bash
npm run self-heal
```

## AI Self-Healing

When a test fails, the framework can:

```text
Failure
   ↓
Screenshot + Failure Log
   ↓
AI Failure Analysis
   ↓
Suggested Fix
   ↓
AI Test Repair
   ↓
TypeScript Validation
   ↓
Playwright Rerun
```

The repaired test is only considered successful when the generated code passes TypeScript validation and the Playwright test passes.

## Why I Built This

I wanted to explore how AI can be integrated into a real automation workflow rather than using AI only for test-case generation.

The project focuses on the complete flow:

`Plan → Generate → Execute → Analyze → Repair → Validate`

## Current Validation

The project has been validated with:

- TypeScript compilation
- Playwright UI tests
- API tests
- AI test planning
- AI Playwright test generation
- Screenshot-based failure analysis
- AI test repair
- Automated self-healing

## Author

**Dhananjay Shukla**

Software Engineer | SDET | Playwright | AI/GenAI
