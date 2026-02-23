const APP_STORAGE_KEY = 'bdma-progress';

const sections = Array.from({ length: 5 }).map((_, idx) => ({
  id: idx + 1,
  title: `Section ${idx + 1}`,
  courses: Array.from({ length: 10 }).map((__, c) => ({
    id: `s${idx + 1}c${c + 1}`,
    title: `Course ${c + 1}`,
    desc: 'Strategy, leadership & wealth systems'
  }))
}));

function getProgress() {
  return JSON.parse(localStorage.getItem(APP_STORAGE_KEY) || '{}');
}

function setProgress(progress) {
  localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(progress));
}

function percentDone() {
  const progress = getProgress();
  const total = sections.reduce((t, s) => t + s.courses.length, 0);
  const done = Object.values(progress).filter(Boolean).length;
  return Math.round((done / total) * 100);
}

function renderHomepage() {
  const container = document.querySelector('#sections');
  if (!container) return;
  const progress = getProgress();

  container.innerHTML = sections.map(s => `
    <article class="glass section" id="section-${s.id}">
      <h3>${s.title}</h3>
      <p class="muted">${s.courses.length} elite courses</p>
      <div class="course-grid">
        ${s.courses.map(c => {
          const done = !!progress[c.id];
          return `<a class="bubble ${done ? 'done sparkle' : ''}" href="course.html?course=${c.id}">
            <strong>${c.title}</strong>
            <div class="desc">${c.desc}</div>
          </a>`;
        }).join('')}
      </div>
    </article>`).join('');

  document.querySelector('#completionRate').textContent = `${percentDone()}% complete`;
  const sidebarLinks = document.querySelector('#sidebarLinks');
  if (sidebarLinks) {
    sidebarLinks.innerHTML = sections.map(s => `<a href="#section-${s.id}">Section ${s.id}</a>`).join('') +
      '<a href="progress.html">Progress Tracker</a><a href="profile.html">Profile</a><a href="settings.html">Settings</a>';
  }
}

function initSidebar() {
  const toggle = document.querySelector('#menuBtn');
  const sidebar = document.querySelector('#sidebar');
  if (!toggle || !sidebar) return;
  toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
}

function initSignup() {
  const form = document.querySelector('#signupForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const pass = form.password.value;
    const confirm = form.confirm_password.value;
    const error = document.querySelector('#errorBubble');
    if (pass.length < 6 || pass !== confirm) {
      error.style.display = 'inline-block';
      error.textContent = 'Try Again — passwords must match and be at least 6 characters.';
      error.classList.remove('shake');
      void error.offsetWidth;
      error.classList.add('shake');
      return;
    }
    localStorage.setItem('bdma-user', JSON.stringify({
      name: form.name.value,
      email: form.email.value
    }));
    location.href = 'homepage.html';
  });
}

function initCoursePage() {
  const courseTitle = document.querySelector('#courseTitle');
  if (!courseTitle) return;
  const courseId = new URLSearchParams(location.search).get('course') || 's1c1';
  const course = sections.flatMap(s => s.courses).find(c => c.id === courseId) || sections[0].courses[0];
  courseTitle.textContent = `${course.title} — Elite Lab`;
  const progressBar = document.querySelector('#courseProgress');
  progressBar.style.width = `${percentDone()}%`;

  document.querySelector('#completeBtn').addEventListener('click', () => {
    const progress = getProgress();
    progress[course.id] = true;
    setProgress(progress);
    location.href = 'homepage.html?spark=' + course.id;
  });
}

function initProgressPage() {
  const holder = document.querySelector('#timeline');
  if (!holder) return;
  const progress = getProgress();
  holder.innerHTML = sections.map(s => {
    const doneCount = s.courses.filter(c => progress[c.id]).length;
    return `<section class="glass milestone">
      <h3>${s.title}</h3>
      <p class="muted">${doneCount}/${s.courses.length} completed</p>
      <div class="mini-bubbles"><span></span><span></span><span></span></div>
    </section>`;
  }).join('');
}

function initProfile() {
  const form = document.querySelector('#profileForm');
  if (!form) return;
  const user = JSON.parse(localStorage.getItem('bdma-user') || '{}');
  form.name.value = user.name || '';
  form.email.value = user.email || '';
  form.addEventListener('submit', e => {
    e.preventDefault();
    localStorage.setItem('bdma-user', JSON.stringify({ name: form.name.value, email: form.email.value }));
    alert('Profile updated.');
  });
}

function initSettings() {
  const themeToggle = document.querySelector('#themeToggle');
  if (!themeToggle) return;
  const light = localStorage.getItem('bdma-light') === '1';
  themeToggle.checked = light;
  if (light) document.body.style.filter = 'invert(1) hue-rotate(180deg)';
  themeToggle.addEventListener('change', () => {
    localStorage.setItem('bdma-light', themeToggle.checked ? '1' : '0');
    location.reload();
  });
}

function initParallax() {
  const parallax = document.querySelector('[data-parallax]');
  if (!parallax) return;
  window.addEventListener('mousemove', e => {
    const x = (e.clientX / window.innerWidth - 0.5) * 16;
    const y = (e.clientY / window.innerHeight - 0.5) * 16;
    parallax.style.transform = `translate(${x}px, ${y}px)`;
  });
}

renderHomepage();
initSidebar();
initSignup();
initCoursePage();
initProgressPage();
initProfile();
initSettings();
initParallax();
