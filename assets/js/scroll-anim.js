/**
 * scroll-anim.js  v3
 *
 * Uses MutationObserver to watch for when main.js adds the .section-show
 * class to a section. This is the most reliable trigger — it fires AFTER
 * the section is visible in the DOM, avoiding all iOS timing issues.
 *
 * Chip animations are handled separately: when an ed-group fades in,
 * its child ed-chip spans are staggered individually.
 */
(function () {
  'use strict';

  // Skip for reduced-motion — CSS already keeps everything visible
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var STAGGER = 90; // ms between elements

  /**
   * Animate all [data-anim] children of a section in.
   * Also handles ed-chip children inside ed-group elements.
   */
  function playSection(section) {
    // Collect direct [data-anim] elements
    var animEls = Array.from(section.querySelectorAll('[data-anim]'));
    if (!animEls.length) return;

    var delay = 0;

    animEls.forEach(function (el) {
      // Skip if already animated
      if (el.hasAttribute('data-anim-in')) return;

      (function (element, d) {
        setTimeout(function () {
          element.setAttribute('data-anim-in', '');

          // If this is an ed-group, stagger its chips too
          var chips = element.querySelectorAll('.ed-chip');
          chips.forEach(function (chip, i) {
            chip.classList.add('chip-anim');
            setTimeout(function () {
              chip.classList.add('chip-anim-in');
            }, 60 + i * 40);
          });

        }, d);
      }(el, delay));

      delay += STAGGER;
    });
  }

  /**
   * Reset animations so they replay when revisiting a section.
   */
  function resetSection(section) {
    section.querySelectorAll('[data-anim-in]').forEach(function (el) {
      el.removeAttribute('data-anim-in');
    });
    section.querySelectorAll('.chip-anim-in').forEach(function (chip) {
      chip.classList.remove('chip-anim-in');
    });
    section.querySelectorAll('.chip-anim').forEach(function (chip) {
      chip.classList.remove('chip-anim');
    });
  }

  // Watch every section for the .section-show class being added/removed
  var sections = Array.from(document.querySelectorAll('section[id]'));

  sections.forEach(function (section) {
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.attributeName !== 'class') return;

        var hasShow = section.classList.contains('section-show');

        if (hasShow) {
          playSection(section);
        } else {
          resetSection(section);
        }
      });
    });

    observer.observe(section, { attributes: true });
  });

  // Also handle the case where the page loads directly to a hash
  window.addEventListener('load', function () {
    if (window.location.hash) {
      var sec = document.querySelector(window.location.hash);
      if (sec && sec.classList.contains('section-show')) {
        playSection(sec);
      }
    }
  });

}());
