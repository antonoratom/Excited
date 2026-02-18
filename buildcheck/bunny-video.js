// Initialize Mini Showreel Player
gsap.registerPlugin(Flip);

function initMiniShowreelPlayer() {
  const openBtns = document.querySelectorAll("[data-mini-showreel-open]");
  if (!openBtns.length) return;

  // Settings
  var duration = 1;
  var ease = "expo.inOut";
  var zIndex = 999;

  let n = "", isOpen = false;
  let lb, pw, tg;
  let pwCss = "", lbZ = "", pwZ = "";

  const q = (sel, root = document) => root.querySelector(sel);

  const getLB = (name) => q(`[data-mini-showreel-lightbox="${name}"]`);
  const getPW = (name) => q(`[data-mini-showreel-player="${name}"]`);

  const safe = (t) => t.closest("[data-mini-showreel-safearea]") || q("[data-mini-showreel-safearea]", t) || t;

  const fit = (b, a) => {
    let w = b.width, h = w / a;
    if (h > b.height) { h = b.height; w = h * a; }
    return {
      left: b.left + (b.width - w) / 2,
      top: b.top + (b.height - h) / 2,
      width: w,
      height: h
    };
  };

  const rectFor = (t) => {
    const b = safe(t).getBoundingClientRect();
    const r = t.getBoundingClientRect();
    const a = r.width > 0 && r.height > 0 ? r.width / r.height : 16 / 9;
    return fit(b, a);
  };

  const place = (el, r) =>
    gsap.set(el, {
      position: "fixed",
      left: r.left,
      top: r.top,
      width: r.width,
      height: r.height,
      margin: 0,
      x: 0,
      y: 0
    });

  function setStatus(status) {
    if (!n) return;
    document.querySelectorAll(`[data-mini-showreel-lightbox="${n}"], [data-mini-showreel-player="${n}"]`).forEach((el) => el.setAttribute("data-mini-showreel-status", status));
  }

  function zOn() {
    lbZ = lb?.style.zIndex || "";
    pwZ = pw?.style.zIndex || "";
    if (lb) lb.style.zIndex = String(zIndex);
    if (pw) pw.style.zIndex = String(zIndex);
  }

  function zOff() {
    if (lb) lb.style.zIndex = lbZ;
    if (pw) pw.style.zIndex = pwZ;
  }

  function openBy(name) {
    if (!name || isOpen) return;

    lb = getLB(name);
    pw = getPW(name);
    if (!lb || !pw) return;

    tg = q("[data-mini-showreel-target]", lb);
    if (!tg) return;

    n = name;
    isOpen = true;

    pw.dataset.flipId = n;
    pwCss = pw.style.cssText || "";

    zOn();
    setStatus("active");

    const state = Flip.getState(pw);
    place(pw, rectFor(tg));

    Flip.from(state, {
      duration: duration,
      ease: ease,
      absolute: true,
      scale: false
    });
  }

  function closeBy(nameOrEmpty) {
    if (!isOpen || !pw) return;
    if (nameOrEmpty && nameOrEmpty !== n) return;

    setStatus("not-active");

    const state = Flip.getState(pw);

    pw.style.cssText = pwCss;
    if (lb) lb.style.zIndex = String(zIndex);
    if (pw) pw.style.zIndex = String(zIndex);

    Flip.from(state, {
      duration: duration,
      ease: ease,
      absolute: true,
      scale: false,
      onComplete: () => {
        zOff();
        n = "";
        isOpen = false;
        lb = pw = tg = null;
        pwCss = "";
        lbZ = "";
        pwZ = "";
      }
    });
  }

  function onResize() {
    if (!isOpen || !pw || !tg) return;
    place(pw, rectFor(tg));
  }

  openBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openBy(btn.getAttribute("data-mini-showreel-open") || "");
    });
  });

  document.addEventListener("click", (e) => {
    const closeBtn = e.target.closest("[data-mini-showreel-close]");
    if (!closeBtn) return;
    e.preventDefault();
    closeBy(closeBtn.getAttribute("data-mini-showreel-close") || "");
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeBy("");
  });

  window.addEventListener("resize", onResize);
}

// Initialize Mini Showreel Player
document.addEventListener("DOMContentLoaded", function () {
  initMiniShowreelPlayer();
});

