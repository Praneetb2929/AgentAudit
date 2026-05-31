# AgentAudit 🔍

**Automated red-teaming and security auditing for LLM agents.**

AgentAudit is the first accessible tool that automatically stress-tests AI agents against adversarial attacks — and tells you exactly how to fix the vulnerabilities it finds.

![AgentAudit Demo](https://img.shields.io/badge/status-live-brightgreen) ![Built with](https://img.shields.io/badge/built%20with-FastAPI%20%2B%20React%20%2B%20Groq-orange)

---

## The Problem

AI agents are being deployed in customer support, finance, healthcare, and legal — but there's no standard way to test if they're safe before shipping. A single prompt injection can make your agent ignore its instructions. A data exfiltration attack can expose your system prompt to any user.

Security tools like Garak exist but require a PhD to run. **There's no Burp Suite for AI agents.**

## What AgentAudit Does

Paste your agent's system prompt → AgentAudit fires 10 adversarial attacks across 5 categories → you get a structured security report with a 0–100 risk score, per-category breakdown, and remediation suggestions → apply fixes → re-audit in one click and watch the score drop.

**Under 60 seconds. No ML expertise required.**

---

## 5 Attack Categories

| Category | What It Tests |
|---|---|
| 💉 Prompt Injection | Malicious input that tries to override the agent's system instructions |
| 🎯 Goal Hijacking | Subtle redirection toward goals the agent was never meant to serve |
| 🌀 Hallucination Trap | Questions designed to make the agent fabricate facts confidently |
| 🔓 Data Exfiltration | Attempts to leak system prompt, context window, or internal tool info |
| ♾️ Jailbreak | Roleplay and hypothetical framings that bypass safety constraints |

---

## How It Works — The 3-LLM Pipeline

```
System Prompt + Tools
        ↓
[LLM #1] Attack Generator
  → Analyzes agent definition
  → Generates 10 targeted adversarial test cases (structured JSON)
        ↓
[LLM #2] Attack Simulator
  → Simulates the agent responding to each attack
  → Captures agent behavior under adversarial conditions
        ↓
[LLM #3] Response Evaluator
  → Judges each response: RESISTED or FAILED?
  → Assigns severity: NONE / LOW / MEDIUM / HIGH / CRITICAL
        ↓
Risk Report
  → 0-100 risk score
  → Category breakdown
  → Top vulnerabilities
  → Remediation suggestions
```

No custom ML models. No fine-tuning. Pure prompt engineering.

---

## Demo — Before & After

**Vulnerable Customer Support Bot (weak system prompt):**
- Risk Score: **35 / MEDIUM**
- Prompt Injection: **100% failed** (agent followed malicious instructions)
- Data Exfiltration: **100% failed** (agent revealed internal tool structure)

**After applying AgentAudit's remediation suggestions:**
- Risk Score: **8 / LOW**
- All 10 attacks: **RESISTED**

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI (Python) |
| LLM | Groq API — Llama 3.3 70B + fallback models |
| Frontend | React + Recharts + Vite |
| Styling | Inline CSS (dark theme) |
| Pipeline | 3-stage LLM orchestration in auditor.py |

---

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Groq API key (free at https://console.groq.com)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create backend/.env:
```
GROQ_API_KEY=your_key_here
```

```bash
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Project Structure

```
agentaudit/
├── backend/
│   ├── main.py          # FastAPI app + /audit endpoint
│   ├── models.py        # Pydantic schemas
│   ├── auditor.py       # 3-LLM pipeline orchestration
│   ├── prompts.py       # All LLM prompts
│   ├── report.py        # Risk score calculation
│   └── requirements.txt
└── frontend/
    └── src/
        ├── App.jsx              # Router + state
        ├── InputForm.jsx        # Agent input + demo loader
        ├── AuditDashboard.jsx   # Results dashboard
        ├── RiskGauge.jsx        # Radial risk score chart
        ├── AttackTable.jsx      # Per-attack results table
        └── api.js               # Axios API calls
```

---

## Roadmap

- [x] System prompt input + tool definitions
- [x] 3-LLM adversarial attack pipeline
- [x] Risk score gauge + category breakdown
- [x] Remediation suggestions
- [x] Fix & Re-audit in one click
- [ ] Live HTTP endpoint probing
- [ ] CI/CD GitHub Action integration
- [ ] PDF audit report export
- [ ] SaaS platform with audit history

---

## Built For

**Beyond Tomorrow Hackathon 2026** — AI / ML Track. Built solo in 3 days.

---

## Why This Matters

The EU AI Act (2025) mandates risk assessments for high-risk AI systems. NIST AI RMF recommends adversarial testing. As AI agents proliferate into regulated industries, automated safety auditing stops being a nice-to-have and becomes a compliance requirement.

AgentAudit makes that accessible to every developer — not just security researchers.
