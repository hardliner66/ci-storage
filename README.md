# CI Storage

A hack to manage persistent data across CI/CD workflow runs.

## Usage

Download the file [ci-storage](./ci-storage) and place it in your project directory.

In your workflow file, add the following step before the workflow needs access to the stored data:

```yaml
- name: Get or create the storage directory
  run: ./ci-storage get
```

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
