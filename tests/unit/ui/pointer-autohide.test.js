/**
 * Unit tests for PointerAutohide: hide the controller (data-vsc-idle) a
 * short delay after the pointer leaves the player, show it again as soon as
 * the pointer is back over the video or the controller.
 */

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

function rect(left, top, width, height) {
  return () => ({
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
  });
}

function move(x, y) {
  const event = new Event('pointermove', { bubbles: true });
  Object.assign(event, { clientX: x, clientY: y });
  document.body.dispatchEvent(event);
  vi.advanceTimersByTime(20); // flush the rAF throttle
}

describe('PointerAutohide', () => {
  let video;
  let host;
  let config;
  let autohide;

  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ['setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame'],
    });
    video = document.createElement('video');
    video.getBoundingClientRect = rect(100, 100, 400, 300);
    host = document.createElement('vsc-controller');
    host.getBoundingClientRect = rect(100, 100, 80, 20);
    document.body.append(video, host);
    config = { settings: { hideOnMouseLeave: true, hideOnMouseLeaveDelay: 2 } };
    autohide = new window.VSC.PointerAutohide(video, host, config);
  });

  afterEach(() => {
    autohide.stop();
    video.remove();
    host.remove();
    vi.useRealTimers();
  });

  const idle = () => host.hasAttribute('data-vsc-idle');

  it('hides after the delay when the pointer was never over the player', () => {
    autohide.start();
    vi.advanceTimersByTime(1999);
    expect(idle()).toBe(false);
    vi.advanceTimersByTime(1);
    expect(idle()).toBe(true);
  });

  it('stays visible while the pointer is over the video', () => {
    autohide.start();
    move(300, 250);
    vi.advanceTimersByTime(10000);
    expect(idle()).toBe(false);
  });

  it('hides after leaving and shows immediately on return', () => {
    autohide.start();
    move(300, 250);
    move(800, 50); // left the player
    vi.advanceTimersByTime(2000);
    expect(idle()).toBe(true);

    move(120, 105); // back over the controller/video
    expect(idle()).toBe(false);
  });

  it('cancels a pending hide when the pointer returns before the delay', () => {
    autohide.start();
    move(800, 50);
    vi.advanceTimersByTime(1500);
    move(300, 250);
    vi.advanceTimersByTime(5000);
    expect(idle()).toBe(false);
  });

  it('hides when the pointer leaves the document', () => {
    autohide.start();
    move(300, 250);
    document.documentElement.dispatchEvent(new Event('pointerleave'));
    vi.advanceTimersByTime(2000);
    expect(idle()).toBe(true);
  });

  it('uses the configured delay', () => {
    config.settings.hideOnMouseLeaveDelay = 0.5;
    autohide.start();
    vi.advanceTimersByTime(500);
    expect(idle()).toBe(true);
  });

  it('does nothing while the option is off and un-hides when turned off live', () => {
    config.settings.hideOnMouseLeave = false;
    autohide.start();
    vi.advanceTimersByTime(10000);
    expect(idle()).toBe(false);

    config.settings.hideOnMouseLeave = true;
    move(800, 50);
    vi.advanceTimersByTime(2000);
    expect(idle()).toBe(true);

    config.settings.hideOnMouseLeave = false;
    move(800, 60);
    expect(idle()).toBe(false);
  });

  it('stop() removes the idle state and listeners', () => {
    autohide.start();
    vi.advanceTimersByTime(2000);
    expect(idle()).toBe(true);
    autohide.stop();
    expect(idle()).toBe(false);
    move(800, 50);
    vi.advanceTimersByTime(5000);
    expect(idle()).toBe(false);
  });
});