// Initialize Full Width Video Player
function initBunnyPlayer() {
  document.querySelectorAll('[data-bunny-player-init]').forEach(function (player) {
    var src = player.getAttribute('data-player-src');
    if (!src) return;

    var video = player.querySelector('video');
    if (!video) return;

    try { video.pause(); } catch (_) { }
    try {
      video.removeAttribute('src');
      var sources = video.querySelectorAll('source');
      sources.forEach(function (s) { s.parentNode.removeChild(s); });
      video.load();
    } catch (_) { }

    // Attribute helpers
    function setStatus(s) {
      if (player.getAttribute('data-player-status') !== s) {
        player.setAttribute('data-player-status', s);
      }
    }
    function setMutedState(v) {
      video.muted = !!v;
      player.setAttribute('data-player-muted', video.muted ? 'true' : 'false');
    }
    function setFsAttr(v) { player.setAttribute('data-player-fullscreen', v ? 'true' : 'false'); }
    function setActivated(v) { player.setAttribute('data-player-activated', v ? 'true' : 'false'); }
    if (!player.hasAttribute('data-player-activated')) setActivated(false);

    // Elements
    var timeline = player.querySelector('[data-player-timeline]');
    var progressBar = player.querySelector('[data-player-progress]');
    var bufferedBar = player.querySelector('[data-player-buffered]');
    var handle = player.querySelector('[data-player-timeline-handle]');
    var timeDurationEls = player.querySelectorAll('[data-player-time-duration]');
    var timeProgressEls = player.querySelectorAll('[data-player-time-progress]');

    // Flags
    var updateSize = player.getAttribute('data-player-update-size');
    var lazyMode = player.getAttribute('data-player-lazy');
    var isLazyTrue = lazyMode === 'true';
    var isLazyMeta = lazyMode === 'meta';
    var autoplay = player.getAttribute('data-player-autoplay') === 'true';
    var initialMuted = player.getAttribute('data-player-muted') === 'true';

    var pendingPlay = false;

    if (autoplay) { setMutedState(true); video.loop = true; } else { setMutedState(initialMuted); }

    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.playsInline = true;
    if (typeof video.disableRemotePlayback !== 'undefined') video.disableRemotePlayback = true;
    if (autoplay) video.autoplay = false;

    // NOTE: These are evaluated at init time but re-checked inside attachMediaOnce()
    // so that late-loading HLS.js is still picked up.
    var isSafariNative = !!video.canPlayType('application/vnd.apple.mpegurl');
    var canUseHlsJs = !!(window.Hls && Hls.isSupported()) && !isSafariNative;

    // Minimal ratio fetch when requested (and not already handled by lazy meta)
    if (updateSize === 'true' && !isLazyMeta) {
      if (isLazyTrue) {
        // Do nothing: no fetch, no <video> touch when lazy=true
      } else {
        var prev = video.preload;
        video.preload = 'metadata';
        var onMeta2 = function () {
          setBeforeRatio(player, updateSize, video.videoWidth, video.videoHeight);
          video.removeEventListener('loadedmetadata', onMeta2);
          video.preload = prev || '';
        };
        video.addEventListener('loadedmetadata', onMeta2, { once: true });
        video.src = src;
      }
    }

    // Lazy meta fetch (duration + aspect) without attaching playback
    function fetchMetaOnce() {
      getSourceMeta(src, canUseHlsJs).then(function (meta) {
        if (meta.width && meta.height) setBeforeRatio(player, updateSize, meta.width, meta.height);
        if (timeDurationEls.length && isFinite(meta.duration) && meta.duration > 0) {
          setText(timeDurationEls, formatTime(meta.duration));
        }
        readyIfIdle(player, pendingPlay);
      });
    }

    // Attach media only once (for actual playback)
    var isAttached = false;
    var userInteracted = false;
    var lastPauseBy = '';
    var isDirectVideo = /\.(mp4|webm|mov|ogg|ogv)($|\?|#)/.test(src);
    var mediaErrorRetries = 0;
    var forceHlsJs = false;

    function attachMediaOnce() {
      if (isAttached) return;
      isAttached = true;

      if (player._hls) { try { player._hls.destroy(); } catch (_) { } player._hls = null; }

      var safariNative = !!video.canPlayType('application/vnd.apple.mpegurl');
      var hlsJs = !!(window.Hls && Hls.isSupported());

      // Only bypass HLS.js for sources that are clearly direct video
      // files (.mp4, .webm, etc.). Everything else (including HLS URLs
      // that may not end in .m3u8) goes through HLS.js or Safari native.
      if (isDirectVideo) {
        video.preload = (isLazyTrue || isLazyMeta) ? 'auto' : (video.preload || 'metadata');
        video.src = src;
        video.addEventListener('loadedmetadata', function () {
          if (pendingPlay) { safePlay(video); } else { readyIfIdle(player, pendingPlay); }
          if (updateSize === 'true') setBeforeRatio(player, updateSize, video.videoWidth, video.videoHeight);
          if (timeDurationEls.length) setText(timeDurationEls, formatTime(video.duration));
        }, { once: true });
        return;
      }

      if (safariNative && !forceHlsJs) {
        video.preload = (isLazyTrue || isLazyMeta) ? 'auto' : video.preload;
        video.src = src;
        video.load();
        setTimeout(function () {
          if (video.readyState === 0 && !player._hls && window.Hls && Hls.isSupported()) {
            forceHlsJs = true;
            isAttached = false;
            attachMediaOnce();
            if (pendingPlay) safePlay(video);
          }
        }, 1200);
        video.addEventListener('loadedmetadata', function () {
          if (pendingPlay) { safePlay(video); } else { readyIfIdle(player, pendingPlay); }
          if (updateSize === 'true') setBeforeRatio(player, updateSize, video.videoWidth, video.videoHeight);
          if (timeDurationEls.length) setText(timeDurationEls, formatTime(video.duration));
        }, { once: true });
      } else if (hlsJs) {
        mediaErrorRetries = 0;
        var hls = new Hls({ maxBufferLength: 10 });
        hls.attachMedia(video);
        hls.on(Hls.Events.MEDIA_ATTACHED, function () { hls.loadSource(src); });
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          if (pendingPlay) { safePlay(video); } else { readyIfIdle(player, pendingPlay); }
          if (updateSize === 'true') {
            var lvls = hls.levels || [];
            var best = bestLevel(lvls);
            if (best && best.width && best.height) setBeforeRatio(player, updateSize, best.width, best.height);
          }
        });
        hls.on(Hls.Events.LEVEL_LOADED, function (e, data) {
          if (data && data.details && isFinite(data.details.totalduration)) {
            if (timeDurationEls.length) setText(timeDurationEls, formatTime(data.details.totalduration));
          }
        });
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (data.fatal) {
            console.warn('[BunnyPlayer] HLS fatal error:', data.type, data.details);
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              mediaErrorRetries++;
              if (mediaErrorRetries <= 1) {
                hls.recoverMediaError();
              } else if (mediaErrorRetries === 2) {
                hls.swapAudioCodec();
                hls.recoverMediaError();
              } else {
                // HLS.js can't recover (likely codec issue) — destroy and
                // fall back to native <video> src. Some browsers handle
                // codec negotiation better natively than via MSE.
                console.warn('[BunnyPlayer] HLS.js recovery failed, falling back to native src');
                hls.destroy();
                player._hls = null;
                video.src = src;
                if (pendingPlay) safePlay(video);
              }
            } else {
              hls.destroy();
              player._hls = null;
              pendingPlay = false;
              setStatus('ready');
            }
          }
        });
        player._hls = hls;
      } else {
        // No HLS.js and not Safari. Non-Safari browsers cannot play HLS
        // natively, so DON'T set video.src (it causes "No decoders"
        // errors). Instead poll until HLS.js finishes loading, then
        // re-attach properly.
        console.warn('[BunnyPlayer] HLS.js not available yet — waiting for it to load…');
        var hlsPoll = setInterval(function () {
          if (window.Hls && Hls.isSupported()) {
            clearInterval(hlsPoll);
            isAttached = false;
            attachMediaOnce();
            if (pendingPlay) safePlay(video);
          }
        }, 200);
        setTimeout(function () {
          clearInterval(hlsPoll);
          if (!player._hls) console.warn('[BunnyPlayer] HLS.js never loaded — video cannot play');
        }, 5000);
      }
    }

    // Allow re-initialization (used by A/B test cleanup to refresh a
    // player whose initial HLS.js attachment may have been blocked by
    // resource limits or script-load timing).
    player._reinitMedia = function () {
      if (player._hls) { try { player._hls.destroy(); } catch (_) { } player._hls = null; }
      isAttached = false;
      attachMediaOnce();
    };

    // Initialize based on lazy mode
    if (isLazyMeta) {
      fetchMetaOnce();
      video.preload = 'none';
    } else if (isLazyTrue) {
      video.preload = 'none';
    } else {
      // Defer to next tick so Firefox's video element can settle after
      // the src-removal + load() reset above. Attaching HLS.js
      // synchronously after load() causes silent failures in Firefox.
      setTimeout(function () { attachMediaOnce(); }, 0);
    }

    // Toggle play/pause
    function togglePlay() {
      userInteracted = true;
      if (video.paused || video.ended) {
        var justAttached = false;

        if ((isLazyTrue || isLazyMeta) && !isAttached) {
          attachMediaOnce();
          justAttached = true;
        }

        // If HLS.js was not available at init but is now, re-attach
        var safariNow = !!video.canPlayType('application/vnd.apple.mpegurl');
        if (!isDirectVideo && isAttached && !player._hls && !safariNow
          && window.Hls && Hls.isSupported()
          && video.readyState === 0) {
          player._reinitMedia();
          justAttached = true;
        }

        pendingPlay = true;
        lastPauseBy = '';
        setStatus('loading');

        // Always attempt play in the user-gesture call stack. If the
        // source was just (re-)attached the call may fail in Firefox;
        // the MANIFEST_PARSED / canplay callbacks will retry via
        // pendingPlay, and safePlay's NotAllowedError fallback will
        // handle the expired-gesture case.
        safePlay(video);
      } else {
        lastPauseBy = 'manual';
        video.pause();
      }
    }

    // Toggle mute
    function toggleMute() {
      video.muted = !video.muted;
      player.setAttribute('data-player-muted', video.muted ? 'true' : 'false');
    }

    // Fullscreen helpers
    function isFsActive() { return !!(document.fullscreenElement || document.webkitFullscreenElement); }
    function enterFullscreen() {
      if (player.requestFullscreen) return player.requestFullscreen();
      if (video.requestFullscreen) return video.requestFullscreen();
      if (video.webkitSupportsFullscreen && typeof video.webkitEnterFullscreen === 'function') return video.webkitEnterFullscreen();
    }
    function exitFullscreen() {
      if (document.exitFullscreen) return document.exitFullscreen();
      if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
      if (video.webkitDisplayingFullscreen && typeof video.webkitExitFullscreen === 'function') return video.webkitExitFullscreen();
    }
    function toggleFullscreen() { if (isFsActive() || video.webkitDisplayingFullscreen) exitFullscreen(); else enterFullscreen(); }
    document.addEventListener('fullscreenchange', function () { setFsAttr(isFsActive()); });
    document.addEventListener('webkitfullscreenchange', function () { setFsAttr(isFsActive()); });
    video.addEventListener('webkitbeginfullscreen', function () { setFsAttr(true); });
    video.addEventListener('webkitendfullscreen', function () { setFsAttr(false); });

    // Controls (delegated)
    player.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-player-control]');
      if (!btn || !player.contains(btn)) return;
      var type = btn.getAttribute('data-player-control');
      if (type === 'play' || type === 'pause' || type === 'playpause') togglePlay();
      else if (type === 'mute') toggleMute();
      else if (type === 'fullscreen') toggleFullscreen();
    });

    // Time text (not in rAF)
    function updateTimeTexts() {
      if (timeDurationEls.length) setText(timeDurationEls, formatTime(video.duration));
      if (timeProgressEls.length) setText(timeProgressEls, formatTime(video.currentTime));
    }
    video.addEventListener('timeupdate', updateTimeTexts);
    video.addEventListener('loadedmetadata', function () { updateTimeTexts(); maybeSetRatioFromVideo(player, updateSize, video); });
    video.addEventListener('loadeddata', function () { maybeSetRatioFromVideo(player, updateSize, video); });
    video.addEventListener('playing', function () { maybeSetRatioFromVideo(player, updateSize, video); });
    video.addEventListener('durationchange', updateTimeTexts);

    // rAF visuals (progress + handle only)
    var rafId;
    function updateProgressVisuals() {
      if (!video.duration) return;
      var playedPct = (video.currentTime / video.duration) * 100;
      if (progressBar) progressBar.style.transform = 'translateX(' + (-100 + playedPct) + '%)';
      if (handle) handle.style.left = playedPct + '%';
    }
    function loop() {
      updateProgressVisuals();
      if (!video.paused && !video.ended) rafId = requestAnimationFrame(loop);
    }

    // Buffered bar (not in rAF)
    function updateBufferedBar() {
      if (!bufferedBar || !video.duration || !video.buffered.length) return;
      var end = video.buffered.end(video.buffered.length - 1);
      var buffPct = (end / video.duration) * 100;
      bufferedBar.style.transform = 'translateX(' + (-100 + buffPct) + '%)';
    }
    video.addEventListener('progress', updateBufferedBar);
    video.addEventListener('loadedmetadata', updateBufferedBar);
    video.addEventListener('durationchange', updateBufferedBar);

    // Media event wiring
    video.addEventListener('play', function () { setActivated(true); cancelAnimationFrame(rafId); loop(); setStatus('playing'); });
    video.addEventListener('playing', function () { pendingPlay = false; setStatus('playing'); });
    video.addEventListener('pause', function () { pendingPlay = false; cancelAnimationFrame(rafId); updateProgressVisuals(); setStatus('paused'); });
    video.addEventListener('waiting', function () { setStatus('loading'); });
    video.addEventListener('canplay', function () {
      if (pendingPlay) { safePlay(video); } else { readyIfIdle(player, pendingPlay); }
    });
    video.addEventListener('error', function () {
      // Ignore errors during initial reset (no source loaded yet)
      if (!video.src && !video.currentSrc) return;
      console.warn('[BunnyPlayer] video error:', video.error && video.error.code, video.error && video.error.message);
      // If the native fallback failed (e.g. .m3u8 in Chrome) and HLS.js
      // is now available, re-attempt with HLS.js before giving up.
      if (!isDirectVideo && !player._hls && window.Hls && Hls.isSupported()) {
        // Safari can report native HLS support while still failing to decode
        // certain manifest URLs. In that case force HLS.js on retry.
        forceHlsJs = true;
        var wasPending = pendingPlay;
        isAttached = false;
        attachMediaOnce();
        if (wasPending) { pendingPlay = true; setStatus('loading'); }
        return;
      }
      pendingPlay = false;
      cancelAnimationFrame(rafId);
      setStatus('ready');
      setActivated(false);
    });
    video.addEventListener('ended', function () { pendingPlay = false; cancelAnimationFrame(rafId); updateProgressVisuals(); setStatus('paused'); setActivated(false); });

    // Scrubbing (pointer events)
    if (timeline) {
      var dragging = false, wasPlaying = false, targetTime = 0, lastSeekTs = 0, seekThrottle = 180, rect = null;
      window.addEventListener('resize', function () { if (!dragging) rect = null; });
      function getFractionFromX(x) {
        if (!rect) rect = timeline.getBoundingClientRect();
        var f = (x - rect.left) / rect.width; if (f < 0) f = 0; if (f > 1) f = 1; return f;
      }
      function previewAtFraction(f) {
        if (!video.duration) return;
        var pct = f * 100;
        if (progressBar) progressBar.style.transform = 'translateX(' + (-100 + pct) + '%)';
        if (handle) handle.style.left = pct + '%';
        if (timeProgressEls.length) setText(timeProgressEls, formatTime(f * video.duration));
      }
      function maybeSeek(now) {
        if (!video.duration) return;
        if ((now - lastSeekTs) < seekThrottle) return;
        lastSeekTs = now; video.currentTime = targetTime;
      }
      function onPointerDown(e) {
        if (!video.duration) return;
        dragging = true; wasPlaying = !video.paused && !video.ended; if (wasPlaying) video.pause();
        player.setAttribute('data-timeline-drag', 'true'); rect = timeline.getBoundingClientRect();
        var f = getFractionFromX(e.clientX); targetTime = f * video.duration; previewAtFraction(f); maybeSeek(performance.now());
        timeline.setPointerCapture && timeline.setPointerCapture(e.pointerId);
        window.addEventListener('pointermove', onPointerMove, { passive: false });
        window.addEventListener('pointerup', onPointerUp, { passive: true });
        e.preventDefault();
      }
      function onPointerMove(e) {
        if (!dragging) return;
        var f = getFractionFromX(e.clientX); targetTime = f * video.duration; previewAtFraction(f); maybeSeek(performance.now()); e.preventDefault();
      }
      function onPointerUp() {
        if (!dragging) return;
        dragging = false; player.setAttribute('data-timeline-drag', 'false'); rect = null; video.currentTime = targetTime;
        if (wasPlaying) safePlay(video); else { updateProgressVisuals(); updateTimeTexts(); }
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
      }
      timeline.addEventListener('pointerdown', onPointerDown, { passive: false });
      if (handle) handle.addEventListener('pointerdown', onPointerDown, { passive: false });
    }

    // Hover/idle detection (pointer-based)
    var hoverTimer;
    var hoverHideDelay = 3000;
    function setHover(state) {
      if (player.getAttribute('data-player-hover') !== state) {
        player.setAttribute('data-player-hover', state);
      }
    }
    function scheduleHide() { clearTimeout(hoverTimer); hoverTimer = setTimeout(function () { setHover('idle'); }, hoverHideDelay); }
    function wakeControls() { setHover('active'); scheduleHide(); }
    player.addEventListener('pointerdown', wakeControls);
    document.addEventListener('fullscreenchange', wakeControls);
    document.addEventListener('webkitfullscreenchange', wakeControls);
    var trackingMove = false;
    function onPointerMoveGlobal(e) {
      var r = player.getBoundingClientRect();
      if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) wakeControls();
    }
    player.addEventListener('pointerenter', function () {
      wakeControls();
      if (!trackingMove) { trackingMove = true; window.addEventListener('pointermove', onPointerMoveGlobal, { passive: true }); }
    });
    player.addEventListener('pointerleave', function () {
      setHover('idle'); clearTimeout(hoverTimer);
      if (trackingMove) { trackingMove = false; window.removeEventListener('pointermove', onPointerMoveGlobal); }
    });

    // Mini-showreel integration: auto-play when the showreel opens
    // (status="active") and auto-pause+reset when it closes
    // (status="not-active"). Uses a MutationObserver so the bunny player
    // stays decoupled from the showreel animation code.
    var showreelWrap = player.closest('[data-mini-showreel-player]');
    if (showreelWrap) {
      var showreelObs = new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
          if (mutations[i].attributeName !== 'data-mini-showreel-status') continue;
          var status = showreelWrap.getAttribute('data-mini-showreel-status');
          if (status === 'active') {
            if (video.paused || video.ended) {
              if ((isLazyTrue || isLazyMeta) && !isAttached) attachMediaOnce();
              pendingPlay = true;
              lastPauseBy = '';
              setStatus('loading');
              safePlay(video);
            }
          } else if (status === 'not-active') {
            pendingPlay = false;
            if (!video.paused && !video.ended) video.pause();
            try { video.currentTime = 0; } catch (_) { }
            setStatus('paused');
          }
        }
      });
      showreelObs.observe(showreelWrap, { attributes: true, attributeFilter: ['data-mini-showreel-status'] });
    }

    // In-view auto play/pause (only when autoplay is true)
    if (autoplay) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var inView = entry.isIntersecting && entry.intersectionRatio > 0;

          if (inView) {
            if ((isLazyTrue || isLazyMeta) && !isAttached) attachMediaOnce();

            if (video.paused) {
              lastPauseBy = '';
              pendingPlay = true;
              setStatus('loading');
              safePlay(video);
            } else {
              setStatus('playing');
            }
          } else {
            if (!video.paused && !video.ended) {
              lastPauseBy = 'io';
              video.pause();
              setStatus('paused');
            }
          }
        });
      }, { threshold: 0.1 });

      io.observe(player);
    }
  });

  // Helper: time/text/meta/ratio utilities
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function formatTime(sec) {
    if (!isFinite(sec) || sec < 0) return '00:00';
    var s = Math.floor(sec), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
    return h > 0 ? (h + ':' + pad2(m) + ':' + pad2(r)) : (pad2(m) + ':' + pad2(r));
  }
  function setText(nodes, text) { nodes.forEach(function (n) { n.textContent = text; }); }

  // Helper: Choose best HLS level by resolution
  function bestLevel(levels) {
    if (!levels || !levels.length) return null;
    return levels.reduce(function (a, b) { return ((b.width || 0) > (a.width || 0)) ? b : a; }, levels[0]);
  }

  // Helper: Safe programmatic play — handles Firefox's strict autoplay
  // policy by falling back to muted playback when the user-gesture window
  // has expired (common when HLS.js attaches source asynchronously).
  function safePlay(video) {
    var p = video.play();
    if (p && typeof p.then === 'function') {
      p.catch(function (err) {
        if (err.name === 'NotAllowedError') {
          video.muted = true;
          var pl = video.closest('[data-bunny-player-init]');
          if (pl) pl.setAttribute('data-player-muted', 'true');
          var p2 = video.play();
          if (p2 && typeof p2.then === 'function') p2.catch(function () { });
        }
      });
    }
  }

  // Helper: Ready status guard
  function readyIfIdle(player, pendingPlay) {
    if (!pendingPlay &&
      player.getAttribute('data-player-activated') !== 'true' &&
      player.getAttribute('data-player-status') === 'idle') {
      player.setAttribute('data-player-status', 'ready');
    }
  }

  // Helper: Ratio Setter
  function setBeforeRatio(player, updateSize, w, h) {
    if (updateSize !== 'true' || !w || !h) return;
    var before = player.querySelector('[data-player-before]');
    if (!before) return;
    before.style.paddingTop = (h / w * 100) + '%';
  }
  function maybeSetRatioFromVideo(player, updateSize, video) {
    if (updateSize !== 'true') return;
    var before = player.querySelector('[data-player-before]');
    if (!before) return;
    var hasPad = before.style.paddingTop && before.style.paddingTop !== '0%';
    if (!hasPad && video.videoWidth && video.videoHeight) {
      setBeforeRatio(player, updateSize, video.videoWidth, video.videoHeight);
    }
  }

  // Helper: simple URL resolver
  function resolveUrl(base, rel) { try { return new URL(rel, base).toString(); } catch (_) { return rel; } }

  // Helper: Unified meta fetch (hls.js or native fetch)
  function getSourceMeta(src, useHlsJs) {
    return new Promise(function (resolve) {
      if (useHlsJs && window.Hls && Hls.isSupported()) {
        try {
          var tmp = new Hls();
          var out = { width: 0, height: 0, duration: NaN };
          var haveLvls = false, haveDur = false;

          tmp.on(Hls.Events.MANIFEST_PARSED, function (e, data) {
            var lvls = (data && data.levels) || tmp.levels || [];
            var best = bestLevel(lvls);
            if (best && best.width && best.height) { out.width = best.width; out.height = best.height; haveLvls = true; }
          });
          tmp.on(Hls.Events.LEVEL_LOADED, function (e, data) {
            if (data && data.details && isFinite(data.details.totalduration)) { out.duration = data.details.totalduration; haveDur = true; }
          });
          tmp.on(Hls.Events.ERROR, function () { try { tmp.destroy(); } catch (_) { } resolve(out); });
          tmp.on(Hls.Events.LEVEL_LOADED, function () { try { tmp.destroy(); } catch (_) { } resolve(out); });

          tmp.loadSource(src);
          return;
        } catch (_) {
          resolve({ width: 0, height: 0, duration: NaN });
          return;
        }
      }

      function parseMaster(masterText) {
        var lines = masterText.split(/\r?\n/);
        var bestW = 0, bestH = 0, firstMedia = null, lastInf = null;
        for (var i = 0; i < lines.length; i++) {
          var line = lines[i];
          if (line.indexOf('#EXT-X-STREAM-INF:') === 0) {
            lastInf = line;
          } else if (lastInf && line && line[0] !== '#') {
            if (!firstMedia) firstMedia = line.trim();
            var m = /RESOLUTION=(\d+)x(\d+)/.exec(lastInf);
            if (m) {
              var w = parseInt(m[1], 10), h = parseInt(m[2], 10);
              if (w > bestW) { bestW = w; bestH = h; }
            }
            lastInf = null;
          }
        }
        return { bestW: bestW, bestH: bestH, media: firstMedia };
      }
      function sumDuration(mediaText) {
        var dur = 0, re = /#EXTINF:([\d.]+)/g, m;
        while ((m = re.exec(mediaText))) dur += parseFloat(m[1]);
        return dur;
      }

      fetch(src, { credentials: 'omit', cache: 'no-store' }).then(function (r) {
        if (!r.ok) throw new Error('master');
        return r.text();
      }).then(function (master) {
        var info = parseMaster(master);
        if (!info.media) { resolve({ width: info.bestW || 0, height: info.bestH || 0, duration: NaN }); return; }
        var mediaUrl = resolveUrl(src, info.media);
        return fetch(mediaUrl, { credentials: 'omit', cache: 'no-store' }).then(function (r) {
          if (!r.ok) throw new Error('media');
          return r.text();
        }).then(function (mediaText) {
          resolve({ width: info.bestW || 0, height: info.bestH || 0, duration: sumDuration(mediaText) });
        });
      }).catch(function () { resolve({ width: 0, height: 0, duration: NaN }); });
    });
  }
}

