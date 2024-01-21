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

function replaceTemplateVariables(dataRaw, contextObj) {
  // Read data from file
  let data = dataRaw;

  try {
    const regex = /ENV_\w+/g;

    // Find all matches of "ENV_" followed by a key in the data string
    const matches = data.match(regex);

    // If there are matches, sort them in descending order
    if (matches) {
      const sortedMatches = matches.sort((a, b) => b.localeCompare(a));

      // Iterate over the sorted matches
      for (const match of sortedMatches) {
        const key = match.substring(4); // Extract the key from the match
        const contextValue = contextObj[key]; // Get the corresponding value from the context

        if (contextValue !== undefined) {
          const normalizedValue = normalizeValue(contextValue);
          const sanitizedValue = getSanitizedValue(data, key, normalizedValue);

          // Replace the key in the data with the sanitized value
          data = data.replace(new RegExp(match, ''), sanitizedValue);
        }
      }
    }

    return data;
  } catch (error) {
    console.error('Error parsing context file:', error);
    return null;
  }
}


function normalizeValue(value) {
  // Normalize newline characters to '\n'
  return value.replace(/\r\n/g, '\n');
}

function getSanitizedValue(data, key, normalizedValue) {
  return normalizedValue.includes('\n')
    ? `|-\n${normalizedValue.split('\n').map(line => {
        // Calculate the indentation dynamically based on the existing indentation
        const existingIndentation = calculateIndentation(data, `ENV_${key}`);
        return `  ${existingIndentation}${line}`;
      }).join('\n')}`
    : normalizedValue;
}



function calculateIndentation(data, key) {
  const lines = data.split('\n');
  const lineWithKey = lines.find(line => line.includes(key));

  if (lineWithKey) {
    const indentationMatch = lineWithKey.match(/^(\s*)/);
    if (indentationMatch) {
      const existingIndentation = indentationMatch[1];
      // Increase the indentation by one if the value is multiline
      const additionalIndentation = existingIndentation.includes(':') ? '  ' : '';
      return existingIndentation + additionalIndentation;
    }
  }

  return ''; // default to an empty string if no indentation is found
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
