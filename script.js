(() => {
  const header = document.getElementById('site-header');
  const scrollProgress = document.getElementById('scroll-progress');
  const navLinks = Array.from(document.querySelectorAll('.desktop-nav .nav-link'));
  const observedSections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  // Scroll progress bar & header scroll state
  const updateScroll = () => {
    const scrollTop = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const percent = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;

    if (scrollProgress) {
      scrollProgress.style.width = `${Math.min(100, Math.max(0, percent))}%`;
    }
    if (header) {
      header.classList.toggle('scrolled', scrollTop > 24);
    }
  };

  window.addEventListener('scroll', updateScroll, { passive: true });
  updateScroll();

  // Active nav highlighting
  if ('IntersectionObserver' in window && observedSections.length > 0) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const targetHref = `#${entry.target.id}`;
          navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === targetHref);
          });
        });
      },
      { rootMargin: '-40% 0px -50% 0px' }
    );

    observedSections.forEach((section) => navObserver.observe(section));
  }

  // Scroll reveal animations
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealItems.length > 0) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12 }
    );
    revealItems.forEach((el) => revealObserver.observe(el));
  } else {
    revealItems.forEach((el) => el.classList.add('is-visible'));
  }

  // Animated stats counters
  const countersContainer = document.getElementById('stats-counters');
  const animateCounter = (el) => {
    const target = Number(el.dataset.target || 0);
    const duration = 1400;
    const startTime = performance.now();

    const step = (now) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);
      el.textContent = current.toLocaleString();
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  if (countersContainer && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          countersContainer.querySelectorAll('.counter-number').forEach(animateCounter);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.35 }
    );
    counterObserver.observe(countersContainer);
  }

  // Mobile drawer
  const menuToggle = document.getElementById('mobile-menu-toggle');
  const menuClose = document.getElementById('mobile-menu-close');
  const drawer = document.getElementById('mobile-nav-drawer');
  const backdrop = document.getElementById('mobile-nav-backdrop');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  const setDrawerOpen = (open) => {
    if (!drawer || !backdrop || !menuToggle) return;
    drawer.hidden = !open;
    backdrop.hidden = !open;
    menuToggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('no-scroll', open);
    if (open) {
      menuClose?.focus();
    } else {
      menuToggle.focus();
    }
  };

  menuToggle?.addEventListener('click', () => {
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    setDrawerOpen(!isExpanded);
  });
  menuClose?.addEventListener('click', () => setDrawerOpen(false));
  backdrop?.addEventListener('click', () => setDrawerOpen(false));
  mobileLinks.forEach((link) => link.addEventListener('click', () => setDrawerOpen(false)));

  // Menu category filtering
  const filterButtons = document.querySelectorAll('.filter-btn');
  const menuCards = document.querySelectorAll('#menu-grid .menu-card');

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.category;
      filterButtons.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('active', active);
        b.setAttribute('aria-selected', String(active));
      });

      menuCards.forEach((card) => {
        const visible = category === 'all' || card.dataset.category === category;
        card.hidden = !visible;
      });
    });
  });

  // Gallery lightbox
  const galleryCards = document.querySelectorAll('.gallery-card');
  const lightbox = document.getElementById('lightbox-modal');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxDesc = document.getElementById('lightbox-desc');
  let activeTrigger = null;

  const closeLightbox = () => {
    if (!lightbox || lightbox.hidden) return;
    lightbox.hidden = true;
    document.body.classList.remove('no-scroll');
    activeTrigger?.focus();
  };

  galleryCards.forEach((card) => {
    card.addEventListener('click', () => {
      if (!lightbox || !lightboxImg || !lightboxTitle || !lightboxDesc) return;
      activeTrigger = card;
      lightboxImg.src = card.dataset.src || '';
      lightboxImg.alt = card.dataset.title || '';
      lightboxTitle.textContent = card.dataset.title || '';
      lightboxDesc.textContent = card.dataset.caption || '';
      lightbox.hidden = false;
      document.body.classList.add('no-scroll');
      lightboxClose?.focus();
    });
  });

  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (drawer && !drawer.hidden) setDrawerOpen(false);
    if (lightbox && !lightbox.hidden) closeLightbox();
  });

  // Reservation form
  const form = document.getElementById('reservation-form');
  const dateInput = document.getElementById('res-date');
  const formError = document.getElementById('form-error');
  const successBox = document.getElementById('reservation-success');
  const successMessage = document.getElementById('success-message');
  const resetBtn = document.getElementById('reset-reservation-btn');

  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today;
  }

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!formError || !successBox || !successMessage) return;

    const name = document.getElementById('guest-name')?.value.trim();
    const email = document.getElementById('guest-email')?.value.trim();
    const date = dateInput?.value;
    const time = document.getElementById('res-time')?.value;
    const guests = document.getElementById('res-guests')?.value;
    const seating = document.getElementById('res-seating')?.value;

    if (!name || !email || !email.includes('@') || !date || !time) {
      formError.textContent = 'Please provide your name, a valid email address, date, and seating time.';
      formError.hidden = false;
      return;
    }

    formError.hidden = true;
    form.hidden = true;
    successMessage.textContent = `Thank you, ${name}. Your table request for ${guests} on ${date} at ${time} (${seating}) has been received. Confirmation details will be sent to ${email}.`;
    successBox.hidden = false;
  });

  resetBtn?.addEventListener('click', () => {
    if (!form || !successBox) return;
    successBox.hidden = true;
    form.hidden = false;
  });
})();
