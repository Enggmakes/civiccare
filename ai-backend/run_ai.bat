@echo off
echo ===================================================
echo Starting CivicCare Python AI Inference Microservice
echo Port: 8000 | Docs: http://localhost:8000/docs
echo ===================================================
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
pause
