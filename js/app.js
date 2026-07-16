/* ===================================================================
   WEDDING INVITATION — INTERACTIVITY
   Countdown timer, music toggle, RSVP modal, share, gallery dots.
   No frameworks, no external libraries.
   =================================================================== */
(function () {
  "use strict";

  /* ---------- CONFIG ---------- */
  var WEDDING_DATE   = new Date("2026-09-04T10:30:00");
  var VENUE_QUERY    = "St. Mary's Church, Kannur, Kerala";
  var COUPLE_NAMES   = "Akhil & Arya";
  var SHARE_URL      = window.location.href;

  /* ---------- 1. COUNTDOWN ---------- */
  (function countdown() {
    var elDays    = document.getElementById("cDays");
    var elHours   = document.getElementById("cHours");
    var elMinutes = document.getElementById("cMinutes");
    var elSeconds = document.getElementById("cSeconds");
    if (!elDays) return;

    function pad(n) { return String(n).padStart(2, "0"); }

    function tick() {
      var now = new Date();
      var diff = WEDDING_DATE - now;

      if (diff <= 0) {
        elDays.textContent = "00";
        elHours.textContent = "00";
        elMinutes.textContent = "00";
        elSeconds.textContent = "00";
        return;
      }

      var totalSeconds = Math.floor(diff / 1000);
      var days    = Math.floor(totalSeconds / 86400);
      var hours   = Math.floor((totalSeconds % 86400) / 3600);
      var minutes = Math.floor((totalSeconds % 3600) / 60);
      var seconds = totalSeconds % 60;

      elDays.textContent    = pad(days);
      elHours.textContent   = pad(hours);
      elMinutes.textContent = pad(minutes);
      elSeconds.textContent = pad(seconds);
    }

    tick();
    setInterval(tick, 1000);
  })();

  /* ---------- 2. GOOGLE MAPS LINK ---------- */
  (function maps() {
    var btn = document.getElementById("mapsBtn");
    if (!btn) return;
    btn.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(VENUE_QUERY);
  })();

  /* ---------- 3. BACKGROUND MUSIC (remembers user's choice) ---------- */
  (function music() {
    var btn   = document.getElementById("musicBtn");
    var audio = document.getElementById("bgMusic");
    if (!btn || !audio) return;

    var STORAGE_KEY = "wedding-music-playing";
    audio.volume = 0.55;

    function setPlaying(isPlaying) {
      btn.classList.toggle("is-playing", isPlaying);
      btn.setAttribute("aria-pressed", String(isPlaying));
      btn.querySelector(".icon-note").hidden = isPlaying;
      btn.querySelector(".icon-pause").hidden = !isPlaying;
      btn.setAttribute("aria-label", isPlaying ? "Pause background music" : "Play background music ");
    }

    function tryPlay() {
      var p = audio.play();
      if (p && typeof p.then === "function") {
        p.then(function () {
          setPlaying(true);
          localStorage.setItem(STORAGE_KEY, "1");
        }).catch(function () {
          // Autoplay/asset blocked — reflect a paused state, no crash.
          setPlaying(false);
        });
      } else {
        setPlaying(true);
      }
    }

    btn.addEventListener("click", function () {
      if (audio.paused) {
        tryPlay();
      } else {
        audio.pause();
        setPlaying(false);
        localStorage.setItem(STORAGE_KEY, "0");
      }
    });

    // Respect the visitor's last choice, if the browser allows resuming audio.
    if (localStorage.getItem(STORAGE_KEY) === "1") {
      tryPlay();
    }
  })();

  /* ---------- 4. RSVP MODAL ---------- */
  (function rsvp() {
    var openBtn  = document.getElementById("rsvpBtn");
    var backdrop = document.getElementById("rsvpBackdrop");
    var closeBtn = document.getElementById("rsvpClose");
    var form     = document.getElementById("rsvpForm");
    var success  = document.getElementById("rsvpSuccess");
    if (!openBtn || !backdrop) return;

    function open() {
      backdrop.hidden = false;
      document.body.style.overflow = "hidden";
    }
    function close() {
      backdrop.hidden = true;
      document.body.style.overflow = "";
    }

    openBtn.addEventListener("click", function (e) {
      e.preventDefault();
      open();
    });
    closeBtn.addEventListener("click", close);
    backdrop.addEventListener("click", function (e) {
      if (e.target === backdrop) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !backdrop.hidden) close();
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      // No backend wired up — store the response locally as a graceful placeholder.
      try {
        var data = {
          name: form.name.value,
          guests: form.guests.value,
          message: form.message.value,
          submittedAt: new Date().toISOString()
        };
        localStorage.setItem("wedding-rsvp", JSON.stringify(data));
      } catch (err) { /* ignore storage errors */ }

      form.hidden = true;
      success.hidden = false;
      setTimeout(close, 1800);
    });
  })();

  /* ---------- 5. SHARE INVITATION ---------- */
  (function share() {
    var btn = document.getElementById("shareBtn");
    if (!btn) return;

    btn.addEventListener("click", async function () {
      var shareData = {
        title: COUPLE_NAMES + " — Wedding Invitation",
        text: "You're invited to celebrate the wedding of " + COUPLE_NAMES + "!",
        url: SHARE_URL
      };
      if (navigator.share) {
        try { await navigator.share(shareData); } catch (err) { /* user cancelled */ }
        return;
      }
      try {
        await navigator.clipboard.writeText(SHARE_URL);
        var original = btn.querySelector("span").textContent;
        btn.querySelector("span").textContent = "Link Copied!";
        setTimeout(function () { btn.querySelector("span").textContent = original; }, 1800);
      } catch (err) {
        window.prompt("Copy this link to share:", SHARE_URL);
      }
    });
  })();






  /* ---------- 6. GALLERY DOTS ---------- */
  (function gallery() {
    var track = document.getElementById("galleryTrack");
    var dotsEl = document.getElementById("galleryDots");
    if (!track || !dotsEl) return;

    var slides = Array.prototype.slice.call(track.children);
    if (!slides.length) return;

    slides.forEach(function (_, i) {
      var dot = document.createElement("span");
      if (i === 0) dot.classList.add("is-active");
      dotsEl.appendChild(dot);
    });
    var dots = Array.prototype.slice.call(dotsEl.children);

    var ticking = false;
    track.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var index = Math.round(track.scrollLeft / track.clientWidth);
        dots.forEach(function (d, i) { d.classList.toggle("is-active", i === index); });
        ticking = false;
      });
    });
  })();

})();
