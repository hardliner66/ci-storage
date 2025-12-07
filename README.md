# CI Storage

A hack to manage persistent data across CI/CD workflow runs.

**IMPORTANT: persisting data and using it in later CI jobs to change the behavior of your workflow
will make your jobs non-deterministic. There are cases where this is acceptable, but in general it's
not recommended. Use at your own risk!**

## Prerequisites

Your workflow must have necessary permissions.

To do this, add the following permissions to your workflow file:

```yaml
permissions:
    contents: write
```

## Usage

To make the persistent storage available for your own scripts, you can use the general `hardliner66/ci-storage@v1` action.

```yaml
- name: Run with persistent storage
  uses: hardliner66/ci-storage@v1
  with:
      script: |
          # Everything you change, add or remove to the $CI_STORAGE_PATH directory will be persisted
          echo hi > "$CI_STORAGE_PATH/hello.txt"
          ls -la "$CI_STORAGE_PATH"
```

If you need more control, you can call the sub-actions accordingly.

First, call `hardliner66/ci-storage/get@v1` to set up the storage directory.

```yaml
- name: Get or create the storage directory
  uses: hardliner66/ci-storage/get@v1
```

_The `get` action will automatically call `init`, if the system isn't initialized.
If you want to prevent automatic initialization, set the environment variable `CI_STORAGE_INIT` to `no_auto`.
In this case, you need to run the `init` action manually before calling `get` or `persist`._

After that is done, you can add, change or remove files from the storage directory (`.ci-storage/`).
The get action will also set the environment variable `CI_STORAGE_PATH` to the path of the storage directory.
You can use that to make sure your scripts always use the correct path, in case it ever changes or
if you decide to change it to something else.

When your workflow is done, you can run the `persist` action to store the changes.
If you don't persist the changes, they will be lost once the workflow run is completed.

```yaml
- name: Persist changes to storage
  uses: hardliner66/ci-storage/persist@v1
```

To remove the storage directory, you can run the `cleanup` action.

```yaml
- name: Cleanup CI storage
  uses: hardliner66/ci-storage/cleanup@v1
```

## Example

You can check out the workflow in the [example repo](https://github.com/hardliner66/ci-storage-example) to see how it's used.

## Known Issues

As this is basically a hack to persist data across CI runs, there are some limitations. For instance,
if two CI jobs are running at the same time and they both use the `ci-storage` action,
one of the jobs will probably fail because as soon as one job pushes to the repository,
the other job can only push if it pulled after the push happened.

And because we don't know what data was changed, we don't know if we can recover
(e.g. by pulling again if pushing fails) without git potentially messing up the merge.
The `persist` action runs `git pull --ff-only` before pushing just in case, but that's not
guaranteed to work for all cases.

## Supported CI Environments

Right now, `ci-storage` only supports GitHub Actions. This is because the actions only know which
configuration to set in order to allow pushing from a GitHub Actions job. If you know how to detect other CI environments and how to set the necessary configuration, feel free to contribute!

If you are using a custom CI environment or if you are using a custom configuration so that
it can't be added here, you can set the environment variable `CI_STORAGE_GIT_CONFIG` to `skip`,
which will disable the automatic configuration attempt of git.
Just make sure you configure git to allow pushing before using the `persist` action
or it will fail.

Alternatively you can use the path to your custom configuration script as value For
the environment variable `CI_STORAGE_GIT_CONFIG`. In this case, the action will execute the configured script
every time before trying to push.
