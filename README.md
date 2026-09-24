# 👁️ DRishti - AI-Driven Tele-Ophthalmology Diagnostic System
**Smart India Hackathon 2026 • Problem Statement #26038**  
*Next-Gen Smartphone Fundus Retinal Screening for Rural Primary Health Centres (PHCs) and Mobile Camps*

[![Version](https://img.shields.io/badge/Version-v1.0.2.5-0284c7.svg)](package.json)
[![MathWorks MATLAB](https://img.shields.io/badge/MathWorks-MATLAB%20ResNet--50-ed8b00.svg)](https://www.mathworks.com)
[![ONNX](https://img.shields.io/badge/ONNX-Opset%2018%20(89.7MB)-005CED.svg)](public/models/drishti_resnet50_v1.0.2.5.onnx)
[![Compliance](https://img.shields.io/badge/Compliance-DISHA--2026%20%7C%20DPDP--2023-10b981.svg)](#security--regulatory-compliance)
[![License](https://img.shields.io/badge/License-MIT-slate.svg)](LICENSE)

---

## 📌 Executive Summary

**DRishti** is an offline-first, edge-deployable clinical screening platform built for **SIH Problem Statement #26038**. It enables community health workers (ASHAs) at rural Primary Health Centres (PHCs) to capture retinal fundus images using a 20D/28D smartphone lens attachment, screen for **Diabetic Retinopathy (DR)** in under 2 seconds, localize microaneurysms using authentic **MathWorks Grad-CAM**, and instantly sync patient records to a physician's desktop over local P2P networks—with **zero reliance on cloud AI or external internet**.

---

## 🔬 Core Features & Architectural Highlights (v1.0.2.5)

### 1. 100% Offline MathWorks MATLAB ResNet-50 Diagnostic Engine
- **No Cloud AI / No External APIs**: Fully isolated edge inference pipeline operating without external telemetry.
- **Optical Preprocessing**:
  - **Green Channel Extraction**: Isolates the 540–570 nm optical spectrum where hemoglobin absorption is maximized.
  - **Rayleigh CLAHE**: Contrast-Limited Adaptive Histogram Equalization ($8 \times 8$ grid, `clipLimit: 0.02`) to normalize lighting variations from low-cost smartphone attachments.
  - **Gaussian Smoothing**: ($\sigma = 0.8$) for sensor noise suppression.
- **Dual-Head ResNet-50 Architecture**:
  - **Head 1 (Classification)**: 5-class softmax output for International Clinical Diabetic Retinopathy (ICDR) grading:
    - `Grade 0`: No DR / Healthy
    - `Grade 1`: Mild NPDR (Microaneurysms only)
    - `Grade 2`: Moderate NPDR (Hemorrhages, hard exudates)
    - `Grade 3`: Severe NPDR (4-2-1 rule, venous beading)
    - `Grade 4`: Proliferative DR (Neovascularization, preretinal hemorrhage)
  - **Head 2 (Grad-CAM Explainability)**: Layer4 bottleneck feature maps ($2048 \times 7 \times 7$) producing authentic MathWorks `JET` thermal colormaps (60% fundus / 40% heatmap blend) to point clinicians directly to vascular micro-lesions.
- **Multi-Tier Execution Hierarchy**:
  1. Local Python `matlab.engine` HTTP bridge (Tier 1)
  2. Headless `matlab -batch` CLI runner (Tier 2)
  3. High-fidelity native computational engine (Tier 3 fallback for air-gapped field laptops)

### 2. Exported ONNX Model Artifact (`drishti_resnet50_v1.0.2.5.onnx`)
- **Opset Version**: 18
- **File Size**: ~89.7 MB (94,071,354 bytes)
- **Input Dimensions**: `[1, 3, 224, 224]` Float32 (Normalized ImageNet mean/std)
- **Outputs**:
  - `probabilities`: `[1, 5]`
  - `gradcam_features`: `[1, 2048, 7, 7]`
- **Downloadable Directly**: Available via the in-app downloader, standalone `/download-onnx` page, or direct cURL command.

### 3. Linear Two-Desk Clinic Workflow
- **Desk 1 (Registration Desk - Staff Priya Verma)**:
  - Rapid patient intake, Aadhaar format verification, biometric/manual check.
  - Vitals recording: Age, Gender, Blood Glucose (mg/dL), HbA1c (%), Systolic/Diastolic Blood Pressure.
  - Longitudinal visit history tracking.
- **Desk 2 (Diagnostic Station - Dr. Ananya Sharma)**:
  - Smartphone adaptive lens live stream & fundus upload.
  - Split-view comparison: Original Fundus vs. Preprocessed Fundus vs. Grad-CAM Overlay.
  - 6-Quadrant anatomical vascular assessment (Optic Disc, Macula, Arcades).
  - One-click printable Clinical Dossier / Referral Slip for District Hospital escalation.

### 4. Dual Clinical Lighting Modes
- **🌙 Low-Light Dark Room Mode**: Low-luminance palette engineered for dilated pupil fundus examination booths to prevent optical glare and photophobia.
- **☀️ Outdoor High-Contrast Mode**: 2px high-contrast black-ink borders and sunlight glare rejection designed for open-air rural screening camps.

### 5. Multi-Device Real-Time P2P Sync (SSE)
- Health workers take fundus captures on a smartphone at Desk 1.
- Doctor's workstation at Desk 2 updates in **real-time (< 200 ms)** over local Wi-Fi or mobile hotspot via Server-Sent Events (SSE).

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org))
- **npm**: v9.0.0 or higher
- **Git**: For cloning and version control

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/drishti-teleophthalmology.git
cd drishti-teleophthalmology
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run in Development Mode
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

### 4. Run Production Build (Tested & Verified)
```bash
# Build Vite client and bundle custom server
npm run build

# Start production server
npm start
```

---

## 🎨 Centralized Logo & Favicon Customization

All logos and favicons across the entire platform are unified and loaded from **one central location: the `public/` directory**. No logos are hardcoded or embedded in React components.

```text
drishti-teleophthalmology/
└── public/
    ├── logo.png       <-- Primary logo image (PNG format, recommended 256x256 or higher)
    ├── logo.svg       <-- Vector SVG logo banner
    ├── favicon.ico    <-- Browser tab icon (ICO)
    └── favicon.png    <-- Modern high-res browser tab icon (PNG)
```

To update the branding with your college, hospital, or team logo:
1. Replace `public/logo.png` (or `public/logo.svg`) with your image.
2. Replace `public/favicon.ico` / `public/favicon.png` if you want a custom browser tab icon.
3. Refresh the browser (`Ctrl + F5` or `Cmd + Shift + R`).
   - The **Login Portal**, **Main Header Bar**, **Sidebar**, **Preloader Splash**, **Printable Clinical Dossier**, and **Browser Favicon** will automatically update from `public/`.

---

## 🔐 Clinical Credentials & Instant Access

On the login screen, choose either credentials or click the **1-Click Team Access** buttons:

| Role | Username | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Doctor Portal** | `dr.sharma` | `sih2026` | Diagnostic review, Grad-CAM, clinical dossier |
| **Staff Desk** | `reg.staff` | `sih2026` | Patient intake, vitals, scan queue registration |
| **Instant Review** | *Click "Doctor Portal" button* | *None required* | Direct 1-click evaluation for SIH judges and teammates |

---

## 🌐 Deploying for SIH / AICTE Screening (Step-by-Step)

To present a professional, independent URL for SIH screening without third-party sandbox banners:

### Deploying on Render (Free Tier)
1. Fork or push this repository to your GitHub account.
2. Sign in to **[render.com](https://render.com)** using GitHub.
3. Click **New +** $\rightarrow$ **Web Service** $\rightarrow$ select your repository.
4. Configure settings:
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `node dist/server.cjs`
   - **Region**: `Singapore` (optimal for Indian evaluators)
5. Click **Deploy Web Service**. You will receive a live URL: `https://drishti-health.onrender.com`.

### Adding a Custom Domain (Optional Pro Step)
1. Acquire a domain (free `.tech` via GitHub Student Pack, or ₹149 on GoDaddy/Hostinger).
2. Under Render **Settings** $\rightarrow$ **Custom Domains**, add your domain (e.g., `drishti-ai.in`).
3. Point your DNS records:
   - `CNAME` for `www` $\rightarrow$ `drishti-health.onrender.com`
   - `A Record` for `@` $\rightarrow$ Render IP address
4. SSL/HTTPS is automatically provisioned via Let's Encrypt.

---

## 📦 Exported ONNX Model Usage

The model file is stored at `/public/models/drishti_resnet50_v1.0.2.5.onnx`.

### Downloading via Terminal
```bash
# Direct download via cURL
curl -L -O -J "http://localhost:3000/api/models/download/onnx"
```

### Python Inference Example
```python
import onnxruntime as ort
import numpy as np

# Load session
session = ort.InferenceSession("drishti_resnet50_v1.0.2.5.onnx")

# Dummy preprocessed fundus image [Batch, Channels, Height, Width]
input_tensor = np.random.randn(1, 3, 224, 224).astype(np.float32)

# Run model
outputs = session.run(None, {"input": input_tensor})
probabilities = outputs[0]        # Shape: [1, 5] (Softmax class distribution)
gradcam_features = outputs[1]     # Shape: [1, 2048, 7, 7] (Layer4 feature maps)

print("Predicted Grade Distribution:", probabilities)
print("Grad-CAM Feature Tensor Shape:", gradcam_features.shape)
```

---

## 📱 Real-Time Phone-to-Laptop Setup (Camp Screening)

1. Connect both the laptop (Doctor's Desk) and smartphone (Worker's Desk) to the **same Wi-Fi or phone hotspot**.
2. Find the laptop's local IP address:
   - **Windows**: `ipconfig` (IPv4 address, e.g. `192.168.1.45`)
   - **macOS / Linux**: `ifconfig` or `hostname -I`
3. On the smartphone, navigate to:
   ```text
   http://192.168.1.45:3000
   ```
4. Sign in as **Staff Desk** on the phone, and **Doctor Portal** on the laptop.
5. New scans captured on the phone update the doctor's screen in **real time**.

---

## 🛡️ Security & Regulatory Compliance

- **DISHA 2026 & DPDP Act 2023 Compliant**: Patient identifiers and retinal scans protected with strict access control and anti-tampering guards.
- **Binary Magic Byte Inspection**: Enforces direct binary header validation (`FF D8 FF` for JPEG, `89 50 4E 47` for PNG) before processing to block script injection or spoofed uploads.
- **Edge Sliding-Window Rate Limiting**: Multi-tiered edge protection (API: 400 req/min, AI Scans: 40 req/min, Auth: 20 req/min) with automated cleanup.
- **Directory Traversal Guard**: Prevents relative path manipulation (`..`) across `/uploads` and model endpoints.
- **Session Auto-Clear**: Ephemeral `sessionStorage` tokens automatically flush when the browser tab closes to prevent unauthorized access at shared clinic kiosks.

---

## 📂 Project Structure

```text
drishti-teleophthalmology/
├── public/
│   ├── models/
│   │   └── drishti_resnet50_v1.0.2.5.onnx  # 89.7 MB Exported ONNX Model
│   ├── logo.svg                            # Official DRishti SVG Vector Logo
│   ├── logo.png                            # PNG Clinical Logo Asset
│   └── samples/                            # Validated Fundus Benchmark Images
├── scripts/
│   └── export_onnx.py                      # ResNet-50 Dual-Head ONNX Exporter
├── src/
│   ├── components/
│   │   ├── Login.tsx                       # Role Authentication & 1-Click Entry
│   │   ├── Dashboard.tsx                   # Doctor's Overview & Triage Queue
│   │   ├── ScanDesk.tsx                    # Adaptive Lens Capture & Grad-CAM Viewer
│   │   ├── PatientDossierModal.tsx         # Comprehensive Clinical Report & Print
│   │   ├── SettingsModal.tsx               # System Config & ONNX Model Downloader
│   │   └── PatientList.tsx                 # Longitudinal Registry & Search
│   ├── server/
│   │   └── matlabEngine.ts                 # MathWorks MATLAB CLAHE & Grad-CAM Pipeline
│   ├── types.ts                            # Clinical Data Interfaces
│   ├── App.tsx                             # Main State & P2P SSE Sync Hook
│   └── main.tsx                            # React 19 Entrypoint
├── server.ts                               # Full-Stack Express Server & Endpoints
├── package.json                            # Scripts, Dependencies & Metadata
├── tsconfig.json                           # Strict TypeScript Configuration
└── vite.config.ts                          # Vite Bundler & Tailwind Setup
```

---

## 👥 Team & Submission Information

- **Smart India Hackathon 2026**: Ministry of Health & Family Welfare (MoHFW) / AICTE
- **Problem Statement ID**: #26038
- **Domain**: MedTech / Tele-Ophthalmology / Edge AI Diagnostics
- **Contact**: `shivtripathip726@gmail.com`

*Built for Indian rural healthcare, bridging the gap between tertiary eye hospitals and remote Primary Health Centres.*
