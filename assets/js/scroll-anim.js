/**
 * scroll-anim.js
 * iOS-safe entrance animations for Resume & Contact sections.
 *
 * Strategy:
 *   - Observes [data-anim] elements with IntersectionObserver.
 *   - The observer root is the scrolling document, so elements are checked
 *     once they are visible on screen — after the section has fully opened.
 *   - Stamps [data-anim-in] to trigger CSS transitions (opacity + transform only,
 *     GPU-composited, safe on iOS Safari).
 *   - Stagger is applied via --anim-delay CSS custom property (ms integer).
 *   - Respects prefers-reduced-motion (CSS handles instant-show).
 *   - Runs once per element (unobserves after trigger).
 */
(function () {
  'use strict';

  // Bail out completely for reduced-motion users (CSS already shows everything)
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('[data-anim]').forEach(function (el) {
      el.setAttribute('data-anim-in', '');
    });
    return;
  }

  // Bail gracefully if IntersectionObserver is unavailable (very old browsers)
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('[data-anim]').forEach(function (el) {
      el.setAttribute('data-anim-in', '');
    });
    return;
  }

  /**
   * Assign stagger delays to a group of sibling elements sharing the same
   * parent, so they cascade in one by one rather than all popping at once.
   */
  function assignStagger(elements) {
    var BASE_DELAY = 0;      // first element starts immediately
    var STEP = 80;           // ms between each successive element

    // Group by parent so siblings within different sections don't interfere
    var groups = new Map();
    elements.forEach(function (el) {
      var key = el.parentElement;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(el);
    });

    groups.forEach(function (siblings) {
      siblings.forEach(function (el, i) {
        el.style.setProperty('--anim-delay', BASE_DELAY + i * STEP);
      });
    });
  }

  // Collect all animatable elements on the page
  var animEls = Array.from(document.querySelectorAll('[data-anim]'));
  if (!animEls.length) return;

  assignStagger(animEls);

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.setAttribute('data-anim-in', '');
        observer.unobserve(entry.target);
      }
    });
  }, {
    // Trigger as soon as even 1px of the element is visible
    threshold: 0.01,
    // No rootMargin so elements only fire when genuinely on screen
    rootMargin: '0px 0px -30px 0px'
  });

  animEls.forEach(function (el) {
    observer.observe(el);
  });

  /**
   * Re-check all still-hidden elements each time a nav link is clicked.
   * This handles the case on mobile where the section opens but the
   * IntersectionObserver hasn't fired yet because the element was off-screen.
   * We defer slightly so the section's CSS transition (opacity/position) has
   * settled before we check visibility.
   */
  document.addEventListener('click', function (e) {
    var link = e.target.closest('#navbar .nav-link');
    if (!link) return;

    // Give the section 500ms to finish its CSS entrance transition
    setTimeout(function () {
      animEls.forEach(function (el) {
        if (el.hasAttribute('data-anim-in')) return; // already done
        var rect = el.getBoundingClientRect();
        var visible = rect.top < window.innerHeight && rect.bottom > 0;
        if (visible) {
          el.setAttribute('data-anim-in', '');
          observer.unobserve(el);
        }
      });
    }, 500);
  });

})();
