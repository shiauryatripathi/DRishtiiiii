# DRishtii AI Diagnostic System (SIH #26038)
### Edge-Native Tele-Ophthalmology & Diabetic Retinopathy Diagnostic Platform

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Compliance](https://img.shields.io/badge/Compliance-DISHA%202026%20%7C%20DPDP%202023%20%7C%20ABDM-blue.svg)]()
[![Version](https://img.shields.io/badge/version-v1.1.2.8-blue.svg)]()
[![License](https://img.shields.io/badge/license-Medical%20Device%20Investigational%20License-orange.svg)]()

DRishtii is an edge-native clinical tele-ophthalmology workstation designed for rural Primary Health Centres (PHCs), sub-centres, and mobile screening vans. It performs instantaneous 5-tier Diabetic Retinopathy (DR) grading and anatomical lesion localization from smartphone-mounted 20D/28D indirect ophthalmoscopy fundus images.

---

## 1. System Architecture & Optical Pipeline

```
 [Patient Ingestion]          [Desk 2: Optical Capture]           [Diagnostic Edge Engine]
   Desk 1 (ABHA / Demographics)  ───► 20D Volk Smartphone Mount ───►  Image Quality Assessment (IQA)
                                          │                              │ (Tenengrad Gradient >= 35.0)
                                          ▼                              ▼
                                     30-Burst Stacking            Green-Channel Extraction (540nm)
                                          │                              │
                                          ▼                              ▼
                                     Optical Auto-Crop            Rayleigh CLAHE Normalization
                                                                         │
                                                                         ▼
                                                                ONNX / MATLAB Engine (Local)
                                                                         │
                                      ┌──────────────────────────────────┴─────────────────────────────────┐
                                      ▼                                                                    ▼
                            5-Stage ETDRS Classification                                         Grad-CAM Lesion Heatmap
                         (Grade 0 to Grade 4 ICO Standards)                                    (Microaneurysms / Exudates)
                                      │                                                                    │
                                      └──────────────────────────────────┬─────────────────────────────────┘
                                                                         ▼
                                                            Comprehensive Clinical Dossier
                                                          (Printable A4 Referral Slip + SSE Sync)
```

---

## 2. Clinical Diagnostic Classification (ICO / ETDRS Standards)

| Stage | Clinical Severity | Key Pathological Features | ICD-10 Code | Action Timeline |
|:---|:---|:---|:---|:---|
| **Grade 0** | No Apparent DR | No microaneurysms, hemorrhages, or exudates | `H36.01` | Routine 12-month follow-up at PHC |
| **Grade 1** | Mild NPDR | Microaneurysms only (<50µm red lesions) | `H36.02` | Follow-up in 6–9 months, HbA1c review |
| **Grade 2** | Moderate NPDR | Dot-blot hemorrhages, hard lipid exudates | `H36.03` | Ophthalmologist review within 3–4 weeks |
| **Grade 3** | Severe NPDR | **4-2-1 Rule**: ≥20 intraretinal hemorrhages in all 4 quadrants | `H36.04` | Urgent Vitreo-Retinal review in 1–2 weeks |
| **Grade 4** | Proliferative (PDR) | Neovascularization (NVD/NVE), vitreous hemorrhage | `H36.05` | **Emergency 24–48h referral (PRP / Anti-VEGF)** |

---

## 3. Optical Preprocessing & Engineering Specifications

1. **Rayleigh CLAHE (Contrast-Limited Adaptive Histogram Equalization):**
   - Tile grid size: $8 \times 8$
   - Clip Limit: $0.02$
   - Rayleigh parameter $\alpha = 0.4$ for realistic retinal reflectance calibration.
2. **Green Channel Isolation:**
   - 540nm peak spectral absorption captures maximum hemoglobin contrast for microvascular lesion detection.
3. **Tenengrad Focus Metric:**
   - Evaluates Sobel spatial gradient variance ($\nabla I_x^2 + \nabla I_y^2$). Rejects blurry or underexposed scans below quality score $35.0$.

---

## 4. Multi-Device Real-Time Sync (Desk 1 ↔ Desk 2)

- **Bi-Directional SSE Synchronization:** Employs persistent Server-Sent Events over HTTP/2 for latency-free queue coordination between Registration Officers and Eye Technicians.
- **Offline Edge Cache:** In-memory sliding-window SQLite/JSON fallback for isolated deployments in rural areas without cellular connectivity.

---

## 5. Security & Regulatory Compliance

- **DISHA 2026 Telemedicine Standard:** End-to-end anonymization of fundus payloads; strict role-based access control (RBAC).
- **DPDP Act 2023 Compliant:** Patient data never leaves local hardware; zero third-party tracking scripts or advertising cookies.
- **Magic Bytes Verification:** Binary signature inspection enforces valid JPEG/PNG structures before inference execution.

---

## 6. Project Credentials & Development Team

- **Initiative:** Smart India Hackathon (SIH Problem Statement #26038)
- **Clinical Domain:** Tele-Ophthalmology & Non-Mydriatic Fundus Screening
- **Deployment Build:** `v1.1.2.8` Edge Release
- **Standard:** IEC 62304 Medical Device Software Lifecycle (Class B)
