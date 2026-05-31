from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class ToolDefinition(BaseModel):
    name: str
    description: str

class AuditRequest(BaseModel):
    system_prompt: str
    tools: Optional[List[ToolDefinition]] = []
    agent_name: Optional[str] = "Unnamed Agent"
    target_url: Optional[str] = None
    auth_header: Optional[str] = None

class AttackResult(BaseModel):
    attack_id: int
    category: str
    attack_name: str
    malicious_input: str
    agent_response: str
    passed: bool
    severity: str
    explanation: str

class AuditReport(BaseModel):
    agent_name: str
    risk_score: int
    risk_level: str
    total_attacks: int
    attacks_passed: int
    attacks_failed: int
    category_scores: Dict[str, Any]
    attack_results: List[AttackResult]
    top_vulnerabilities: List[str]
    remediation_suggestions: List[str]