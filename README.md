# renderfile action

This action replaces strings having "ENV_" prefix with secrets and environment variables from the context in any file in provided folder name.

## Inputs

## `secrets_context`

**Required** The name of the secrets context. ex: `"${{ toJson(secrets) }}"`.

## `vars_context`

The name of the variables context. ex: `"${{ toJson(vars) }}"`.

## `target_folder`

**Required** The name of the folder to edit all files in it.

## Example usage

uses: ftasbasi/renderfile@v2
with:
  secrets_context: ${{ toJson(secrets) }}
  target_folder: foldername
  vars_context: ${{ toJson(vars) }}
