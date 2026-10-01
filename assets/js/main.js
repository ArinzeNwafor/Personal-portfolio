/**
* Template Name: Personal
* Updated: Sep 18 2023 with Bootstrap v5.3.2
* Template URL: https://bootstrapmade.com/personal-free-resume-bootstrap-template/
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/
(function() {
  "use strict";

  /**
   * Easy selector helper function
   */
  const select = (el, all = false) => {
    el = el.trim()
    if (all) {
      return [...document.querySelectorAll(el)]
    } else {
      return document.querySelector(el)
    }
  }

  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all)

    if (selectEl) {
      if (all) {
        selectEl.forEach(e => e.addEventListener(type, listener))
      } else {
        selectEl.addEventListener(type, listener)
      }
    }
  }

/**
   * Scrool with ofset on links with a class name .scrollto
   * Shown sections sit at document top 100px, and the fixed mini-bar ends at
   * ~83px, so parking at 0 leaves them cleanly below the bar. Measuring the
   * bar here instead would catch it mid-collapse animation (667px -> 83px).
   */
  const scrollto = (el) => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  /**
   * Scrool with ofset on links with a class name .scrollto
   */
  on('click', '#navbar .nav-link', function(e) {
    let section = select(this.hash)
    if (section) {
      e.preventDefault()

      let navbar = select('#navbar')
      let header = select('#header')
      let sections = select('section', true)
      let navlinks = select('#navbar .nav-link', true)

      navlinks.forEach((item) => {
        item.classList.remove('active')
      })

      this.classList.add('active')

      if (this.hash == '#header') {
        header.classList.remove('header-top')
        sections.forEach((item) => {
          item.classList.remove('section-show')
        })
        return;
      }

      // header-top pulls the full-height hero out of the document flow.
      // Showing the section later (the old 350ms defer) left the page with
      // almost no scrollable height in between, which is what collapsed the
      // view mid-navigation. Apply both classes in the same frame instead.
      header.classList.add('header-top')
      sections.forEach((item) => {
        item.classList.remove('section-show')
      })
      section.classList.add('section-show')
      section.querySelectorAll('.reveal, .reveal-blur, .reveal-line').forEach((el) => {
        el.classList.add('in-view')
      })

      scrollto(this.hash)
    }
  }, true)

  /**
   * Activate/show sections on load with hash links
   */
  window.addEventListener('load', () => {
    if (window.location.hash) {
      let initial_nav = select(window.location.hash)

      if (initial_nav) {
        let header = select('#header')
        let navlinks = select('#navbar .nav-link', true)

        header.classList.add('header-top')

        navlinks.forEach((item) => {
          if (item.getAttribute('href') == window.location.hash) {
            item.classList.add('active')
          } else {
            item.classList.remove('active')
          }
        })

        initial_nav.classList.add('section-show')
        initial_nav.querySelectorAll('.reveal, .reveal-blur, .reveal-line').forEach((el) => {
          el.classList.add('in-view')
        })

        scrollto(window.location.hash)
      }
    }
  });

  /**
   * Skills animation
   */
  let skilsContent = select('.skills-content');
  if (skilsContent) {
    new Waypoint({
      element: skilsContent,
      offset: '80%',
      handler: function(direction) {
        let progress = select('.progress .progress-bar', true);
        progress.forEach((el) => {
          el.style.width = el.getAttribute('aria-valuenow') + '%'
        });
      }
    })
  }

  /**
   * Testimonials slider (guarded: section repurposed, element may not exist)
   */
  if (document.querySelector('.testimonials-slider')) {
    new Swiper('.testimonials-slider', {
      speed: 600,
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false
      },
      slidesPerView: 'auto',
      pagination: {
        el: '.swiper-pagination',
        type: 'bullets',
        clickable: true
      },
      breakpoints: {
        320: {
          slidesPerView: 1,
          spaceBetween: 20
        },

        1200: {
          slidesPerView: 3,
          spaceBetween: 20
        }
      }
    });
  }

  /**
   * Porfolio isotope and filter
   */
  window.addEventListener('load', () => {
    let portfolioContainer = select('.portfolio-container');
    if (portfolioContainer && !portfolioContainer.closest('[hidden]')) {
      let portfolioIsotope = new Isotope(portfolioContainer, {
        itemSelector: '.portfolio-item',
        layoutMode: 'fitRows'
      });

      let portfolioFilters = select('#portfolio-flters li', true);

      on('click', '#portfolio-flters li', function(e) {
        e.preventDefault();
        portfolioFilters.forEach(function(el) {
          el.classList.remove('filter-active');
        });
        this.classList.add('filter-active');

        portfolioIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });
      }, true);
    }

  });

  /**
   * Initiate portfolio lightbox (guarded: only if elements exist)
   */
  if (document.querySelector('.portfolio-lightbox')) {
    const portfolioLightbox = GLightbox({
      selector: '.portfolio-lightbox'
    });
  }

  /**
   * Initiate portfolio details lightbox (guarded)
   */
  if (document.querySelector('.portfolio-details-lightbox')) {
    const portfolioDetailsLightbox = GLightbox({
      selector: '.portfolio-details-lightbox',
      width: '90%',
      height: '90vh'
    });
  }

  /**
   * Portfolio details slider (guarded)
   */
  if (document.querySelector('.portfolio-details-slider')) {
    new Swiper('.portfolio-details-slider', {
      speed: 400,
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false
      },
      pagination: {
        el: '.swiper-pagination',
        type: 'bullets',
        clickable: true
      }
    });
  }

  /**
   * Keyboard support for portfolio filters (a11y)
   */
  const filterTabs = document.querySelectorAll('#portfolio-flters li');
  filterTabs.forEach((tab) => {
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        tab.click();
      }
    });
    tab.addEventListener('click', () => {
      filterTabs.forEach((t) => t.setAttribute('aria-selected', 'false'));
      tab.setAttribute('aria-selected', 'true');
    });
  });

  /**
   * Hero intro animation: split name into letters, then reveal
   */
  const heroNameLink = document.querySelector('#header h1 a');
  if (heroNameLink && !heroNameLink.querySelector('.hero-char')) {
    const name = heroNameLink.textContent;
    heroNameLink.setAttribute('aria-label', name);
    heroNameLink.textContent = '';
    [...name].forEach((ch, i) => {
      const s = document.createElement('span');
      s.className = 'hero-char';
      s.setAttribute('aria-hidden', 'true');
      s.style.setProperty('--i', i);
      s.textContent = ch === ' ' ? '\u00A0' : ch;
      heroNameLink.appendChild(s);
    });
  }
  const revealHero = () => document.body.classList.add('hero-loaded');
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => requestAnimationFrame(() => requestAnimationFrame(revealHero)));
    setTimeout(revealHero, 1200); // fallback
  } else {
    window.addEventListener('load', revealHero);
    setTimeout(revealHero, 1200); // fallback
  }

  /**
   * Editorial ledes: split into words for the staggered rise
   */
  document.querySelectorAll('.ed-lede').forEach((lede) => {
    if (lede.querySelector('.ed-w')) return;
    const text = lede.textContent.trim().replace(/\s+/g, ' ');
    lede.setAttribute('aria-label', text);
    lede.textContent = '';
    text.split(' ').forEach((word, i, arr) => {
      const s = document.createElement('span');
      s.className = 'ed-w';
      s.setAttribute('aria-hidden', 'true');
      s.style.setProperty('--i', i);
      s.textContent = word;
      lede.appendChild(s);
      if (i < arr.length - 1) lede.appendChild(document.createTextNode(' '));
    });
  });

  /**
   * Scroll reveals for About stats, stack groups and Now items
   */
  const revealSelectors = ['.reveal', '#about .reveal-blur', '#about .reveal-line'];
  const revealEls = document.querySelectorAll(revealSelectors.join(', '));
  if ('IntersectionObserver' in window && revealEls.length) {
    const revealIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach((el) => {
      const ownSel = revealSelectors.find((sel) => el.matches(sel));
      const siblings = [...el.parentElement.children].filter((child) =>
        child.matches(ownSel)
      );
      el.style.setProperty('--r', siblings.indexOf(el));
      revealIO.observe(el);
    });
  } else {
    revealEls.forEach((el) => el.classList.add('in-view'));
  }

  /**
   * Initiate Pure Counter 
   */
  new PureCounter();

})()