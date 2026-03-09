/* ============================================================
   SAPTHAGIRI NPS UNIVERSITY — AI & DATA SCIENCE DEPT
   app.js  |  All site logic lives here
   ============================================================ */

"use strict";

// ════════════════════════════════════════════════════════════
//  SECURITY CONFIG  — edit these values to change behaviour
// ════════════════════════════════════════════════════════════
const SEC = {
  MAX_ATTEMPTS: 5, // lock after this many wrong tries
  LOCKOUT_MS: 15 * 60 * 1000, // lockout duration: 15 minutes
  SESSION_MS: 30 * 60 * 1000, // auto-logout after 30 min idle
};

// ════════════════════════════════════════════════════════════
//  SIMPLE HASH  (SHA-256 via Web Crypto — no plain-text pw stored)
// ════════════════════════════════════════════════════════════
async function sha256(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// ════════════════════════════════════════════════════════════
//  STORAGE KEYS
// ════════════════════════════════════════════════════════════
const K = {
  ev: "aids4_ev",
  not: "aids4_not",
  gal: "aids4_gal",
  fac: "aids4_fac",
  abt: "aids4_abt",
  con: "aids4_con",
  st: "aids4_st",
  pwh: "aids4_pwh", // stores HASH not plain text
  lock: "aids4_lock", // lockout expiry timestamp
  att: "aids4_att", // failed attempt count
};

const ld = (k, d) => {
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : d;
  } catch {
    return d;
  }
};
const sv = (k, v) => localStorage.setItem(k, JSON.stringify(v));

// ════════════════════════════════════════════════════════════
//  DEFAULT DATA
// ════════════════════════════════════════════════════════════
const DEV = [{
    id: 1,
    title: "National AI Hackathon 2025",
    date: "2025-09-15",
    time: "09:00",
    venue: "Main Auditorium",
    type: "Hackathon",
    desc: "36-hour national-level hackathon solving real-world problems using AI. All UG & PG students eligible.",
    photo: null,
    regUrl: "",
    regLabel: "🖊 Register / RSVP",
    maxReg: 100,
    curReg: 62
  },
  {
    id: 2,
    title: "Data Science Bootcamp",
    date: "2025-08-28",
    time: "10:00",
    venue: "Seminar Hall 2",
    type: "Workshop",
    desc: "2-day intensive bootcamp on Python, Pandas, ML pipelines and model deployment. Certificate provided.",
    photo: null,
    regUrl: "",
    regLabel: "🖊 Register / RSVP",
    maxReg: 80,
    curReg: 76
  },
  {
    id: 3,
    title: "Future of Generative AI",
    date: "2025-08-05",
    time: "11:00",
    venue: "Conference Room A",
    type: "Guest Lecture",
    desc: "Industry speaker on LLMs, prompt engineering and AI product development.",
    photo: null,
    regUrl: "",
    regLabel: "🖊 Register / RSVP",
    maxReg: 60,
    curReg: 44
  },
  {
    id: 4,
    title: "TechCorp Campus Placement",
    date: "2025-09-12",
    time: "08:30",
    venue: "Placement Cell",
    type: "Placement",
    desc: "Campus placement drive by TechCorp. Eligible: 7 CGPA and above, all branches.",
    photo: null,
    regUrl: "",
    regLabel: "🖊 Register Now",
    maxReg: 0,
    curReg: 0
  },
  {
    id: 5,
    title: "Annual Technical Symposium",
    date: "2025-10-10",
    time: "09:00",
    venue: "Block A — Ground Floor",
    type: "Conference",
    desc: "Department-level symposium with paper presentations, poster exhibitions and project demos.",
    photo: null,
    regUrl: "",
    regLabel: "🖊 Submit Paper",
    maxReg: 50,
    curReg: 28
  },
  {
    id: 6,
    title: "Cloud & MLOps Workshop",
    date: "2025-10-22",
    time: "10:00",
    venue: "Computer Lab 3",
    type: "Workshop",
    desc: "Hands-on session on AWS, GCP, deployment pipelines and MLOps fundamentals.",
    photo: null,
    regUrl: "",
    regLabel: "🖊 Register / RSVP",
    maxReg: 40,
    curReg: 15
  },
];

