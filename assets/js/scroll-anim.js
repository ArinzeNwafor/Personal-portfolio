/**
 * scroll-anim.js  v4
 *
 * Two distinct animation modes:
 *
 * 1. ENTRANCE mode (#about, #contact):
 *    MutationObserver watches for .section-show. When it fires, all
 *    [data-anim] children animate in sequentially.
 *
 * 2. SCROLL-WITHIN mode (#resume):
 *    After .section-show is added, IntersectionObserver is set up on
 *    each [data-anim] element individually. They animate in as the user
 *    scrolls — one by one, section by section.
 *    This is safe because the section is already open (overflow:visible)
 *    so elements are genuinely in the viewport when IO fires.
 *
 * 3. CHIP stagger:
 *    When any .reveal or [data-anim] that contains .ed-chip spans becomes
 *    visible, chips stagger in at 40ms each.
 */
(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─────────────────────────────────────────────
     Helpers
  ───────────────────────────────────────────── */

  function animateIn(el) {
    if (el.hasAttribute('data-anim-in')) return;
    el.setAttribute('data-anim-in', '');
    staggerChips(el);
  }

  function resetEl(el) {
    el.removeAttribute('data-anim-in');
    el.querySelectorAll('.chip-anim, .chip-anim-in').forEach(function (c) {
      c.classList.remove('chip-anim', 'chip-anim-in');
    });
  }

  /** Stagger .ed-chip children of an element after it animates in */
  function staggerChips(parent) {
    var chips = parent.querySelectorAll('.ed-chip');
    if (!chips.length) return;
    chips.forEach(function (chip, i) {
      chip.classList.add('chip-anim');
      setTimeout(function () {
        chip.classList.add('chip-anim-in');
      }, 80 + i * 40);
    });
  }

  /* ─────────────────────────────────────────────
     ENTRANCE mode — animate all at once on open
     Used for: #about, #contact (and any other section)
  ───────────────────────────────────────────── */

  function runEntranceMode(section) {
    var els = Array.from(section.querySelectorAll('[data-anim]'));
    if (!els.length) return;

    var delay = 0;
    els.forEach(function (el) {
      if (el.hasAttribute('data-anim-in')) return;
      (function (element, d) {
        setTimeout(function () { animateIn(element); }, d);
      }(el, delay));
      delay += 80;
    });
  }

  /* ─────────────────────────────────────────────
     SCROLL-WITHIN mode — each item animates when
     it scrolls into view.
     Used for: #resume
  ───────────────────────────────────────────── */

  var scrollIOs = []; // keep refs so we can disconnect on reset

  function runScrollWithinMode(section) {
    var els = Array.from(section.querySelectorAll('[data-anim]'));
    if (!els.length) return;

    if (!('IntersectionObserver' in window) || reducedMotion) {
      els.forEach(animateIn);
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateIn(entry.target);
        io.unobserve(entry.target);
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -60px 0px'
    });

    els.forEach(function (el) {
      if (!el.hasAttribute('data-anim-in')) io.observe(el);
    });

    scrollIOs.push({ section: section, io: io });
  }

  function teardownScrollWithin(section) {
    scrollIOs = scrollIOs.filter(function (entry) {
      if (entry.section !== section) return true;
      entry.io.disconnect();
      return false;
    });
  }

  /* ─────────────────────────────────────────────
     MutationObserver — watches each section for
     .section-show being added/removed
  ───────────────────────────────────────────── */

  // ALL sections use scroll-within mode:
  // - elements already in viewport animate immediately on section open
  // - elements below the fold animate as the user scrolls down to them
  var SCROLL_WITHIN_SECTIONS = ['about', 'resume', 'contact'];

  function onSectionShow(section) {
    var id = section.id;
    if (SCROLL_WITHIN_SECTIONS.indexOf(id) !== -1) {
      runScrollWithinMode(section);
    } else {
      runEntranceMode(section);
    }
  }

  function onSectionHide(section) {
    var id = section.id;
    // Reset data-anim elements so they replay next visit
    section.querySelectorAll('[data-anim]').forEach(resetEl);

    if (SCROLL_WITHIN_SECTIONS.indexOf(id) !== -1) {
      teardownScrollWithin(section);
    }
  }

  document.querySelectorAll('section[id]').forEach(function (section) {
    var mo = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        if (m.attributeName !== 'class') return;
        if (section.classList.contains('section-show')) {
          onSectionShow(section);
        } else {
          onSectionHide(section);
        }
      });
    });
    mo.observe(section, { attributes: true });
  });

  /* ─────────────────────────────────────────────
     Handle direct URL hash on page load
  ───────────────────────────────────────────── */
  window.addEventListener('load', function () {
    if (window.location.hash) {
      var sec = document.querySelector(window.location.hash);
      if (sec && sec.classList.contains('section-show')) {
        onSectionShow(sec);
      }
    }
  });

  // Reduced motion fallback — make all data-anim elements immediately visible
  if (reducedMotion) {
    document.querySelectorAll('[data-anim]').forEach(function (el) {
      el.setAttribute('data-anim-in', '');
    });
  }

}());
