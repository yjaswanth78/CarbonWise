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

## 🚀 Quick Start (Local Run)

We have transformed the architecture into a **Single Application Server**. The FastAPI backend automatically builds the React frontend and serves both the API and the web interface from a single port!

### Instructions:
1. Open your terminal in the project directory.
2. Run the startup script:
   ```bash
   python run.py
   ```
3. The script will automatically:
   - Install all required Python backend dependencies.
   - Install Node Modules and build the React frontend (`npm install && npm run build`).
   - Launch the unified Server on **[http://localhost:8000](http://localhost:8000)**.

---

## ☁️ Deploying to Google Cloud Run

This project includes a `Dockerfile` pre-configured to build the frontend and serve it alongside the Python backend in a single container.

### Deployment Instructions:
1. Open [Google Cloud Console](https://console.cloud.google.com/) and launch **Cloud Shell**.
2. Clone your repository:
   ```bash
   git clone https://github.com/yjaswanth78/CarbonWise.git
   cd CarbonWise
   ```
3. Grant permissions to the default build service account:
   ```bash
   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID --member="serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" --role="roles/editor"
   ```
4. Deploy the application:
   ```bash
   gcloud run deploy carbonwise --source . --region=us-central1 --allow-unauthenticated
   ```

*Once deployed, Google Cloud will provide you with a live `https://...` link to view your application!*

---

## ☁️ Google Cloud Integrations

The application supports real Google Cloud Storage (for permanently saving uploaded images) and Google Cloud Vision (for AI-powered OCR scanning). 

By default, the application uses these GCP services. If you do not have GCP setup, you can revert back to "Local Simulation Mode".

**To configure GCP:**
1. Open `backend/app/config.py`.
2. Set `USE_GCP = True`.
3. Set your `BUCKET_NAME` to your actual GCS bucket name (e.g. `carbonwise-receipts`).
4. Ensure your project has the **Cloud Vision API** and **Cloud Storage API** enabled. When deployed on Cloud Run, the credentials are automatically handled securely!