const DNO = [{
    id: 1,
    text: "Internal Assessment Schedule for August 2025 — check timetable on portal",
    date: "2025-07-01",
    tag: "Exam"
  },
  {
    id: 2,
    text: "Last date to submit mini-project titles: August 20, 2025",
    date: "2025-07-03",
    tag: "Academic"
  },
  {
    id: 3,
    text: "AI Hackathon 2025 registrations open — Register before September 1",
    date: "2025-07-05",
    tag: "Event"
  },
  {
    id: 4,
    text: "Placement drive by TechCorp on Sept 12 — Eligible: 7 CGPA and above",
    date: "2025-07-06",
    tag: "Placement"
  },
  {
    id: 5,
    text: "Seminar on Responsible AI — August 8 at main auditorium. Open to all.",
    date: "2025-07-08",
    tag: "Event"
  },
  {
    id: 6,
    text: "Library extended hours during exam season: 8 AM – 10 PM daily",
    date: "2025-07-10",
    tag: "General"
  },
];

const DGA = [{
    id: 1,
    caption: "Annual Tech Fest 2024",
    src: null
  }, {
    id: 2,
    caption: "Hackathon 2024 Winners",
    src: null
  },
  {
    id: 3,
    caption: "Data Science Workshop",
    src: null
  }, {
    id: 4,
    caption: "Guest Lecture Series",
    src: null
  },
  {
    id: 5,
    caption: "Deep Learning Lab Session",
    src: null
  }, {
    id: 6,
    caption: "Project Exhibition Day",
    src: null
  },
  {
    id: 7,
    caption: "Department Orientation 2024",
    src: null
  },
];

const DFA = [{
    id: 1,
    name: "Dr. Priya Sharma",
    role: "HOD & Professor",
    spec: "Machine Learning, AI Ethics",
    photo: null
  },
  {
    id: 2,
    name: "Prof. Rahul Menon",
    role: "Associate Professor",
    spec: "Deep Learning, Computer Vision",
    photo: null
  },
  {
    id: 3,
    name: "Dr. Anita Rao",
    role: "Assistant Professor",
    spec: "Data Mining, NLP",
    photo: null
  },
  {
    id: 4,
    name: "Prof. Vikram Nair",
    role: "Assistant Professor",
    spec: "Big Data, Cloud Computing",
    photo: null
  },
  {
    id: 5,
    name: "Dr. Sunita Joshi",
    role: "Assistant Professor",
    spec: "Statistics, Data Visualization",
    photo: null
  },
  {
    id: 6,
    name: "Prof. Arjun Patel",
    role: "Assistant Professor",
    spec: "Reinforcement Learning, Robotics",
    photo: null
  },
  {
    id: 7,
    name: "Dr. Meera Iyer",
    role: "Assistant Professor",
    spec: "Computer Vision, Image Processing",
    photo: null
  },
  {
    id: 8,
    name: "Prof. Kiran Kumar",
    role: "Lab Instructor",
    spec: "Python, Data Engineering",
    photo: null
  },
];

const DAB = {
  title: "Pioneering AI & Data Science Education",
  p1: "The Department of Artificial Intelligence and Data Science at Sapthagiri NPS University delivers world-class education at the intersection of technology, innovation, and real-world problem solving.",
  p2: "Our curriculum equips students with cutting-edge skills in machine learning, deep learning, data analytics and AI engineering — preparing them for tomorrow's digital economy.",
  p3: "With state-of-the-art labs, industry-aligned projects, and expert faculty, we create an environment where curiosity meets capability.",
  tags: "🧠 Machine Learning,📊 Data Analytics,🤖 Deep Learning,☁️ Cloud AI,🔬 Research,💡 Innovation",
  photo: null,
};

const DCO = {
  address: "#14/5, Chikkasandra, Hesarghatta Main Road, Bengaluru – 560057",
  phone: "9035922191 / 080-29633636",
  email: "dept.aids@snpsu.edu.in",
  hours: "Mon – Sat: 9:00 AM – 5:00 PM",
};

const DST = {
  students: 480,
  faculty: 18,
  events: 24,
  projects: 12
};

// ════════════════════════════════════════════════════════════
//  STATE
// ════════════════════════════════════════════════════════════
let S = {
  ev: ld(K.ev, DEV),
  not: ld(K.not, DNO),
  gal: ld(K.gal, DGA),
  fac: ld(K.fac, DFA),
  abt: ld(K.abt, DAB),
  con: ld(K.con, DCO),
  st: ld(K.st, DST),
};
let nid = {
  ev: 500,
  not: 500,
  gal: 500,
  fac: 500
};
let sessionTimer = null;

// ════════════════════════════════════════════════════════════
//  SECURITY HELPERS
// ════════════════════════════════════════════════════════════

// Default password hash of "snpsuads2025" — run sha256("snpsuads2025") once to get it
// Stored in localStorage; if first run, we store the hash of the default password
async function initPasswordHash() {
  if (!localStorage.getItem(K.pwh)) {
    const hash = await sha256("snpsuads2025");
    localStorage.setItem(K.pwh, hash);
  }
}

