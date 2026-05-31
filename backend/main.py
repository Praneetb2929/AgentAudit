from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import AuditRequest, AuditReport
from auditor import run_full_audit
from report import calculate_risk_score

app = FastAPI(title="AgentAudit API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://agentaudit.vercel.app",   # add this
        "https://*.vercel.app",             # covers preview deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health():
    return {"status": "AgentAudit backend running"}

@app.post("/audit", response_model=AuditReport)
async def audit_agent(request: AuditRequest):
    try:
        tools_list = [{"name": t.name, "description": t.description} for t in request.tools]

        results = await run_full_audit(
            system_prompt=request.system_prompt,
            tools=tools_list,
            agent_name=request.agent_name,
            target_url=getattr(request, "target_url", None),
            auth_header=getattr(request, "auth_header", None)
        )

        report = calculate_risk_score(results)

        return AuditReport(
            agent_name=request.agent_name,
            attack_results=results,
            **report
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))