// Initialize Bunny HTML HLS Player (Advanced)
document.addEventListener('DOMContentLoaded', function () {
  initBunnyPlayer();
});


(function () {
  'use strict';

  // Detect mobile devices
  const isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // If mobile: show control only and exit immediately
  if (isMobile) {
    console.log('Mobile device detected - A/B test disabled, showing control only');

    function showControlOnMobile() {
      const controlVideo = document.getElementById('hero-video-control');
      const videoB1 = document.getElementById('hero-video-b1');
      const videoA2 = document.getElementById('hero-video-a2');

      if (controlVideo) {
        controlVideo.style.display = 'block';
        controlVideo.style.visibility = 'visible';
        controlVideo.style.opacity = '1';
      }

      if (videoB1) {
        videoB1.style.display = 'none';
        videoB1.style.visibility = 'hidden';
        videoB1.style.opacity = '0';
      }

      if (videoA2) {
        videoA2.style.display = 'none';
        videoA2.style.visibility = 'hidden';
        videoA2.style.opacity = '0';
      }

      console.log('Mobile: Control video shown, other variants hidden');
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showControlOnMobile);
    } else {
      showControlOnMobile();
    }

    return;
  }

  // ===========================================
  // DESKTOP ONLY CODE BELOW THIS LINE
  // ===========================================

  console.log('Desktop device detected - running A/B test');

  const MAX_WAIT_TIME = 5000;
  const CHECK_INTERVAL = 50;

  // Destroy HLS instances and release video resources inside a container
  // so hidden A/B variants don't hog MediaSource slots or bandwidth.
  function teardownPlayers(container) {
    if (!container) return;
    container.querySelectorAll('[data-bunny-player-init]').forEach(function (p) {
      if (p._hls) {
        try { p._hls.destroy(); } catch (_) { }
        p._hls = null;
      }
      var v = p.querySelector('video');
      if (v) {
        try { v.pause(); } catch (_) { }
        try { v.removeAttribute('src'); v.load(); } catch (_) { }
      }
    });
  }

  // Ensure the player inside a container is ready to play. If the initial
  // HLS.js attachment failed (e.g. script wasn't loaded yet, or browser
  // hit a MediaSource limit), this gives it a fresh start.
  function ensurePlayerReady(container) {
    if (!container) return;
    container.querySelectorAll('[data-bunny-player-init]').forEach(function (p) {
      var v = p.querySelector('video');
      if (v && v.readyState === 0 && p._reinitMedia) {
        p._reinitMedia();
      }
    });
  }

  function runHeroVideoTest() {
    posthog.onFeatureFlags(function () {
      const heroVideoVariant = posthog.getFeatureFlag('Hero-Video');

      const controlVideo = document.getElementById('hero-video-control');
      const videoB1 = document.getElementById('hero-video-b1');
      const videoA2 = document.getElementById('hero-video-a2');

      if (!controlVideo || !videoB1 || !videoA2) {
        console.warn('Hero video elements not found');
        return;
      }

      var allContainers = [controlVideo, videoB1, videoA2];
      var shownContainer = null;

      // Hide all variants
      allContainers.forEach(function (c) { c.style.display = 'none'; });

      // Show the correct variant
      switch (heroVideoVariant) {
        case 'control':
          shownContainer = controlVideo;
          console.log('Showing control variant');
          break;
        case 'video-b1':
          shownContainer = videoB1;
          console.log('Showing video-b1 variant');
          break;
        case 'video-a2':
          shownContainer = videoA2;
          console.log('Showing video-a2 variant');
          break;
        case false:
        case undefined:
        case null:
          console.log('Feature flag not active, showing control');
          shownContainer = controlVideo;
          break;
        default:
          console.log('Unknown variant:', heroVideoVariant, '- showing control');
          shownContainer = controlVideo;
      }

      if (shownContainer) shownContainer.style.display = 'block';

      // Tear down hidden variants to free MediaSource slots / bandwidth,
      // then make sure the visible variant's player is functional.
      allContainers.forEach(function (c) {
        if (c !== shownContainer) teardownPlayers(c);
      });
      ensurePlayerReady(shownContainer);

      console.log('Hero video variant loaded:', heroVideoVariant);
    });
  }

  function waitForPostHog(callback) {
    if (typeof window.posthog !== 'undefined' && window.posthog) {
      console.log('PostHog found immediately');
      callback();
      return;
    }

    console.log('Waiting for PostHog to load from GTM...');

    let elapsed = 0;
    const interval = setInterval(function () {
      elapsed += CHECK_INTERVAL;

      if (typeof window.posthog !== 'undefined' && window.posthog) {
        clearInterval(interval);
        console.log('PostHog loaded after', elapsed, 'ms');
        callback();
        return;
      }

      if (elapsed >= MAX_WAIT_TIME) {
        clearInterval(interval);
        console.error('PostHog failed to load within', MAX_WAIT_TIME, 'ms');
        const controlVideo = document.getElementById('hero-video-control');
        if (controlVideo) {
          controlVideo.style.display = 'block';

          // Clean up the other two containers
          var videoB1 = document.getElementById('hero-video-b1');
          var videoA2 = document.getElementById('hero-video-a2');
          teardownPlayers(videoB1);
          teardownPlayers(videoA2);
          ensurePlayerReady(controlVideo);
        }
      }
    }, CHECK_INTERVAL);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      waitForPostHog(runHeroVideoTest);
    });
  } else {
    waitForPostHog(runHeroVideoTest);
  }
})();