function isLockedOut() {
  const expiry = ld(K.lock, 0);
  if (Date.now() < expiry) return true;
  return false;
}

function getLockRemaining() {
  const expiry = ld(K.lock, 0);
  const rem = expiry - Date.now();
  if (rem <= 0) return null;
  const m = Math.ceil(rem / 60000);
  return m + " minute" + (m !== 1 ? "s" : "");
}

function recordFailedAttempt() {
  let att = ld(K.att, 0) + 1;
  sv(K.att, att);
  if (att >= SEC.MAX_ATTEMPTS) {
    sv(K.lock, Date.now() + SEC.LOCKOUT_MS);
    sv(K.att, 0);
  }
  return att;
}

function clearAttempts() {
  sv(K.att, 0);
  sv(K.lock, 0);
}

// Session management
function startSessionTimer() {
  clearSessionTimer();
  sessionTimer = setTimeout(() => {
    closeAdmin();
    toast("⏱ Session expired — you have been logged out.");
  }, SEC.SESSION_MS);
}

function clearSessionTimer() {
  if (sessionTimer) {
    clearTimeout(sessionTimer);
    sessionTimer = null;
  }
}

function resetSessionTimer() {
  if (document.getElementById("adminModal").classList.contains("open")) {
    startSessionTimer();
  }
}

// Reset idle timer on any interaction inside admin panel
document.addEventListener("click", resetSessionTimer);
document.addEventListener("keydown", resetSessionTimer);

// ════════════════════════════════════════════════════════════
//  COUNTDOWN TIMERS
// ════════════════════════════════════════════════════════════
const pad = n => String(n).padStart(2, "0");

function buildCD(dateStr, timeStr, el) {
  function tick() {
    const target = new Date(`${dateStr}T${timeStr || "00:00"}:00`);
    const diff = target - new Date();
    if (diff <= 0) {
      const d = Math.floor(-diff / 86400000);
      el.innerHTML = d === 0 ?
        `<span class="cd-today">🟢 HAPPENING TODAY</span>` :
        `<span class="cd-past">✓ Completed ${d}d ago</span>`;
      return;
    }
    const d = Math.floor(diff / 86400000),
      h = Math.floor((diff % 86400000) / 3600000),
      m = Math.floor((diff % 3600000) / 60000),
      sec = Math.floor((diff % 60000) / 1000);
    el.innerHTML = `
      <div class="cdu"><span class="cdn">${pad(d)}</span><span class="cdl">D</span></div>
      <span class="cdsep">:</span>
      <div class="cdu"><span class="cdn">${pad(h)}</span><span class="cdl">H</span></div>
      <span class="cdsep">:</span>
      <div class="cdu"><span class="cdn">${pad(m)}</span><span class="cdl">M</span></div>
      <span class="cdsep">:</span>
      <div class="cdu"><span class="cdn">${pad(sec)}</span><span class="cdl">S</span></div>`;
  }
  tick();
  el._ci = setInterval(tick, 1000);
}

// ════════════════════════════════════════════════════════════
//  RENDER FUNCTIONS
// ════════════════════════════════════════════════════════════
function renderAll() {
  renderTicker();
  renderNotices();
  renderEvents();
  renderGallery();
  renderFaculty();
  renderAbout();
  renderContact();
  renderStats();
}

function renderTicker() {
  const items = [
    "🎓 Welcome to Dept. of AI & Data Science",
    "🚀 Sapthagiri NPS University · Bengaluru",
    ...S.not.map(n => `📌 ${n.text}`),
  ];
  const all = [...items, ...items];
  document.getElementById("tickerTrack").innerHTML =
    all.map(i => `<span>${i}&nbsp;&nbsp;◆&nbsp;&nbsp;</span>`).join("");
}

function renderNotices() {
  document.getElementById("nbCnt").textContent = S.not.length + " notices";
  document.getElementById("noticeList").innerHTML = S.not.map(n => `
    <li class="ni">
      <div class="ni-top">
        <span class="ni-text">${n.text}</span>
        <span class="ni-pill">${n.tag}</span>
      </div>
      <div class="ni-date">${fmt(n.date)}</div>
    </li>`).join("");

  document.getElementById("featNotices").innerHTML = S.not.slice(0, 3).map((n, i) => `
    <div class="fn-card reveal reveal-left delay-${(i % 5) + 1}">
      <div class="fn-tag">${n.tag} · ${fmt(n.date)}</div>
      <div class="fn-text">${n.text}</div>
    </div>`).join("");
  observeReveal();
}

