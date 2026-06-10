import os
import json
import time
import logging
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.deployment import DeploymentSession
from app.models.agent import AgentLog
from app.models.script import GeneratedScript
from app.models.report import VerificationReport
from app.services.gemini import gemini_service
from app.services.pdf_generator import PDFGenerator

logger = logging.getLogger("app.services.orchestrator")

class AgentOrchestrator:
    @staticmethod
    def run_pipeline(session_id: str, db: Session):
        """
        Executes the multi-agent pipeline sequentially in the background.
        Updates the database session, creates logs, and generates scripts/reports.
        """
        logger.info(f"Starting pipeline for session: {session_id}")
        
        # 1. Fetch Session
        session = db.query(DeploymentSession).filter(DeploymentSession.id == session_id).first()
        if not session:
            logger.error(f"DeploymentSession {session_id} not found in database.")
            return

        try:
            # --- PHASE 1: PLANNING ---
            session.status = "planning"
            db.commit()
            
            # Log agent start
            plan_log = AgentLog(
                session_id=session_id,
                agent_name="Planner",
                action="Analyzing installation request and mapping requirements",
                thought=f"User wants to install: '{session.requirements}' on OS: '{session.target_os}'. I need to break this down into clear, structured, logical setup phases.",
                output_data="Initiated requirements review..."
            )
            db.add(plan_log)
            db.commit()
            
            time.sleep(2)  # Delay for rich user interface feedback
            
            # Call Planner Agent
            plan_data = gemini_service.generate_plan(session.requirements, session.target_os)
            steps = plan_data.get("steps", [])
            
            plan_log.output_data = json.dumps(plan_data)
            plan_log.action = "Installation plan compiled"
            plan_log.thought = f"Requirements analyzed. I mapped this to {len(steps)} distinct installation steps."
            db.commit()

            # --- PHASE 2: GENERATION ---
            session.status = "generating"
            db.commit()
            
            time.sleep(2)
            
            generated_scripts = []
            for step in steps:
                step_title = step.get("title", "Setup Step")
                step_desc = step.get("description", "")
                
                # Log step generation start
                gen_log = AgentLog(
                    session_id=session_id,
                    agent_name="Generator",
                    action=f"Synthesizing installation script for step: {step_title}",
                    thought=f"I will now generate executable shell script files to accomplish: '{step_title}' targeting {session.target_os}.",
                    output_data=f"Step description: {step_desc}"
                )
                db.add(gen_log)
                db.commit()
                
                time.sleep(1.5)
                
                # Call Generator Agent
                script_response = gemini_service.generate_script(
                    session.requirements,
                    session.target_os,
                    step_title
                )
                
                # Create Database script record
                script_obj = GeneratedScript(
                    session_id=session_id,
                    filename=script_response.get("filename", f"step_{step.get('step_number')}.sh"),
                    content=script_response.get("content", ""),
                    language=script_response.get("language", "bash"),
                    description=script_response.get("description", step_desc)
                )
                db.add(script_obj)
                db.commit()
                generated_scripts.append(script_obj)
                
                # Update log
                gen_log.action = f"Script generated: {script_obj.filename}"
                gen_log.thought = f"Script for '{step_title}' created. Output syntax: {script_obj.language}."
                gen_log.output_data = json.dumps({
                    "filename": script_obj.filename,
                    "language": script_obj.language,
                    "size_bytes": len(script_obj.content)
                })
                db.commit()

            # --- PHASE 3: AUDITING ---
            session.status = "auditing"
            db.commit()
            
            time.sleep(2)
            
            for script in generated_scripts:
                # Log audit start
                audit_log = AgentLog(
                    session_id=session_id,
                    agent_name="Auditor",
                    action=f"Scanning security footprint of script: {script.filename}",
                    thought=f"Reviewing script content of {script.filename} for command injection, hardcoded credentials, and configuration vulnerabilities.",
                    output_data="Scanning..."
                )
                db.add(audit_log)
                db.commit()
                
                time.sleep(1.5)
                
                # Call Auditor Agent
                audit_result = gemini_service.audit_script(
                    script.filename,
                    script.content,
                    session.target_os
                )
                
                # Update log
                audit_log.action = f"Audit completed for script: {script.filename}"
                audit_log.thought = f"Audit score: {audit_result.get('score', 100)}/100. Issues found: {len(audit_result.get('issues', []))}."
                audit_log.output_data = json.dumps(audit_result)
                db.commit()

            # --- PHASE 4: VERIFICATION ---
            session.status = "verifying"
            db.commit()
            
            # Log verification checks start
            verify_log = AgentLog(
                session_id=session_id,
                agent_name="Verifier",
                action="Compiling environment validation checks",
                thought="Generating post-installation validation commands to verify daemon bindings, socket accessibility, and configuration success.",
                output_data="Analyzing deployment scripts..."
            )
            db.add(verify_log)
            db.commit()
            
            time.sleep(2)
            
            scripts_summary = [{"filename": s.filename, "content": s.content} for s in generated_scripts]
            verification_result = gemini_service.verify_deployment(
                session.requirements,
                session.target_os,
                scripts_summary
            )
            
            # Create verification report
            report_obj = VerificationReport(
                session_id=session_id,
                passed=verification_result.get("passed", True),
                score=verification_result.get("score", 100),
                summary=verification_result.get("summary", ""),
                details=json.dumps(verification_result.get("details", []))
            )
            db.add(report_obj)
            db.commit()
            
            # Generate PDF Report
            all_logs = db.query(AgentLog).filter(AgentLog.session_id == session_id).all()
            pdf_path = PDFGenerator.generate_report(session, report_obj, generated_scripts, all_logs)
            
            # Save PDF path (relative path or filename is preferred, but let's store absolute/local path)
            report_obj.pdf_path = pdf_path
            db.commit()
            
            # Update verification log details
            verify_log.action = "Validation suite generated and PDF report compiled"
            verify_log.thought = f"Verification plan complete. Output score: {report_obj.score}/100. Generated PDF report."
            verify_log.output_data = json.dumps(verification_result)
            db.commit()

            # --- COMPLETED ---
            session.status = "completed"
            db.commit()
            logger.info(f"Pipeline completed successfully for session: {session_id}")
            
        except Exception as e:
            logger.exception(f"Error executing agent pipeline for session: {session_id}")
            session.status = "failed"
            
            # Log failure
            fail_log = AgentLog(
                session_id=session_id,
                agent_name="Orchestrator",
                action="Pipeline terminated with failure",
                thought="An unhandled error occurred while executing the agent pipeline. Rolling back.",
                output_data=str(e)
            )
            db.add(fail_log)
            db.commit()
