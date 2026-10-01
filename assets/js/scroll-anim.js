/**
 * scroll-anim.js  v2
 * Entrance animations for all sections.
 *
 * Approach:
 *   Rather than fighting IntersectionObserver (unreliable on iOS Safari for
 *   elements inside position:absolute sections), we hook directly into the
 *   nav-link click that opens each section and fire animations with explicit
 *   timeouts — no observer, no race conditions.
 *
 *   For the About section the existing .reveal / .reveal-blur / .reveal-line
 *   system is left intact. This file only handles [data-anim] elements.
 *
 *   CSS handles the actual transition:
 *     [data-anim]       → opacity:0; transform: initial-offset
 *     [data-anim-in]    → opacity:1; transform: none; transition: ...
 */
(function () {
  'use strict';

  /* ── Reduced-motion: skip everything, CSS keeps elements visible ── */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* ── Stagger constants ── */
  var SECTION_OPEN_DELAY = 120;  // ms — let the section CSS transition begin
  var ITEM_STAGGER       = 80;   // ms between consecutive elements

  /**
   * Animate all [data-anim] children inside a given section element.
   * Elements are sorted by their vertical position so they cascade top→bottom.
   */
  function animateSection(sectionEl) {
    if (!sectionEl) return;

    var els = Array.from(sectionEl.querySelectorAll('[data-anim]'));
    if (!els.length) return;

    /* Sort top → bottom so stagger flows naturally down the page */
    els.sort(function (a, b) {
      return a.getBoundingClientRect().top - b.getBoundingClientRect().top;
    });

    els.forEach(function (el, i) {
      /* Skip elements already animated */
      if (el.hasAttribute('data-anim-in')) return;

      setTimeout(function () {
        el.setAttribute('data-anim-in', '');
      }, SECTION_OPEN_DELAY + i * ITEM_STAGGER);
    });
  }

  /**
   * Reset a section's animations so they replay on next visit.
   * (Optional: remove this if you want fire-once behaviour.)
   */
  function resetSection(sectionEl) {
    if (!sectionEl) return;
    sectionEl.querySelectorAll('[data-anim-in]').forEach(function (el) {
      el.removeAttribute('data-anim-in');
    });
  }

  /* ── Hook into nav clicks ── */
  document.addEventListener('click', function (e) {
    var link = e.target.closest('#navbar .nav-link');
    if (!link) return;

    var hash = link.getAttribute('href'); // e.g. "#resume"
    if (!hash || hash === '#header') return;

    var targetSection = document.querySelector(hash);
    if (!targetSection) return;

    /* Reset all OTHER sections so their animations replay if visited again */
    document.querySelectorAll('section').forEach(function (sec) {
      if (sec !== targetSection) resetSection(sec);
    });

    animateSection(targetSection);
  }, true); /* capture phase — fires before main.js adds section-show */

  /* ── Handle direct URL hash on page load ── */
  window.addEventListener('load', function () {
    if (window.location.hash && window.location.hash !== '#header') {
      var sec = document.querySelector(window.location.hash);
      animateSection(sec);
    }
  });

})();