function renderEvents() {
  const grid = document.getElementById("eventsGrid");
  // Stop old countdown intervals
  grid.querySelectorAll(".ev-countdown").forEach(el => {
    if (el._ci) clearInterval(el._ci);
  });

  if (!S.ev.length) {
    grid.innerHTML = `<p style="color:var(--mu);grid-column:1/-1;text-align:center;padding:3rem">No events yet. Add from Admin Panel.</p>`;
    return;
  }

  grid.innerHTML = S.ev.map((ev, i) => {
    const thumb = ev.photo ?
      `<img src="${ev.photo}" alt="${ev.title}"/>` :
      `<div class="ev-thumb-ph">🎯</div>`;

    let regBarHTML = "";
    if (ev.maxReg > 0) {
      const pct = Math.min(100, Math.round((ev.curReg / ev.maxReg) * 100));
      const fillColor = pct >= 90 ? "var(--red)" : pct >= 70 ? "var(--org)" : "var(--acc)";
      regBarHTML = `
        <div class="ev-reg-wrap">
          <div class="ev-reg-label">
            <span>Registrations</span>
            <strong>${ev.curReg}/${ev.maxReg}</strong>
          </div>
          <div class="ev-reg-bar">
            <div class="ev-reg-fill" style="width:${pct}%;background:linear-gradient(90deg,${fillColor},var(--acc2))"></div>
          </div>
        </div>`;
    }

    const hasUrl = ev.regUrl && ev.regUrl.trim() !== "";
    const btnLabel = ev.regLabel || "🖊 Register / RSVP";
    const regBtn = hasUrl ?
      `<a href="${ev.regUrl}" target="_blank" rel="noopener" class="ev-reg-btn">${btnLabel}</a>` :
      `<span class="ev-reg-btn no-url">🔒 Registration not open yet</span>`;

    let meta = `<span class="ev-meta-chip">📅 ${fmt(ev.date)}</span>`;
    if (ev.time) meta += `<span class="ev-meta-chip">🕐 ${fmtTime(ev.time)}</span>`;
    if (ev.venue) meta += `<span class="ev-meta-chip">📍 ${ev.venue}</span>`;

    return `
    <div class="ev-card reveal delay-${(i % 5) + 1}">
      <div class="ev-thumb-wrap">
        ${thumb}
        <div class="ev-type-badge">${ev.type}</div>
        <div class="ev-countdown" id="cd_${ev.id}"></div>
      </div>
      <div class="ev-body">
        <div class="ev-title">${ev.title}</div>
        <div class="ev-desc">${ev.desc.slice(0,100)}${ev.desc.length > 100 ? "…" : ""}</div>
        <div class="ev-meta">${meta}</div>
        ${regBarHTML}
        ${regBtn}
      </div>
    </div>`;
  }).join("");

  S.ev.forEach(ev => {
    const el = document.getElementById("cd_" + ev.id);
    if (el) buildCD(ev.date, ev.time, el);
  });
  observeReveal();
}

function renderGallery() {
  const g = document.getElementById("galleryGrid");
  if (!S.gal.length) {
    g.innerHTML = `<p style="color:var(--mu);text-align:center;padding:2rem;grid-column:1/-1">No photos yet.</p>`;
    return;
  }
  g.innerHTML = S.gal.map((item, i) => `
    <div class="gi reveal reveal-scale delay-${(i % 5) + 1}" onclick="openLb('${item.src || ""}','${item.caption}')">
      ${item.src ? `<img src="${item.src}" alt="${item.caption}"/>` : `<div class="gi-ph">📸</div>`}
      <div class="gi-ov"><span style="font-size:1.6rem">🔍</span></div>
      <div class="gi-cap">${item.caption}</div>
    </div>`).join("");
  observeReveal();
}

function renderFaculty() {
  document.getElementById("facCnt").textContent = S.fac.length;
  document.getElementById("facultyGrid").innerHTML = S.fac.map((f, i) => {
    const ini = f.name.replace(/^(Dr\.|Prof\.)\s*/i, "").split(" ").slice(0, 2).map(n => n[0]).join("");
    return `<div class="fac-card reveal delay-${(i % 5) + 1}">
      <div class="fav">${f.photo ? `<img src="${f.photo}" alt="${f.name}"/>` : ini}</div>
      <div class="fn">${f.name}</div>
      <div class="fr">${f.role}</div>
      <div class="fs">${f.spec || "—"}</div>
    </div>`;
  }).join("");
  observeReveal();
}

