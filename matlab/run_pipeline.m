function exitCode = run_pipeline(inputImagePath, outputJsonPath, modelPath)
% RUN_PIPELINE - Headless CLI Entry Point for Node.js / Web App Integration
% Usage:
%   matlab -batch "run_pipeline('path/to/fundus.jpg', 'path/to/result.json')"

    exitCode = 0;
    try
        if nargin < 1 || isempty(inputImagePath)
            error('Missing input image path.');
        end
        if nargin < 2 || isempty(outputJsonPath)
            [p, f, ~] = fileparts(inputImagePath);
            outputJsonPath = fullfile(p, [f '_result.json']);
        end
        if nargin < 3
            modelPath = '';
        end

        outputDir = fileparts(outputJsonPath);
        if isempty(outputDir)
            outputDir = pwd;
        end

        % Run diagnostic inference
        res = dr_inference(inputImagePath, modelPath, outputDir);

        % Convert struct to JSON
        jsonStr = jsonencode(res);

        % Write to target file
        fid = fopen(outputJsonPath, 'w');
        if fid == -1
            error('Unable to open output JSON file for writing.');
        end
        fwrite(fid, jsonStr, 'char');
        fclose(fid);

        fprintf('[MATLAB PIPELINE SUCCESS] Result written to: %s\n', outputJsonPath);
    catch ME
        fprintf(2, '[MATLAB PIPELINE ERROR] %s\n', ME.message);
        exitCode = 1;
    end
end
