# 🌍 CarbonWise
**AI-Powered Gamified Carbon Footprint Tracker**

[![Live Demo](https://img.shields.io/badge/Live_Demo-Click_Here-success?style=for-the-badge)](https://carbonwise-365027537314.us-central1.run.app/)
*(Deployed on Google Cloud Run)*

CarbonWise is a gamified, AI-driven carbon tracking and reduction application designed for the **PromptWars** competition. It automates footprint logging through smart features like grocery receipt scanning, standby energy audits, and neighborhood tool sharing, replacing tedious manual data entry with engaging, automated feedback.

---

## 🚀 The Vision

Tracking your carbon footprint shouldn't feel like doing taxes. CarbonWise transforms sustainability into an engaging, visual, and socially rewarding experience. By framing your footprint as a "Carbon Debt", every eco-friendly action you take—from swapping beef for chicken to unplugging vampire appliances—acts as a debt payment that visibly heals your personal virtual ecosystem.

---

## ✨ Key Features

🌱 **Live Virtual EcoSphere**
An interactive visual representation of a floating island. The ecosystem blooms (spawns green leaves, flowers, sunny sky) when you save carbon, and decays (spawns barren trees, gray smog) when your carbon footprint is neglected.

💳 **Carbon Debt Clock**
Measures your carbon emissions as a financial debt to the Earth. Completing daily and weekly quests functions as "debt payments" ticking down the clock in real-time.

🧾 **AI Receipt Scanner (Smart Pantry)**
Powered by **Google Cloud Vision OCR**. Snap a photo of your grocery bill, and the AI instantly identifies high-impact food purchases (like beef and dairy) and calculates their carbon cost while suggesting eco-friendly swaps. Images are securely stored in **Google Cloud Storage**.

🔌 **Home-Audit (Phantom Loads)**
An interactive checklist identifying appliances consuming power while on standby. Shows real-time savings after turning off TVs, unplugging unused phone chargers, and shutting down game consoles.

🔄 **Eco-Xchange (P2P Lending)**
A community marketplace allowing neighbors to borrow low-use items (tents, ladders, drills) instead of buying new products. The app tracks the exact carbon emissions avoided by sharing instead of manufacturing new items.

🏆 **Social Leaderboard & Badges**
Compete with peers and neighbors to earn titles like *Transit Hero*, *Pantry Warden*, and *Grid Saver*.

---

## 💻 Tech Stack

- **Frontend**: React.js (Vite), Glassmorphic Vanilla CSS, Lucide Icons
- **Backend**: Python, FastAPI, SQLite (SQLAlchemy ORM)
- **AI & Cloud Services**: Google Cloud Vision API (OCR), Google Cloud Storage (GCS Bucket), Google Cloud Run

---

## 🛠️ How to Run Locally

CarbonWise uses a streamlined **Single Application Server** architecture. The FastAPI backend automatically builds and serves the React frontend, meaning you only need one terminal to run the entire full-stack application!

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yjaswanth78/CarbonWise.git
   cd CarbonWise
   ```

2. **Run the startup script:**
   ```bash
   python run.py
   ```
   *This script automatically creates your virtual environment, installs Python dependencies, builds the Node.js frontend, and starts the unified server.*

3. **Open your browser:**
   Navigate to [http://localhost:8000](http://localhost:8000)

*(Note: The application is pre-configured to gracefully fall back to local simulated OCR if Google Cloud credentials are not detected on your local machine).*
