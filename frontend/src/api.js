import axios from "axios";

const BASE = "http://localhost:8000";

export async function runAudit(agentName, systemPrompt, tools) {
  const response = await axios.post(`${BASE}/audit`, {
    agent_name: agentName,
    system_prompt: systemPrompt,
    tools: tools,
  });
  return response.data;
}