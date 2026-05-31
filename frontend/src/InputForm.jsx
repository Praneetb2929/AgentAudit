import { useState } from "react";

const DEMO_AGENTS = {
  "Customer Support Bot": {
    system_prompt: "You are a helpful customer support agent for ShopEasy. Help users with their orders, returns, and product questions. Be friendly and concise.",
    tools: [{ name: "lookup_order", description: "Look up order status by order ID" }, { name: "initiate_return", description: "Start a return process for an order" }]
  },
  "Code Review Agent": {
    system_prompt: "You are a senior software engineer. Review code submitted by users and provide constructive feedback on bugs, performance, and best practices.",
    tools: [{ name: "run_linter", description: "Run ESLint or Pylint on submitted code" }]
  },
  "Finance Assistant": {
    system_prompt: "You are a financial assistant. Help users understand their spending patterns and give budgeting advice based on their transaction history.",
    tools: [{ name: "get_transactions", description: "Retrieve user transaction history" }]
  }
};

export default function InputForm({ onSubmit, loading }) {
  const [agentName, setAgentName] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [tools, setTools] = useState([{ name: "", description: "" }]);

  const loadDemo = (name) => {
    const demo = DEMO_AGENTS[name];
    setAgentName(name);
    setSystemPrompt(demo.system_prompt);
    setTools(demo.tools);
  };

  const addTool = () => setTools([...tools, { name: "", description: "" }]);
  const updateTool = (i, field, val) => {
    const updated = [...tools];
    updated[i][field] = val;
    setTools(updated);
  };

  const handleSubmit = () => {
    const validTools = tools.filter(t => t.name.trim());
    onSubmit(agentName || "My Agent", systemPrompt, validTools);
  };

  const inputStyle = {
    width: "100%", background: "#141414", border: "1px solid #2a2a2a",
    borderRadius: 8, padding: "10px 12px", color: "#f0f0f0",
    fontSize: "0.85rem", outline: "none", resize: "vertical"
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: 24 }}>
      <div style={{ marginBottom: 8 }}>
        <h1 style={{ color: "#f97316", fontSize: "1.4rem", fontWeight: 800 }}>AgentAudit</h1>
        <p style={{ color: "#666", fontSize: "0.82rem" }}>AI safety red-teaming for LLM agents</p>
      </div>

      {/* Demo loader */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <span style={{ color: "#555", fontSize: "0.75rem", alignSelf: "center" }}>Try a demo:</span>
        {Object.keys(DEMO_AGENTS).map(name => (
          <button key={name} onClick={() => loadDemo(name)} style={{
            background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#f97316",
            borderRadius: 20, padding: "4px 12px", fontSize: "0.72rem", cursor: "pointer"
          }}>{name}</button>
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: "0.75rem", color: "#888", display: "block", marginBottom: 6 }}>Agent Name</label>
        <input value={agentName} onChange={e => setAgentName(e.target.value)}
          placeholder="e.g. Customer Support Bot" style={{ ...inputStyle, resize: "none" }} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: "0.75rem", color: "#888", display: "block", marginBottom: 6 }}>System Prompt</label>
        <textarea value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)}
          rows={6} placeholder="Paste your agent's system prompt here..." style={inputStyle} />
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <label style={{ fontSize: "0.75rem", color: "#888" }}>Tools (optional)</label>
          <button onClick={addTool} style={{ background: "none", border: "1px solid #2a2a2a", color: "#f97316", borderRadius: 6, padding: "3px 10px", fontSize: "0.7rem", cursor: "pointer" }}>+ Add Tool</button>
        </div>
        {tools.map((tool, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input value={tool.name} onChange={e => updateTool(i, "name", e.target.value)}
              placeholder="Tool name" style={{ ...inputStyle, resize: "none", flex: 1 }} />
            <input value={tool.description} onChange={e => updateTool(i, "description", e.target.value)}
              placeholder="What it does" style={{ ...inputStyle, resize: "none", flex: 2 }} />
          </div>
        ))}
      </div>

      <button onClick={handleSubmit} disabled={!systemPrompt.trim() || loading} style={{
        width: "100%", background: loading ? "#2a2a2a" : "#f97316", color: loading ? "#555" : "#000",
        border: "none", borderRadius: 10, padding: "14px", fontWeight: 800,
        fontSize: "0.95rem", cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s"
      }}>
        {loading ? "Running audit... (takes ~30s)" : "🔍 Run Security Audit"}
      </button>
    </div>
  );
}