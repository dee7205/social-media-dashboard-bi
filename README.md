<div align="center">

# 🚀 Viral Social Media Analytics Dashboard

> **A Business Intelligence (BI) tool designed to transform raw social media data into actionable content strategies.**

![Project Status](https://img.shields.io/badge/Status-Active-success)
![Tech Stack](https://img.shields.io/badge/Built%20With-React%20%7C%20Recharts%20%7C%20PapaParse-blue)
![Deployment](https://img.shields.io/badge/Deployed%20on-Vercel-black)

<br />

[**Explore the Live Demo »**](https://social-media-dashboard-bi.vercel.app/)

</div>

---

## 📖 Overview

The **Viral Social Media Analytics Dashboard** is a Single Page Application (SPA) developed by **Team Gimatag** for the course **CSDS 313 (Business Intelligence)**.

Unlike traditional analytics tools that simply display what happened (*Descriptive Analytics*), this dashboard integrates **Prescriptive Analytics** to tell creators *what to do next*. It processes large datasets of social media engagement to identify viral trends, optimal content formats, and platform-specific opportunities.

---

## ✨ Key Features

### 📊 1. Interactive Analytics Dashboard
* **Global KPI Banner:** Instant view of Total Views, Interactions, and Average Engagement Rate (ERR).
* **Dynamic Filtering:** Filter data by Region, Platform, Content Type, and Hashtags.
* **Visualizations:**
    * **Bubble Chart:** Analyzes the relationship between Likes, Comments, and Shares (Virality).
    * **Heatmap/Grouped Bar:** Identifies the "Winning Format" for each platform.
    * **Trend Analysis:** Tracks engagement fluctuations over time.

### 🤖 2. Platform Strategist
A predictive modeling tool that helps creators decide where to post.
* **How it works:** Uses historical "Decay Rate" data to rank platforms based on content longevity.
* **Input:** Region, Content Format, Hashtag.
* **Output:** A ranked list (Gold/Silver/Bronze) of platforms best suited for the content.

### 🧮 3. Quick ERR Calculator
A real-time benchmarking tool for auditing competitor content.
* **Features:**
    * Calculates **Engagement Rate by Reach (ERR)** instantly.
    * **Anomaly Detection:** Warns if engagement metrics exceed view counts.
    * **Quality Grading:** Assigns a label (e.g., "Low", "Average", "Viral Status") based on industry benchmarks.

### ℹ️ 4. In-App Documentation
A comprehensive guide accessible directly from the dashboard header.
* **Project Overview:** Context on why the dashboard exists.
* **Dataset Specifications:** Full list of features (Views, Likes, Content Types, etc.).
* **Methodology:** Detailed explanation of the math behind **Decayed ERR** and engagement grading scales.

---

## 🛠️ Tech Stack

* **Frontend Library:** React.js (v18+)
* **Visualization:** Recharts
* **Data Parsing:** PapaParse (Client-side CSV processing)
* **Icons:** Lucide React
* **Deployment:** Vercel

---

## ⚙️ Installation & Setup

Follow these steps to run the project locally.

### Prerequisites
* Node.js (v18 or higher)
* npm

### 1. Clone the Repository
```bash
git clone [https://github.com/your-username/social-media-dashboard.git](https://github.com/your-username/social-media-dashboard.git)
cd social-media-dashboard
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Data Files
Ensure the following CSV files are located in the public/ folder:

Cleaned_Viral_Social_Media_Trends_FINAL.csv (Main Dataset)

For_Platform_Predicting.csv (Training Data)

### 4. Run the Application
Bash

npm start
Open http://localhost:3000 to view it in your browser.

📂 Project Structure
Plaintext

/src
  ├── components
  │   ├── AboutModal.js       <-- Project documentation & dataset specs
  │   ├── ERRCalculator.js    <-- Real-time engagement calculator
  │   └── platformSelector.js <-- Platform Strategist UI logic
  ├── Dashboard.js            <-- Main layout & Chart logic
  ├── App.js                  <-- Route entry point
  └── index.js
/public
  ├── Cleaned_Viral_Social_Media_Trends_FINAL.csv
  └── For_Platform_Predicting.csv

  
### 💡 How to Use
* Exploratory Analysis: Use the Filters on the main dashboard to drill down into specific regions (e.g., "Brazil") or hashtags (e.g., "#Gaming") to see what content performs best.
* Strategic Planning: Click the ✨ AI Strategist button. Select your target parameters to receive a data-backed recommendation on which platform to prioritize.
* Competitor Auditing: Click the 🧮 ERR Calculator button. Input the metrics from a competitor's post to verify if their engagement is genuine.

### View Methodology: Click the ℹ️ About button to read about the dataset source, math formulas, and grading scales used in the project.

### 👥 Authors
Team Gimatag

* Dave Shanna Marie E. Gigawin
* Allan C. Tagle
* Wakin Cean C. Maclang

*This project was built for educational purposes for the College of Information and Computing.*
