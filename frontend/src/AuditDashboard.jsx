import { useState } from "react";
import RiskGauge from "./RiskGauge";
import AttackTable from "./AttackTable";
import { runAudit } from "./api";

export default function AuditDashboard({ report, originalRequest }) {
  const {
    agent_name, risk_score, risk_level, total_attacks,
    attacks_passed, attacks_failed, attack_results,
    top_vulnerabilities, remediation_suggestions, category_scores
  } = report;

  const [selectedFixes, setSelectedFixes] = useState(
    remediation_suggestions.map(() => true) // all selected by default
  );
  const [reauditReport, setReauditReport] = useState(null);
  const [reauditLoading, setReauditLoading] = useState(false);
  const [reauditError, setReauditError] = useState(null);

  const toggleFix = (i) => {
    const updated = [...selectedFixes];
    updated[i] = !updated[i];
    setSelectedFixes(updated);
  };

  const handleReaudit = async () => {
    const appliedFixes = remediation_suggestions
      .filter((_, i) => selectedFixes[i])
      .map((fix, i) => `[Security Rule ${i + 1}]: ${fix}`)
      .join("\n");

    const patchedPrompt = `${originalRequest.system_prompt}

--- SECURITY CONSTRAINTS ADDED BY AGENTAUDIT ---
${appliedFixes}
--- END SECURITY CONSTRAINTS ---`;

    setReauditLoading(true);
    setReauditError(null);
    setReauditReport(null);

    try {
      const result = await runAudit(
        originalRequest.agent_name,
        patchedPrompt,
        originalRequest.tools
      );
      setReauditReport(result);
    } catch (err) {
      setReauditError("Re-audit failed. Check if backend is running.");
    } finally {
      setReauditLoading(false);
    }
  };

  const getRiskColor = (score) => {
    if (score <= 20) return "#4ade80";
    if (score <= 45) return "#facc15";
    if (score <= 70) return "#f97316";
    return "#ef4444";
  };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: 24 }}>
      <h2 style={{ color: "#f97316", marginBottom: 4 }}>Audit Report</h2>
      <p style={{ color: "#666", marginBottom: 32 }}>{agent_name}</p>

      {/* ── Score comparison row ── */}
      <div style={{ display: "flex", gap: 20, marginBottom: 32, flexWrap: "wrap", alignItems: "flex-start" }}>

        {/* Original score */}
        <div style={{ flex: 1, minWidth: 200, background: "#141414", border: "1px solid #252525", borderRadius: 12, padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: "0.7rem", color: "#666", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>Original</div>
          <RiskGauge score={risk_score} level={risk_level} />
        </div>

        {/* Arrow */}
        <div style={{ display: "flex", alignItems: "center", fontSize: "2rem", color: "#333", paddingTop: 60 }}>→</div>

        {/* Re-audit score or placeholder */}
        <div style={{ flex: 1, minWidth: 200, background: "#141414", border: `1px solid ${reauditReport ? "#166534" : "#252525"}`, borderRadius: 12, padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: "0.7rem", color: "#666", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>After Fix</div>
          {reauditReport ? (
            <>
              <RiskGauge score={reauditReport.risk_score} level={reauditReport.risk_level} />
              <div style={{ marginTop: 12, fontSize: "0.82rem", color: "#4ade80", fontWeight: 700 }}>
                ↓ {risk_score - reauditReport.risk_score} points reduced
              </div>
            </>
          ) : (
            <div style={{ paddingTop: 40, color: "#333", fontSize: "0.8rem" }}>
              {reauditLoading ? (
                <div>
                  <div style={{ color: "#f97316", fontSize: "0.85rem", marginBottom: 8 }}>Running re-audit...</div>
                  <div style={{ color: "#555", fontSize: "0.72rem" }}>~30 seconds</div>
                </div>
              ) : "Apply fixes and re-audit to see improvement"}
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{ flex: 2, minWidth: 280, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            ["Total Attacks", total_attacks],
            ["Resisted", attacks_passed],
            ["Failed", attacks_failed],
            ["Pass Rate", `${Math.round((attacks_passed / total_attacks) * 100)}%`]
          ].map(([label, val]) => (
            <div key={label} style={{ background: "#141414", border: "1px solid #252525", borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: "0.68rem", color: "#666", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff" }}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Category breakdown ── */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ color: "#f97316", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>Category Breakdown</h3>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {Object.entries(category_scores).map(([cat, data]) => (
            <div key={cat} style={{ background: "#141414", border: "1px solid #252525", borderRadius: 10, padding: "10px 16px", minWidth: 140 }}>
              <div style={{ fontSize: "0.65rem", color: "#f97316", marginBottom: 4 }}>{cat.replace(/_/g, " ")}</div>
              <div style={{ fontSize: "1.2rem", fontWeight: 800, color: data.score > 50 ? "#ef4444" : "#4ade80" }}>{data.score}%</div>
              <div style={{ fontSize: "0.68rem", color: "#555" }}>{data.failed}/{data.total} failed</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Attack table ── */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ color: "#f97316", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>Attack Results</h3>
        <div style={{ background: "#141414", border: "1px solid #252525", borderRadius: 12, overflow: "hidden" }}>
          <AttackTable results={attack_results} />
        </div>
      </div>

      {/* ── Remediation + Re-audit ── */}
      <div style={{ background: "#0f1a0f", border: "1px solid #166534", borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <h3 style={{ color: "#4ade80", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>
          🛡️ Remediation Suggestions
        </h3>
        <p style={{ color: "#555", fontSize: "0.72rem", marginBottom: 16 }}>
          Select fixes to apply, then re-audit to verify improvement.
        </p>

        {remediation_suggestions.map((s, i) => (
          <div
            key={i}
            onClick={() => toggleFix(i)}
            style={{
              display: "flex", alignItems: "flex-start", gap: 12,
              background: selectedFixes[i] ? "#0d2b1a" : "#141414",
              border: `1px solid ${selectedFixes[i] ? "#166534" : "#252525"}`,
              borderRadius: 10, padding: "12px 14px", marginBottom: 8,
              cursor: "pointer", transition: "all 0.15s"
            }}
          >
            <div style={{
              width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 1,
              background: selectedFixes[i] ? "#4ade80" : "#1a1a1a",
              border: `2px solid ${selectedFixes[i] ? "#4ade80" : "#333"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.65rem", color: "#000", fontWeight: 800
            }}>
              {selectedFixes[i] ? "✓" : ""}
            </div>
            <div style={{ fontSize: "0.8rem", color: selectedFixes[i] ? "#ccc" : "#666", lineHeight: 1.6 }}>{s}</div>
          </div>
        ))}

        {reauditError && (
          <div style={{ background: "#2b0d0d", border: "1px solid #7f1d1d", borderRadius: 8, padding: 10, color: "#f87171", fontSize: "0.78rem", marginBottom: 12 }}>
            ⚠️ {reauditError}
          </div>
        )}

        <button
          onClick={handleReaudit}
          disabled={reauditLoading || selectedFixes.every(f => !f)}
          style={{
            width: "100%", marginTop: 8,
            background: reauditLoading ? "#1a1a1a" : "#4ade80",
            color: reauditLoading ? "#555" : "#000",
            border: "none", borderRadius: 10, padding: 14,
            fontWeight: 800, fontSize: "0.95rem",
            cursor: reauditLoading ? "not-allowed" : "pointer",
            transition: "all 0.2s"
          }}
        >
          {reauditLoading ? "⏳ Re-auditing... (~30s)" : "🔁 Re-audit with Fixes Applied"}
        </button>
      </div>

      {/* ── Re-audit attack table ── */}
      {reauditReport && (
        <div style={{ marginTop: 8 }}>
          <h3 style={{ color: "#4ade80", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>
            ✅ Post-Fix Attack Results
          </h3>
          <div style={{ background: "#141414", border: "1px solid #166534", borderRadius: 12, overflow: "hidden" }}>
            <AttackTable results={reauditReport.attack_results} />
          </div>
        </div>
      )}

    </div>
  );
}