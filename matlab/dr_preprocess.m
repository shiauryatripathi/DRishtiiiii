function [preprocessedImg, mask] = dr_preprocess(inputImagePath, outputImagePath)
% DR_PREPROCESS - Diabetic Retinopathy Fundus Preprocessing Pipeline
% Problem Statement: SIH 2026 #26038 (MathWorks)
% 
% Algorithm:
% 1. RGB Fundus Image Acquisition
% 2. Green Channel Isolation (Maximum contrast for retinal vascular tree)
% 3. Circular Optic Field-of-View (FOV) Mask Detection
% 4. Contrast-Limited Adaptive Histogram Equalization (CLAHE)
% 5. Noise Attenuation via 2D Gaussian Filtering
% 6. Resizing to standard Deep Learning input dimensions (224x224x3)

    if nargin < 1
        error('Input image path must be provided.');
    end

    % 1. Read input image
    rawImg = imread(inputImagePath);
    if size(rawImg, 3) ~= 3
        error('Input must be a 3-channel RGB retinal fundus image.');
    end

    % 2. Extract channels (Green channel provides highest vascular contrast)
    R = rawImg(:, :, 1);
    G = rawImg(:, :, 2);
    B = rawImg(:, :, 3);

    % 3. Estimate circular fundus mask (Threshold on luminance)
    grayImg = rgb2gray(rawImg);
    mask = grayImg > 15;
    mask = imfill(mask, 'holes');
    mask = bwareaopen(mask, 1000); % Remove small artifact noise

    % 4. Apply CLAHE to the Green channel
    % ClipLimit: 0.02 to avoid amplifying sensor noise
    % Distribution: Rayleigh for balanced contrast in fundus images
    enhancedG = adapthisteq(G, ...
        'ClipLimit', 0.02, ...
        'Distribution', 'rayleigh', ...
        'NumTiles', [8 8]);

    % 5. Mild Gaussian denoising on enhanced channel
    enhancedG = imgaussfilt(enhancedG, 0.8);

    % 6. Reconstruct balanced 3-channel composite
    % Enhance Red (hemorrhages) and Blue while preserving Green dominance
    enhancedR = adapthisteq(R, 'ClipLimit', 0.01);
    preprocessedImg = cat(3, enhancedR, enhancedG, B);

    % Mask background to true black (0)
    preprocessedImg = bsxfun(@times, preprocessedImg, cast(mask, 'like', preprocessedImg));

    % 7. Resize to standard CNN input size (224 x 224 x 3)
    preprocessedImg = imresize(preprocessedImg, [224 224]);

    % Save if output path specified
    if nargin >= 2 && ~isempty(outputImagePath)
        imwrite(preprocessedImg, outputImagePath);
        fprintf('[MATLAB] Preprocessed image saved to: %s\n', outputImagePath);
    end
end
