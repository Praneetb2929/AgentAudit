import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "https://agentaudit-backend.onrender.com";

export async function runAudit(agentName, systemPrompt, tools) {
  const response = await axios.post(`${BASE}/audit`, {
    agent_name: agentName,
    system_prompt: systemPrompt,
    tools: tools,
  });
  return response.data;
}