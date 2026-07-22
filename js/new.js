/**
 * Wedding T1: 3-session invitation flow.
 */
(function () {
  'use strict';

  var body = document.body;
  if (!body) return;

  var sessions = {
    one: document.getElementById('wed-session-1'),
    two: document.getElementById('wed-session-2'),
    three: document.getElementById('wed-session-3')
  };

  var envelope = document.getElementById('wed-envelope');
  var openBtn = document.getElementById('wed-open-btn');
  var toSessionThreeBtn = document.getElementById('wed-to-session-3');
  var backToSessionTwoBtn = document.getElementById('wed-back-to-session-2');
  var sealInitials = document.getElementById('wed-seal-initials');
  var coupleWrap = document.querySelector('.wed-couple-vertical');
  var parentsBlock = document.querySelector('.wed-parents-dual');
  var parentNameEls = document.querySelectorAll('.wed-parents-dual .wed-parent-name');
  var groomNameEl = document.getElementById('wed-groom-name');
  var ampEl = document.querySelector('.wed-couple-vertical .wed-amp');
  var brideNameEl = document.getElementById('wed-bride-name');
  var dateSessionEl = document.querySelector('.wed-date-session');
  var parentsFadeTimer = null;
  var bismillahWrap = document.querySelector('.wed-bismillah-wrap');
  var stylePicker = document.getElementById('wed-style-picker');
  var coupleDecoImg = document.querySelector('.wed-invite-deco-bottom-center');

  var COUPLE_DECO_GENERAL = {
    path: '/templates%2Fshared%2Fimages%2Fwedding%20t1%2Fbride_groom_1.png',
    token: '9ad0e6ac-8f08-4d09-b83d-0e1275b58a57'
  };
 
  var audio = document.getElementById('wed-music');
  var muteBtns = document.querySelectorAll('.wed-mute-btn');

  var countdownEls = {
    days: document.getElementById('wed-days'),
    hours: document.getElementById('wed-hours'),
    minutes: document.getElementById('wed-minutes'),
    seconds: document.getElementById('wed-seconds')
  };

  function getAttr(name, fallback) {
    var val = body.getAttribute(name);
    if (val === null || val === '') return fallback;
    return val;
  }

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function setHtml(id, value) {
    var el = document.getElementById(id);
    if (el) el.innerHTML = value;
  }

  function formatParentLinesHtml(value) {
    if (!value) return '';
    var parts;
    if (value.indexOf('|') !== -1) {
      parts = value.split('|').map(function (s) { return s.trim(); }).filter(Boolean);
    } else if (value.indexOf('&') !== -1) {
      parts = value.split('&').map(function (s) { return s.trim(); }).filter(Boolean);
    } else {
      return '<span class="wed-parent-line">' + value + '</span>';
    }
    return parts.map(function (part) {
      return '<span class="wed-parent-line">' + part + '</span>';
    }).join('');
  }

  function formatCoupleName(name) {
    var s = (name || '').trim();
    if (!s) return s;
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function getTimeDisplayLabel(rawTime) {
    var parsed = (rawTime || '').split('-')[0].trim();
    if (!parsed) return 'AT 11:00 AM';
    return 'AT ' + parsed.toUpperCase();
  }

  function resetScrollToSessionTop() {
    if (window.scrollTo) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    } else {
      window.scrollTo(0, 0);
    }
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }
  }

  function showSession(target) {
    var list = [sessions.one, sessions.two, sessions.three];
    list.forEach(function (node) {
      if (!node) return;
      var isTarget = node === target;
      node.classList.toggle('is-active', isTarget);
      if (isTarget) node.removeAttribute('aria-hidden');
      else node.setAttribute('aria-hidden', 'true');
    });

    if (target === sessions.two) {
      runBismillahFade();
      runCoupleLetterIntro();
    } else if (target === sessions.three) {
      runDateSectionIntro();
      runSessionThreeTextIntro();
    } else if (sessions.three) {
      sessions.three.classList.remove('wed-s3-text-active');
    }

    if (target) {
      // After display toggles, keep window scroll at the top of the new session
      // (e.g. user scrolled on session 2, then session 3 must not start mid-viewport).
      requestAnimationFrame(function () {
        resetScrollToSessionTop();
        try {
          target.scrollIntoView({ block: 'start', behavior: 'auto', inline: 'nearest' });
        } catch (e) {
          /* no-op for older runtimes */
        }
      });
    }
  }

  function runDateSectionIntro() {
    if (!dateSessionEl) return;
    dateSessionEl.classList.remove('wed-date-animate-active');
    // Force reflow to restart CSS transitions on repeat opens.
    void dateSessionEl.offsetWidth;
    dateSessionEl.classList.add('wed-date-animate-active');
  }

  function runSessionThreeTextIntro() {
    if (!sessions.three) return;
    sessions.three.classList.remove('wed-s3-text-active');
    // Force reflow to restart text fade transitions.
    void sessions.three.offsetWidth;
    sessions.three.classList.add('wed-s3-text-active');
  }

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  function buildFlyLetters(lineEl, options) {
    if (!lineEl) return;
    var text = (lineEl.getAttribute('data-full-text') || lineEl.textContent || '').trim();
    if (!text) return;

    lineEl.setAttribute('data-full-text', text);
    lineEl.innerHTML = '';
    lineEl.classList.add('wed-fly-line');

    var chars = Array.from(text);
    chars.forEach(function (ch, i) {
      var span = document.createElement('span');
      span.className = 'wed-fly-letter';
      span.textContent = ch;
      span.style.setProperty('--sx', randomInRange(options.minX, options.maxX).toFixed(0) + 'px');
      span.style.setProperty('--sy', randomInRange(options.minY, options.maxY).toFixed(0) + 'px');
      span.style.setProperty('--rot', randomInRange(-35, 35).toFixed(1) + 'deg');
      var delay = options.baseDelay + i * options.stepDelay + randomInRange(0, options.jitter);
      span.style.setProperty('--delay', delay.toFixed(0) + 'ms');
      lineEl.appendChild(span);
    });
  }

  function runBismillahFade() {
    if (!bismillahWrap) return;
    bismillahWrap.classList.remove('is-visible');
    void bismillahWrap.offsetWidth;
    bismillahWrap.classList.add('is-visible');
  }

  function runCoupleLetterIntro() {
    if (!coupleWrap) return;
    parentNameEls.forEach(function (el) {
      el.classList.remove('wed-parent-name-visible');
    });
    if (parentsFadeTimer) {
      clearTimeout(parentsFadeTimer);
      parentsFadeTimer = null;
    }

    buildFlyLetters(groomNameEl, { minX: -180, maxX: -40, minY: -140, maxY: 120, baseDelay: 40, stepDelay: 36, jitter: 120 });
    buildFlyLetters(ampEl, { minX: -80, maxX: 80, minY: -160, maxY: -20, baseDelay: 240, stepDelay: 44, jitter: 80 });
    buildFlyLetters(brideNameEl, { minX: 40, maxX: 200, minY: -120, maxY: 140, baseDelay: 140, stepDelay: 36, jitter: 120 });

    coupleWrap.classList.remove('wed-fly-active');
    // Force reflow so removing/adding class restarts transitions.
    void coupleWrap.offsetWidth;
    coupleWrap.classList.add('wed-fly-active');

    // Start parent-name reveal exactly when letter animation settles.
    var letters = coupleWrap.querySelectorAll('.wed-fly-letter');
    var maxDelayMs = 0;
    letters.forEach(function (letter) {
      var delayRaw = letter.style.getPropertyValue('--delay') || '0ms';
      var delay = parseFloat(delayRaw);
      if (!isNaN(delay) && delay > maxDelayMs) {
        maxDelayMs = delay;
      }
    });
    // Match CSS transition duration for each letter (transform: 1.15s) plus tiny settle buffer.
    var parentRevealDelayMs = maxDelayMs + 1150 + 60;

    parentsFadeTimer = setTimeout(function () {
      parentNameEls.forEach(function (el) {
        el.classList.add('wed-parent-name-visible');
      });
      parentsFadeTimer = null;
    }, parentRevealDelayMs);
  }

  function applyMusicVolume() {
    if (!audio) return;
    var volRaw = getAttr('data-music-volume', '');
    if (!volRaw) return;
    var vol = parseFloat(volRaw);
    if (isNaN(vol)) return;
    if (vol > 1) vol = vol / 100;
    audio.volume = Math.min(1, Math.max(0, vol));
  }

  function initializeFirebaseAudio() {
    if (!audio) return;
    applyMusicVolume();
    var source = audio.querySelector('source[data-storage-path]');
    var baseUrl = window.FirebaseConfig && window.FirebaseConfig.storageBaseUrl;
    if (!source || !baseUrl) return;

    var storagePath = source.getAttribute('data-storage-path');
    var token = source.getAttribute('data-token');
    if (!storagePath || !token) return;

    var encodedPath = storagePath.replace(/^\//, '');
    source.src = baseUrl + encodedPath + '?alt=media&token=' + token;
    audio.load();
  }

  function decodedStoragePath(attr) {
    if (!attr) return '';
    var raw = attr.replace(/^\//, '');
    try {
      return decodeURIComponent(raw);
    } catch (e) {
      return raw.replace(/%2F/g, '/');
    }
  }

  function encodedStoragePath(attr) {
    return attr ? attr.replace(/^\//, '') : '';
  }

  function resolvePathOnlyImageUrl(storagePath, baseUrl, cb) {
    var path = decodedStoragePath(storagePath);
    var encoded = encodedStoragePath(storagePath);
    var bucket = 'my-bel0ved.firebasestorage.app';

    function setUrl(url) {
      if (url && typeof cb === 'function') cb(url);
    }

    function tryPublicMedia() {
      if (baseUrl) setUrl(baseUrl + encoded + '?alt=media');
    }

    function tryRestFallback() {
      fetch('https://firebasestorage.googleapis.com/v0/b/' + bucket + '/o/' + encoded)
        .then(function (r) { return r.json(); })
        .then(function (data) {
          var token = data && (data.downloadTokens || (data.metadata && data.metadata.firebaseStorageDownloadTokens));
          if (token) setUrl(baseUrl + encoded + '?alt=media&token=' + token);
          else tryPublicMedia();
        })
        .catch(function () { tryPublicMedia(); });
    }

    function trySdk() {
      if (!window.FirebaseStorage || !window.FirebaseStorage.getDownloadUrlByPath) {
        tryRestFallback();
        return;
      }
      window.FirebaseStorage.getDownloadUrlByPath(path)
        .then(function (url) {
          if (url) setUrl(url);
          else tryRestFallback();
        })
        .catch(function () { tryRestFallback(); });
    }

    trySdk();
    setTimeout(trySdk, 300);
    setTimeout(trySdk, 700);
  }

  var wedImageInitDone = false;

  function resolveFirebaseImages() {
    var baseUrl = window.FirebaseConfig && window.FirebaseConfig.storageBaseUrl;
    if (!baseUrl || wedImageInitDone) return;
    wedImageInitDone = true;

    document.querySelectorAll('img[data-storage-path]').forEach(function (img) {
      var storagePath = img.getAttribute('data-storage-path');
      if (!storagePath) return;

      var token = img.getAttribute('data-token');
      if (token) {
        var encodedPath = encodedStoragePath(storagePath);
        img.src = baseUrl + encodedPath + '?alt=media&token=' + token;
        return;
      }

      resolvePathOnlyImageUrl(storagePath, baseUrl, function (url) {
        img.src = url;
      });
    });
  }

  function runFirebaseImageInit() {
    if (window.FirebaseConfig && window.FirebaseConfig.storageBaseUrl) {
      resolveFirebaseImages();
      return;
    }
    var checkFirebase = setInterval(function () {
      if (window.FirebaseConfig && window.FirebaseConfig.storageBaseUrl) {
        clearInterval(checkFirebase);
        resolveFirebaseImages();
      }
    }, 100);
    setTimeout(function () { clearInterval(checkFirebase); }, 12000);
  }

  function applyBrideFirstOrder() {
    if (getAttr('data-bride-first', '') !== 'true') return;
    body.classList.add('wed-bride-first');

    if (coupleWrap && groomNameEl && brideNameEl) {
      var groomIndex = Array.prototype.indexOf.call(coupleWrap.children, groomNameEl);
      var brideIndex = Array.prototype.indexOf.call(coupleWrap.children, brideNameEl);
      if (groomIndex !== -1 && brideIndex !== -1 && groomIndex < brideIndex) {
        coupleWrap.insertBefore(brideNameEl, groomNameEl);
        if (ampEl) coupleWrap.insertBefore(ampEl, groomNameEl);
      }
    }

    var parentsDual = document.querySelector('.wed-parents-dual');
    var groomCol = document.querySelector('.wed-parents-groom');
    var brideCol = document.querySelector('.wed-parents-bride');
    if (parentsDual && groomCol && brideCol) {
      var groomColIndex = Array.prototype.indexOf.call(parentsDual.children, groomCol);
      var brideColIndex = Array.prototype.indexOf.call(parentsDual.children, brideCol);
      if (groomColIndex !== -1 && brideColIndex !== -1 && groomColIndex < brideColIndex) {
        parentsDual.insertBefore(brideCol, groomCol);
      }
    }
  }

  function hydrate() {
    var groom = formatCoupleName(getAttr('data-groom-name', 'Vyshak'));
    var bride = formatCoupleName(getAttr('data-bride-name', 'Devika'));
    var groomRing = getAttr('data-groom-ring-name', groom);
    var brideRing = getAttr('data-bride-ring-name', bride);
    var groomInitial = getAttr('data-groom-initial', groom.charAt(0)).toUpperCase();
    var brideInitial = getAttr('data-bride-initial', bride.charAt(0)).toUpperCase();
    var brideFirst = getAttr('data-bride-first', '') === 'true';

    setText('wed-groom-name', groomRing);
    setText('wed-bride-name', brideRing);
    setText('wed-groom-parent-prefix', getAttr('data-groom-parent-prefix', getAttr('data-parent-prefix', 'Son of')));
    setHtml(
      'wed-groom-parents-name',
      formatParentLinesHtml(getAttr('data-groom-parents-name', getAttr('data-parents-name', 'Vyshak & Devika')))
    );

    var bridePrefix = getAttr('data-bride-parent-prefix', 'Daughter of');
    var brideParents = getAttr('data-bride-parents-name', '');
    var brideCol = document.querySelector('.wed-parents-bride');
    setText('wed-bride-parent-prefix', bridePrefix);
    setHtml('wed-bride-parents-name', formatParentLinesHtml(brideParents));
    if (brideCol) {
      brideCol.classList.toggle('is-hidden', !brideParents);
    }
    var eventTime = getAttr('data-event-time', '11:00 AM - 2:00 PM');
    setText('wed-time-text', eventTime);
    setText('wed-date-time', getTimeDisplayLabel(eventTime));
    setText('wed-address-text', getAttr('data-event-address', 'Pallisseey bagavathi temple, thrissur'));
    setText('wed-blessings-text', getAttr('data-blessings', ''));

    if (sealInitials) {
      var sealGroomFirst = getAttr('data-seal-groom-first', '') === 'true';
      sealInitials.textContent = brideFirst && !sealGroomFirst
        ? brideInitial + ' & ' + groomInitial
        : groomInitial + ' & ' + brideInitial;
    }

    var dateRaw = getAttr('data-event-date', '2026-09-04');
    var eventDateOnly = new Date(dateRaw + 'T00:00:00');
    if (!isNaN(eventDateOnly.getTime())) {
      setText(
        'wed-date-month',
        eventDateOnly.toLocaleDateString('en-GB', {
          month: 'long'
        }).toUpperCase()
      );
      setText(
        'wed-date-day',
        eventDateOnly.toLocaleDateString('en-GB', {
          weekday: 'long'
        }).toUpperCase()
      );
      setText('wed-date-number', String(eventDateOnly.getDate()));
      setText(
        'wed-date-text',
        eventDateOnly.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      );
    }

    var mapLink = document.getElementById('wed-map-link');
    if (mapLink) mapLink.href = getAttr('data-map-link', '#');

    applyBrideFirstOrder();
  }

  function setCoupleDeco(asset) {
    if (!coupleDecoImg || !asset) return;
    var baseUrl = window.FirebaseConfig && window.FirebaseConfig.storageBaseUrl;
    var encodedPath = asset.path.replace(/^\//, '');
    if (baseUrl) {
      coupleDecoImg.src = baseUrl + encodedPath + '?alt=media&token=' + asset.token;
    } else {
      coupleDecoImg.src =
        'https://firebasestorage.googleapis.com/v0/b/my-bel0ved.firebasestorage.app/o/' +
        encodedPath +
        '?alt=media&token=' +
        asset.token;
    }
  }

  function applyStyleChoice(style) {
    var isMuslim = style === 'muslim';
    body.classList.toggle('wed-has-bismillah', isMuslim);
    body.classList.toggle('wed-couple-img-muslim-demo', isMuslim);
    body.classList.toggle('wed-ring-slightly-larger', isMuslim);

    if (isMuslim) {
      body.setAttribute('data-groom-name', 'Vyshak');
      body.setAttribute('data-bride-name', 'Devika');
      body.setAttribute('data-groom-initial', '');
      body.setAttribute('data-bride-initial', '');
      document.title = 'Vyshak & Devika - Wedding Invitation';
      setCoupleDeco(COUPLE_DECO_MUSLIM);
    } else {
      body.setAttribute('data-groom-name', 'Vyshak');
      body.setAttribute('data-bride-name', 'Devika');
      body.setAttribute('data-groom-initial', '');
      body.setAttribute('data-bride-initial', '');
      document.title = 'Vyshak & Devika - Wedding Invitation';
      setCoupleDeco(COUPLE_DECO_GENERAL);
    }

    hydrate();
  }

  function dismissStylePicker() {
    if (!stylePicker) return;
    stylePicker.classList.remove('is-active');
    stylePicker.setAttribute('aria-hidden', 'true');
  }

  function initStylePicker(onReady) {
    if (!stylePicker || getAttr('data-style-picker', '') !== 'true') {
      if (typeof onReady === 'function') onReady();
      return;
    }

    var buttons = stylePicker.querySelectorAll('[data-style]');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        applyStyleChoice(btn.getAttribute('data-style'));
        dismissStylePicker();
        if (typeof onReady === 'function') onReady();
      });
    });
  }

  function showMuteButton(show) {
    if (!muteBtns || !muteBtns.length) return;
    muteBtns.forEach(function (btn) {
      btn.classList.toggle('is-visible', show);
      if (show) btn.removeAttribute('aria-hidden');
      else btn.setAttribute('aria-hidden', 'true');
    });
  }

 function startMusic() {
    if (!audio) return;

    applyMusicVolume();

    audio.play().catch(function () {});

    showMuteButton(true);
}

  function launchHeartShower() {
    var burst = document.createElement('div');
    burst.className = 'wed-love-rain';
    body.appendChild(burst);

    var heartSymbols = ['♥', '♡', '❤'];
    var pieces = 24;
    for (var i = 0; i < pieces; i += 1) {
      var heart = document.createElement('span');
      heart.className = 'wed-love-drop';
      heart.textContent = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
      heart.style.left = randomInRange(2, 98).toFixed(2) + '%';
      heart.style.animationDelay = randomInRange(0, 0.8).toFixed(2) + 's';
      heart.style.animationDuration = randomInRange(2.4, 3.7).toFixed(2) + 's';
      heart.style.fontSize = randomInRange(1.05, 1.75).toFixed(2) + 'rem';
      burst.appendChild(heart);
    }

    setTimeout(function () {
      if (burst && burst.parentNode) {
        burst.parentNode.removeChild(burst);
      }
    }, 5000);
  }

  function startCountdown() {
    var dateRaw = getAttr('data-event-date', '2026-09-04');
    var eventTimeRaw = getAttr('data-event-time', '9:00 AM - 10:00 PM');
    var timeStart = eventTimeRaw.split('-')[0].trim();
    var dateTime = new Date(dateRaw + ' ' + timeStart);

    if (isNaN(dateTime.getTime())) {
      dateTime = new Date(dateRaw + 'T11:00:00');
    }

    function tick() {
      var now = new Date().getTime();
      var diff = dateTime.getTime() - now;

      if (diff <= 0) {
        countdownEls.days.textContent = '0';
        countdownEls.hours.textContent = '0';
        countdownEls.minutes.textContent = '0';
        countdownEls.seconds.textContent = '0';
        return;
      }

      var dayMs = 24 * 60 * 60 * 1000;
      var hourMs = 60 * 60 * 1000;
      var minuteMs = 60 * 1000;

      var days = Math.floor(diff / dayMs);
      var hours = Math.floor((diff % dayMs) / hourMs);
      var minutes = Math.floor((diff % hourMs) / minuteMs);
      var seconds = Math.floor((diff % minuteMs) / 1000);

      countdownEls.days.textContent = String(days);
      countdownEls.hours.textContent = String(hours);
      countdownEls.minutes.textContent = String(minutes);
      countdownEls.seconds.textContent = String(seconds);
    }

    tick();
    setInterval(tick, 1000);
  }

  if (openBtn) {
    openBtn.addEventListener('click', function () {
      if (envelope) envelope.classList.add('is-open');
      startMusic();
      setTimeout(function () {
        showSession(sessions.two);
      }, 900);
    });
  }

  if (toSessionThreeBtn) {
    toSessionThreeBtn.addEventListener('click', function () {
      launchHeartShower();
      showSession(sessions.three);
    });
  }

  if (backToSessionTwoBtn) {
    backToSessionTwoBtn.addEventListener('click', function () {
      showSession(sessions.two);
    });
  }

if (muteBtns && muteBtns.length && audio) {

    const PLAY_ICON = "pause.svg";
    const PAUSE_ICON = "play.svg";

    function updateIcon() {

        muteBtns.forEach(function(btn){

            var img = btn.querySelector("img");

            if(!img) return;

            if(audio.muted){
                img.src = PLAY_ICON;
                img.alt = "Play Music";
            }else{
                img.src = PAUSE_ICON;
                img.alt = "Mute Music";
            }

        });

    }

    muteBtns.forEach(function(btn){

        btn.addEventListener("click",function(){

            audio.muted = !audio.muted;

            updateIcon();

        });

    });

    audio.addEventListener("play",updateIcon);
    audio.addEventListener("pause",updateIcon);

    updateIcon();

}
  



  hydrate();
  runFirebaseImageInit();
  initializeFirebaseAudio();
  startCountdown();
  showMuteButton(false);
  initStylePicker(function () {
    showSession(sessions.one);
  });
})();
Explain
