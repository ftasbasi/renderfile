const fs = require('fs');
const path = require('path');
const core = require('@actions/core');
try {
  const targetFolder = core.getInput('target-folder');
  const secretsContext = JSON.parse(core.getInput('secrets-context'));
  const varsContext = JSON.parse(core.getInput('variables-context'));

  const targetFiles = fs.readdirSync(targetFolder).filter(file => file.endsWith('.yml') || file.endsWith('.yaml'));

  targetFiles.forEach(targetFile => {
    const filePath = path.join(targetFolder, targetFile);

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
  });

  // Now you can use 'targetFolder', 'secretsContext', and 'varsContext' in your script logic
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
