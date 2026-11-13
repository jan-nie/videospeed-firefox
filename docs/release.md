# Release Process

Releases are produced by the [Build & Release](../.github/workflows/release.yml)
workflow. Every push to `main` runs lint, unit/integration tests, the TLA+
models, a minified build, Mozilla's `web-ext lint` and packages
`release/videospeed-firefox-<version>.zip` as a workflow artifact.

A GitHub release is created only when `package.json` carries a version that
has no `v<version>` release yet. Pushes without a version bump never
overwrite an existing release.

## Invariants

- `package.json` is the source of truth for the version. `package-lock.json`
  must carry the same root version.
- The checked-in `manifest.json` keeps `"version": "0.0.0"`;
  `scripts/build.mjs` writes the package version into `dist/manifest.json`.
- The gecko ID in `manifest.json` (`browser_specific_settings.gecko.id`) must
  never change, or Firefox and AMO treat the add-on as a different one.
- Each version is uploaded to addons.mozilla.org at most once; AMO rejects a
  version number it has already seen.

## Releasing a new version

1. Set the version without creating a commit or tag:

   ```sh
   npm version 0.11.2 --no-git-tag-version
   ```

2. Optionally add release notes as `docs/release-notes/<version>.md`. Without
   that file the release body is generated from the commits.

3. Run the local gates (`test:tlc` needs Java 11+):

   ```sh
   npm run lint && npm test && npm run test:tlc && npm run build:release
   ```

4. Commit and merge/push to `main`. The workflow creates release
   `v<version>` with the zip attached.

## addons.mozilla.org

The first submission is done by hand on the
[AMO Developer Hub](https://addons.mozilla.org/developers/): upload the zip
from the GitHub release, plus a source archive (`git archive --format=zip -o
source.zip v<version>`) because the bundle is minified. Build instructions
for reviewers: `npm ci && npm run build:release`, output in `dist/`.

Later versions can be submitted by the workflow:

1. Create an AMO API key (Developer Hub → Tools → Manage API Keys).
2. In the GitHub repository settings add the secrets `AMO_JWT_ISSUER` and
   `AMO_JWT_SECRET`, and the variable `AMO_SUBMIT` = `true`.

The workflow then runs `web-ext sign --channel listed` for every newly
released version, uploading the same build and its source archive. AMO
review still happens before the version is public.
