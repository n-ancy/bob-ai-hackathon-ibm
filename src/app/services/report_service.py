import io
import logging
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from app.db.graph_db import db
from app.services.pattern_service import FraudPatternDetector
from app.services.analytics_service import NetworkAnalyticsEngine
from app.services.role_service import RoleIndicatorEngine

logger = logging.getLogger("CFNA.Report")

class CaseBriefReportGenerator:
    """Module 14: PDF Investigation Case Brief Generator using ReportLab."""

    @classmethod
    def generate_pdf_report(cls, case_id: str) -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            'TitleStyle',
            parent=styles['Heading1'],
            fontSize=20,
            leading=24,
            textColor=colors.HexColor('#0F172A'),
            spaceAfter=12
        )
        heading2_style = ParagraphStyle(
            'Heading2Style',
            parent=styles['Heading2'],
            fontSize=14,
            leading=18,
            textColor=colors.HexColor('#1E293B'),
            spaceBefore=14,
            spaceAfter=8
        )
        body_style = ParagraphStyle(
            'BodyStyle',
            parent=styles['Normal'],
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#334155')
        )

        story = []

        # Title & Banner
        story.append(Paragraph("CYBER FRAUD NETWORK ANALYZER (CFNA)", title_style))
        story.append(Paragraph(f"<b>OFFICIAL INVESTIGATION CASE BRIEF - CASE ID: {case_id}</b>", styles['Heading3']))
        story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#0284C7'), spaceAfter=15))

        # Data collection
        graph_data = db.get_case_graph(case_id)
        nodes = graph_data.get("nodes", [])
        edges = graph_data.get("edges", [])
        patterns = FraudPatternDetector.detect_patterns(case_id)
        analytics = NetworkAnalyticsEngine.calculate_analytics(case_id)
        roles = RoleIndicatorEngine.evaluate_roles(case_id)

        # 1. Executive Summary Table
        summary_data = [
            ["Metric", "Count / Value"],
            ["Total Ingested Entities", str(len(nodes))],
            ["Total Relationships / Transactions", str(len(edges))],
            ["Detected Fraud Patterns", str(len(patterns))],
            ["Network Density", str(analytics.density)],
            ["Identified Community Clusters", str(analytics.communities_count)],
            ["Evaluated Role Indicators", str(len(roles))]
        ]

        t_summary = Table(summary_data, colWidths=[240, 240])
        t_summary.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (1,0), colors.HexColor('#1E293B')),
            ('TEXTCOLOR', (0,0), (1,0), colors.whitesmoke),
            ('FONTNAME', (0,0), (-1,-1), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0,0), (-1,0), 6),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
            ('BACKGROUND', (0,1), (-1,-1), colors.HexColor('#F8FAFC'))
        ]))

        story.append(Paragraph("1. EXECUTIVE SUMMARY & METRICS", heading2_style))
        story.append(t_summary)
        story.append(Spacer(1, 12))

        # 2. Detected Patterns Section
        story.append(Paragraph("2. DETECTED FRAUD PATTERNS", heading2_style))
        if patterns:
            pat_table_data = [["Pattern ID", "Type", "Severity", "Explanation"]]
            for p in patterns[:6]:
                pat_table_data.append([
                    p.pattern_id,
                    p.pattern_type,
                    p.severity,
                    Paragraph(p.explanation[:120] + "...", body_style)
                ])

            t_pat = Table(pat_table_data, colWidths=[90, 80, 70, 240])
            t_pat.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0F172A')),
                ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
                ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
                ('VALIGN', (0,0), (-1,-1), 'TOP')
            ]))
            story.append(t_pat)
        else:
            story.append(Paragraph("No automated fraud patterns detected in current case scope.", body_style))

        story.append(Spacer(1, 12))

        # 3. Role Indicators Section
        story.append(Paragraph("3. NETWORK ROLE INDICATORS", heading2_style))
        if roles:
            role_data = [["Entity ID", "Role Indicator", "Confidence", "Evidence Summary"]]
            for r in roles[:6]:
                role_data.append([
                    r.entity_id,
                    r.role_type.value,
                    f"{int(r.confidence_score * 100)}%",
                    Paragraph(r.explanation[:120] + "...", body_style)
                ])

            t_role = Table(role_data, colWidths=[110, 140, 70, 160])
            t_role.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#334155')),
                ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
                ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
                ('VALIGN', (0,0), (-1,-1), 'TOP')
            ]))
            story.append(t_role)
        else:
            story.append(Paragraph("No network role indicators evaluated for current entity dataset.", body_style))

        story.append(Spacer(1, 15))
        story.append(Paragraph("<b>CONFIDENTIALITY NOTICE:</b> This document contains evidence-linked cybersecurity investigation leads generated by CFNA.", ParagraphStyle('Foot', parent=body_style, fontSize=8, textColor=colors.gray)))

        doc.build(story)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes
