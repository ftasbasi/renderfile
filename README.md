# Render files javascript action

This action retrieves secrets and variables from the GitHub context and replaces with values in files stated in target-folder parameter if it finds a string with *ENV_* prefix that is *ENV_<variable/secret name>*.

## Inputs

### `target-folder`

**Required** The name of folder contains files to be edited which has *ENV_* words in it.

### `secrets-context`

The secrets context which has secrets in it. (`${{ toJson(secrets) }}`)

### `variables-context`

The variables context which has environment variables in it. (`${{ toJson(vars) }}`)

## Outputs

Replaced files on the fly.

## Example usage

```yaml
uses: ftasbasi/renderfile@v1.6
with:
  secrets-context: ${{ toJson(secrets) }}
  variables-context: ${{ toJson(vars) }}
  target-folder: manifests
```
