# Setup Alire Action

GitHub action to setup Alire, the Ada/SPARK package manager.

Version v2 adds caching to speed up deployment, particularly on Windows.

## Usage

To use the latest stable release of the Alire project, add this line to your workflow steps:
```yaml
    - uses: alire-project/setup-alire@v4
```

To use a precompiled nightly build of the development version, use the following:
```yaml
    - uses: alire-project/setup-alire@v4
      with:
        version: "nightly"
```

To use a development version compiled from sources (if you known what
you are doing), use the following:
```yaml
    - uses: alire-project/setup-alire@v4
      with:
        branch: "master" # or the branch you want to use
```

For building from sources, the action will detect whether a GNAT is already in
the PATH. If not, one will be installed to be able to build `alr`.

The command-line tool `alr` will be available in `PATH` after the action
completes.

More generally, these options are available for the action:

```yaml
inputs:
  version:
    description: Use this argument to install a stable or nightly release. Use a version number without v prefix, e.g., 1.0.1, 1.1.0, or 'nightly'. This argument will be ignored if a branch argument is supplied. Defaults to the latest stable release.
    required: false
    default: '2.0.2'
    # Also to be updated in test-cache-yml
  branch:
    description: Use this argument to install a development branch (e.g., master).
    required: false
    default: ''
  toolchain:
    description: Arguments to pass to `alr toolchain` after setup.
    required: false
    default: 'gnat_native gprbuild'
  msys2:
    description: Whether to install MSYS2 on Windows. When false, `msys2.do_not_install` will be set to true in alr's settings.
    required: false
    default: true
  cache:
    description: Whether to reuse a cached previous install.
    required: false
    default: true
```