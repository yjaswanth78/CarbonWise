# CarbonWise: AI-Powered Carbon Footprint Tracker

CarbonWise is a gamified, AI-driven carbon tracking and reduction application designed for the **PromptWars** competition. It automates footprint logging through smart features like calendar syncing, grocery receipt scanning, standby energy audits, and neighborhood tool sharing, replacing tedious manual data entry.

---

## Key Features

1. **Live Virtual EcoSphere**: An interactive HTML5 Canvas visual representation of a floating island. The ecosystem blooms (spawns green leaves, flowers, sunny sky) when you save carbon, and decays (spawns barren trees, gray smog clouds) when carbon footprint is neglected.
2. **Carbon Debt Clock**: Measures carbon as a financial debt to the Earth. Completing daily/weekly quests functions as "debt payments" ticking down the clock in real-time.
3. **Receipt Scanner (Smart Pantry)**: Scans grocery bill images (supports real GCP Cloud Vision OCR or offline simulation mode), identifies high-impact food purchases (like beef and dairy), and suggests eco-friendly swaps (like chicken or oat milk).
4. **Life-Sync (Transit Optimization)**: Connects to your daily schedule calendar, optimizes commute routes, calculates vehicle vs. metro emissions, and rewards public transportation choices.
5. **Home-Audit (Phantom Loads)**: An interactive checklist identifying appliances consuming power while on standby. Shows real-time savings after turning off TVs, unplugging unused phone chargers, and shutting down game consoles.
6. **Eco-Xchange (P2P Lending)**: A community marketplace allowing neighbors to borrow low-use items (tents, ladders, drills) instead of buying new products. Tracks carbon emissions avoided by sharing.
7. **Social Leaderboard & Badge Cabinet**: Compete with college peers and neighbors to earn titles like *Transit Hero*, *Pantry Warden*, and *Grid Saver*.

---

## Tech Stack

- **Frontend**: React (Vite) + Glassmorphic Vanilla CSS (Outfit & Jakarta fonts) + Lucide Icons.
- **Backend**: Python + FastAPI + SQLite (SQLAlchemy ORM) + Google Cloud Vision (OCR) + Google Cloud Storage (Bucket uploads).

---

## Quick Start (Local Run)

We have created an automated startup script `run_project.ps1` that will install all dependencies (Python Virtual Env and Node Modules) and run both servers in separate windows.

### Instructions:
1. Open **PowerShell** in your project directory: `c:\Users\yjasw\Downloads\Hack2skill promptwars2`.
2. Run the startup script:
   ```powershell
   ./run_project.ps1
   ```
3. The script will:
   - Create a Python virtualenv inside `backend/venv/` and install Pydantic, FastAPI, and GCP packages.
   - Install all frontend dependencies (React, Lucide icons, Vite).
   - Launch the FastAPI Backend on [http://localhost:8000](http://localhost:8000).
   - Launch the React Frontend on [http://localhost:5173](http://localhost:5173).

---

## How to Switch to Real Google Cloud APIs
By default, the application is configured to run **100% locally** (it will use offline simulated OCR and local storage for uploads so you can test immediately). 

To enable real Google Cloud features:
1. Open `backend/app/config.py`.
2. Set `USE_GCP = True`.
3. Set your `BUCKET_NAME` to your actual GCS bucket name (e.g. `carbonwise-receipts-497104`).
4. Ensure your service account key file is named `credentials.json` and resides inside the `backend/` directory.
