import argparse
import json
import os
from glob import glob


def main():
    parser = argparse.ArgumentParser(description='Update environment files based on secrets and variables.')
    parser.add_argument('--target_folder', required=True, help='Target folder for updating environment files')
    parser.add_argument('--secrets_context', required=True, help='JSON string representing secrets context')
    parser.add_argument('--vars_context', required=True, help='JSON string representing variables context')

    args = parser.parse_args()

    folder = args.target_folder
    secrets = json.loads(args.secrets_context)
    variables = json.loads(args.vars_context)

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
    # Now you can use 'folder', 'secrets', and 'variables' in your script logic

if __name__ == "__main__":
    main()