/**
 * Unit tests for TwitchHandler (#1651).
 * Twitch's player vetoes any rate above 2x it observes via `ratechange`, so
 * VSC's own write echoes must be hidden from page listeners on Twitch while
 * page-initiated rate changes keep propagating.
 */

import { vi } from 'vitest';
import {
  installChromeMock,
  cleanupChromeMock,
  resetMockStorage,
} from '../../helpers/chrome-mock.js';

async function createWorld() {
  const config = window.VSC.videoSpeedConfig;
  await config.load();
  config.settings.lastSpeed = 1.0;

  const eventManager = new window.VSC.EventManager(config, null);
  const actionHandler = new window.VSC.ActionHandler(config, eventManager);
  eventManager.actionHandler = actionHandler;
  eventManager.setupRateChangeListener(document);

  const video = document.createElement('video');
  let playbackRate = 1.0;
  Object.defineProperty(video, 'playbackRate', {
    configurable: true,
    get: () => playbackRate,
    set: (value) => {
      playbackRate = Number(value);
    },
  });
  video.vsc = {
    div: document.createElement('div'),
    speedIndicator: { textContent: '1.00' },
  };
  Object.defineProperty(video, 'readyState', { value: 4, configurable: true });
  document.body.append(video);

  // Page player: records what it observes and clamps to 2x like Twitch.
  const observed = [];
  video.addEventListener('ratechange', () => {
    observed.push(video.playbackRate);
    if (video.playbackRate > 2) {
      video.playbackRate = 2;
    }
  });

  return {
    actionHandler,
    eventManager,
    video,
    observed,
    cleanup() {
      eventManager.cleanup();
      video.remove();
    },
  };
}

function useHost(hostname) {
  vi.stubGlobal('location', { hostname });
  window.VSC.siteHandlerManager.currentHandler = null;
}

describe('TwitchHandler', () => {
  beforeEach(() => {
    installChromeMock();
    resetMockStorage();
  });

  afterEach(() => {
    cleanupChromeMock();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    window.VSC.siteHandlerManager.currentHandler = null;
  });

  it.each([
    ['www.twitch.tv', true],
    ['m.twitch.tv', true],
    ['player.twitch.tv', true],
    ['twitch.tv', true],
    ['nottwitch.tv', false],
    ['www.youtube.com', false],
  ])('matches(%s) -> %s', (hostname, expected) => {
    vi.stubGlobal('location', { hostname });
    expect(window.VSC.TwitchHandler.matches()).toBe(expected);
  });

  it('is selected by the site handler manager and hides rate echoes', () => {
    useHost('www.twitch.tv');
    expect(window.VSC.siteHandlerManager.getCurrentHandler()).toBeInstanceOf(
      window.VSC.TwitchHandler
    );
    expect(window.VSC.siteHandlerManager.hidesRateEchoes()).toBe(true);
  });

  it('hides VSC write echoes from the page so it cannot clamp them', async () => {
    useHost('www.twitch.tv');
    const world = await createWorld();
    try {
      world.actionHandler.adjustSpeed(world.video, 3.5);
      world.video.dispatchEvent(new Event('ratechange'));

      expect(world.observed).toEqual([]);
      expect(world.video.playbackRate).toBe(3.5);
    } finally {
      world.cleanup();
    }
  });

  it('still delivers page-initiated rate changes to the page', async () => {
    useHost('www.twitch.tv');
    const world = await createWorld();
    // e.g. a pick from Twitch's own speed menu (prototype-level so every
    // live EventManager in the shared test window agrees)
    vi.spyOn(window.VSC.IntentClassifier.prototype, 'classify').mockReturnValue(
      window.VSC.IntentClassifier.VERDICTS.USER_INTENT
    );
    try {
      world.video.playbackRate = 1.5;
      world.video.dispatchEvent(new Event('ratechange'));

      expect(world.observed).toEqual([1.5]);
    } finally {
      world.cleanup();
    }
  });

  it('keeps echoes visible on other sites', async () => {
    useHost('www.example.com');
    expect(window.VSC.siteHandlerManager.hidesRateEchoes()).toBe(false);
    const world = await createWorld();
    try {
      world.actionHandler.adjustSpeed(world.video, 3.5);
      world.video.dispatchEvent(new Event('ratechange'));

      expect(world.observed).toEqual([3.5]);
    } finally {
      world.cleanup();
    }
  });
});
