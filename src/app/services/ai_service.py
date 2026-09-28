import re
from typing import Dict, Any, List
from app.models.schemas import AIQuery, AIResponse
from app.db.graph_db import db
from app.services.pattern_service import FraudPatternDetector
from app.services.role_service import RoleIndicatorEngine
from app.services.ibm_ai_service import IBMBobAIService

class AIInvestigationAssistant:
    """Module 13: Strict Evidence-Grounded AI Investigation Assistant with IBM watsonx Granite Integration."""

    @classmethod
    def query(cls, ai_query: AIQuery) -> AIResponse:
        case_id = ai_query.case_id
        user_text = ai_query.query.strip()
        lower_query = user_text.lower()

        # 1. Identity & Greeting Check
        if any(w in lower_query for w in ["who are you", "are you bob", "bob ai", "what is your name", "hello", "hi bob"]):
            answer = (
                "👋 **Yes! I am Bob AI**, your evidence-grounded cyber crime investigation assistant powered by **IBM watsonx & Granite AI architecture**.\n\n"
                f"I am attached to active case **{case_id}**. I can help you:\n"
                "• Trace suspicious money transfers & multi-hop paths\n"
                "• Analyze shared device hubs & phone numbers\n"
                "• Explain fan-in / fan-out / rapid transfer patterns\n"
                "• Provide evidence citations (EV-xxxx) for forensic reporting\n\n"
                "How can I assist your investigation today?"
            )
            return AIResponse(
                answer=answer,
                supporting_evidence=["IBM watsonx Granite Model Architecture", f"Case Scope: {case_id}"],
                observed_patterns=[],
                investigation_leads=["Ask about any account, phone, or device ID to inspect evidence."],
                uncertainties=[]
            )

        # Sanitize query against prompt injection
        sanitized_text = re.sub(r'(?i)(ignore previous|system prompt|overwrite instructions)', '[FILTERED]', user_text)

        # Retrieve factual graph context for the case
        graph_data = db.get_case_graph(case_id)
        nodes = graph_data.get("nodes", [])
        edges = graph_data.get("edges", [])
        patterns = FraudPatternDetector.detect_patterns(case_id)
        roles = RoleIndicatorEngine.evaluate_roles(case_id)

        supporting_ev = []
        observed_pats = [p.explanation for p in patterns]
        leads = []
        uncertainties = []

        # Target entity detection in user query
        matched_nodes = []
        for n in nodes:
            label = n.get("label", "")
            n_id = n.get("id", "")
            if label and (label.lower() in sanitized_text.lower() or n_id.lower() in sanitized_text.lower()):
                matched_nodes.append(n)

        # Build context summary string
        context_lines = [
            f"Case ID: {case_id}",
            f"Total Nodes: {len(nodes)}, Total Edges: {len(edges)}",
            "Nodes: " + ", ".join([f"{n.get('id')} ({n.get('type')}: {n.get('label')})" for n in nodes[:15]]),
            "Edges: " + ", ".join([f"{e.get('source')} -[{e.get('type')}]-> {e.get('target')}" for e in edges[:15]]),
            "Detected Patterns: " + "; ".join([p.explanation for p in patterns[:5]]),
            "Role Indicators: " + "; ".join([f"{r.entity_id}: {r.role_type.value} - {r.explanation}" for r in roles[:5]])
        ]
        evidence_context_str = "\n".join(context_lines)

        # 2. Try IBM Granite watsonx API response if configured & permitted
        ibm_response = IBMBobAIService.generate_response(user_text, evidence_context_str)
        if ibm_response:
            supporting_ev = [f"IBM Granite Model ({case_id})", f"Evidence Graph {case_id}"]
            return AIResponse(
                answer=f"**[IBM Granite / Bob AI Response]**\n\n{ibm_response}",
                supporting_evidence=supporting_ev,
                observed_patterns=observed_pats[:5],
                investigation_leads=["Extracted via IBM Granite AI model anchored to case graph."],
                uncertainties=[]
            )

        # 3. Local Deterministic Fallback Engine
        if matched_nodes:
            target = matched_nodes[0]
            t_id = target.get("id")
            neighbors = db.get_neighbors(t_id)

            supporting_ev = [f"Record EV-GRAPH-{t_id}"]
            leads.append(f"Inspect direct connections of {target.get('label')} ({len(neighbors)} neighbors).")

            lines = [
                f"### Fact Sheet for Entity: {target.get('label')} ({target.get('type')})",
                f"- **Entity ID**: `{t_id}`",
                f"- **Case Scope**: `{case_id}`",
                f"- **Direct Graph Connectivity**: {len(neighbors)} observed edges.",
                "\n**Observed Relationships:**"
            ]

            for neigh in neighbors[:6]:
                lines.append(f"  • **{neigh.get('direction')}** `[{neigh.get('relationship_type')}]` ➔ Entity `{neigh.get('entity_id')}`")

            role_matches = [r for r in roles if r.entity_id == t_id]
            if role_matches:
                lines.append("\n**Analytical Role Indicators:**")
                for rm in role_matches:
                    lines.append(f"  • **{rm.role_type.value}**: {rm.explanation}")
                    leads.append(rm.explanation)

            answer = "\n".join(lines)
        else:
            supporting_ev = [f"Case Graph dataset {case_id}"]
            uncertainties.append("Query did not specify an exact entity ID; showing case-wide facts.")
            
            lines = [
                f"### Case Overview Brief for `{case_id}`",
                f"- **Total Entities Ingested**: {len(nodes)}",
                f"- **Total Relationships Discovered**: {len(edges)}",
                f"- **Detected Suspicious Patterns**: {len(patterns)}",
                f"- **Evaluated Role Indicators**: {len(roles)}",
                "\n**Top Detected Fraud Patterns:**"
            ]
            for p in patterns[:4]:
                lines.append(f"  • **[{p.pattern_type}]** {p.explanation}")
                leads.append(p.explanation)

            answer = "\n".join(lines)

        return AIResponse(
            answer=answer,
            supporting_evidence=supporting_ev,
            observed_patterns=observed_pats[:5],
            investigation_leads=leads,
            uncertainties=uncertainties
        )
