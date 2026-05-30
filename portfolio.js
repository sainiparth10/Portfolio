/* ========================================================================
   portfolio.js — Portfolio Website Logic & Animations
   ======================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  /* ---- Apply Theme ---- */
  DataStore.applyTheme();
  const data = DataStore.getAll();

  /* ---- Set page title ---- */
  document.title = data.settings.siteTitle || 'Portfolio';

  /* ================================================================
     RENDER ALL SECTIONS
     ================================================================ */
  renderHero(data);
  renderAbout(data);
  renderSkills(data);
  renderProjects(data);
  renderExperience(data);
  renderTestimonials(data);
  renderContact(data);
  renderFooter(data);

  /* ================================================================
     INITIALIZE EFFECTS
     ================================================================ */
  initParticles();
  initTyped(data);
  initCustomCursor();
  initNavigation();
  initScrollReveal();
  initCounterAnimation();
  initSkillBarAnimation();
  initTestimonialSlider();
  initContactForm();
  initTiltCards();

  /* ================================================================
     RENDER FUNCTIONS
     ================================================================ */
  function renderHero(d) {
    document.getElementById('heroName').textContent = d.profile.name;
    const navLogo = document.querySelector('.nav-logo');
    if (navLogo) {
      const names = d.profile.name.split(' ');
      navLogo.textContent = names.map(n => n[0]).join('').toUpperCase();
    }
  }

  function renderAbout(d) {
    document.getElementById('aboutBio').textContent = d.profile.bio;

    if (d.profile.avatar) {
      const avatarEl = document.getElementById('aboutAvatar');
      avatarEl.innerHTML = '';
      avatarEl.style.padding = '0';
      const img = document.createElement('img');
      img.src = d.profile.avatar;
      img.alt = d.profile.name;
      img.className = 'about-avatar';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.style.borderRadius = 'var(--radius-xl)';
      avatarEl.appendChild(img);
    }

    const statsContainer = document.getElementById('aboutStats');
    statsContainer.innerHTML = d.profile.stats.map((s, i) => `
      <div class="stat-card glass-card">
        <div class="stat-number" data-target="${s.value}">0</div>
        <div class="stat-label">${s.label}</div>
      </div>
    `).join('');
  }

  function renderSkills(d) {
    const categories = ['All', ...new Set(d.skills.map(s => s.category))];
    const filterContainer = document.getElementById('skillsFilter');
    filterContainer.innerHTML = categories.map(c => `
      <button class="filter-btn ${c === 'All' ? 'active' : ''}" data-filter="${c}">${c}</button>
    `).join('');

    const grid = document.getElementById('skillsGrid');
    renderSkillItems(grid, d.skills);

    filterContainer.addEventListener('click', e => {
      if (!e.target.classList.contains('filter-btn')) return;
      filterContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      const filter = e.target.dataset.filter;
      const filtered = filter === 'All' ? d.skills : d.skills.filter(s => s.category === filter);
      renderSkillItems(grid, filtered);
      requestAnimationFrame(() => animateSkillBars());
    });
  }

  function renderSkillItems(container, skills) {
    container.innerHTML = skills.map(s => `
      <div class="skill-item glass-card reveal-scale" data-category="${s.category}">
        <div class="skill-header">
          <span class="skill-name">${s.name}</span>
          <span class="skill-percent">${s.level}%</span>
        </div>
        <div class="skill-bar">
          <div class="skill-fill" data-level="${s.level}"></div>
        </div>
      </div>
    `).join('');
  }

  function renderProjects(d) {
    const categories = ['All', ...new Set(d.projects.map(p => p.category))];
    const filterContainer = document.getElementById('projectsFilter');
    filterContainer.innerHTML = categories.map(c => `
      <button class="filter-btn ${c === 'All' ? 'active' : ''}" data-filter="${c}">${c}</button>
    `).join('');

    const grid = document.getElementById('projectsGrid');
    renderProjectCards(grid, d.projects);

    filterContainer.addEventListener('click', e => {
      if (!e.target.classList.contains('filter-btn')) return;
      filterContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      const filter = e.target.dataset.filter;
      const filtered = filter === 'All' ? d.projects : d.projects.filter(p => p.category === filter);
      renderProjectCards(grid, filtered);
      initTiltCards();
    });
  }

  function renderProjectCards(container, projects) {
    container.innerHTML = projects.map((p, i) => `
      <div class="project-card reveal" style="transition-delay: ${i * 0.1}s">
        <div class="project-image-wrapper">
          ${p.image
            ? `<img src="${p.image}" alt="${p.title}" class="project-image">`
            : `<div class="project-placeholder project-placeholder-${(i % 6) + 1}">${p.title.charAt(0)}</div>`
          }
          <div class="project-overlay">
            <a href="${p.liveUrl || '#'}" class="project-overlay-btn" title="Live Demo" target="_blank" rel="noopener">🔗</a>
            <a href="${p.githubUrl || '#'}" class="project-overlay-btn" title="Source Code" target="_blank" rel="noopener">💻</a>
          </div>
        </div>
        <div class="project-info">
          <span class="project-category">${p.category}</span>
          <h3 class="project-title">${p.title}</h3>
          <p class="project-desc">${p.description}</p>
          <div class="project-tags">
            ${p.tags.map(t => `<span class="project-tag">${t}</span>`).join('')}
          </div>
        </div>
      </div>
    `).join('');
  }

  function renderExperience(d) {
    const timeline = document.getElementById('timeline');
    timeline.innerHTML = d.experience.map(e => `
      <div class="timeline-item glass-card reveal" data-type="${e.type}">
        <div class="timeline-dot"></div>
        <span class="timeline-period">${e.period}</span>
        <h3 class="timeline-role">${e.role}</h3>
        <span class="timeline-company">${e.company}</span>
        <p class="timeline-desc">${e.description}</p>
      </div>
    `).join('');
  }

  function renderTestimonials(d) {
    const slider = document.getElementById('testimonialsSlider');
    slider.innerHTML = d.testimonials.map(t => `
      <div class="testimonial-card glass-card">
        <div class="testimonial-quote-icon">"</div>
        <p class="testimonial-text">${t.quote}</p>
        <div class="testimonial-author">
          <div class="testimonial-avatar">
            ${t.avatar
              ? `<img src="${t.avatar}" alt="${t.name}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`
              : t.name.charAt(0)
            }
          </div>
          <div class="testimonial-author-info">
            <h4>${t.name}</h4>
            <p>${t.role}</p>
          </div>
        </div>
      </div>
    `).join('');
  }

  function renderContact(d) {
    const details = document.getElementById('contactDetails');
    const items = [];
    if (d.contact.email) items.push({ icon: '📧', label: 'Email', value: d.contact.email, href: `mailto:${d.contact.email}` });
    if (d.contact.location) items.push({ icon: '📍', label: 'Location', value: d.contact.location });
    details.innerHTML = items.map(item => `
      <${item.href ? 'a' : 'div'} class="contact-item" ${item.href ? `href="${item.href}"` : ''}>
        <div class="contact-icon">${item.icon}</div>
        <div>
          <div class="contact-item-label">${item.label}</div>
          <div class="contact-item-value">${item.value}</div>
        </div>
      </${item.href ? 'a' : 'div'}>
    `).join('');

    const socialContainer = document.getElementById('socialLinks');
    const socials = [];
    if (d.contact.github && d.contact.github !== '#') socials.push({ icon: '🐙', url: d.contact.github, label: 'GitHub' });
    if (d.contact.linkedin && d.contact.linkedin !== '#') socials.push({ icon: '💼', url: d.contact.linkedin, label: 'LinkedIn' });
    if (d.contact.twitter && d.contact.twitter !== '#') socials.push({ icon: '🐦', url: d.contact.twitter, label: 'Twitter' });
    socialContainer.innerHTML = socials.map(s => `
      <a href="${s.url}" class="social-link" target="_blank" rel="noopener" title="${s.label}">${s.icon}</a>
    `).join('');
  }

  function renderFooter(d) {
    document.getElementById('footerName').textContent = d.profile.name;
  }

  /* ================================================================
     PARTICLES
     ================================================================ */
  function initParticles() {
    if (typeof tsParticles !== 'undefined') {
      tsParticles.load("particles-js", particlesConfig).catch(err => {
        console.warn('Particles failed to load:', err);
      });
    }
  }

  /* ================================================================
     TYPED.JS
     ================================================================ */
  function initTyped(d) {
    if (typeof Typed !== 'undefined') {
      new Typed('#typed-text', {
        strings: d.profile.roles,
        typeSpeed: 60,
        backSpeed: 40,
        backDelay: 2000,
        loop: true,
        showCursor: true,
        cursorChar: '|'
      });
    }
  }

  /* ================================================================
     CUSTOM CURSOR
     ================================================================ */
  function initCustomCursor() {
    const cursor = document.getElementById('customCursor');
    const dot = document.getElementById('cursorDot');
    if (!cursor || !dot) return;

    // Hide on touch devices
    if ('ontouchstart' in window) {
      cursor.style.display = 'none';
      dot.style.display = 'none';
      return;
    }

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let dotX = 0, dotY = 0;

    document.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function animate() {
      // Lerp for smooth following
      cursorX += (mouseX - cursorX) * 0.12;
      cursorY += (mouseY - cursorY) * 0.12;
      dotX += (mouseX - dotX) * 0.25;
      dotY += (mouseY - dotY) * 0.25;

      cursor.style.left = cursorX + 'px';
      cursor.style.top = cursorY + 'px';
      dot.style.left = dotX + 'px';
      dot.style.top = dotY + 'px';

      requestAnimationFrame(animate);
    }
    animate();

    // Hover effect on interactive elements
    const hoverTargets = document.querySelectorAll('a, button, .project-card, .glass-card, .filter-btn, .social-link, input, textarea');
    hoverTargets.forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
    });
  }

  /* ================================================================
     NAVIGATION
     ================================================================ */
  function initNavigation() {
    const nav = document.getElementById('nav-floating');
    const toggle = document.getElementById('navToggle');
    const links = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    // Scroll effect
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }

      // Active section
      let current = '';
      sections.forEach(section => {
        const top = section.offsetTop - 200;
        if (window.scrollY >= top) {
          current = section.id;
        }
      });
      links.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.section === current) {
          link.classList.add('active');
        }
      });
    });

    // Mobile toggle
    if (toggle) {
      toggle.addEventListener('click', () => {
        nav.classList.toggle('open');
      });

      links.forEach(link => {
        link.addEventListener('click', () => {
          nav.classList.remove('open');
        });
      });
    }
  }

  /* ================================================================
     SCROLL REVEAL (IntersectionObserver)
     ================================================================ */
  function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    if (!revealElements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
  }

  /* ================================================================
     COUNTER ANIMATION
     ================================================================ */
  function initCounterAnimation() {
    const counters = document.querySelectorAll('.stat-number');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.target, 10);
          animateCounter(el, target);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));
  }

  function animateCounter(el, target) {
    const duration = 2000;
    const startTime = performance.now();
    const easeOutQuart = t => 1 - Math.pow(1 - t, 4);

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);
      const current = Math.round(easedProgress * target);
      el.textContent = current + (target >= 10 ? '+' : '');

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    requestAnimationFrame(update);
  }

  /* ================================================================
     SKILL BAR ANIMATION
     ================================================================ */
  function initSkillBarAnimation() {
    const skillSection = document.getElementById('skills');
    if (!skillSection) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateSkillBars();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    observer.observe(skillSection);
  }

  function animateSkillBars() {
    const fills = document.querySelectorAll('.skill-fill');
    fills.forEach((fill, i) => {
      setTimeout(() => {
        fill.style.width = fill.dataset.level + '%';
        fill.classList.add('animated');
      }, i * 80);
    });
  }

  /* ================================================================
     TESTIMONIAL SLIDER
     ================================================================ */
  function initTestimonialSlider() {
    const slider = document.getElementById('testimonialsSlider');
    const prevBtn = document.getElementById('testimonialPrev');
    const nextBtn = document.getElementById('testimonialNext');
    if (!slider || !prevBtn || !nextBtn) return;

    prevBtn.addEventListener('click', () => {
      slider.scrollBy({ left: -380, behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
      slider.scrollBy({ left: 380, behavior: 'smooth' });
    });

    // Auto-scroll
    let autoScroll = setInterval(() => {
      const maxScroll = slider.scrollWidth - slider.clientWidth;
      if (slider.scrollLeft >= maxScroll - 10) {
        slider.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        slider.scrollBy({ left: 380, behavior: 'smooth' });
      }
    }, 5000);

    slider.addEventListener('mouseenter', () => clearInterval(autoScroll));
    slider.addEventListener('mouseleave', () => {
      autoScroll = setInterval(() => {
        const maxScroll = slider.scrollWidth - slider.clientWidth;
        if (slider.scrollLeft >= maxScroll - 10) {
          slider.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          slider.scrollBy({ left: 380, behavior: 'smooth' });
        }
      }, 5000);
    });
  }

  /* ================================================================
     CONTACT FORM
     ================================================================ */
  function initContactForm() {
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('contactSubmitBtn');
    if (!form) return;

    form.addEventListener('submit', e => {
      e.preventDefault();

      // Validate
      const name = document.getElementById('contactName').value.trim();
      const email = document.getElementById('contactEmail').value.trim();
      const message = document.getElementById('contactMessage').value.trim();

      if (!name || !email || !message) {
        submitBtn.textContent = 'Please fill all required fields';
        submitBtn.style.background = 'linear-gradient(135deg, var(--accent), #ff6b6b)';
        setTimeout(() => {
          submitBtn.textContent = 'Send Message ✉';
          submitBtn.style.background = '';
        }, 2500);
        return;
      }

      // Simulate send
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.textContent = '✓ Message Sent!';
        submitBtn.classList.add('success');
        form.reset();

        setTimeout(() => {
          submitBtn.textContent = 'Send Message ✉';
          submitBtn.classList.remove('success');
          submitBtn.disabled = false;
        }, 3000);
      }, 1500);
    });
  }

  /* ================================================================
     TILT EFFECT ON CARDS
     ================================================================ */
  function initTiltCards() {
    if (typeof VanillaTilt === 'undefined') return;
    if ('ontouchstart' in window) return; // Skip on mobile

    const cards = document.querySelectorAll('.project-card');
    cards.forEach(card => {
      VanillaTilt.init(card, {
        max: 8,
        speed: 400,
        glare: true,
        'max-glare': 0.15,
        scale: 1.02
      });
    });
  }
});
