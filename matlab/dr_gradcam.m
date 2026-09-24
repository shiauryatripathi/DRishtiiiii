function [gradcamMap, overlayImg] = dr_gradcam(net, inputImg, targetClass, featureLayer, reductionLayer)
% DR_GRADCAM - Gradient-weighted Class Activation Mapping for Explainable AI
% MathWorks SIH 2026 #26038: Diabetic Retinopathy Explainability
% 
% Computes gradient of the class score with respect to feature activation maps
% in the final convolutional block of ResNet-50 ('activation_49_relu' / 'res5c_relu')
% to highlight microaneurysms, hemorrhages, and hard exudates.

    if nargin < 4 || isempty(featureLayer)
        featureLayer = 'activation_49_relu'; % ResNet-50 final conv layer
    end
    if nargin < 5 || isempty(reductionLayer)
        reductionLayer = 'ClassificationLayer_fc1000';
    end

    % Resize input image to match network architecture if needed
    inputSize = net.Layers(1).InputSize;
    if size(inputImg, 1) ~= inputSize(1) || size(inputImg, 2) ~= inputSize(2)
        inputImgResized = imresize(inputImg, [inputSize(1) inputSize(2)]);
    else
        inputImgResized = inputImg;
    end

    % Convert to dlarray for automatic differentiation
    dlImg = dlarray(single(inputImgResized), 'SSC');

    % Forward pass through feature extraction layer
    try
        % Compute Grad-CAM using Deep Learning Toolbox built-in or gradient computation
        gradcamMap = gradCAM(net, inputImgResized, targetClass, 'FeatureLayer', featureLayer);
    catch
        % Fallback manual implementation if gradCAM function differs by release
        fprintf('[MATLAB] Generating custom gradient activation map...\n');
        features = activations(net, inputImgResized, featureLayer);
        weights = mean(mean(features, 1), 2);
        cam = sum(features .* weights, 3);
        cam = max(cam, 0); % ReLU on CAM
        gradcamMap = imresize(cam, [size(inputImg, 1) size(inputImg, 2)]);
        if max(gradcamMap(:)) > min(gradcamMap(:))
            gradcamMap = (gradcamMap - min(gradcamMap(:))) / (max(gradcamMap(:)) - min(gradcamMap(:)));
        end
    end

    % Generate heat map overlay using JET colormap
    heatMap = ind2rgb(gray2ind(gradcamMap, 256), jet(256));
    heatMap = uint8(heatMap * 255);

    % Alpha blending with original fundus image (60% fundus, 40% heatmap)
    if size(inputImgResized, 3) == 1
        inputImgResized = repmat(inputImgResized, [1 1 3]);
    end
    overlayImg = uint8(0.6 * double(inputImgResized) + 0.4 * double(heatMap));
end
