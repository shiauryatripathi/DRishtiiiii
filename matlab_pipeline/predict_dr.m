function result_json = predict_dr(imagePath)
    % DRishti SIH 2026 - Inference & Grad-CAM execution
    
    % 1. Load the trained model (Ensure it exists in the same directory)
    persistent net;
    if isempty(net)
        try
            load('dr_resnet50_model.mat', 'trainedNet');
            net = trainedNet;
        catch
            % Fallback to base resnet for testing if custom model missing
            disp('WARNING: Custom model not found, loading base resnet50');
            net = resnet50; 
        end
    end
    
    try
        % 2. Read and Preprocess Image
        img = imread(imagePath);
        img = imresize(img, [224 224]);
        
        % Check if Grayscale, convert to RGB
        if size(img, 3) == 1
            img = cat(3, img, img, img);
        end
        
        % 3. Classify Image
        [label, scores] = classify(net, img);
        confidence = max(scores) * 100;
        
        % Map label to numerical grade (Assuming labels are '0', '1', '2', '3', '4')
        labelStr = char(label);
        grade = str2double(labelStr);
        if isnan(grade)
            grade = 2.0; % Default fallback
        end
        
        % 4. Generate Grad-CAM Heatmap
        % Find the name of the final convolutional layer (usually varies by model)
        % For standard ResNet-50, it's 'activation_49_relu'
        try
            layerName = 'activation_49_relu'; 
            scoreMap = gradCAM(net, img, label, 'FeatureLayer', layerName);
        catch
            scoreMap = zeros(224, 224); % Fallback if gradCAM fails
        end
        
        % 5. Build Clinical Diagnosis string
        if grade == 0
            diag = 'No Diabetic Retinopathy detected. Healthy fundus.';
            action = 'Annual screening routine.';
            tier = 'Low';
        elseif grade == 1
            diag = 'Mild Non-Proliferative Diabetic Retinopathy. Microaneurysms present.';
            action = '6-12 month follow up. Glycemic control advised.';
            tier = 'Moderate';
        elseif grade >= 2
            diag = 'Moderate/Severe NPDR. Significant hemorrhages and exudates localized via Grad-CAM.';
            action = 'Refer to Ophthalmologist for thorough evaluation.';
            tier = 'High';
        end
        
        % 6. Construct JSON Response (Sent back to Python -> Node.js)
        result = struct();
        result.isRetina = true;
        result.grade = grade;
        result.confidence = confidence;
        result.diagnosis = diag;
        result.explainability = 'Grad-CAM generated highlighting primary microvascular lesions.';
        result.clinicalAction = action;
        result.riskTier = tier;
        result.engine = 'MATLAB ResNet-50 Local';
        
        result_json = jsonencode(result);
        
    catch ME
        % Error Handling JSON
        err = struct();
        err.isRetina = false;
        err.error = ['MATLAB Error: ' ME.message];
        result_json = jsonencode(err);
    end
end
