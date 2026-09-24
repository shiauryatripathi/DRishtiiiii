# DRishti - MATLAB Connection Guide

This folder contains the actual MATLAB source code required to run your ResNet-50 pipeline locally and connect it to your exported web application.

## Prerequisites on your PC
1. **MATLAB** (R2022a or newer recommended).
2. **Deep Learning Toolbox** (Installed in MATLAB).
3. **ResNet-50 Network Support Package** (Installed via MATLAB Add-On Explorer).
4. **Python** (3.8 - 3.11).

## Step 1: Install MATLAB Engine for Python
You need to bridge Python to MATLAB so the web app can talk to it.
Open your PC's Command Prompt (Run as Administrator) and navigate to your MATLAB installation folder:
```bash
cd "C:\Program Files\MATLAB\R2023b\extern\engines\python"
python setup.py install
```
*(Change `R2023b` to your actual MATLAB version).*

## Step 2: Install Flask
```bash
pip install flask
```

## Step 3: Train your Model (Optional if you already have one)
1. Open MATLAB and navigate to this `matlab_pipeline` folder.
2. Ensure you have a `dataset` folder here with subfolders `0`, `1`, `2`, `3`, `4` containing your fundus images.
3. Run `train_model.m` in MATLAB.
4. It will save `dr_resnet50_model.mat`.

## Step 4: Start the API Bridge
Open a terminal in this `matlab_pipeline` folder and run:
```bash
python app.py
```
*Wait until it says "MATLAB Engine connected successfully!" and "Running on http://127.0.0.1:5000".*

## Step 5: Connect the Web App
1. In your exported web app folder, open the `.env` file (create it if it doesn't exist).
2. Add this exact line to the `.env` file:
```env
MATLAB_API_URL="http://127.0.0.1:5000/predict"
```
3. Start your Node.js app (`npm run dev`).
4. Now, when you click "Analyze Scan" in the app, it will send the image directly to your MATLAB window via Python, calculate the ResNet-50 Grad-CAM, and return the real result instantly!
