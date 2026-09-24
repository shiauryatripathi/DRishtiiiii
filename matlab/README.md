# DRishti MATLAB Deep Learning Diagnostic Pipeline
**Problem Statement:** Smart India Hackathon (SIH 2026) #26038 (MathWorks)  
**Architecture:** ResNet-50 Convolutional Neural Network + CLAHE Image Preprocessing + Grad-CAM Explainable AI

---

## 🛠️ Required Toolboxes (All in your 30-Day Trial)
1. **MATLAB** (R2022b or later)
2. **Deep Learning Toolbox**
3. **Image Processing Toolbox**
4. **Computer Vision Toolbox**
5. **Deep Learning Toolbox Model for ResNet-50 Network** (Install by typing `resnet50` in the MATLAB Command Window)

---

## 📁 File Structure
- `dr_preprocess.m` — Green channel isolation (highest vascular contrast) + CLAHE contrast equalization.
- `dr_gradcam.m` — Computes Grad-CAM attention heatmaps from final convolutional layer (`res5c_relu`).
- `dr_inference.m` — Evaluates a fundus photo, assigns 0 to 4 severity grade, produces diagnosis & explainability text.
- `run_pipeline.m` — Headless batch interface for the Node.js web server (`matlab -batch "run_pipeline(...)"`).
- `train_retina_resnet50.m` — Full training script with data augmentation and confusion matrix generation.

---

## 🚀 How to Test in MATLAB Right Now

### 1. Test Single Image Inference
Open MATLAB, set current directory to `/matlab`, and run:
```matlab
% Run diagnostic on any test image
result = dr_inference('test_eye.jpg');

% View the result
disp(result);
```

### 2. Run Headless from Terminal / Command Prompt
```bash
matlab -batch "run_pipeline('test_eye.jpg', 'output_result.json')"
```

### 3. Train on APTOS Dataset
1. Place dataset images into `dataset_aptos/0`, `dataset_aptos/1`, `dataset_aptos/2`, `dataset_aptos/3`, `dataset_aptos/4`.
2. Open MATLAB and run:
```matlab
train_retina_resnet50
```
3. A live training progress window with loss and accuracy curves will appear, saving `retina_resnet50_dr.mat` upon completion.
