/**
 * ShadowDOMManager.applyAppearance: opacity and button size can be changed
 * on an existing controller (live options updates).
 */

import { describe, it, expect } from 'vitest';

function makeShadow(options) {
  const host = document.createElement('div');
  document.body.append(host);
  return { host, shadow: window.VSC.ShadowDOMManager.createShadowDOM(host, options) };
}

describe('ShadowDOMManager.applyAppearance', () => {
  it('applies the initial opacity and button size', () => {
    const { host, shadow } = makeShadow({ opacity: 0.4, buttonSize: 18 });
    const controller = shadow.querySelector('#controller');
    expect(controller.style.opacity).toBe('0.4');
    expect(controller.style.getPropertyValue('--vsc-opacity')).toBe('0.4');
    expect(shadow.querySelector('.draggable').style.fontSize).toBe('18px');
    expect(shadow.querySelector('#controls').style.lineHeight).toBe('18px');
    host.remove();
  });

  it('updates an existing controller in place', () => {
    const { host, shadow } = makeShadow({ opacity: 0.3, buttonSize: 14 });
    window.VSC.ShadowDOMManager.applyAppearance(shadow, { opacity: 0.9, buttonSize: 22 });
    const controller = shadow.querySelector('#controller');
    expect(controller.style.opacity).toBe('0.9');
    expect(controller.style.getPropertyValue('--vsc-opacity')).toBe('0.9');
    expect(shadow.querySelector('.draggable').style.fontSize).toBe('22px');
    expect(shadow.querySelector('#controls').style.fontSize).toBe('22px');
    host.remove();
  });

  it('leaves values untouched that are not given', () => {
    const { host, shadow } = makeShadow({ opacity: 0.3, buttonSize: 14 });
    window.VSC.ShadowDOMManager.applyAppearance(shadow, { opacity: 0.7 });
    expect(shadow.querySelector('#controller').style.opacity).toBe('0.7');
    expect(shadow.querySelector('.draggable').style.fontSize).toBe('14px');
    host.remove();
  });
});
