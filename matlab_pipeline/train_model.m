% =========================================================================
% DRishti SIH 2026 - ResNet-50 Training Script for Diabetic Retinopathy
% Requirements: Deep Learning Toolbox, ResNet-50 Network Support Package
% =========================================================================

disp('Initializing DRishti Model Training...');

% 1. Load the Dataset
% Ensure you have a folder named 'dataset' with subfolders: 0, 1, 2, 3, 4
datasetPath = fullfile(pwd, 'dataset'); 
imds = imageDatastore(datasetPath, ...
    'IncludeSubfolders', true, ...
    'LabelSource', 'foldernames');

% 2. Split into Training and Validation (80/20)
[imdsTrain, imdsValidation] = splitEachLabel(imds, 0.8, 'randomized');

% 3. Load Pre-trained ResNet-50
net = resnet50;
lgraph = layerGraph(net);

% 4. Replace the Classification Layers for 5-Class Output
numClasses = numel(categories(imdsTrain.Labels));

newFCLayer = fullyConnectedLayer(numClasses, ...
    'Name', 'new_fc', ...
    'WeightLearnRateFactor', 10, ...
    'BiasLearnRateFactor', 10);
    
newClassLayer = classificationLayer('Name', 'new_classoutput');

lgraph = replaceLayer(lgraph, 'fc1000', newFCLayer);
lgraph = replaceLayer(lgraph, 'ClassificationLayer_fc1000', newClassLayer);

% 5. Data Augmentation (Crucial for Fundus Images)
pixelRange = [-30 30];
imageAugmenter = imageDataAugmenter( ...
    'RandXReflection', true, ...
    'RandYReflection', true, ...
    'RandXTranslation', pixelRange, ...
    'RandYTranslation', pixelRange, ...
    'RandRotation', [-15 15]);

augimdsTrain = augmentedImageDatastore([224 224], imdsTrain, ...
    'DataAugmentation', imageAugmenter);
augimdsValidation = augmentedImageDatastore([224 224], imdsValidation);

% 6. Training Options
options = trainingOptions('sgdm', ...
    'MiniBatchSize', 32, ...
    'MaxEpochs', 20, ...
    'InitialLearnRate', 1e-4, ...
    'Shuffle', 'every-epoch', ...
    'ValidationData', augimdsValidation, ...
    'ValidationFrequency', 50, ...
    'Verbose', false, ...
    'Plots', 'training-progress');

% 7. Train the Network
disp('Starting Training... (This may take hours depending on your GPU)');
trainedNet = trainNetwork(augimdsTrain, lgraph, options);

% 8. Save the Model
save('dr_resnet50_model.mat', 'trainedNet');
disp('Model saved successfully as dr_resnet50_model.mat');
