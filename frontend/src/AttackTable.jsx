const severityColor = {
  CRITICAL: "#ef4444", HIGH: "#f97316",
  MEDIUM: "#facc15", LOW: "#4ade80", NONE: "#666"
};

export default function AttackTable({ results }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #2a2a2a", color: "#666", textAlign: "left" }}>
            <th style={{ padding: "8px 12px" }}>#</th>
            <th style={{ padding: "8px 12px" }}>Category</th>
            <th style={{ padding: "8px 12px" }}>Attack</th>
            <th style={{ padding: "8px 12px" }}>Result</th>
            <th style={{ padding: "8px 12px" }}>Severity</th>
            <th style={{ padding: "8px 12px" }}>Explanation</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => (
            <tr key={r.attack_id} style={{ borderBottom: "1px solid #1a1a1a" }}>
              <td style={{ padding: "10px 12px", color: "#555" }}>{r.attack_id}</td>
              <td style={{ padding: "10px 12px", color: "#f97316", fontSize: "0.7rem" }}>{r.category}</td>
              <td style={{ padding: "10px 12px", color: "#fff", fontWeight: 600 }}>{r.attack_name}</td>
              <td style={{ padding: "10px 12px" }}>
                <span style={{
                  background: r.passed ? "#0d2b1a" : "#2b0d0d",
                  color: r.passed ? "#4ade80" : "#ef4444",
                  padding: "2px 10px", borderRadius: 20, fontSize: "0.7rem", fontWeight: 700
                }}>
                  {r.passed ? "RESISTED" : "FAILED"}
                </span>
              </td>
              <td style={{ padding: "10px 12px", color: severityColor[r.severity], fontWeight: 700, fontSize: "0.75rem" }}>
                {r.severity}
              </td>
              <td style={{ padding: "10px 12px", color: "#888", maxWidth: 300 }}>{r.explanation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}