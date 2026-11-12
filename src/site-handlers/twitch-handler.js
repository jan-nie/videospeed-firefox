/**
 * Twitch-specific handler
 *
 * Since Nov 2026 Twitch's player (player-core) listens for `ratechange` on
 * the <video> element and answers any rate above 2x by writing
 * `playbackRate = 2` back, roughly 1ms later via its worker RPC (#1651).
 * Because that rewrite is asynchronous, the propagated-echo transaction
 * cannot prove causality, every VSC write is "vetoed" and the bounded
 * fight budget surrenders at 2x.
 *
 * Hiding VSC's own write echoes from page listeners prevents the veto from
 * ever being issued. Rate changes the page itself initiates (Twitch's own
 * speed menu, ads) still propagate normally.
 */

window.VSC = window.VSC || {};

class TwitchHandler extends window.VSC.BaseSiteHandler {
  /**
   * @returns {boolean} True on twitch.tv (incl. player.twitch.tv embeds)
   */
  static matches() {
    const host = location.hostname;
    return host === 'twitch.tv' || host.endsWith('.twitch.tv');
  }

  /**
   * See file header: Twitch clamps any rate it observes above 2x (#1651).
   * @returns {boolean}
   */
  hidesRateEchoes() {
    return true;
  }
}

window.VSC.TwitchHandler = TwitchHandler;