function renderAbout() {
  const a = S.abt;
  document.getElementById("aboutTitle").textContent = a.title;
  document.getElementById("aboutBody").innerHTML = `<p>${a.p1}</p><p>${a.p2}</p><p>${a.p3}</p>`;
  document.getElementById("aboutChips").innerHTML = a.tags.split(",").map(t => `<span class="chip">${t.trim()}</span>`).join("");
  const img = document.getElementById("aboutImg");
  const ph = document.getElementById("aboutImgPh");
  if (a.photo) {
    img.src = a.photo;
    img.style.display = "block";
    ph.style.display = "none";
  } else {
    // keep default building photo from images folder
    if (!img.src || img.src.endsWith("undefined") || img.src === window.location.href) {
      img.src = "images/college-building.jpg";
    }
    img.style.display = "block";
    ph.style.display = "none";
  }
}

function renderContact() {
  const c = S.con;
  document.getElementById("contactCards").innerHTML = `
    <div class="cc reveal delay-1"><div class="cc-icon">📍</div><div><div class="cc-lbl">Address</div><div class="cc-val">${c.address}</div></div></div>
    <div class="cc reveal delay-2"><div class="cc-icon">📞</div><div><div class="cc-lbl">Phone</div><div class="cc-val">${c.phone}</div></div></div>
    <div class="cc reveal delay-3"><div class="cc-icon">📧</div><div><div class="cc-lbl">Email</div><div class="cc-val">${c.email}</div></div></div>
    <div class="cc reveal delay-4"><div class="cc-icon">🕐</div><div><div class="cc-lbl">Hours</div><div class="cc-val">${c.hours}</div></div></div>`;
  observeReveal();
}

function renderStats() {
  countUp("sS", S.st.students);
  countUp("sF", S.st.faculty);
  countUp("sE", S.st.events);
  countUp("sP", S.st.projects);
  document.getElementById("pS").textContent = S.st.students;
  document.getElementById("pF").textContent = S.st.faculty;
  document.getElementById("pE").textContent = S.st.events;
  document.getElementById("pP").textContent = S.st.projects;
}

function countUp(id, target) {
  const el = document.getElementById(id);
  let v = 0;
  clearInterval(el._ci);
  el._ci = setInterval(() => {
    v = Math.min(v + Math.max(1, Math.ceil(target / 60)), target);
    el.textContent = v + "+";
    if (v >= target) clearInterval(el._ci);
  }, 22);
}

// ════════════════════════════════════════════════════════════
//  ADMIN LIST RENDER
// ════════════════════════════════════════════════════════════
function renderAdminLists() {
  document.getElementById("evCnt").textContent = S.ev.length;
  document.getElementById("adminEvList").innerHTML = S.ev.map(ev => `
    <li class="ap-li">
      <div>
        <div class="ap-li-t">${ev.title}</div>
        <div class="ap-li-s">${fmt(ev.date)} ${ev.time ? "· " + fmtTime(ev.time) : ""} ${ev.venue ? "· " + ev.venue : ""} · ${ev.type}${ev.regUrl ? " · 🔗 Reg link set" : ""}</div>
      </div>
      <div class="ap-actions"><button class="btn-del" onclick="del('ev',${ev.id})">Delete</button></div>
    </li>`).join("");

  document.getElementById("adminNotList").innerHTML = S.not.map(n => `
    <li class="ap-li">
      <div>
        <div class="ap-li-t">${n.text.slice(0,60)}${n.text.length > 60 ? "…" : ""}</div>
        <div class="ap-li-s">${fmt(n.date)} · ${n.tag}</div>
      </div>
      <div class="ap-actions"><button class="btn-del" onclick="del('not',${n.id})">Delete</button></div>
    </li>`).join("");

  document.getElementById("adminGalList").innerHTML = S.gal.map(g => `
    <li class="ap-li">
      <div>
        <div class="ap-li-t">${g.caption}</div>
        <div class="ap-li-s">${g.src ? "📷 Photo uploaded" : "📷 No photo"}</div>
      </div>
      <div class="ap-actions"><button class="btn-del" onclick="del('gal',${g.id})">Delete</button></div>
    </li>`).join("");

  document.getElementById("facCnt").textContent = S.fac.length;
  document.getElementById("adminFacList").innerHTML = S.fac.map(f => `
    <li class="ap-li">
      <div>
        <div class="ap-li-t">${f.name}</div>
        <div class="ap-li-s">${f.role} · ${f.spec || "—"}</div>
      </div>
      <div class="ap-actions"><button class="btn-del" onclick="del('fac',${f.id})">Delete</button></div>
    </li>`).join("");
}

