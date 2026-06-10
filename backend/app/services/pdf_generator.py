import os
import json
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to calculate the total page count dynamically.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            super().showPage()
        super().save()

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#718096"))
        
        # Header text
        self.drawString(54, 750, "InstallGen AI — Installation Verification Report")
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(54, 742, letter[0] - 54, 742)
        
        # Footer text
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(letter[0] - 54, 36, page_text)
        self.drawString(54, 36, f"Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        self.line(54, 48, letter[0] - 54, 48)
        
        self.restoreState()


class PDFGenerator:
    @staticmethod
    def generate_report(session, report, scripts, agent_logs) -> str:
        """
        Generates a premium PDF verification report for the deployment session.
        Returns the absolute file path of the generated PDF.
        """
        # Ensure static reports directory exists
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        reports_dir = os.path.join(base_dir, "static", "reports")
        os.makedirs(reports_dir, exist_ok=True)
        
        pdf_filename = f"report_{session.id}.pdf"
        pdf_path = os.path.join(reports_dir, pdf_filename)
        
        # Set up document
        # Margin: 0.75 inch (54 points)
        doc = SimpleDocTemplate(
            pdf_path,
            pagesize=letter,
            leftMargin=54,
            rightMargin=54,
            topMargin=72,
            bottomMargin=72
        )
        
        styles = getSampleStyleSheet()
        
        # Define premium custom styles
        primary_color = colors.HexColor("#0F172A")    # Dark Slate Blue
        secondary_color = colors.HexColor("#4F46E5")  # Indigo Accent
        text_color = colors.HexColor("#334155")       # Cool Grey Text
        
        # Modify existing styles or add unique names
        title_style = ParagraphStyle(
            'ReportTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=24,
            leading=28,
            textColor=primary_color,
            spaceAfter=15
        )
        
        h2_style = ParagraphStyle(
            'ReportH2',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=14,
            leading=18,
            textColor=secondary_color,
            spaceBefore=12,
            spaceAfter=6
        )
        
        body_style = ParagraphStyle(
            'ReportBody',
            parent=styles['BodyText'],
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            textColor=text_color,
            spaceAfter=8
        )
        
        meta_label_style = ParagraphStyle(
            'ReportMetaLabel',
            parent=styles['BodyText'],
            fontName='Helvetica-Bold',
            fontSize=10,
            leading=14,
            textColor=primary_color
        )

        code_style = ParagraphStyle(
            'ReportCode',
            parent=styles['Code'],
            fontName='Courier',
            fontSize=8,
            leading=10,
            textColor=colors.HexColor("#0F172A"),
            backColor=colors.HexColor("#F8FAFC"),
            borderColor=colors.HexColor("#E2E8F0"),
            borderWidth=0.5,
            borderPadding=6,
            spaceAfter=8
        )
        
        story = []
        
        # Title Section
        story.append(Paragraph("INSTALLATION VERIFICATION REPORT", title_style))
        story.append(Paragraph(f"Session Name: {session.name}", body_style))
        story.append(Spacer(1, 10))
        
        # Session Metadata Table
        meta_data = [
            [Paragraph("Session ID", meta_label_style), Paragraph(str(session.id), body_style)],
            [Paragraph("Target OS", meta_label_style), Paragraph(str(session.target_os).capitalize(), body_style)],
            [Paragraph("Status", meta_label_style), Paragraph(str(session.status).upper(), body_style)],
            [Paragraph("Created At", meta_label_style), Paragraph(session.created_at.strftime("%Y-%m-%d %H:%M:%S"), body_style)],
            [Paragraph("Verification Score", meta_label_style), Paragraph(f"{report.score}/100", body_style)],
            [Paragraph("Verification Result", meta_label_style), Paragraph("PASSED" if report.passed else "FAILED", ParagraphStyle('Result', parent=body_style, textColor=colors.HexColor("#16A34A") if report.passed else colors.HexColor("#DC2626"), fontName='Helvetica-Bold'))],
        ]
        
        meta_table = Table(meta_data, colWidths=[120, 380])
        meta_table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor("#F8FAFC")),
            ('PADDING', (0, 0), (-1, -1), 6),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        
        story.append(meta_table)
        story.append(Spacer(1, 15))
        
        # Requirements Section
        story.append(Paragraph("Installation Requirements", h2_style))
        story.append(Paragraph(session.requirements, body_style))
        story.append(Spacer(1, 10))
        
        # Verification Summary
        story.append(Paragraph("AI Verification Summary", h2_style))
        story.append(Paragraph(report.summary or "No summary provided.", body_style))
        story.append(Spacer(1, 10))
        
        # Verification Details List
        if report.details:
            try:
                details_list = json.loads(report.details)
                if isinstance(details_list, list) and len(details_list) > 0:
                    story.append(Paragraph("Verification Steps Completed:", meta_label_style))
                    for item in details_list:
                        story.append(Paragraph(f"• {item}", body_style))
                    story.append(Spacer(1, 10))
            except Exception:
                story.append(Paragraph(report.details, body_style))
                story.append(Spacer(1, 10))
                
        # Generated Scripts Section
        if scripts:
            story.append(Paragraph("Generated Deployment Scripts", h2_style))
            for idx, script in enumerate(scripts):
                story.append(Paragraph(f"{idx+1}. {script.filename} ({script.language.capitalize()})", meta_label_style))
                if script.description:
                    story.append(Paragraph(script.description, body_style))
                
                # Show script preview (first 15 lines or so to keep it neat)
                lines = script.content.split("\n")
                preview_lines = lines[:15]
                if len(lines) > 15:
                    preview_lines.append("# ... [Truncated in PDF report. Download complete script for execution] ...")
                preview_content = "\n".join(preview_lines)
                story.append(Paragraph(preview_content.replace("\n", "<br/>").replace(" ", "&nbsp;"), code_style))
                story.append(Spacer(1, 8))
                
        # Agent Orchestration Logs
        if agent_logs:
            story.append(Paragraph("Multi-Agent Execution Log", h2_style))
            log_rows = [
                [Paragraph("Agent", meta_label_style), Paragraph("Action", meta_label_style), Paragraph("Time", meta_label_style)]
            ]
            for log in sorted(agent_logs, key=lambda l: l.timestamp):
                log_rows.append([
                    Paragraph(log.agent_name, body_style),
                    Paragraph(log.action or "No action recorded", body_style),
                    Paragraph(log.timestamp.strftime("%M:%S"), body_style)
                ])
                
            log_table = Table(log_rows, colWidths=[100, 320, 80])
            log_table.setStyle(TableStyle([
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
                ('PADDING', (0, 0), (-1, -1), 5),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ]))
            story.append(log_table)
            
        # Build Document using NumberedCanvas
        doc.build(story, canvasmaker=NumberedCanvas)
        
        # Return path relative to the app structure, or absolute path for local loading
        return pdf_path
