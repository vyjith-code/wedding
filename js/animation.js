/* ===================================================================
   ENVELOPE OPENING ANIMATION
   Sequenced with plain setTimeout + CSS class toggles so every motion
   is driven by GPU-friendly CSS transitions (transform/opacity only).
   =================================================================== */
(function () {
  "use strict";

  var scene       = document.getElementById("envelopeScene");
  var seal        = document.getElementById("waxSeal");
  var tapHint     = document.getElementById("tapHint");
  var flapTop     = document.getElementById("flapTop");
  var flapLeft    = document.getElementById("flapLeft");
  var flapRight   = document.getElementById("flapRight");
  var flapBottom  = document.getElementById("flapBottom");
  // var miniCard    = document.getElementById("miniCard");
  var fadeOverlay = document.getElementById("fadeOverlay");
  var sfxClick    = document.getElementById("sfxClick");
  var sfxOpen     = document.getElementById("sfxOpen");

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var opening = false;

  function wait(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, reducedMotion ? Math.min(ms, 30) : ms); });
  }

  // Sound is optional / decorative — never let a missing file break the sequence.
  function playSafely(el) {
    if (!el) return;
    try {
      el.currentTime = 0;
      var p = el.play();
      if (p && typeof p.catch === "function") p.catch(function () {});
    } catch (e) { /* no-op: audio asset may be missing */ }
  }

  async function openEnvelope() {
    if (opening) return;
    opening = true;
    seal.setAttribute("aria-disabled", "true");

    // Step 1 — wax seal presses
    seal.classList.add("is-pressed");
    playSafely(sfxClick);
    await wait(100);

    // Step 2 — seal disappears
    seal.classList.remove("is-pressed");
    seal.classList.add("is-gone");
    tapHint.classList.add("is-hidden");
    scene.classList.add("is-opening");
    playSafely(sfxOpen);
    await wait(150);

    // Step 3 — top flap rotates upward (900ms)
    flapTop.classList.add("is-open");
    await wait(500);

    // Step 4 — left flap opens (overlaps slightly for a natural cascade)
    flapLeft.classList.add("is-open");
    await wait(250);

    // Step 5 — right flap opens
    flapRight.classList.add("is-open");
    await wait(250);

    // Step 6 — bottom flap folds downward
    flapBottom.classList.add("is-open");
    await wait(500);

    await wait(300);
fadeOverlay.classList.add("is-active");
await wait(500);
window.location.href = "invitation.html";
  }

  seal.addEventListener("click", openEnvelope);
  seal.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openEnvelope();
    }
  });
})();
