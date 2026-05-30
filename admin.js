/* ========================================================================
   admin.js — Admin Panel Logic & CRUD Operations
   ======================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  DataStore.applyTheme();

  /* ================================================================
     AUTH
     ================================================================ */
  const loginPage = document.getElementById('loginPage');
  const adminLayout = document.getElementById('adminLayout');
  const loginForm = document.getElementById('loginForm');
  const loginError = document.getElementById('loginError');

  // Check if already logged in
  if (sessionStorage.getItem('admin_auth') === 'true') {
    showAdmin();
  }

  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const pw = document.getElementById('loginPassword').value;
    const settings = DataStore.get('settings');
    if (pw === settings.password) {
      sessionStorage.setItem('admin_auth', 'true');
      showAdmin();
    } else {
      loginError.textContent = 'Incorrect password. Try again.';
      document.getElementById('loginPassword').value = '';
    }
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem('admin_auth');
    loginPage.style.display = '';
    adminLayout.style.display = 'none';
  });

  function showAdmin() {
    loginPage.style.display = 'none';
    adminLayout.style.display = 'grid';
    initAdmin();
  }

  /* ================================================================
     INIT ADMIN
     ================================================================ */
  function initAdmin() {
    initSidebar();
    initDashboard();
    initProfile();
    initSkills();
    initProjects();
    initExperience();
    initTestimonials();
    initContactInfo();
    initTheme();
    initSettings();
    initMobileSidebar();
  }

  /* ================================================================
     SIDEBAR NAVIGATION
     ================================================================ */
  function initSidebar() {
    const links = document.querySelectorAll('.sidebar-link');
    const panels = document.querySelectorAll('.admin-panel');

    links.forEach(link => {
      link.addEventListener('click', () => {
        const target = link.dataset.panel;

        links.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        panels.forEach(p => p.classList.remove('active'));
        document.getElementById(`panel-${target}`).classList.add('active');

        // Close mobile sidebar
        document.getElementById('adminSidebar').classList.remove('open');
      });
    });

    // Quick actions
    document.querySelectorAll('[data-goto]').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.goto;
        links.forEach(l => {
          l.classList.remove('active');
          if (l.dataset.panel === target) l.classList.add('active');
        });
        panels.forEach(p => p.classList.remove('active'));
        document.getElementById(`panel-${target}`).classList.add('active');
      });
    });
  }

  function initMobileSidebar() {
    const toggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('adminSidebar');
    if (toggle) {
      toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
    }
  }

  /* ================================================================
     DASHBOARD
     ================================================================ */
  function initDashboard() {
    const data = DataStore.getAll();
    const stats = [
      { icon: '💡', value: data.skills.length, label: 'Skills' },
      { icon: '🚀', value: data.projects.length, label: 'Projects' },
      { icon: '💼', value: data.experience.length, label: 'Experience' },
      { icon: '💬', value: data.testimonials.length, label: 'Testimonials' }
    ];

    document.getElementById('dashStats').innerHTML = stats.map(s => `
      <div class="dash-stat-card">
        <div class="dash-stat-icon">${s.icon}</div>
        <div class="dash-stat-value">${s.value}</div>
        <div class="dash-stat-label">${s.label}</div>
      </div>
    `).join('');
  }

  /* ================================================================
     PROFILE
     ================================================================ */
  function initProfile() {
    const profile = DataStore.get('profile');

    document.getElementById('profileName').value = profile.name;
    document.getElementById('profileBio').value = profile.bio;
    document.getElementById('profileAvatar').value = profile.avatar || '';
    document.getElementById('profileResume').value = profile.resumeLink || '';

    // Render roles tags
    renderRolesTags(profile.roles);

    // Render stats editors
    renderProfileStats(profile.stats);

    // Roles input
    const rolesInput = document.getElementById('rolesInput');
    rolesInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const val = rolesInput.value.trim();
        if (val) {
          const profile = DataStore.get('profile');
          profile.roles.push(val);
          DataStore.set('profile', profile);
          renderRolesTags(profile.roles);
          rolesInput.value = '';
        }
      }
    });

    // Save profile
    document.getElementById('profileForm').addEventListener('submit', e => {
      e.preventDefault();
      try {
        const profile = DataStore.get('profile');
        profile.name = document.getElementById('profileName').value.trim();
        profile.bio = document.getElementById('profileBio').value.trim();
        profile.avatar = document.getElementById('profileAvatar').value.trim();
        profile.resumeLink = document.getElementById('profileResume').value.trim();

        // Gather stats
        const statInputs = document.querySelectorAll('.stat-editor-row');
        profile.stats = Array.from(statInputs).map(row => ({
          label: row.querySelector('.stat-label-input').value || 'Untitled',
          value: parseInt(row.querySelector('.stat-value-input').value, 10) || 0
        }));

        DataStore.set('profile', profile);
        toast('✅ Profile saved! Refresh portfolio to see changes.');
        initDashboard();
      } catch (err) {
        console.error('Profile save error:', err);
        toast('❌ Error saving profile: ' + err.message, true);
      }
    });
  }

  function renderRolesTags(roles) {
    const wrapper = document.getElementById('rolesWrapper');
    const input = document.getElementById('rolesInput');
    // Remove existing tags
    wrapper.querySelectorAll('.tag-pill').forEach(t => t.remove());
    // Add tags before input
    roles.forEach((role, i) => {
      const tag = document.createElement('span');
      tag.className = 'tag-pill';
      tag.innerHTML = `${role} <span class="tag-remove" data-index="${i}">×</span>`;
      wrapper.insertBefore(tag, input);
    });

    // Remove handler
    wrapper.querySelectorAll('.tag-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index, 10);
        const profile = DataStore.get('profile');
        profile.roles.splice(idx, 1);
        DataStore.set('profile', profile);
        renderRolesTags(profile.roles);
      });
    });
  }

  function renderProfileStats(stats) {
    const container = document.getElementById('profileStatsContainer');
    container.innerHTML = stats.map((s, i) => `
      <div class="stat-editor-row form-row" style="margin-bottom:0.75rem;">
        <div class="form-group" style="margin-bottom:0;">
          <input type="text" class="stat-label-input" value="${s.label}" placeholder="Label">
        </div>
        <div class="form-group" style="margin-bottom:0; display:flex; gap:0.5rem;">
          <input type="number" class="stat-value-input" value="${s.value}" placeholder="Value" style="flex:1;">
          <button type="button" class="btn btn-secondary" onclick="this.closest('.stat-editor-row').remove()" style="padding:0.5rem 0.8rem; font-size:0.85rem;">×</button>
        </div>
      </div>
    `).join('') + `
      <button type="button" class="add-item-btn" style="margin-top:0.5rem;" onclick="addProfileStat()">+ Add Stat</button>
    `;
  }

  // Expose to global for inline onclick
  window.addProfileStat = function() {
    const container = document.getElementById('profileStatsContainer');
    const addBtn = container.querySelector('.add-item-btn');
    const row = document.createElement('div');
    row.className = 'stat-editor-row form-row';
    row.style.marginBottom = '0.75rem';
    row.innerHTML = `
      <div class="form-group" style="margin-bottom:0;">
        <input type="text" class="stat-label-input" value="" placeholder="Label">
      </div>
      <div class="form-group" style="margin-bottom:0; display:flex; gap:0.5rem;">
        <input type="number" class="stat-value-input" value="0" placeholder="Value" style="flex:1;">
        <button type="button" class="btn btn-secondary" onclick="this.closest('.stat-editor-row').remove()" style="padding:0.5rem 0.8rem; font-size:0.85rem;">×</button>
      </div>
    `;
    container.insertBefore(row, addBtn);
  };

  /* ================================================================
     SKILLS
     ================================================================ */
  function initSkills() {
    renderSkillsList();

    document.getElementById('addSkillBtn').addEventListener('click', () => {
      openModal('Add Skill', getSkillFormHTML(), (form) => {
        const skills = DataStore.get('skills');
        skills.push({
          name: form.querySelector('#modalSkillName').value.trim(),
          category: form.querySelector('#modalSkillCategory').value.trim(),
          level: parseInt(form.querySelector('#modalSkillLevel').value, 10) || 50
        });
        DataStore.set('skills', skills);
        renderSkillsList();
        initDashboard();
        toast('✅ Skill added! Refresh portfolio to see changes.');
      });
    });
  }

  function renderSkillsList() {
    const skills = DataStore.get('skills');
    document.getElementById('skillsList').innerHTML = skills.map((s, i) => `
      <div class="admin-list-item">
        <div class="list-item-info">
          <div class="list-item-title">${s.name}</div>
          <div class="list-item-subtitle">${s.category} • ${s.level}%</div>
        </div>
        <div class="list-item-actions">
          <button class="edit-btn" data-index="${i}" data-type="skill" title="Edit">✏️</button>
          <button class="delete-btn" data-index="${i}" data-type="skill" title="Delete">🗑️</button>
        </div>
      </div>
    `).join('');

    // Bind edit/delete
    document.querySelectorAll('#skillsList .edit-btn').forEach(btn => {
      btn.addEventListener('click', () => editSkill(parseInt(btn.dataset.index)));
    });
    document.querySelectorAll('#skillsList .delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('Delete this skill?')) {
          const skills = DataStore.get('skills');
          skills.splice(parseInt(btn.dataset.index), 1);
          DataStore.set('skills', skills);
          renderSkillsList();
          initDashboard();
          toast('Skill deleted.');
        }
      });
    });
  }

  function editSkill(index) {
    const skills = DataStore.get('skills');
    const s = skills[index];
    openModal('Edit Skill', getSkillFormHTML(s), (form) => {
      skills[index] = {
        name: form.querySelector('#modalSkillName').value.trim(),
        category: form.querySelector('#modalSkillCategory').value.trim(),
        level: parseInt(form.querySelector('#modalSkillLevel').value, 10) || 50
      };
      DataStore.set('skills', skills);
      renderSkillsList();
      toast('✅ Skill updated!');
    });
  }

  function getSkillFormHTML(s = {}) {
    return `
      <div class="form-group">
        <label for="modalSkillName">Skill Name</label>
        <input type="text" id="modalSkillName" value="${s.name || ''}" placeholder="e.g., JavaScript">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="modalSkillCategory">Category</label>
          <select id="modalSkillCategory">
            ${['Frontend','Backend','DevOps','Design','Other'].map(c =>
              `<option value="${c}" ${s.category === c ? 'selected' : ''}>${c}</option>`
            ).join('')}
          </select>
        </div>
        <div class="form-group">
          <label for="modalSkillLevel">Proficiency (%)</label>
          <input type="number" id="modalSkillLevel" value="${s.level || 50}" min="0" max="100">
        </div>
      </div>
    `;
  }

  /* ================================================================
     PROJECTS
     ================================================================ */
  function initProjects() {
    renderProjectsList();

    document.getElementById('addProjectBtn').addEventListener('click', () => {
      openModal('Add Project', getProjectFormHTML(), (form) => {
        const projects = DataStore.get('projects');
        projects.push({
          id: DataStore.nextId('projects'),
          title: form.querySelector('#modalProjTitle').value.trim(),
          description: form.querySelector('#modalProjDesc').value.trim(),
          image: form.querySelector('#modalProjImage').value.trim(),
          tags: form.querySelector('#modalProjTags').value.split(',').map(t => t.trim()).filter(Boolean),
          liveUrl: form.querySelector('#modalProjLive').value.trim(),
          githubUrl: form.querySelector('#modalProjGithub').value.trim(),
          category: form.querySelector('#modalProjCategory').value.trim(),
          featured: form.querySelector('#modalProjFeatured').checked
        });
        DataStore.set('projects', projects);
        renderProjectsList();
        initDashboard();
        toast('✅ Project added! Refresh portfolio to see changes.');
      });
    });
  }

  function renderProjectsList() {
    const projects = DataStore.get('projects');
    document.getElementById('projectsList').innerHTML = projects.map((p, i) => `
      <div class="admin-list-item">
        <div class="list-item-info">
          <div class="list-item-title">${p.title} ${p.featured ? '⭐' : ''}</div>
          <div class="list-item-subtitle">${p.category} • ${p.tags.join(', ')}</div>
        </div>
        <div class="list-item-actions">
          <button class="edit-btn" data-index="${i}" title="Edit">✏️</button>
          <button class="delete-btn" data-index="${i}" title="Delete">🗑️</button>
        </div>
      </div>
    `).join('');

    document.querySelectorAll('#projectsList .edit-btn').forEach(btn => {
      btn.addEventListener('click', () => editProject(parseInt(btn.dataset.index)));
    });
    document.querySelectorAll('#projectsList .delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('Delete this project?')) {
          const projects = DataStore.get('projects');
          projects.splice(parseInt(btn.dataset.index), 1);
          DataStore.set('projects', projects);
          renderProjectsList();
          initDashboard();
          toast('Project deleted.');
        }
      });
    });
  }

  function editProject(index) {
    const projects = DataStore.get('projects');
    const p = projects[index];
    openModal('Edit Project', getProjectFormHTML(p), (form) => {
      projects[index] = {
        ...projects[index],
        title: form.querySelector('#modalProjTitle').value.trim(),
        description: form.querySelector('#modalProjDesc').value.trim(),
        image: form.querySelector('#modalProjImage').value.trim(),
        tags: form.querySelector('#modalProjTags').value.split(',').map(t => t.trim()).filter(Boolean),
        liveUrl: form.querySelector('#modalProjLive').value.trim(),
        githubUrl: form.querySelector('#modalProjGithub').value.trim(),
        category: form.querySelector('#modalProjCategory').value.trim(),
        featured: form.querySelector('#modalProjFeatured').checked
      };
      DataStore.set('projects', projects);
      renderProjectsList();
      toast('✅ Project updated!');
    });
  }

  function getProjectFormHTML(p = {}) {
    return `
      <div class="form-group">
        <label for="modalProjTitle">Project Title</label>
        <input type="text" id="modalProjTitle" value="${p.title || ''}" placeholder="My Awesome Project">
      </div>
      <div class="form-group">
        <label for="modalProjDesc">Description</label>
        <textarea id="modalProjDesc" rows="3" placeholder="Brief description...">${p.description || ''}</textarea>
      </div>
      <div class="form-group">
        <label for="modalProjImage">Image URL</label>
        <input type="url" id="modalProjImage" value="${p.image || ''}" placeholder="https://example.com/screenshot.jpg">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="modalProjCategory">Category</label>
          <select id="modalProjCategory">
            ${['Web App','Mobile','AI / ML','Creative','Other'].map(c =>
              `<option value="${c}" ${p.category === c ? 'selected' : ''}>${c}</option>`
            ).join('')}
          </select>
        </div>
        <div class="form-group">
          <label for="modalProjTags">Tags (comma-separated)</label>
          <input type="text" id="modalProjTags" value="${(p.tags || []).join(', ')}" placeholder="React, Node.js">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="modalProjLive">Live Demo URL</label>
          <input type="url" id="modalProjLive" value="${p.liveUrl || ''}" placeholder="https://...">
        </div>
        <div class="form-group">
          <label for="modalProjGithub">GitHub URL</label>
          <input type="url" id="modalProjGithub" value="${p.githubUrl || ''}" placeholder="https://github.com/...">
        </div>
      </div>
      <div class="form-group" style="display:flex;align-items:center;gap:0.75rem;">
        <input type="checkbox" id="modalProjFeatured" ${p.featured ? 'checked' : ''} style="width:auto;">
        <label for="modalProjFeatured" style="margin:0;">Featured Project</label>
      </div>
    `;
  }

  /* ================================================================
     EXPERIENCE
     ================================================================ */
  function initExperience() {
    renderExperienceList();

    document.getElementById('addExpBtn').addEventListener('click', () => {
      openModal('Add Experience', getExpFormHTML(), (form) => {
        const experience = DataStore.get('experience');
        experience.push({
          id: DataStore.nextId('experience'),
          role: form.querySelector('#modalExpRole').value.trim(),
          company: form.querySelector('#modalExpCompany').value.trim(),
          period: form.querySelector('#modalExpPeriod').value.trim(),
          description: form.querySelector('#modalExpDesc').value.trim(),
          type: form.querySelector('#modalExpType').value
        });
        DataStore.set('experience', experience);
        renderExperienceList();
        initDashboard();
        toast('✅ Experience added!');
      });
    });
  }

  function renderExperienceList() {
    const experience = DataStore.get('experience');
    document.getElementById('experienceList').innerHTML = experience.map((e, i) => `
      <div class="admin-list-item">
        <div class="list-item-info">
          <div class="list-item-title">${e.role}</div>
          <div class="list-item-subtitle">${e.company} • ${e.period} • ${e.type}</div>
        </div>
        <div class="list-item-actions">
          <button class="edit-btn" data-index="${i}" title="Edit">✏️</button>
          <button class="delete-btn" data-index="${i}" title="Delete">🗑️</button>
        </div>
      </div>
    `).join('');

    document.querySelectorAll('#experienceList .edit-btn').forEach(btn => {
      btn.addEventListener('click', () => editExperience(parseInt(btn.dataset.index)));
    });
    document.querySelectorAll('#experienceList .delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('Delete this entry?')) {
          const exp = DataStore.get('experience');
          exp.splice(parseInt(btn.dataset.index), 1);
          DataStore.set('experience', exp);
          renderExperienceList();
          initDashboard();
          toast('Entry deleted.');
        }
      });
    });
  }

  function editExperience(index) {
    const experience = DataStore.get('experience');
    const e = experience[index];
    openModal('Edit Experience', getExpFormHTML(e), (form) => {
      experience[index] = {
        ...experience[index],
        role: form.querySelector('#modalExpRole').value.trim(),
        company: form.querySelector('#modalExpCompany').value.trim(),
        period: form.querySelector('#modalExpPeriod').value.trim(),
        description: form.querySelector('#modalExpDesc').value.trim(),
        type: form.querySelector('#modalExpType').value
      };
      DataStore.set('experience', experience);
      renderExperienceList();
      toast('✅ Experience updated!');
    });
  }

  function getExpFormHTML(e = {}) {
    return `
      <div class="form-group">
        <label for="modalExpRole">Role / Title</label>
        <input type="text" id="modalExpRole" value="${e.role || ''}" placeholder="Senior Developer">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="modalExpCompany">Company / Institution</label>
          <input type="text" id="modalExpCompany" value="${e.company || ''}" placeholder="Tech Corp">
        </div>
        <div class="form-group">
          <label for="modalExpPeriod">Time Period</label>
          <input type="text" id="modalExpPeriod" value="${e.period || ''}" placeholder="2022 — Present">
        </div>
      </div>
      <div class="form-group">
        <label for="modalExpDesc">Description</label>
        <textarea id="modalExpDesc" rows="3" placeholder="What did you accomplish?">${e.description || ''}</textarea>
      </div>
      <div class="form-group">
        <label for="modalExpType">Type</label>
        <select id="modalExpType">
          <option value="work" ${e.type === 'work' ? 'selected' : ''}>Work</option>
          <option value="education" ${e.type === 'education' ? 'selected' : ''}>Education</option>
        </select>
      </div>
    `;
  }

  /* ================================================================
     TESTIMONIALS
     ================================================================ */
  function initTestimonials() {
    renderTestimonialsList();

    document.getElementById('addTestimonialBtn').addEventListener('click', () => {
      openModal('Add Testimonial', getTestimonialFormHTML(), (form) => {
        const testimonials = DataStore.get('testimonials');
        testimonials.push({
          id: DataStore.nextId('testimonials'),
          name: form.querySelector('#modalTestName').value.trim(),
          role: form.querySelector('#modalTestRole').value.trim(),
          quote: form.querySelector('#modalTestQuote').value.trim(),
          avatar: form.querySelector('#modalTestAvatar').value.trim()
        });
        DataStore.set('testimonials', testimonials);
        renderTestimonialsList();
        initDashboard();
        toast('✅ Testimonial added!');
      });
    });
  }

  function renderTestimonialsList() {
    const testimonials = DataStore.get('testimonials');
    document.getElementById('testimonialsList').innerHTML = testimonials.map((t, i) => `
      <div class="admin-list-item">
        <div class="list-item-info">
          <div class="list-item-title">${t.name}</div>
          <div class="list-item-subtitle">${t.role}</div>
        </div>
        <div class="list-item-actions">
          <button class="edit-btn" data-index="${i}" title="Edit">✏️</button>
          <button class="delete-btn" data-index="${i}" title="Delete">🗑️</button>
        </div>
      </div>
    `).join('');

    document.querySelectorAll('#testimonialsList .edit-btn').forEach(btn => {
      btn.addEventListener('click', () => editTestimonial(parseInt(btn.dataset.index)));
    });
    document.querySelectorAll('#testimonialsList .delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('Delete this testimonial?')) {
          const test = DataStore.get('testimonials');
          test.splice(parseInt(btn.dataset.index), 1);
          DataStore.set('testimonials', test);
          renderTestimonialsList();
          initDashboard();
          toast('Testimonial deleted.');
        }
      });
    });
  }

  function editTestimonial(index) {
    const testimonials = DataStore.get('testimonials');
    const t = testimonials[index];
    openModal('Edit Testimonial', getTestimonialFormHTML(t), (form) => {
      testimonials[index] = {
        ...testimonials[index],
        name: form.querySelector('#modalTestName').value.trim(),
        role: form.querySelector('#modalTestRole').value.trim(),
        quote: form.querySelector('#modalTestQuote').value.trim(),
        avatar: form.querySelector('#modalTestAvatar').value.trim()
      };
      DataStore.set('testimonials', testimonials);
      renderTestimonialsList();
      toast('✅ Testimonial updated!');
    });
  }

  function getTestimonialFormHTML(t = {}) {
    return `
      <div class="form-group">
        <label for="modalTestName">Person's Name</label>
        <input type="text" id="modalTestName" value="${t.name || ''}" placeholder="Jane Doe">
      </div>
      <div class="form-group">
        <label for="modalTestRole">Role / Title</label>
        <input type="text" id="modalTestRole" value="${t.role || ''}" placeholder="CEO, Company Inc.">
      </div>
      <div class="form-group">
        <label for="modalTestQuote">Testimonial Quote</label>
        <textarea id="modalTestQuote" rows="4" placeholder="What did they say?">${t.quote || ''}</textarea>
      </div>
      <div class="form-group">
        <label for="modalTestAvatar">Avatar URL (optional)</label>
        <input type="url" id="modalTestAvatar" value="${t.avatar || ''}" placeholder="https://example.com/photo.jpg">
      </div>
    `;
  }

  /* ================================================================
     CONTACT INFO
     ================================================================ */
  function initContactInfo() {
    const contact = DataStore.get('contact');
    document.getElementById('contactEmailField').value = contact.email || '';
    document.getElementById('contactLocation').value = contact.location || '';
    document.getElementById('contactGithub').value = contact.github || '';
    document.getElementById('contactLinkedin').value = contact.linkedin || '';
    document.getElementById('contactTwitter').value = contact.twitter || '';

    document.getElementById('contactInfoForm').addEventListener('submit', e => {
      e.preventDefault();
      DataStore.set('contact', {
        email: document.getElementById('contactEmailField').value.trim(),
        location: document.getElementById('contactLocation').value.trim(),
        github: document.getElementById('contactGithub').value.trim(),
        linkedin: document.getElementById('contactLinkedin').value.trim(),
        twitter: document.getElementById('contactTwitter').value.trim()
      });
      toast('✅ Contact info saved! Refresh portfolio to see changes.');
    });
  }

  /* ================================================================
     THEME
     ================================================================ */
  function initTheme() {
    const theme = DataStore.get('theme');

    const colorFields = [
      { picker: 'themePrimary', hex: 'themePrimaryHex', key: 'primaryColor' },
      { picker: 'themeSecondary', hex: 'themeSecondaryHex', key: 'secondaryColor' },
      { picker: 'themeAccent', hex: 'themeAccentHex', key: 'accentColor' },
      { picker: 'themeBg', hex: 'themeBgHex', key: 'bgColor' },
      { picker: 'themeSurface', hex: 'themeSurfaceHex', key: 'surfaceColor' },
      { picker: 'themeText', hex: 'themeTextHex', key: 'textColor' }
    ];

    // Populate values
    colorFields.forEach(f => {
      const val = theme[f.key];
      document.getElementById(f.picker).value = val;
      document.getElementById(f.hex).value = val;
    });

    // Sync color picker <-> hex input
    colorFields.forEach(f => {
      const picker = document.getElementById(f.picker);
      const hex = document.getElementById(f.hex);

      picker.addEventListener('input', () => {
        hex.value = picker.value;
      });

      hex.addEventListener('input', () => {
        if (/^#[0-9a-fA-F]{6}$/.test(hex.value)) {
          picker.value = hex.value;
        }
      });
    });

    // Save theme
    document.getElementById('themeForm').addEventListener('submit', e => {
      e.preventDefault();
      const newTheme = { ...theme };
      colorFields.forEach(f => {
        newTheme[f.key] = document.getElementById(f.hex).value;
      });
      DataStore.set('theme', newTheme);
      DataStore.applyTheme();
      toast('Theme saved! Open portfolio to see changes.');
    });

    // Reset theme
    document.getElementById('resetThemeBtn').addEventListener('click', () => {
      if (confirm('Reset theme to defaults?')) {
        const defaults = DataStore.getDefaults();
        DataStore.set('theme', defaults.theme);
        DataStore.applyTheme();
        initTheme(); // Re-populate
        toast('Theme reset to defaults.');
      }
    });
  }

  /* ================================================================
     SETTINGS
     ================================================================ */
  function initSettings() {
    const settings = DataStore.get('settings');
    document.getElementById('settingsTitle').value = settings.siteTitle || '';

    document.getElementById('settingsForm').addEventListener('submit', e => {
      e.preventDefault();
      const settings = DataStore.get('settings');
      settings.siteTitle = document.getElementById('settingsTitle').value.trim();

      const newPw = document.getElementById('settingsNewPassword').value;
      const confirmPw = document.getElementById('settingsConfirmPassword').value;
      if (newPw) {
        if (newPw !== confirmPw) {
          toast('Passwords do not match!', true);
          return;
        }
        settings.password = newPw;
      }

      DataStore.set('settings', settings);
      document.getElementById('settingsNewPassword').value = '';
      document.getElementById('settingsConfirmPassword').value = '';
      toast('Settings saved!');
    });

    // Export
    document.getElementById('exportBtn').addEventListener('click', () => {
      DataStore.exportData();
      toast('Backup downloaded!');
    });

    // Import
    const dropZone = document.getElementById('importDropZone');
    const fileInput = document.getElementById('importFileInput');

    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', e => {
      e.preventDefault();
      dropZone.style.borderColor = 'var(--primary)';
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.style.borderColor = '';
    });

    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.style.borderColor = '';
      const file = e.dataTransfer.files[0];
      if (file) importFile(file);
    });

    fileInput.addEventListener('change', () => {
      if (fileInput.files[0]) importFile(fileInput.files[0]);
    });

    // Reset all
    document.getElementById('resetAllBtn').addEventListener('click', () => {
      if (confirm('⚠ Are you sure you want to reset ALL data? This cannot be undone!')) {
        if (confirm('This is your last chance. Really reset everything?')) {
          DataStore.resetToDefaults();
          toast('All data reset to defaults. Refreshing...');
          setTimeout(() => location.reload(), 1500);
        }
      }
    });
  }

  function importFile(file) {
    const reader = new FileReader();
    reader.onload = e => {
      const result = DataStore.importData(e.target.result);
      if (result.success) {
        toast('Data imported successfully! Refreshing...');
        setTimeout(() => location.reload(), 1500);
      } else {
        toast('Import failed: ' + result.error, true);
      }
    };
    reader.readAsText(file);
  }

  /* ================================================================
     MODAL
     ================================================================ */
  function openModal(title, bodyHTML, onSave) {
    const overlay = document.getElementById('modalOverlay');
    const modal = document.getElementById('modalContent');

    modal.innerHTML = `
      <h2>${title}</h2>
      <form id="modalForm" class="admin-form">
        ${bodyHTML}
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" id="modalCancelBtn">Cancel</button>
          <button type="submit" class="btn btn-primary">💾 Save</button>
        </div>
      </form>
    `;

    overlay.classList.add('open');

    document.getElementById('modalCancelBtn').addEventListener('click', () => {
      overlay.classList.remove('open');
    });

    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.classList.remove('open');
    });

    document.getElementById('modalForm').addEventListener('submit', e => {
      e.preventDefault();
      onSave(modal);
      overlay.classList.remove('open');
    });
  }

  /* ================================================================
     TOAST NOTIFICATION
     ================================================================ */
  function toast(message, isError = false) {
    const el = document.getElementById('toast');
    el.textContent = message;
    el.className = 'admin-toast show' + (isError ? ' error' : '');
    setTimeout(() => {
      el.classList.remove('show');
    }, 3000);
  }
});
