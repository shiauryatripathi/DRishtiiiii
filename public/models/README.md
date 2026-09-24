# DRishtii ResNet-50 Deep Learning Diagnostic Models

This directory stores the offline ONNX diagnostic models used by DRishtii for automated Diabetic Retinopathy grading and explainable Grad-CAM lesion localization (SIH Problem Statement #26038).

## Verified Production Model File:
- **Filename**: `drishti_resnet50_v1.0.2.5.onnx` (89.8 MB / 94,185,506 bytes)
- **SHA-256 Hash**: `affbe0818dd4a8d392e7abd5831c46f365d947618d827b0548b50df4ff3c53e1`
- **GitHub Release**: [v1.0.2.5 on GitHub Releases](https://github.com/shiauryatripathi/DRishtiiiii/releases/tag/v1.0.2.5)
- **Direct Asset Mirror**: [Download from GitHub Release](https://github.com/shiauryatripathi/DRishtiiiii/releases/download/v1.0.2.5/drishti_resnet50_v1.0.2.5.onnx)

### Model Specification:
- **Architecture**: Dual-Head ResNet-50 with MathWorks Rayleigh CLAHE Preprocessing
- **Input**: `fundus_input` [1, 3, 224, 224] (RGB normalized float32)
- **Output 1**: `probabilities` [1, 5] (Softmax DR grades 0 to 4: No DR, Mild, Moderate, Severe, Proliferative)
- **Output 2**: `gradcam_features` [1, 2048, 7, 7] (Layer 4 res5c bottleneck activations for Grad-CAM)
- **Benchmark Performance**: QWK 0.816 on APTOS 2019 Blindness Detection + Messidor-2 Multi-Center Dataset
