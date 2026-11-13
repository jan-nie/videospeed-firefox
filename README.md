# Video Speed Controller for Firefox

[![Latest release][github-release-badge]][github-release-link]
[![Build][ci-badge]][ci-link]

**Video Speed Controller for Firefox** gives you fine-grained control over any
HTML5 video or audio element, on any site.

This is a Firefox port of [Video Speed Controller][upstream] by
[Ilya Grigorik][upstream-author] and its contributors. All credit for the
extension itself goes to them; this fork packages it for Firefox and carries
Firefox-specific fixes. Please report problems with this port
[here][issues], not upstream.

## The science of accelerated playback

**TL;DR** -- faster playback translates to better engagement and retention.

The average adult reads at [250-300 words per minute][wpm-study] (wpm). Speech
averages ~150 wpm; slide presentations often closer to 100 wpm. Given the
choice, most viewers [speed up playback to ~1.3-1.5x][ms-study] to close the
gap. Accelerated viewing [keeps attention longer][byu-study] -- faster delivery
means higher engagement. With practice, many settle at 2x or above and find it
[uncomfortable to return to 1x][mit-study].

[wpm-study]: http://www.paperbecause.com/PIOP/files/f7/f7bb6bc5-2c4a-466f-9ae7-b483a2c0dca4.pdf
[ms-study]: http://research.microsoft.com/en-us/um/redmond/groups/coet/compression/chi99/paper.pdf
[byu-study]: http://www.enounce.com/docs/BYUPaper020319.pdf
[mit-study]: http://alumni.media.mit.edu/~barons/html/avios92.html#beasleyalteredspeech

HTML5 media elements expose a native playback rate API, but most players hide
or artificially limit it. Speed adjustments should be effortless and frequent:
we don't read at a fixed pace, and we shouldn't watch at one either.

## Features

- **Universal** - works on any site with HTML5 media: YouTube, Netflix,
  Coursera, podcasts, local files, etc.
- **Video and audio** - controls both `<video>` and `<audio>` elements.
- **Fine-grained speed** - 0.07x to 16x in configurable increments.
- **Per-site speed rules** - set a default playback speed for specific domains
  (e.g., always 2x on lecture sites).
- **Per-site disable** - turn off the controller on sites where you don't
  want it.
- **Remember speed** - optionally persist your last speed across sessions
  and tabs.
- **Speed fightback** - automatically re-applies your chosen speed when a
  site's player tries to reset it.
- **Draggable overlay** - reposition the on-video speed indicator anywhere
  you like.
- **Fully customizable shortcuts** - remap every key, add modifier combos
  (Ctrl, Shift, Alt), create multiple preferred-speed toggles.
- **Custom controller CSS** - style or reposition the overlay with your own
  CSS rules.

## Default keyboard shortcuts

- **S** - decrease playback speed
- **D** - increase playback speed
- **R** - reset playback speed to 1.0x
- **Z** - rewind video by 10 seconds
- **X** - advance video by 10 seconds
- **G** - toggle between current and preferred speed
- **V** - show/hide the controller
- **M** - set a marker at current position
- **J** - jump back to the previously set marker

All shortcuts are fully customizable in the extension's settings page. You can
reassign keys, add modifier combinations, and define multiple preferred-speed
shortcuts with different values for quick toggling. Click **Add New** in
settings to create additional bindings. Refresh the page after making changes
for them to take effect.

## Install

- **Firefox Add-ons:** coming soon on addons.mozilla.org.
- **From a release:** download `videospeed-firefox-<version>.zip` from the
  [releases page][github-release-link]. Unsigned builds can only be loaded
  temporarily (see below) or in Firefox Developer Edition / Nightly with
  `xpinstall.signatures.required` set to `false`.

Requires Firefox 128 or newer.

## Differences from the original

- Built for Firefox only: the manifest uses `background.scripts` (event
  page) instead of a service worker and declares a gecko add-on ID.
- Settings and messages crossing from the content script into the page-world
  script are passed through `cloneInto()`, which Firefox requires.
- Twitch: since November 2026 Twitch's player resets any speed above 2x.
  The extension hides its own `ratechange` events from Twitch so speeds such
  as 3.5x stick ([upstream issue #1651][issue-1651]).

## Build from source

Requires Node.js (see `.nvmrc`).

```sh
npm ci
npm run build           # unpacked add-on in dist/
npm test                # unit + integration tests
npm run build:release   # minified build in dist/
node scripts/package-release.js   # zip in release/
```

To try a build, open `about:debugging#/runtime/this-firefox`, click
**Load Temporary Add-on…** and select `dist/manifest.json`. Temporary add-ons
are removed when Firefox restarts.

Releases are built by GitHub Actions on every push to `main`; see
[docs/release.md](docs/release.md).

## License

(MIT License) - Copyright (c) 2014 Ilya Grigorik. Firefox port maintained by
[jan-nie](https://github.com/jan-nie).

[upstream]: https://github.com/igrigorik/videospeed
[upstream-author]: https://github.com/igrigorik
[issues]: https://github.com/jan-nie/videospeed-firefox/issues
[issue-1651]: https://github.com/igrigorik/videospeed/issues/1651
[github-release-badge]: https://img.shields.io/github/v/release/jan-nie/videospeed-firefox
[github-release-link]: https://github.com/jan-nie/videospeed-firefox/releases
[ci-badge]: https://github.com/jan-nie/videospeed-firefox/actions/workflows/release.yml/badge.svg
[ci-link]: https://github.com/jan-nie/videospeed-firefox/actions/workflows/release.yml
