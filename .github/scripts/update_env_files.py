import json
import os
from glob import glob

folder = os.getenv('TARGET_FOLDER')
secrets = json.loads(os.getenv('SECRETS_CONTEXT'))
variables = json.loads(os.getenv('VARS_CONTEXT'))
# Read the file into a string
target_files = glob(f"{folder}/*.y*ml")
for target_file in target_files:
	with open(target_file) as f:
		data = f.read()
	# Replace the template variables with their values if exist in secrets
	for key, value in secrets.items():
		data = data.replace('ENV_' + key, value)
	# Replace the template variables with their values if exist in variables from vars context
	if variables is not None:
		for key, value in variables.items():
			data = data.replace('ENV_' + key, value)
	# Replace the template variables with their values if exist in variables from env context
	for key, value in os.environ.items():
		data = data.replace('ENV_' + key, value)
	# Overwrite the result to the file
	with open(target_file, 'w') as f:
		f.write(data)