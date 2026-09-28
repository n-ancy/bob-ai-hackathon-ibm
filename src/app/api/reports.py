from fastapi import APIRouter
from fastapi.responses import Response
from app.services.report_service import CaseBriefReportGenerator

router = APIRouter(prefix="/cases", tags=["Reports"])

@router.get("/{case_id}/report")
def generate_case_report(case_id: str):
    pdf_bytes = CaseBriefReportGenerator.generate_pdf_report(case_id)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=CFNA_Case_Brief_{case_id}.pdf"}
    )
