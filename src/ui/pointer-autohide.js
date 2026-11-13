/**
 * Pointer autohide — hides a controller shortly after the mouse leaves its
 * player.
 *
 * This is a site-autohide input (docs/controller-visibility.md): it only
 * toggles `data-vsc-idle` on the light-DOM <vsc-controller> host, and the
 * stylesheet (inject.css) hides an idle host unless an explicit SHOW or
 * feedback flash (`vsc-show`) is active. Explicit HIDE, no-source and
 * automatic hiding keep their precedence in the shadow cascade.
 *
 * "Inside the player" is decided geometrically (pointer within the media
 * element's or the controller's bounding box) instead of by DOM ancestry,
 * because players commonly cover the <video> with sibling overlays and some
 * site handlers insert the controller outside the player subtree.
 *
 * Settings (`hideOnMouseLeave`, `hideOnMouseLeaveDelay` in seconds) are read
 * on every evaluation so live option changes apply without a reload.
 */

window.VSC = window.VSC || {};

class PointerAutohide {
  /**
   * @param {HTMLMediaElement} media
   * @param {HTMLElement} host - the <vsc-controller> element
   * @param {{settings: Object}} config
   */
  constructor(media, host, config) {
    this.media = media;
    this.host = host;
    this.config = config;
    this.doc = media.ownerDocument;
    this.view = this.doc.defaultView;
    this.timer = null;
    this.frame = null;
    this.lastPoint = null;

    this.onPointerMove = (event) => {
      this.lastPoint = { x: event.clientX, y: event.clientY };
      if (this.frame === null) {
        this.frame = this.view.requestAnimationFrame(() => {
          this.frame = null;
          this.evaluate();
        });
      }
    };
    // Pointer left the document (window, or the iframe hosting the player).
    this.onDocumentLeave = () => {
      this.lastPoint = null;
      this.evaluate();
    };
  }

  start() {
    this.doc.addEventListener('pointermove', this.onPointerMove, { capture: true, passive: true });
    this.doc.documentElement.addEventListener('pointerleave', this.onDocumentLeave);
    // The pointer position is unknown until it moves: treat it as outside so
    // a controller on a page the user is not pointing at still hides.
    this.evaluate();
  }

  stop() {
    this.doc.removeEventListener('pointermove', this.onPointerMove, { capture: true });
    this.doc.documentElement.removeEventListener('pointerleave', this.onDocumentLeave);
    if (this.frame !== null) {
      this.view.cancelAnimationFrame(this.frame);
      this.frame = null;
    }
    this.clearTimer();
    this.setIdle(false);
  }

  get enabled() {
    return this.config.settings.hideOnMouseLeave === true;
  }

  get delayMs() {
    const seconds = Number(this.config.settings.hideOnMouseLeaveDelay);
    return Number.isFinite(seconds) && seconds >= 0 ? seconds * 1000 : 2000;
  }

  /** Re-evaluate idle state from the last known pointer position. */
  evaluate() {
    if (!this.enabled || this.isPointerInside()) {
      this.clearTimer();
      this.setIdle(false);
      return;
    }
    if (this.timer === null && !this.isIdle()) {
      this.timer = this.view.setTimeout(() => {
        this.timer = null;
        if (this.enabled && !this.isPointerInside()) {
          this.setIdle(true);
        }
      }, this.delayMs);
    }
  }

  isPointerInside() {
    if (!this.lastPoint) {
      return false;
    }
    return [this.media, this.host].some((element) => {
      const rect = element.getBoundingClientRect();
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        this.lastPoint.x >= rect.left &&
        this.lastPoint.x <= rect.right &&
        this.lastPoint.y >= rect.top &&
        this.lastPoint.y <= rect.bottom
      );
    });
  }

  isIdle() {
    return this.host.hasAttribute('data-vsc-idle');
  }

  setIdle(idle) {
    this.host.toggleAttribute('data-vsc-idle', idle);
  }

  clearTimer() {
    if (this.timer !== null) {
      this.view.clearTimeout(this.timer);
      this.timer = null;
    }
  }
}

window.VSC.PointerAutohide = PointerAutohide;
