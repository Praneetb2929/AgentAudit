import { useState } from "react";
import InputForm from "./InputForm";
import AuditDashboard from "./AuditDashboard";
import { runAudit } from "./api";

export default function App() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [originalRequest, setOriginalRequest] = useState(null);

  const handleSubmit = async (agentName, systemPrompt, tools) => {
    setLoading(true);
    setError(null);
    setReport(null);
    setOriginalRequest({ agent_name: agentName, system_prompt: systemPrompt, tools });

    try {
      const result = await runAudit(agentName, systemPrompt, tools);
      setReport(result);
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong. Check if the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d0d", color: "#f0f0f0", fontFamily: "'Segoe UI', sans-serif" }}>
      {!report ? (
        <>
          <InputForm onSubmit={handleSubmit} loading={loading} />
          {error && (
            <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 24px" }}>
              <div style={{ background: "#2b0d0d", border: "1px solid #7f1d1d", borderRadius: 8, padding: 12, color: "#f87171", fontSize: "0.82rem" }}>
                ⚠️ {error}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div style={{ maxWidth: 960, margin: "0 auto", padding: "16px 24px 0" }}>
            <button
              onClick={() => { setReport(null); setOriginalRequest(null); }}
              style={{ background: "none", border: "1px solid #2a2a2a", color: "#f97316", borderRadius: 8, padding: "6px 14px", fontSize: "0.78rem", cursor: "pointer" }}
            >
              ← New Audit
            </button>
          </div>
          <AuditDashboard report={report} originalRequest={originalRequest} />
        </>
      )}
    </div>
  );
}