// ════════════════════════════════════════════════════════════
//  ADMIN ACTIONS
// ════════════════════════════════════════════════════════════
function addEvent() {
  const title = gv("evTitle").trim(),
    date = gv("evDate"),
    time = gv("evTime"),
    venue = gv("evVenue").trim();
  const type = document.getElementById("evType").value,
    desc = gv("evDesc").trim();
  const regUrl = gv("evRegUrl").trim(),
    regLabel = gv("evRegLabel").trim() || "🖊 Register / RSVP";
  const maxReg = parseInt(gv("evMaxReg")) || 0,
    curReg = parseInt(gv("evCurReg")) || 0;
  if (!title || !date) {
    toast("⚠ Title and date are required!");
    return;
  }
  const f = document.getElementById("evPhoto").files[0];
  const photo = f ? URL.createObjectURL(f) : null;
  S.ev.unshift({
    id: nid.ev++,
    title,
    date,
    time,
    venue,
    type,
    desc,
    photo,
    regUrl,
    regLabel,
    maxReg,
    curReg
  });
  sv(K.ev, S.ev);
  renderEvents();
  renderAdminLists();
  renderTicker();
  ["evTitle", "evDate", "evTime", "evVenue", "evDesc", "evRegUrl", "evRegLabel", "evMaxReg", "evCurReg"].forEach(id => document.getElementById(id).value = "");
  document.getElementById("evPhoto").value = "";
  document.getElementById("evPrev").innerHTML = "";
  toast("✓ Event added!");
}

function addNotice() {
  const text = gv("notText").trim(),
    date = gv("notDate") || today();
  const tag = document.getElementById("notTag").value;
  if (!text) {
    toast("⚠ Notice text required!");
    return;
  }
  S.not.unshift({
    id: nid.not++,
    text,
    date,
    tag
  });
  sv(K.not, S.not);
  renderNotices();
  renderAdminLists();
  renderTicker();
  document.getElementById("notText").value = "";
  toast("✓ Notice posted!");
}

function addGallery() {
  const cap = gv("galCap").trim();
  if (!cap) {
    toast("⚠ Caption required!");
    return;
  }
  const f = document.getElementById("galPhoto").files[0];
  const src = f ? URL.createObjectURL(f) : null;
  S.gal.push({
    id: nid.gal++,
    caption: cap,
    src
  });
  sv(K.gal, S.gal);
  renderGallery();
  renderAdminLists();
  document.getElementById("galCap").value = "";
  document.getElementById("galPhoto").value = "";
  document.getElementById("galPrev").innerHTML = "";
  toast("✓ Photo added!");
}

function addFaculty() {
  const name = gv("facName").trim(),
    role = gv("facRole").trim(),
    spec = gv("facSpec").trim();
  if (!name || !role) {
    toast("⚠ Name and role required!");
    return;
  }
  const f = document.getElementById("facPhoto").files[0];
  const photo = f ? URL.createObjectURL(f) : null;
  S.fac.push({
    id: nid.fac++,
    name,
    role,
    spec,
    photo
  });
  sv(K.fac, S.fac);
  renderFaculty();
  renderAdminLists();
  ["facName", "facRole", "facSpec"].forEach(id => document.getElementById(id).value = "");
  document.getElementById("facPhoto").value = "";
  document.getElementById("facPrev").innerHTML = "";
  toast("✓ Faculty added!");
}

function saveAbout() {
  const a = S.abt;
  a.title = gv("aTitle") || a.title;
  a.p1 = gv("aP1") || a.p1;
  a.p2 = gv("aP2") || a.p2;
  a.p3 = gv("aP3") || a.p3;
  a.tags = gv("aTags") || a.tags;
  const f = document.getElementById("aPhoto").files[0];
  if (f) a.photo = URL.createObjectURL(f);
  sv(K.abt, a);
  renderAbout();
  toast("✓ About updated!");
}

function saveContact() {
  const c = S.con;
  c.address = gv("ctAddr") || c.address;
  c.phone = gv("ctPhone") || c.phone;
  c.email = gv("ctEmail") || c.email;
  c.hours = gv("ctHours") || c.hours;
  sv(K.con, c);
  renderContact();
  toast("✓ Contact updated!");
}

function saveStats() {
  const s = S.st;
  const ss = gv("stS"),
    sf = gv("stF"),
    se = gv("stE"),
    sp = gv("stP");
  if (ss) s.students = +ss;
  if (sf) s.faculty = +sf;
  if (se) s.events = +se;
  if (sp) s.projects = +sp;
  sv(K.st, s);
  renderStats();
  toast("✓ Stats updated!");
}

