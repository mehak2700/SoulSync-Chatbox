#!/bin/bash

# Kill anything using port 8000 or 8001
fuser -k 8000/tcp 2>/dev/null
fuser -k 8001/tcp 2>/dev/null

# Activate venv
source venv/bin/activate

# Start FastAPI on 8001
uvicorn backend.main:app --port 8001 --reload
