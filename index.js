const fs = require('fs');
const path = require('path');
const core = require('@actions/core');

try {
  const target = core.getInput('target');
  const processFile = core.getInput('file') === 'true'; // Check if 'file' is set to 'true'
  const secretsContext = JSON.parse(core.getInput('secrets-context'));
  const varsContext = JSON.parse(core.getInput('variables-context'));

  if (processFile) {
    // Process a single file specified in 'target'
    processSingleFile(target, secretsContext, varsContext);
  } else {
    // Process all files in the folder specified in 'target'
    processAllFiles(target, secretsContext, varsContext);
  }
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

function processSingleFile(filePath, secretsContext, varsContext) {
  try {
    let data = fs.readFileSync(filePath, 'utf8');

    // Replace the template variables with their values if exist in secrets
    for (const [key, value] of Object.entries(secretsContext)) {
      const regex = new RegExp(`ENV_${key}`, 'g');
      data = data.replace(regex, value);
    }

    // Replace the template variables with their values if exist in variables from vars context
    if (varsContext !== null) {
      for (const [key, value] of Object.entries(varsContext)) {
        const regex = new RegExp(`ENV_${key}`, 'g');
        data = data.replace(regex, value);
      }
    }

    // Replace the template variables with their values if exist in variables from env context
    for (const [key, value] of Object.entries(process.env)) {
      const regex = new RegExp(`ENV_${key}`, 'g');
      data = data.replace(regex, value);
    }

    // Overwrite the result to the file
    fs.writeFileSync(filePath, data);

    console.log(`File processed successfully: ${filePath}`);
  } catch (error) {
    console.error(`Error processing file ${filePath}: ${error.message}`);
  }
}

function processAllFiles(folderPath, secretsContext, varsContext) {
  const targetFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.yml') || file.endsWith('.yaml'));

  targetFiles.forEach(targetFile => {
    const filePath = path.join(folderPath, targetFile);
    processSingleFile(filePath, secretsContext, varsContext);
  });

  console.log(`All files in ${folderPath} processed successfully.`);
}
