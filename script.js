(function() {
  'use strict';

  const guard = window.__app || (window.__app = {});
  if (guard.__scriptLoaded) return;
  guard.__scriptLoaded = true;

  const util = {
    debounce: function(fn, delay) {
      let timer;
      return function() {
        const args = arguments, ctx = this;
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(ctx, args), delay);
      };
    },
    throttle: function(fn, limit) {
      let waiting = false;
      return function() {
        if (waiting) return;
        const args = arguments, ctx = this;
        fn.apply(ctx, args);
        waiting = true;
        setTimeout(() => { waiting = false; }, limit);
      };
    },
    getHeaderHeight: function() {
      const header = document.querySelector('.navbar, .l-header');
      return header ? header.offsetHeight : 80;
    }
  };

  function initBurgerMenu() {
    if (guard.__burgerInit) return;
    guard.__burgerInit = true;

    const toggle = document.querySelector('.navbar-toggler');
    const collapse = document.querySelector('.navbar-collapse');
    const body = document.body;

    if (!toggle || !collapse) return;

    let isOpen = false;

    function open() {
      isOpen = true;
      collapse.classList.add('show');
      toggle.setAttribute('aria-expanded', 'true');
      body.classList.add('u-no-scroll');
      collapse.style.height = `calc(100vh - ${util.getHeaderHeight()}px)`;
    }

    function close() {
      isOpen = false;
      collapse.classList.remove('show');
      toggle.setAttribute('aria-expanded', 'false');
      body.classList.remove('u-no-scroll');
      collapse.style.height = '';
    }

    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      isOpen ? close() : open();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) close();
    });

    document.addEventListener('click', (e) => {
      if (!isOpen) return;
      if (!collapse.contains(e.target) && !toggle.contains(e.target)) {
        close();
      }
    });

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (isOpen) close();
      });
    });

    window.addEventListener('resize', util.throttle(() => {
      if (window.innerWidth >= 768 && isOpen) close();
    }, 200), { passive: true });
  }

  function initScrollEffects() {
    if (guard.__scrollInit) return;
    guard.__scrollInit = true;

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, observerOptions);

    const animatedElements = document.querySelectorAll(`
      .benefit-card,
      .category-card,
      .card,
      .c-service-card,
      .c-location-card,
      .c-quick-link,
      .accordion-item,
      .form-container
    `);

    animatedElements.forEach((el, index) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = `opacity 0.6s ease-out ${index * 0.1}s, transform 0.6s ease-out ${index * 0.1}s`;
      observer.observe(el);
    });

    const style = document.createElement('style');
    style.textContent = `
      .is-visible {
        opacity: 1 !important;
        transform: translateY(0) !important;
      }
    `;
    document.head.appendChild(style);
  }

  function initRippleEffect() {
    if (guard.__rippleInit) return;
    guard.__rippleInit = true;

    const buttons = document.querySelectorAll('.btn, .c-button, .nav-link, a[class*="btn"]');

    buttons.forEach(button => {
      button.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ripple = document.createElement('span');
        ripple.style.cssText = `
          position: absolute;
          left: ${x}px;
          top: ${y}px;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.6);
          transform: translate(-50%, -50%);
          animation: ripple-animation 0.6s ease-out;
          pointer-events: none;
        `;

        const oldRipple = this.querySelector('.ripple-effect');
        if (oldRipple) oldRipple.remove();

        ripple.classList.add('ripple-effect');
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
      });
    });

    const rippleStyle = document.createElement('style');
    rippleStyle.textContent = `
      @keyframes ripple-animation {
        to {
          width: 300px;
          height: 300px;
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(rippleStyle);
  }

  function initCountUp() {
    if (guard.__countUpInit) return;
    guard.__countUpInit = true;

    const counters = document.querySelectorAll('[data-count]');
    if (counters.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.counted) {
          const target = parseInt(entry.target.dataset.count);
          const duration = 2000;
          const step = target / (duration / 16);
          let current = 0;

          const updateCounter = () => {
            current += step;
            if (current < target) {
              entry.target.textContent = Math.floor(current);
              requestAnimationFrame(updateCounter);
            } else {
              entry.target.textContent = target;
              entry.target.dataset.counted = 'true';
            }
          };

          updateCounter();
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
  }

  function initSmoothScroll() {
    if (guard.__smoothScrollInit) return;
    guard.__smoothScrollInit = true;

    document.addEventListener('click', (e) => {
      const target = e.target.closest('a[href^="#"]');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href || href === '#' || href === '#!') return;

      const hash = href.includes('/#') ? href.split('/#')[1] : href.substring(1);
      if (!hash) return;

      const targetEl = document.getElementById(hash);
      if (!targetEl) return;

      e.preventDefault();

      const headerHeight = util.getHeaderHeight();
      const offsetTop = targetEl.getBoundingClientRect().top + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });

      if (history.pushState) {
        history.pushState(null, null, '#' + hash);
      }
    });
  }

  function initActiveMenu() {
    if (guard.__activeMenuInit) return;
    guard.__activeMenuInit = true;

    const path = location.pathname;
    const links = document.querySelectorAll('.nav-link');

    links.forEach(link => {
      const href = link.getAttribute('href') || '';
      link.removeAttribute('aria-current');
      link.classList.remove('active');

      const linkPath = href.split('#')[0];
      if (linkPath === path || 
          (path === '/' && (linkPath === '/' || linkPath === '/index.html')) ||
          (path.match(//index.html?$/) && (linkPath === '/' || linkPath === '/index.html'))) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('active');
      }
    });
  }

  function initScrollSpy() {
    if (guard.__scrollSpyInit) return;
    guard.__scrollSpyInit = true;

    const sections = document.querySelectorAll('section[id]');
    if (sections.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          const navLinks = document.querySelectorAll(`.nav-link[href="#${id}"], .nav-link[href="/#${id}"]`);
          
          document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
          });

          navLinks.forEach(link => {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
          });
        }
      });
    }, { threshold: 0.5 });

    sections.forEach(section => observer.observe(section));
  }

  function initImages() {
    if (guard.__imagesInit) return;
    guard.__imagesInit = true;

    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }

      img.addEventListener('error', function() {
        if (this.dataset.fallbackApplied) return;
        this.dataset.fallbackApplied = 'true';
        this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23e9ecef" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%236c757d" font-family="sans-serif" font-size="18"%3EImage not available%3C/text%3E%3C/svg%3E';
      });
    });

    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
      if (!video.hasAttribute('loading')) {
        video.setAttribute('loading', 'lazy');
      }
    });
  }

  function initFormValidation() {
    if (guard.__formInit) return;
    guard.__formInit = true;

    const forms = document.querySelectorAll('form');
    if (forms.length === 0) return;

    const validators = {
      name: {
        test: (value) => value.trim().length >= 2,
        message: 'Bitte geben Sie einen gültigen Namen ein (mindestens 2 Zeichen)'
      },
      email: {
        test: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein'
      },
      phone: {
        test: (value) => /^[\d\s\+\(\)\-]{10,20}$/.test(value),
        message: 'Bitte geben Sie eine gültige Telefonnummer ein'
      },
      message: {
        test: (value) => value.trim().length >= 10,
        message: 'Bitte geben Sie eine Nachricht mit mindestens 10 Zeichen ein'
      },
      privacy: {
        test: (checked) => checked === true,
        message: 'Bitte akzeptieren Sie die Datenschutzerklärung'
      }
    };

    function validateField(field) {
      const name = field.name || field.id;
      const value = field.type === 'checkbox' ? field.checked : field.value;
      const validator = validators[name];

      let errorElement = field.parentElement.querySelector('.invalid-feedback, .c-form__error');
      
      if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = field.classList.contains('c-form__input') ? 'c-form__error' : 'invalid-feedback';
        field.parentElement.appendChild(errorElement);
      }

      if (validator && !validator.test(value)) {
        field.setAttribute('aria-invalid', 'true');
        field.classList.add('is-invalid');
        if (field.parentElement.classList.contains('c-form__field')) {
          field.parentElement.classList.add('has-error');
        }
        errorElement.textContent = validator.message;
        errorElement.style.display = 'block';
        return false;
      } else {
        field.removeAttribute('aria-invalid');
        field.classList.remove('is-invalid');
        if (field.parentElement.classList.contains('c-form__field')) {
          field.parentElement.classList.remove('has-error');
        }
        errorElement.style.display = 'none';
        return true;
      }
    }

    forms.forEach(form => {
      const fields = form.querySelectorAll('input, select, textarea');
      
      fields.forEach(field => {
        if (field.hasAttribute('required') || field.hasAttribute('aria-required')) {
          field.addEventListener('blur', () => validateField(field));
          field.addEventListener('input', util.debounce(() => validateField(field), 500));
        }
      });

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();

        let isValid = true;
        const requiredFields = form.querySelectorAll('[required], [aria-required="true"]');

        requiredFields.forEach(field => {
          if (!validateField(field)) {
            isValid = false;
          }
        });

        if (!isValid) {
          const firstInvalid = form.querySelector('[aria-invalid="true"]');
          if (firstInvalid) {
            firstInvalid.focus();
            firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          const originalText = submitBtn.textContent;
          submitBtn.innerHTML = '<span style="display:inline-block;width:16px;height:16px;border:2px solid #fff;border-top-color:transparent;border-radius:50%;animation:spin 0.6s linear infinite;margin-right:8px;"></span>Wird gesendet...';
          
          const spinStyle = document.createElement('style');
          spinStyle.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
          if (!document.querySelector('style[data-spin]')) {
            spinStyle.dataset.spin = 'true';
            document.head.appendChild(spinStyle);
          }

          setTimeout(() => {
            window.location.href = 'thank_you.html';
          }, 1500);
        }
      });
    });
  }

  function initScrollToTop() {
    if (guard.__scrollTopInit) return;
    guard.__scrollTopInit = true;

    const button = document.createElement('button');
    button.innerHTML = '↑';
    button.className = 'scroll-to-top';
    button.setAttribute('aria-label', 'Nach oben scrollen');
    button.style.cssText = `
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: var(--color-primary);
      color: white;
      border: none;
      cursor: pointer;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      z-index: 999;
      font-size: 24px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;

    document.body.appendChild(button);

    window.addEventListener('scroll', util.throttle(() => {
      if (window.pageYOffset > 300) {
        button.style.opacity = '1';
        button.style.visibility = 'visible';
      } else {
        button.style.opacity = '0';
        button.style.visibility = 'hidden';
      }
    }, 100), { passive: true });

    button.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function initHeaderScroll() {
    if (guard.__headerScrollInit) return;
    guard.__headerScrollInit = true;

    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    window.addEventListener('scroll', util.throttle(() => {
      if (window.pageYOffset > 50) {
        navbar.classList.add('is-scrolled');
      } else {
        navbar.classList.remove('is-scrolled');
      }
    }, 100), { passive: true });
  }

  function initHoverEffects() {
    if (guard.__hoverInit) return;
    guard.__hoverInit = true;

    const cards = document.querySelectorAll('.benefit-card, .category-card, .card, .c-service-card, .c-location-card');

    cards.forEach(card => {
      card.addEventListener('mouseenter', function() {
        this.style.transition = 'transform 0.3s ease-out, box-shadow 0.3s ease-out';
      });
    });
  }

  function initAccordion() {
    if (guard.__accordionInit) return;
    guard.__accordionInit = true;

    const buttons = document.querySelectorAll('.accordion-button');

    buttons.forEach(button => {
      button.addEventListener('click', function() {
        const target = this.getAttribute('data-bs-target');
        if (!target) return;

        const collapse = document.querySelector(target);
        if (!collapse) return;

        const isExpanded = this.getAttribute('aria-expanded') === 'true';

        if (isExpanded) {
          this.setAttribute('aria-expanded', 'false');
          this.classList.add('collapsed');
          collapse.classList.remove('show');
        } else {
          this.setAttribute('aria-expanded', 'true');
          this.classList.remove('collapsed');
          collapse.classList.add('show');
        }
      });
    });
  }

  function initPrivacyModal() {
    if (guard.__privacyInit) return;
    guard.__privacyInit = true;

    const privacyLinks = document.querySelectorAll('a[href*="privacy"]');
    
    privacyLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        if (this.getAttribute('href') === '#privacy' || this.getAttribute('href') === '#privacy-policy') {
          e.preventDefault();
          
          const modal = document.createElement('div');
          modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.8);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            animation: fadeIn 0.3s ease-out;
          `;

          const content = document.createElement('div');
          content.style.cssText = `
            background: white;
            padding: 40px;
            border-radius: 12px;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            animation: slideUp 0.3s ease-out;
          `;

          content.innerHTML = `
            <h2 style="margin-bottom: 20px;">Datenschutzerklärung</h2>
            <p>Ihre Daten werden vertraulich behandelt und nicht an Dritte weitergegeben.</p>
            <button style="margin-top: 20px; padding: 12px 24px; background: var(--color-primary); color: white; border: none; border-radius: 25px; cursor: pointer; font-weight: 600;">Schließen</button>
          `;

          modal.appendChild(content);
          document.body.appendChild(modal);

          const closeBtn = content.querySelector('button');
          const closeModal = () => modal.remove();
          
          closeBtn.addEventListener('click', closeModal);
          modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
          });

          const style = document.createElement('style');
          style.textContent = `
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideUp {
              from { transform: translateY(30px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `;
          document.head.appendChild(style);
        }
      });
    });
  }

  guard.init = function() {
    initBurgerMenu();
    initScrollEffects();
    initRippleEffect();
    initCountUp();
    initSmoothScroll();
    initActiveMenu();
    initScrollSpy();
    initImages();
    initFormValidation();
    initScrollToTop();
    initHeaderScroll();
    initHoverEffects();
    initAccordion();
    initPrivacyModal();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', guard.init);
  } else {
    guard.init();
  }
})();
