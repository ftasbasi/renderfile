const fs = require('fs');
const path = require('path');
const core = require('@actions/core');

try {
  const target = core.getInput('target');
  const processFile = core.getInput('file') === 'true' || false; // Set to false by default
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

function replaceTemplateVariables(data, context) {
  for (const [key, value] of Object.entries(context)) {
    const regex = new RegExp(`ENV_${key}`, 'g');

    // Preserve newline characters with the '|' YAML syntax and apply indentation
    const sanitizedValue = value.includes('\n')
      ? `|-\n${value.split('\n').map(line => `  ${line}`).join('\n')}`
      : value;

    data = data.replace(regex, sanitizedValue);
  }
  return data;
}

function processSingleFile(filePath, secretsContext, varsContext) {
  try {
    let data = fs.readFileSync(filePath, 'utf8');

    // Replace template variables with their values in secrets context
    data = replaceTemplateVariables(data, secretsContext);

    // Replace template variables with their values in variables from vars context
    if (varsContext !== null) {
      data = replaceTemplateVariables(data, varsContext);
    }

    // Replace template variables with their values in variables from env context
    data = replaceTemplateVariables(data, process.env);

    // Overwrite the result to the file
    fs.writeFileSync(filePath, data, 'utf8');

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
