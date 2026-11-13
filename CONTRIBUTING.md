# Contributing

Video Speed Controller for Firefox is the Firefox port of
[Video Speed Controller](https://github.com/igrigorik/videospeed), an open
source project licensed under the MIT license with many contributors.
Contributions are welcome, and greatly appreciated.

Changes that are not Firefox-specific are best proposed upstream as well, so
both versions benefit.

If you would like to help, getting started is easy.

## Get Started

### Windows Prerequisites

The build scripts and tests are cross-platform, but Git hooks (Husky) require
a POSIX shell. Windows users need:

1. **[Git for Windows](https://git-scm.com/download/win)** — provides the
   `sh.exe` that Husky hooks run under. Use Git Bash or a terminal backed by
   Git's bundled shell.
2. **Node.js 22.22.2+, 24.15.0+, or 26+** — install via any version manager that reads `.nvmrc`
   ([fnm](https://github.com/Schniz/fnm), [nvm-windows](https://github.com/coreybutler/nvm-windows),
   [volta](https://volta.sh/), etc.). Make sure Node is available in both your
   regular terminal and Git Bash.
3. **Husky + Node in hooks** — Husky hooks run in a non-interactive shell where
   your shell profile isn't sourced. If hooks fail with "node not found", add
   your version manager's init to `~/.config/husky/init.sh` (Husky sources this
   before every hook). For example with fnm:
   ```sh
   echo 'eval "$(fnm env)"' >> ~/.config/husky/init.sh
   ```

### Contribution Process

1. You must have a github account and be logged in
2. Open <https://github.com/jan-nie/videospeed-firefox/>
3. Fork the repo by clicking the "Fork" link on the top-right corner of the page
4. Once the fork is ready, clone to your local PC

   ```sh
   $ git clone https://github.com/<USERNAME>/videospeed-firefox.git
   Cloning into 'videospeed-firefox'...
    remote: Enumerating objects: 10, done.
    remote: Counting objects: 100% (10/10), done.
    remote: Compressing objects: 100% (9/9), done.
    remote: Total 877 (delta 3), reused 2 (delta 1), pack-reused 867
    Receiving objects: 100% (877/877), 317.65 KiB | 2.17 MiB/s, done.
    Resolving deltas: 100% (543/543), done.
   ```

5. Create a branch for your changes

   ```sh
    $ cd videospeed-firefox
    videospeed-firefox$ git checkout -b bugfix/1-fix-double-click
    Switched to a new branch 'bugfix/1-fix-double-click'
    videospeed-firefox$
   ```

6. Open the code in your favorite code editor, make your changes

   ```sh
   echo "Awesome changes" > somefile.js
   git add .
   ```

   > Important: Your commit must be formatted using
   > [prettier](https://prettier.io/). If it is not it may be autoformatted for
   > you or your pull request may be rejected.

7. Next, open Firefox (128 or newer) and navigate to
   `about:debugging#/runtime/this-firefox`.

8. Install dependencies

   ```sh
   npm install
   ```

9. Build the extension

   ```sh
   npm run build
   ```

10. Click `Load Temporary Add-on…` and select `dist/manifest.json` (the build
    output). Click `Reload` there after each rebuild.

11. Try out your changes, make sure they work as expected

12. Commit and push your changes to github

    ```sh
    git commit -m "Awesome description of some awesome changes."
    git push
    ```

13. Open your branch up on the github website then click `New pull request` and
    write up a description of your changes.

## Changing speed behavior

Anything that affects how VSC decides `video.playbackRate` — fight-back,
adoption of native speed changes, lifecycle restores, site rules — is
governed by the arbitration contract in `docs/speed-arbitration.md`
(machine-checked twin: `specs/SpeedArbiter.tla`). PRs touching speed
behavior must identify which transition-table cell(s) they change and
why. Classifier heuristics (gesture evidence) must cite the issue that
motivated them. `npm test` runs the JavaScript conformance and differential
suites. Run `npm run test:tlc` separately for the pinned TLA+ models; it
requires Java 11 or newer and downloads a checksum-verified TLC artifact
outside the repository. CI runs both commands. Changes to shared/local
arbitration or controller lifecycle should also be checked by hand in Firefox
with two media elements on one page.

## Changing controller visibility

Controller visibility is governed by `docs/controller-visibility.md`
(machine-checked twin: `specs/ControllerVisibility.tla`). PRs touching the
visibility override, automatic hiding, feedback timers, CSS precedence,
broadcast actions, or controller teardown must identify the changed transition
or precedence rule. Run `npm test`, `npm run test:tlc` and `npm run build`,
then check the controller in Firefox. The TLA+ model checks temporal behavior;
the real adopted shadow stylesheet still needs a look in the browser.

## Optional

### Run Git Hooks Manually

Running `npm install` configures the repository's Husky hooks. Commits run
`npx lint-staged` to format and lint staged files, while pushes run the full
lint and test suites.

You can run the same checks manually:

```sh
npx lint-staged
npm run lint
npm test
npm run test:tlc
```

### Pull Upstream Changes

You should always be working with the latest version of the tool to make pull
requests easy. If you want to do this easily, just add a second remote to your
local git repo like this
`git remote add upstream https://github.com/jan-nie/videospeed-firefox.git`

Now any time you like to pull the latest version in to your local branch you can
simply issue the command `git pull upstream main`
