# CI Storage

A hack to manage persistent data across CI/CD workflow runs.

## Usage (with GitHub Actions)

Download the file [ci-storage](./ci-storage) and place it in your project directory.

In your workflow file, make sure you add the necessary permissions:

```yaml
permissions:
    contents: write
```

Then add the following step somewhere before the workflow needs access to the stored data:

```yaml
- name: Get or create the storage directory
  run: ./ci-storage get
```

_The `get` command will automatically call `init`, if the system isn't initialized.
If you want to prevent automatic initialization, set the environment variable `CI_STORAGE_INIT` to `no_auto`.
In this case, you need to run `./ci-storage init` manually before calling `./ci-storage get` or `./ci-storage persist`._

After that is done, you can add, change or remove files from the storage directory (`.ci-storage/`).

You can use the command `./ci-storage path` to get the absolute path to the storage directory.
This way you will always use the correct path.

When your workflow is done, you can run `./ci-storage persist` to store the changes.
If you don't persist the changes, they will be lost once the workflow run is completed.

```yaml
- name: Persist changes to storage
  run: ./ci-storage persist
```

## Example

You can check out the [example workflow](.github/workflows/example-workflow.yml) to see how it's used
in a workflow file and how to access the stored data. The example workflow runs the file
[example/increment-count.sh](./example/increment-count.sh) and passes the path where the data should be stored
as an argument. The script updates a counter in a JSON file or creates the file if it doesn't exist.

## Known Issues

As this is basically a hack to persist data across CI runs, there are some limitations. For instance,
if two CI jobs are running at the same time and they both use the `ci-storage` script,
one of the jobs will probably fail because as soon as one job pushes to the repository,
the other job can only push if it pulled after the push happened.

And because we don't know what data was changed, we don't know if we can recover
(e.g. by pulling again if pushing fails) without git potentially messing up the merge.
The script runs `git pull --ff-only` before pushing just in case, but that's not
guaranteed to work for all cases.

## Supported CI Environments

Right now, `ci-storage` only supports GitHub Actions. This is because the script only knows which
configuration to set in order to allow pushing from a CI job. If you know how to detect other CI environments and how to set the necessary configuration, feel free to contribute!

If you are using a custom CI environment or if you are using a custom configuration so that
it can't be added here, you can set the environment variable `CI_GIT_CONFIG` to `skip`,
which will disable the automatic configuration attempt of git.
Just make sure you configure git to allow pushing before calling `./ci-storage persist`
or the script will fail.

Alternatively you can use the path to your custom configuration script as value For
the environment variable `CI_GIT_CONFIG`. In this case, the script will execute the configured script
every time before trying to push.
