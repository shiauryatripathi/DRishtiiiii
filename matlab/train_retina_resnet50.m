% TRAIN_RETINA_RESNET50 - Complete Training Script for MathWorks SIH 26038
% Fine-tunes ResNet-50 Convolutional Neural Network on Diabetic Retinopathy Datasets (APTOS 2019 / IDRiD / Messidor)
% Requirements:
%   - MATLAB (R2022b or later recommended)
%   - Deep Learning Toolbox
%   - Image Processing Toolbox
%   - Deep Learning Toolbox Model for ResNet-50 Network

clc; clear; close all;
fprintf('=== DRishti: MathWorks SIH2026 ResNet-50 Training Pipeline ===\n\n');

%% 1. Configuration & Hyperparameters
dataDir = fullfile(pwd, 'dataset_aptos'); % Point to folder containing /0, /1, /2, /3, /4 subfolders
outputModelFile = fullfile(pwd, 'retina_resnet50_dr.mat');
imageSize = [224 224 3];
numClasses = 5;
classNames = {'No DR', 'Mild NPDR', 'Moderate NPDR', 'Severe NPDR', 'Proliferative DR'};

miniBatchSize = 32;
maxEpochs = 20;
initialLearnRate = 1e-4;

%% 2. Load and Preprocess Image Datastore
if ~exist(dataDir, 'dir')
    fprintf('[INFO] Dataset directory "%s" not found.\n', dataDir);
    fprintf('Please create the folder with subdirectories "0", "1", "2", "3", "4" containing your fundus scans.\n');
    fprintf('You can download the APTOS 2019 dataset from Kaggle.\n');
    return;
end

imds = imageDatastore(dataDir, ...
    'IncludeSubfolders', true, ...
    'LabelSource', 'foldernames');

% Stratified 80% Train, 20% Validation split
[imdsTrain, imdsVal] = splitEachLabel(imds, 0.8, 'randomized');
fprintf('Training Images: %d | Validation Images: %d\n', numel(imdsTrain.Files), numel(imdsVal.Files));

%% 3. Data Augmentation Pipeline
% Simulates varying smartphone lens angles and rural clinic illumination
pixelRange = [-20 20];
scaleRange = [0.9 1.1];
imageAugmenter = imageDataAugmenter( ...
    'RandXReflection', true, ...
    'RandYReflection', true, ...
    'RandRotation', [-180 180], ...
    'RandXTranslation', pixelRange, ...
    'RandYTranslation', pixelRange, ...
    'RandXScale', scaleRange, ...
    'RandYScale', scaleRange);

% Custom preprocessing transform: CLAHE on Green Channel + Resize
augImdsTrain = augmentedImageDatastore(imageSize, imdsTrain, ...
    'DataAugmentation', imageAugmenter, ...
    'ColorPreprocessing', 'gray2rgb');

augImdsVal = augmentedImageDatastore(imageSize, imdsVal, ...
    'ColorPreprocessing', 'gray2rgb');

%% 4. Load Pretrained ResNet-50 and Perform Transfer Learning
fprintf('[INFO] Loading pretrained ResNet-50 network...\n');
net = resnet50;
lgraph = layerGraph(net);

% Replace final 1000-class layers with 5-class Retinopathy classifier
newFCLayer = fullyConnectedLayer(numClasses, ...
    'Name', 'fc_retinopathy', ...
    'WeightLearnRateFactor', 10, ...
    'BiasLearnRateFactor', 10);

newSoftmaxLayer = softmaxLayer('Name', 'softmax_dr');
newClassLayer = classificationLayer('Name', 'output_dr', 'Classes', categorical(classNames));

lgraph = replaceLayer(lgraph, 'fc1000', newFCLayer);
lgraph = replaceLayer(lgraph, 'ClassificationLayer_fc1000', newClassLayer);

%% 5. Training Options
options = trainingOptions('adam', ...
    'MiniBatchSize', miniBatchSize, ...
    'MaxEpochs', maxEpochs, ...
    'InitialLearnRate', initialLearnRate, ...
    'LearnRateSchedule', 'piecewise', ...
    'LearnRateDropPeriod', 8, ...
    'LearnRateDropFactor', 0.2, ...
    'Shuffle', 'every-epoch', ...
    'ValidationData', augImdsVal, ...
    'ValidationFrequency', 30, ...
    'Verbose', true, ...
    'Plots', 'training-progress');

%% 6. Train Network
fprintf('\n[TRAINING] Starting ResNet-50 training with MathWorks Deep Learning Toolbox...\n');
[netTrained, trainInfo] = trainNetwork(augImdsTrain, lgraph, options);

%% 7. Evaluation & Confusion Matrix
fprintf('\n[EVALUATION] Computing confusion matrix on validation set...\n');
YPred = classify(netTrained, augImdsVal);
YVal = imdsVal.Labels;
accuracy = mean(YPred == YVal);
fprintf('Final Validation Accuracy: %.2f%%\n', accuracy * 100);

figure('Name', 'Diabetic Retinopathy Confusion Matrix');
confusionchart(YVal, YPred);
title(sprintf('ResNet-50 DR Classification - Accuracy: %.1f%%', accuracy * 100));
saveas(gcf, fullfile(pwd, 'dr_confusion_matrix.png'));

%% 8. Save Model
net = netTrained;
save(outputModelFile, 'net', 'accuracy', 'classNames');
fprintf('[SUCCESS] Model saved to: %s\n', outputModelFile);
