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

    // Normalize newline characters to '\n' and preserve the '|' YAML syntax
    const normalizedValue = value.replace(/\r\n/g, '\n');
    const sanitizedValue = normalizedValue.includes('\n')
      ? `|-\n${normalizedValue.split('\n').map(line => `  ${calculateIndentation(data, key)}${line}`).join('\n')}`
      : normalizedValue;

    data = data.replace(regex, sanitizedValue);
  }
  return data;
}


function calculateIndentation(data, key) {
  const lines = data.split('\n');
  const lineWithKey = lines.find(line => line.includes(`ENV_${key}`));

  if (lineWithKey) {
    const indentationMatch = lineWithKey.match(/^(\s*)/);
    if (indentationMatch) {
      const existingIndentation = indentationMatch[1];
      // Increase the indentation by one if the value is multiline
      const additionalIndentation = existingIndentation.includes(':') ? '  ' : '';
      return existingIndentation + additionalIndentation;
    }
  }

  return ''; // default to empty string if no indentation is found
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
