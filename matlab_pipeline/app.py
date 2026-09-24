from flask import Flask, request, jsonify
import base64
import os
import uuid
import json

# =========================================================================
# DRishti SIH 2026 - Python API Bridge to MATLAB
# =========================================================================
# INSTALL INSTRUCTIONS:
# 1. Install MATLAB Engine API for Python (Check MathWorks docs for your version)
#    Usually: cd "C:\Program Files\MATLAB\R202Xx\extern\engines\python" && python setup.py install
# 2. pip install flask
# 3. Run: python app.py
# =========================================================================

try:
    import matlab.engine
    print("Starting MATLAB Engine... (This takes a few seconds)")
    eng = matlab.engine.start_matlab()
    print("MATLAB Engine connected successfully!")
except ImportError:
    print("ERROR: MATLAB Engine API for Python is not installed.")
    print("Please install it to connect this API to your MATLAB scripts.")
    exit(1)

app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        if not data or 'image' not in data:
            return jsonify({"error": "No image base64 provided"}), 400
        
        # Decode base64 image from Node.js
        image_b64 = data['image']
        # Remove header if present (e.g. data:image/jpeg;base64,)
        if ',' in image_b64:
            image_b64 = image_b64.split(',')[1]
            
        temp_filename = f"temp_fundus_{uuid.uuid4().hex}.jpg"
        
        with open(temp_filename, "wb") as fh:
            fh.write(base64.b64decode(image_b64))
            
        # Call the MATLAB function 'predict_dr.m'
        print(f"Processing image {temp_filename} through MATLAB...")
        result_json_str = eng.predict_dr(temp_filename, nargout=1)
        
        # Clean up temp file
        if os.path.exists(temp_filename):
            os.remove(temp_filename)
            
        # Parse the JSON string returned by MATLAB and send it back to Node.js
        result_dict = json.loads(result_json_str)
        return jsonify(result_dict)
        
    except Exception as e:
        print("API Error:", str(e))
        return jsonify({"isRetina": False, "error": str(e)}), 500

if __name__ == '__main__':
    print("==================================================")
    print(" MATLAB API Bridge Server Running on port 5000")
    print(" Put 'http://127.0.0.1:5000/predict' in your")
    print(" DRishti web app .env file as MATLAB_API_URL")
    print("==================================================")
    app.run(host='127.0.0.1', port=5000)
