# Render files javascript action

This action retrieves secrets and variables from the GitHub context and replaces with values in files (yml/yaml extensions) stated in target-folder parameter if it finds a string with *ENV_* prefix that is *ENV_<variable/secret name>*.

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
uses: ftasbasi/renderfile@v1.8
with:
  secrets-context: ${{ toJson(secrets) }}
  variables-context: ${{ toJson(vars) }}
  target-folder: foldername
env:
  VAR1: "sample value" # for changing ENV_VAR1 in files
```

##### Let's say we provide ENVIRONMENT_NAME=test-env and STORAGE_SIZE=20Gi as env parameter or a GitHub environment variable directly, here is the sample output:

Before:
```
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  namespace: ENV_ENVIRONMENT_NAME
  name: postgresql-ENV_ENVIRONMENT_NAME
spec:
  accessModes:
    - ReadWriteMany
  storageClassName: manual
  resources:
    requests:
      storage: ENV_STORAGE_SIZE
```

After:
```
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  namespace: test-env
  name: postgresql-test-env
spec:
  accessModes:
    - ReadWriteMany
  storageClassName: manual
  resources:
    requests:
      storage: 20Gi
```