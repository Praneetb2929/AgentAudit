import json
import os
import httpx
from groq import Groq
from dotenv import load_dotenv
from prompts import get_attack_generator_prompt, get_simulator_prompt, get_evaluator_prompt

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODELS = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "gemma2-9b-it",
]


# ─────────────────────────────────────────
# SHARED: LLM caller
# ─────────────────────────────────────────

def call_llm(prompt: str, system: str = "You are a helpful assistant.") -> str:
    for model in MODELS:
        try:
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=4000
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            if "rate_limit" in str(e).lower() or "429" in str(e):
                continue
            raise e
    raise Exception("All models rate limited. Wait 20 minutes or add a new Groq API key.")


# ─────────────────────────────────────────
# LLM #1 — Attack Generator
# ─────────────────────────────────────────

def generate_attacks(system_prompt: str, tools: list) -> list:
    prompt = get_attack_generator_prompt(system_prompt, tools)
    raw = call_llm(prompt)

    raw = raw.replace("```json", "").replace("```", "").strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        start = raw.find("[")
        end = raw.rfind("]") + 1
        if start != -1 and end != 0:
            return json.loads(raw[start:end])
        raise ValueError(f"Could not parse attack JSON: {raw[:300]}")


# ─────────────────────────────────────────
# LLM #2a — Simulate agent (no real endpoint)
# ─────────────────────────────────────────

def simulate_attack(system_prompt: str, malicious_input: str) -> str:
    prompt = get_simulator_prompt(system_prompt, malicious_input)
    return call_llm(prompt)


# ─────────────────────────────────────────
# LLM #2b — Probe a real live agent endpoint
# ─────────────────────────────────────────

async def probe_real_agent(target_url: str, malicious_input: str, auth_header: str = None) -> str:
    headers = {"Content-Type": "application/json"}
    if auth_header:
        headers["Authorization"] = auth_header

    payload = {"message": malicious_input}

    try:
        async with httpx.AsyncClient(timeout=30) as client_http:
            response = await client_http.post(target_url, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            # Try common response field names across different agent frameworks
            return (
                data.get("response") or
                data.get("message") or
                data.get("output") or
                data.get("text") or
                data.get("answer") or
                data.get("content") or
                str(data)
            )
    except httpx.TimeoutException:
        return "[ERROR] Agent endpoint timed out after 30 seconds."
    except httpx.HTTPStatusError as e:
        return f"[ERROR] Agent returned HTTP {e.response.status_code}."
    except Exception as e:
        return f"[ERROR] Could not reach agent: {str(e)}"


# ─────────────────────────────────────────
# LLM #3 — Evaluator
# ─────────────────────────────────────────

def evaluate_response(attack: dict, agent_response: str) -> dict:
    from prompts import get_evaluator_prompt
    prompt = get_evaluator_prompt(attack, agent_response)
    raw = call_llm(prompt)
    raw = raw.replace("```json", "").replace("```", "").strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        # Safe fallback so one bad parse doesn't crash the whole audit
        return {
            "passed": True,
            "severity": "NONE",
            "explanation": "Could not evaluate response automatically."
        }


# ─────────────────────────────────────────
# ORCHESTRATOR — Full audit pipeline
# ─────────────────────────────────────────

async def run_full_audit(
    system_prompt: str,
    tools: list,
    agent_name: str,
    target_url: str = None,
    auth_header: str = None
) -> list:
    """
    Runs the full 3-step audit pipeline.

    If target_url is provided → probes the real agent endpoint (live mode).
    If not → simulates the agent using LLM #2 (simulation mode).
    """

    # Step 1: Generate adversarial attack cases
    attacks = generate_attacks(system_prompt, tools)

    results = []
    for attack in attacks:
        malicious_input = attack["malicious_input"]

        # Step 2: Get agent response — real or simulated
        if target_url:
            agent_response = await probe_real_agent(target_url, malicious_input, auth_header)
        else:
            agent_response = simulate_attack(system_prompt, malicious_input)

        # Step 3: Evaluate the response
        evaluation = evaluate_response(attack, agent_response)

        results.append({
            "attack_id": attack["attack_id"],
            "category": attack["category"],
            "attack_name": attack["attack_name"],
            "malicious_input": malicious_input,
            "agent_response": agent_response,
            "passed": evaluation.get("passed", True),
            "severity": evaluation.get("severity", "NONE"),
            "explanation": evaluation.get("explanation", "")
        })

    return results