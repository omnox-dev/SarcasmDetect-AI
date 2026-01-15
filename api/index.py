import sys
import os

# Add the root and backend directories to sys.path
root_path = os.path.join(os.path.dirname(__file__), "..")
sys.path.append(root_path)
sys.path.append(os.path.join(root_path, "backend"))

from backend.app import app

# Vercel needs 'app' to be the FastAPI instance
# This is already provided by the import
