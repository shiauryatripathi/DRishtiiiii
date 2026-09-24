# DRishti MATLAB Pipeline Architecture

This folder represents the offline MATLAB & Simulink architecture required by the MathWorks SIH26038 problem statement.

## Datasets
Due to the massive size of the required medical datasets (50GB+), they are not hosted inside this lightweight Node.js web server. To train the model locally for the finale, download and place them in the \`datasets\` folder:

1. **APTOS 2019 Blindness Detection**: `datasets/aptos2019/`
2. **IDRiD**: `datasets/idrid/`
3. **DRIVE (Vessel Extraction)**: `datasets/drive/`
4. **Messidor-2**: `datasets/messidor2/`

## MATLAB Scripts Overview
* **`01_image_enhancement.m`**: Applies CLAHE (Contrast Limited Adaptive Histogram Equalization) and illumination normalization.
* **`02_lesion_segmentation.m`**: Extracts optic disc, fovea, and microaneurysms using Deep Learning Toolbox.
* **`03_dr_grading.m`**: ResNet50-based classification (Levels 0-4) using the APTOS dataset.
* **`04_gradcam_explainability.m`**: Generates heatmap visualization for the web dashboard.
* **`telemedicine_pipeline.slx`**: Simulink model optimizing image acquisition rates, bandwidth, and processing throughput for 100,000+ patients.

> **Note to Judges:** The web application in this repository acts as the Edge deployment interface for rural clinics. It securely transmits images to this centralized MATLAB processing pipeline and renders the resulting Grad-CAM explainability outputs for the ophthalmologist.