async function changePw() {
  const c = gv("pwC"),
    n = gv("pwN"),
    cf = gv("pwCf");
  const storedHash = localStorage.getItem(K.pwh);
  const currentHash = await sha256(c);
  if (currentHash !== storedHash) {
    toast("⚠ Current password is wrong!");
    return;
  }
  if (n.length < 8) {
    toast("⚠ Min 8 characters required!");
    return;
  }
  if (n !== cf) {
    toast("⚠ Passwords do not match!");
    return;
  }
  const newHash = await sha256(n);
  localStorage.setItem(K.pwh, newHash);
  ["pwC", "pwN", "pwCf"].forEach(id => document.getElementById(id).value = "");
  toast("✓ Password changed!");
}

function del(type, id) {
  if (!confirm("Delete this item?")) return;
  S[type] = S[type].filter(i => i.id !== id);
  sv(K[type], S[type]);
  if (type === "ev") renderEvents();
  if (type === "not") {
    renderNotices();
    renderTicker();
  }
  if (type === "gal") renderGallery();
  if (type === "fac") renderFaculty();
  renderAdminLists();
  toast("✓ Deleted.");
}

// ════════════════════════════════════════════════════════════
//  PHOTO PREVIEW
// ════════════════════════════════════════════════════════════
function prevImg(input, prevId) {
  const f = input.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = e => {
    document.getElementById(prevId).innerHTML =
      `<img src="${e.target.result}" style="max-width:160px;max-height:100px;border-radius:8px;border:1px solid var(--bdr)"/>`;
  };
  r.readAsDataURL(f);
}

// ════════════════════════════════════════════════════════════
//  LOGIN / ADMIN  (secured)
// ════════════════════════════════════════════════════════════
function openLogin(e) {
  e.preventDefault();
  document.getElementById("loginModal").classList.add("open");
  updateLockoutUI();
}

function closeLogin() {
  document.getElementById("loginModal").classList.remove("open");
  document.getElementById("loginErr").style.display = "none";
  document.getElementById("loginAttempts").style.display = "none";
}

function updateLockoutUI() {
  const banner = document.getElementById("lockoutBanner");
  const btn = document.getElementById("loginBtn");
  if (isLockedOut()) {
    banner.style.display = "block";
    banner.textContent = `🔒 Too many failed attempts. Try again in ${getLockRemaining()}.`;
    btn.disabled = true;
    btn.style.opacity = "0.5";
  } else {
    banner.style.display = "none";
    btn.disabled = false;
    btn.style.opacity = "1";
  }
}

async function doLogin() {
  if (isLockedOut()) {
    updateLockoutUI();
    return;
  }

  const u = document.getElementById("lu").value.trim();
  const p = document.getElementById("lp").value;
  const storedHash = localStorage.getItem(K.pwh);
  const inputHash = await sha256(p);

  if ((u === "admin" || u === "") && inputHash === storedHash) {
    clearAttempts();
    closeLogin();
    openAdmin();
  } else {
    const att = recordFailedAttempt();
    const errEl = document.getElementById("loginErr");
    const attEl = document.getElementById("loginAttempts");
    errEl.style.display = "block";

    if (isLockedOut()) {
      errEl.textContent = `🔒 Account locked for ${getLockRemaining()} due to too many attempts.`;
      attEl.style.display = "none";
      document.getElementById("loginBtn").disabled = true;
    } else {
      errEl.textContent = "Incorrect credentials. Please try again.";
      const rem = SEC.MAX_ATTEMPTS - att;
      attEl.style.display = "block";
      attEl.textContent = `⚠ ${rem} attempt${rem !== 1 ? "s" : ""} remaining before lockout.`;
    }
  }
}

function openAdmin() {
  const a = S.abt,
    c = S.con,
    s = S.st;
  document.getElementById("aTitle").value = a.title;
  document.getElementById("aP1").value = a.p1;
  document.getElementById("aP2").value = a.p2;
  document.getElementById("aP3").value = a.p3;
  document.getElementById("aTags").value = a.tags;
  document.getElementById("ctAddr").value = c.address;
  document.getElementById("ctPhone").value = c.phone;
  document.getElementById("ctEmail").value = c.email;
  document.getElementById("ctHours").value = c.hours;
  document.getElementById("stS").value = s.students;
  document.getElementById("stF").value = s.faculty;
  document.getElementById("stE").value = s.events;
  document.getElementById("stP").value = s.projects;
  renderAdminLists();
  renderStats();
  document.getElementById("adminModal").classList.add("open");
  startSessionTimer();
}

function closeAdmin() {
  document.getElementById("adminModal").classList.remove("open");
  clearSessionTimer();
}

function swTab(id, btn) {
  document.querySelectorAll(".ap-tc").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".ap-sb-btn").forEach(t => t.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  btn.classList.add("active");
}

// ════════════════════════════════════════════════════════════
//  LIGHTBOX
// ════════════════════════════════════════════════════════════
function openLb(src, cap) {
  if (!src) {
    toast("No photo for this item.");
    return;
  }
  document.getElementById("lbImg").src = src;
  document.getElementById("lb").classList.add("open");
}

function closeLb() {
  document.getElementById("lb").classList.remove("open");
}
document.getElementById("lb").addEventListener("click", e => {
  if (e.target === e.currentTarget) closeLb();
});

// ════════════════════════════════════════════════════════════
//  CONTACT FORM
// ════════════════════════════════════════════════════════════
function submitContact() {
  const n = gv("cName"),
    e = gv("cEmail"),
    m = gv("cMsg");
  if (!n || !e || !m) {
    toast("⚠ Please fill all fields!");
    return;
  }
  ["cName", "cEmail", "cSubject", "cMsg"].forEach(id => document.getElementById(id).value = "");
  toast("✓ Message sent! We'll get back to you.");
}

// ════════════════════════════════════════════════════════════
//  NAV
// ════════════════════════════════════════════════════════════
function toggleNav() {
  document.getElementById("navLinks").classList.toggle("open");
}

window.addEventListener("scroll", () => {
  const nav = document.getElementById("mainNav");
  nav.classList.toggle("scrolled", window.scrollY > 50);
});

document.addEventListener("click", e => {
  if (!e.target.closest("nav")) document.getElementById("navLinks").classList.remove("open");
});

// ════════════════════════════════════════════════════════════
//  SCROLL REVEAL
// ════════════════════════════════════════════════════════════
function observeReveal() {
  const obs = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add("visible");
    }), {
      threshold: 0.08
    }
  );
  document.querySelectorAll(".reveal:not(.visible)").forEach(el => obs.observe(el));
}

// ════════════════════════════════════════════════════════════
//  HELPERS
// ════════════════════════════════════════════════════════════
const gv = id => document.getElementById(id).value;

function fmt(d) {
  if (!d) return "—";
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function fmtTime(t) {
  if (!t) return "";
  try {
    const [h, m] = t.split(":");
    const d = new Date();
    d.setHours(+h, +m);
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return t;
  }
}

function today() {
  return new Date().toISOString().split("T")[0];
}

function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3200);
}

// close modals on backdrop click
document.getElementById("loginModal").addEventListener("click", e => {
  if (e.target === e.currentTarget) closeLogin();
});
document.getElementById("adminModal").addEventListener("click", e => {
  if (e.target === e.currentTarget) closeAdmin();
});

// ════════════════════════════════════════════════════════════
//  ROBOT CHATBOT
// ════════════════════════════════════════════════════════════
function toggleChatbot() {
  const cw = document.getElementById('chatbotWindow');
  if (cw.classList.contains('active')) {
    cw.classList.remove('active');
  } else {
    cw.classList.add('active');
    document.getElementById('chatInput').focus();
  }
}

function sendMessage() {
  const input = document.getElementById('chatInput');
  const msg = input.value.trim();
  if (!msg) return;

  const msgsDiv = document.getElementById('chatbotMessages');
  
  const userDiv = document.createElement('div');
  userDiv.className = 'chat-msg user-msg';
  userDiv.textContent = msg;
  msgsDiv.appendChild(userDiv);
  
  input.value = '';
  msgsDiv.scrollTop = msgsDiv.scrollHeight;

  setTimeout(() => {
    const botDiv = document.createElement('div');
    botDiv.className = 'chat-msg bot-msg';
    
    const lowerMsg = msg.toLowerCase();
    let reply = "I'm the department's AI bot! You can ask me about AI, events, or the faculty.";
    if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) reply = "Hello there! How can I assist you?";
    else if (lowerMsg.includes('event')) reply = "Check out our Events section for the latest activities!";
    else if (lowerMsg.includes('ai') || lowerMsg.includes('data')) reply = "AI and Data Science is the future! Explore our curriculum in the About section.";
    else if (lowerMsg.includes('faculty') || lowerMsg.includes('teacher')) reply = "Our expert faculty are guiding the next generation. See them in the Faculty section!";
    else if (lowerMsg.includes('contact')) reply = "You can reach us through the Contact form at the bottom of the page.";

    botDiv.textContent = reply;
    msgsDiv.appendChild(botDiv);
    msgsDiv.scrollTop = msgsDiv.scrollHeight;
  }, 800);
}

// ════════════════════════════════════════════════════════════
//  INIT
// ════════════════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", async () => {
  await initPasswordHash();
  renderAll();
  observeReveal();
  new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) renderStats();
    }), {
      threshold: 0.4
    }
  ).observe(document.getElementById("heroStats"));
});