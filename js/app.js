/* ============================================================
   KOTE HOMESTAY: edit the CONFIG block, or run configure.py (see README.md).
   ============================================================ */
const CONFIG = {
  name: "Kote Homestay",
  whatsapp: "919480201679",          // country code + number, no "+" or spaces  <-- REPLACE
  phoneDisplay: "+91 94802 01679",   // REPLACE
  mapQuery: "Kote Homestay Halegadaka estate Durgadahalli village, post, Sunkasale, Mudigere, Karnataka 577121",         // REPLACE with the exact place name or "lat,lng"
  instagram: "kotehomestay",         // Instagram handle without @  <-- REPLACE
  googleMapsApiKey: "",              // Google Maps browser key, restricted to your website  <-- REPLACE (see README.md)
  googlePlaceId: "",                 // your Google Place ID, e.g. "ChIJ..."                  <-- REPLACE (see README.md)
  googleReviewsUrl: "",              // optional "all reviews" link (blank = built from the Place ID)
  googleWriteReviewUrl: "https://g.page/r/Cd2dbZbe3XdLEBE/review",
  popupDelayMs: 15000,               // quick-enquiry popup appears after this many ms
};

/* ------------------------------------------------------------ helpers */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const conn = navigator.connection || {};
const lowData = !!conn.saveData || /^(slow-2g|2g|3g)$/.test(conn.effectiveType || "");
document.documentElement.classList.add("js");

/* ------------------------------------------------------------ contact links */
const waLink = (text = "") => `https://wa.me/${CONFIG.whatsapp}${text ? "?text=" + encodeURIComponent(text) : ""}`;
const mapsUrl = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(CONFIG.mapQuery);
const igUrl = "https://www.instagram.com/" + encodeURIComponent(CONFIG.instagram.replace(/^@/, "")) + "/";
const placeId = (CONFIG.googlePlaceId || "").trim();
const reviewsUrl = CONFIG.googleReviewsUrl || (placeId ? "https://search.google.com/local/reviews?placeid=" + encodeURIComponent(placeId) : mapsUrl);
const writeUrl = CONFIG.googleWriteReviewUrl || (placeId ? "https://search.google.com/local/writereview?placeid=" + encodeURIComponent(placeId) : reviewsUrl);
$$("[data-tel]").forEach(a => a.href = "tel:+" + CONFIG.whatsapp);
$$("[data-phone]").forEach(el => el.textContent = CONFIG.phoneDisplay);
$$("[data-wa]").forEach(a => a.href = waLink(`Hi ${CONFIG.name}, I'd like to know more about staying with you.`));
$$("[data-ig]").forEach(a => a.href = igUrl);
$$("[data-ig-handle]").forEach(el => el.textContent = "@" + CONFIG.instagram.replace(/^@/, ""));
$$("[data-maps]").forEach(a => a.href = mapsUrl);
$$("[data-reviews]").forEach(a => a.href = reviewsUrl);
$$("[data-write]").forEach(a => a.href = writeUrl);
$("#year").textContent = new Date().getFullYear();
(function lazyMap() {
  const f = $("#mapFrame"), src = "https://www.google.com/maps?q=" + encodeURIComponent(CONFIG.mapQuery) + "&output=embed";
  if (!("IntersectionObserver" in window)) { f.src = src; return; }
  const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { f.src = src; io.disconnect(); } }, { rootMargin: "400px" });
  io.observe(f);
})();

/* ------------------------------------------------------------ nav */
const nav = $("#nav"), menu = $("#menu"), burger = $("#burger");
const setMenu = o => { menu.classList.toggle("open", o); burger.setAttribute("aria-expanded", o); burger.setAttribute("aria-label", o ? "Close menu" : "Open menu"); };
burger.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
$$("#menu a").forEach(a => a.addEventListener("click", () => setMenu(false)));
const secs = $$("main section[id]");
function onScroll() {
  nav.classList.toggle("solid", scrollY > 40 || menu.classList.contains("open"));
  let cur = ""; secs.forEach(s => { if (s.getBoundingClientRect().top < 140) cur = s.id; });
  $$("#menu > a").forEach(a => a.classList.toggle("on", a.getAttribute("href") === "#" + cur));
}
addEventListener("scroll", onScroll, { passive: true }); onScroll();
burger.addEventListener("click", onScroll);

/* ------------------------------------------------------------ hero: video loop over a photo slideshow */
(function hero() {
  const hero = $("#home"), media = $(".hero-media"), slides = $$(".hslide"), toggle = $("#heroToggle");
  let k = 0, timer = null, video = null, paused = false;
  const advance = () => { slides[k].classList.remove("on"); k = (k + 1) % slides.length; slides[k].classList.add("on"); };
  const startShow = () => { if (!timer && slides.length > 1 && !reduceMotion) timer = setInterval(advance, 6500); };
  const stopShow = () => { clearInterval(timer); timer = null; };
  const setToggle = () => {
    toggle.innerHTML = `<svg class="ico"><use href="#${paused ? "i-play" : "i-pause"}"/></svg>`;
    toggle.setAttribute("aria-label", paused ? "Play background video" : "Pause background video");
  };
  const moving = !reduceMotion;
  if (moving) { toggle.hidden = false; setToggle(); }
  toggle.addEventListener("click", () => {
    paused = !paused; setToggle();
    if (paused) { stopShow(); if (video) video.pause(); } else if (video && video.classList.contains("on")) video.play().catch(() => {}); else startShow();
  });
  if (!reduceMotion && !lowData) {
    video = document.createElement("video");
    video.className = "hero-video"; video.muted = true; video.loop = true; video.playsInline = true; video.preload = "auto";
    video.setAttribute("muted", ""); video.setAttribute("playsinline", ""); video.setAttribute("aria-hidden", "true"); video.tabIndex = -1;
    video.src = "video/hero-loop.mp4";
    video.addEventListener("playing", () => { video.classList.add("on"); hero.classList.add("has-video"); stopShow(); }, { once: true });
    video.addEventListener("error", () => { video = null; startShow(); });
    media.prepend(video);
    video.play().catch(() => {});
    setTimeout(() => { if (video && !video.classList.contains("on")) startShow(); }, 2500);   // slideshow while the video loads
  } else startShow();
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { stopShow(); if (video) video.pause(); }
    else if (!paused) { if (video && video.classList.contains("on")) video.play().catch(() => {}); else startShow(); }
  });
})();

/* ------------------------------------------------------------ carousels (rooms) */
$$("[data-carousel]").forEach(c => {
  const sl = $$(".slide", c); if (!sl.length) return;
  const dots = $(".dots", c); let i = 0, timer = null;
  if (dots && sl.length > 1) {
    sl.forEach((_, n) => { const b = document.createElement("button"); b.type = "button"; b.setAttribute("aria-label", `Show photo ${n + 1}`); b.addEventListener("click", () => { go(n); stop(); }); dots.appendChild(b); });
    dots.removeAttribute("aria-hidden");
  }
  const go = n => {
    i = (n + sl.length) % sl.length;
    sl.forEach((s, m) => { s.classList.toggle("on", m === i); s.setAttribute("aria-hidden", m === i ? "false" : "true"); });
    if (dots) $$("button", dots).forEach((b, m) => { b.classList.toggle("on", m === i); b.setAttribute("aria-current", m === i ? "true" : "false"); });
  };
  const stop = () => { clearInterval(timer); timer = null; };
  const start = () => { if (!timer && sl.length > 1 && !reduceMotion) timer = setInterval(() => go(i + 1), 5200); };
  go(0);
  $(".sl-prev", c)?.addEventListener("click", () => { go(i - 1); stop(); });
  $(".sl-next", c)?.addEventListener("click", () => { go(i + 1); stop(); });
  $(".sl-zoom", c).addEventListener("click", () => openLb(sl[i]));
  sl.forEach(s => s.addEventListener("click", () => openLb(s)));
  let x0 = null;
  c.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; stop(); }, { passive: true });
  c.addEventListener("touchend", e => { if (x0 === null) return; const d = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(d) > 40) go(i + (d < 0 ? 1 : -1)); });
  c.setAttribute("tabindex", "0");
  c.addEventListener("keydown", e => { if (e.key === "ArrowRight") { go(i + 1); stop(); } if (e.key === "ArrowLeft") { go(i - 1); stop(); } });
  if ("IntersectionObserver" in window) new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? start() : stop()), { threshold: .5 }).observe(c);   // auto-advance only while visible
});

/* ------------------------------------------------------------ washroom strip */
(function washStrip() {
  const st = $("#washStrip"); if (!st) return;
  const by = d => st.scrollBy({ left: d * Math.min(340, st.clientWidth * .8), behavior: reduceMotion ? "auto" : "smooth" });
  $("#washPrev").addEventListener("click", () => by(-1)); $("#washNext").addEventListener("click", () => by(1));
})();

/* ------------------------------------------------------------ a day at Kote (tabs) */
(function dayTabs() {
  const tabs = $$(".day-tab"), panels = $$(".day-panel"); let timer = null;
  const select = (n, focus) => {
    tabs.forEach((t, i) => { const on = i === n; t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1; if (on && focus) t.focus(); });
    panels.forEach((p, i) => { p.classList.toggle("on", i === n); p.setAttribute("aria-hidden", i === n ? "false" : "true"); });
  };
  const stop = () => { clearInterval(timer); timer = null; };
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => { select(i); stop(); });
    t.addEventListener("keydown", e => {
      const cur = tabs.indexOf(t); let n = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") n = (cur + 1) % tabs.length;
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") n = (cur - 1 + tabs.length) % tabs.length;
      if (e.key === "Home") n = 0; if (e.key === "End") n = tabs.length - 1;
      if (n !== null) { e.preventDefault(); select(n, true); stop(); }
    });
  });
  const cycle = () => { const cur = tabs.findIndex(t => t.getAttribute("aria-selected") === "true"); select((cur + 1) % tabs.length); };
  if ("IntersectionObserver" in window && !reduceMotion) new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting && !timer) timer = setInterval(cycle, 6000); else if (!e.isIntersecting) stop();
  }), { threshold: .5 }).observe($(".day-stage"));
})();

/* ------------------------------------------------------------ gallery filters */
(function gallery() {
  const chips = $$("#filters .chip"), items = $$("#galleryGrid .g");
  $("#filters").addEventListener("click", e => {
    const c = e.target.closest(".chip"); if (!c) return;
    chips.forEach(x => { const on = x === c; x.classList.toggle("on", on); x.setAttribute("aria-pressed", on); });
    const f = c.dataset.f;
    items.forEach(g => { g.hidden = !(f === "all" || g.dataset.cat === f); if (!g.hidden) { g.style.animation = "none"; void g.offsetWidth; g.style.animation = ""; } });
  });
})();

/* ------------------------------------------------------------ video players (poster button swaps in a <video>) */
function playFilm(btn) {
  if (!btn || btn.classList.contains("playing")) return;
  const v = document.createElement("video");
  v.src = btn.dataset.video; v.controls = true; v.autoplay = true; v.playsInline = true; v.preload = "auto";
  v.setAttribute("playsinline", ""); v.setAttribute("aria-label", btn.dataset.label || "Video");
  btn.classList.add("playing"); btn.appendChild(v);
  btn.removeAttribute("aria-label");
  const stop = e => e.stopPropagation(); v.addEventListener("click", stop);
  v.play().catch(() => {});
}
$$(".vid-play").forEach(b => b.addEventListener("click", e => { if (e.target.tagName !== "VIDEO") playFilm(b); }));
$$("[data-film]").forEach(b => b.addEventListener("click", () => {
  const sec = $("#films"); sec.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  setTimeout(() => playFilm($(".vid-film .vid-play")), reduceMotion ? 0 : 500);
}));

/* ------------------------------------------------------------ lightbox (photos and videos) */
const lb = $("#lightbox"), lbStage = $("#lbStage");
let lbList = [], lbIdx = 0, lbFocus = null;
function lbItems(el) {
  const g = el.dataset.lb;
  return $$(`[data-lb="${g}"]`).filter(x => !x.hidden && x.closest("[hidden]") === null);
}
function showLb() {
  const el = lbList[lbIdx]; lbStage.innerHTML = "";
  if (el.dataset.type === "video") {
    const v = document.createElement("video");
    v.src = el.dataset.src; v.poster = el.dataset.poster || ""; v.controls = true; v.autoplay = true; v.playsInline = true; v.setAttribute("playsinline", "");
    v.setAttribute("aria-label", el.dataset.cap || "Video"); lbStage.appendChild(v); v.play().catch(() => {});
  } else {
    const im = new Image(); im.src = el.dataset.full; im.alt = el.dataset.cap || "";
    if (el.dataset.w) { im.width = +el.dataset.w; im.height = +el.dataset.h; }
    lbStage.appendChild(im);
  }
  $("#lbCap").textContent = el.dataset.cap || "";
  $("#lbCount").textContent = lbList.length > 1 ? `${lbIdx + 1} / ${lbList.length}` : "";
  $$(".lb-nav", lb).forEach(b => b.hidden = lbList.length < 2);
  const nx = lbList[(lbIdx + 1) % lbList.length]; if (nx && nx.dataset.full) { const p = new Image(); p.src = nx.dataset.full; }   // preload next
}
function openLb(el) {
  lbList = lbItems(el); lbIdx = Math.max(0, lbList.indexOf(el));
  lbFocus = document.activeElement; showLb();
  lb.hidden = false; document.body.style.overflow = "hidden";
  $(".lb-x", lb).focus();
}
function closeLb() {
  const v = $("video", lbStage); if (v) v.pause();
  lbStage.innerHTML = ""; lb.hidden = true;
  if (popup.hidden) document.body.style.overflow = "";
  if (lbFocus && lbFocus.focus) lbFocus.focus();
}
const lbStep = d => { lbIdx = (lbIdx + d + lbList.length) % lbList.length; showLb(); };
document.addEventListener("click", e => {
  const t = e.target.closest("[data-lb]");
  if (t && !t.classList.contains("slide") && !t.closest("[data-carousel]")) openLb(t);   // carousels open their own current slide
});
$(".lb-prev", lb).addEventListener("click", () => lbStep(-1));
$(".lb-next", lb).addEventListener("click", () => lbStep(1));
$(".lb-x", lb).addEventListener("click", closeLb);
lb.addEventListener("click", e => { if (e.target === lb || e.target.classList.contains("lb-fig") || e.target === lbStage) closeLb(); });
let lx = null;
lb.addEventListener("touchstart", e => { lx = e.touches[0].clientX; }, { passive: true });
lb.addEventListener("touchend", e => { if (lx === null) return; const d = e.changedTouches[0].clientX - lx; lx = null; if (Math.abs(d) > 50 && lbList.length > 1 && !e.target.closest("video")) lbStep(d < 0 ? 1 : -1); });
lb.addEventListener("keydown", e => {                                           // keep Tab inside the viewer
  if (e.key !== "Tab") return;
  const f = $$("button,video", lb).filter(x => !x.hidden && x.offsetParent !== null);
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

/* ------------------------------------------------------------ WhatsApp helpers */
const phoneOk = v => /^\+?\d[\d\s-]{8,14}$/.test(v.trim());
const fmt = d => new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
let toastTimer;
const toast = msg => { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 4500); };
function openLink(url) {
  const a = document.createElement("a");
  a.href = url; a.target = "_blank"; a.rel = "noopener";
  document.body.appendChild(a); a.click(); a.remove();
}
function sendEnquiry(lines) {
  const msg = lines.filter(x => x !== null).join("\n");
  try { localStorage.setItem("kote:lastEnquiry", JSON.stringify({ at: Date.now(), msg })); } catch (_) {}
  toast("Opening WhatsApp with your enquiry. Just tap Send.");
  openLink(waLink(msg));
}
const markPopupDone = () => { try { sessionStorage.setItem("kote:popupDone", "1"); } catch (_) {} };
const popupDone = () => { try { return !!sessionStorage.getItem("kote:popupDone"); } catch (_) { return false; } };
const todayISO = (() => { const d = new Date(); return new Date(d - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); })();
const nightsBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 864e5);
const nextDay = d => { const x = new Date(d + "T00:00:00"); x.setDate(x.getDate() + 1); return new Date(x - x.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); };
function linkDates(f) {
  f.checkin.min = todayISO; f.checkout.min = nextDay(todayISO);
  f.checkin.addEventListener("change", () => {
    if (!f.checkin.value) return;
    f.checkout.min = nextDay(f.checkin.value);
    if (f.checkout.value && f.checkout.value <= f.checkin.value) f.checkout.value = "";
  });
}

/* ------------------------------------------------------------ booking strip (hero) */
const book = $("#bookForm");
linkDates(book);
book.addEventListener("submit", e => {
  e.preventDefault();
  const err = $("#bookErr"); err.textContent = "";
  if (!book.checkin.value || !book.checkout.value) { err.textContent = "Please choose your check-in and check-out dates."; (book.checkin.value ? book.checkout : book.checkin).focus(); return; }
  if (book.checkout.value <= book.checkin.value) { err.textContent = "Check-out must be after check-in."; book.checkout.focus(); return; }
  const n = nightsBetween(book.checkin.value, book.checkout.value);
  sendEnquiry([
    `*Availability check, ${CONFIG.name}*`, "",
    `Stay: ${fmt(book.checkin.value)} to ${fmt(book.checkout.value)} (${n} night${n > 1 ? "s" : ""})`,
    `Guests: ${book.guests.value}${book.guests.value === "15" ? "+" : ""}`, "",
    "Are rooms available for these dates? Please share the rates.",
  ]);
  markPopupDone();
});

/* ------------------------------------------------------------ main enquiry form */
const form = $("#enquiryForm");
linkDates(form);
$$(".stepper button", form).forEach(b => b.addEventListener("click", () => { form.guests.value = Math.min(30, Math.max(1, +form.guests.value + +b.dataset.d)); }));
$$("[data-room]").forEach(b => b.addEventListener("click", () => {
  const opt = [...form.room.options].find(o => o.textContent.toLowerCase().startsWith(b.dataset.room.toLowerCase().split(" ")[0]));
  if (opt) form.room.value = opt.value;
  $("#enquiry").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  setTimeout(() => form.name.focus({ preventScroll: true }), reduceMotion ? 0 : 600);
}));
form.addEventListener("submit", e => {
  e.preventDefault();
  const err = $("#formErr"); err.textContent = "";
  $$("input", form).forEach(i => i.classList.remove("bad"));
  const bad = [];
  if (form.name.value.trim().length < 2) bad.push(form.name);
  if (!phoneOk(form.phone.value)) bad.push(form.phone);
  if (form.email.value && !form.email.checkValidity()) bad.push(form.email);
  if (!form.checkin.value) bad.push(form.checkin);
  if (!form.checkout.value || form.checkout.value <= form.checkin.value) bad.push(form.checkout);
  if (bad.length) { bad.forEach(i => i.classList.add("bad")); bad[0].focus(); err.textContent = "Please check the highlighted fields (check-out must be after check-in)."; return; }
  const n = nightsBetween(form.checkin.value, form.checkout.value);
  const interests = $$("#interests input:checked").map(i => i.value).join(", ") || "None selected";
  sendEnquiry([
    `*New enquiry, ${CONFIG.name}*`, "",
    `Name: ${form.name.value.trim()}`,
    `Phone: ${form.phone.value.trim()}`,
    form.email.value ? `Email: ${form.email.value}` : null,
    `Stay: ${fmt(form.checkin.value)} to ${fmt(form.checkout.value)} (${n} night${n > 1 ? "s" : ""})`,
    `Guests: ${form.guests.value}`,
    `Room: ${form.room.value}`,
    `Interested in: ${interests}`,
    form.message.value.trim() ? `Note: ${form.message.value.trim()}` : null,
  ]);
  markPopupDone();
  form.reset(); form.guests.value = 2;
});

/* ------------------------------------------------------------ quick-enquiry popup (after 15 s) */
const popup = $("#popup"), pform = $("#popupForm");
let popFocus = null, popTimer = null;
pform.guests.innerHTML = Array.from({ length: 12 }, (_, i) => `<option value="${i + 1}"${i === 1 ? " selected" : ""}>${i + 1}${i === 11 ? "+" : ""}</option>`).join("");
pform.checkin.min = todayISO;
function popupAllowed() {
  if (!popup.hidden || !lb.hidden) return false;
  const r = $("#enquiry").getBoundingClientRect();
  if (r.top < innerHeight * .8 && r.bottom > innerHeight * .2) return false;   // already looking at the enquiry form
  if (form.contains(document.activeElement) || book.contains(document.activeElement)) return false;
  return true;
}
function openPopup() {
  popFocus = document.activeElement;
  popup.hidden = false; document.body.style.overflow = "hidden";
  setTimeout(() => pform.name.focus(), 120);
}
function closePopup() {
  popup.hidden = true; document.body.style.overflow = "";
  markPopupDone();
  if (popFocus && popFocus.focus) popFocus.focus();
}
function schedulePopup(ms) {
  clearTimeout(popTimer);
  popTimer = setTimeout(() => {
    if (popupDone()) return;
    if (popupAllowed()) openPopup(); else schedulePopup(4000);
  }, ms);
}
schedulePopup(CONFIG.popupDelayMs);
popup.addEventListener("click", e => { if (e.target === popup || e.target.closest("[data-popclose]")) closePopup(); });
popup.addEventListener("keydown", e => {
  if (e.key !== "Tab") return;
  const f = $$("input,select,textarea,button,a[href]", popup).filter(x => !x.disabled && x.offsetParent !== null);
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});
pform.addEventListener("submit", e => {
  e.preventDefault();
  const err = $("#popErr"); err.textContent = "";
  $$("input", pform).forEach(i => i.classList.remove("bad"));
  const bad = [];
  if (pform.name.value.trim().length < 2) bad.push(pform.name);
  if (!phoneOk(pform.phone.value)) bad.push(pform.phone);
  if (bad.length) { bad.forEach(i => i.classList.add("bad")); bad[0].focus(); err.textContent = "Please add your name and a valid phone number."; return; }
  sendEnquiry([
    `*Quick enquiry, ${CONFIG.name}*`, "",
    `Name: ${pform.name.value.trim()}`,
    `Phone: ${pform.phone.value.trim()}`,
    pform.checkin.value ? `Check-in: ${fmt(pform.checkin.value)}` : null,
    `Guests: ${pform.guests.value}`,
    pform.message.value.trim() ? `Question: ${pform.message.value.trim()}` : null,
  ]);
  closePopup(); pform.reset(); pform.guests.value = 2;
});
addEventListener("keydown", e => {
  if (e.key === "Escape") { if (!popup.hidden) closePopup(); else if (!lb.hidden) closeLb(); else if (menu.classList.contains("open")) setMenu(false); }
  if (!lb.hidden && lbList.length > 1) { if (e.key === "ArrowRight") lbStep(1); if (e.key === "ArrowLeft") lbStep(-1); }
});

/* ------------------------------------------------------------------------------------------
   GOOGLE REVIEWS: loaded LIVE from Google each time the page is opened.
   Nothing is typed in or stored by this site (Google's rules do not allow storing review text),
   so a review added on Google shows up the next time someone loads the page.
   Needs CONFIG.googleMapsApiKey + CONFIG.googlePlaceId. Google decides which (max 5) reviews it returns.
   ------------------------------------------------------------------------------------------ */
const rv = { sec: $("#reviews"), wrap: $("#rvWrap"), track: $("#rvTrack"), summary: $("#rvSummary"), empty: $("#rvEmpty"), note: $("#rvNote") };
const RV_MSG = "Our guests share their stays on Google. Read what they say, or add your own review.";
let rvLoadedAt = 0, rvLoading = false;
const httpsOnly = u => (typeof u === "string" && /^https:\/\//i.test(u)) ? u : "";
const pick = (o, ...names) => { for (const n of names) if (o && o[n] != null) return o[n]; };
const asText = v => (typeof v === "string" ? v : v && typeof v.text === "string" ? v.text : "").trim();
function showReviewsFallback(msg) {
  rv.wrap.hidden = true; rv.summary.hidden = true; rv.note.hidden = true;
  rv.empty.hidden = false; rv.empty.querySelector("p").textContent = msg || RV_MSG;
}
window.gm_authFailure = () => { console.warn("[Kote] Google rejected the Maps API key (check the key, its website restriction and that billing is on)."); if (!rvLoadedAt) showReviewsFallback(); };
function loadMapsScript() {
  if (window.google && google.maps && google.maps.importLibrary) return Promise.resolve();
  return new Promise((resolve, reject) => {
    window.__koteGoogleReady = resolve;
    const s = document.createElement("script");
    s.src = "https://maps.googleapis.com/maps/api/js?key=" + encodeURIComponent(CONFIG.googleMapsApiKey) + "&v=weekly&loading=async&libraries=places&callback=__koteGoogleReady";
    s.async = true; s.onerror = () => reject(new Error("Google Maps script could not load (offline or blocked)"));
    document.head.appendChild(s);
  });
}
const starRow = n => { n = Math.max(0, Math.min(5, Math.round(n) || 0)); return "★".repeat(n) + "☆".repeat(5 - n); };
function reviewCard(r, hidden) {
  const a = r.authorAttribution || {};
  const name = String(pick(a, "displayName") || "Google user");
  const photo = httpsOnly(pick(a, "photoURI", "photoUri"));
  const authorUri = httpsOnly(pick(a, "uri"));
  const link = httpsOnly(pick(r, "googleMapsURI", "googleMapsUri")) || reviewsUrl;
  const flag = httpsOnly(pick(r, "flagContentURI", "flagContentUri"));
  const initial = (name.trim().charAt(0) || "G").toUpperCase();
  let text = asText(r.text) || asText(r.originalText);
  const long = text.length > 230;
  if (long) text = text.slice(0, 230).replace(/\s+\S*$/, "") + "…";
  const ti = hidden ? ' tabindex="-1"' : "";
  const stars = Math.max(0, Math.min(5, Math.round(r.rating) || 0));
  return `<article class="rv"${hidden ? ' aria-hidden="true"' : ""}>
    <div class="rv-top"><span class="av">${photo ? `<img src="${esc(photo)}" alt="" referrerpolicy="no-referrer" loading="lazy" data-ini="${esc(initial)}">` : esc(initial)}</span>
      <div><b>${authorUri ? `<a href="${esc(authorUri)}" target="_blank" rel="noopener"${ti}>${esc(name)}</a>` : esc(name)}</b><small>${esc(r.relativePublishTimeDescription || "")}</small></div>
      <span class="gmark" title="Google review" aria-hidden="true">G</span></div>
    <div class="rv-stars" role="img" aria-label="${stars} out of 5 stars">${starRow(stars)}</div>
    <p>${esc(text)}</p>
    <div class="rv-links"><a href="${esc(link)}" target="_blank" rel="noopener"${ti}>${long ? "Read full review" : "View on Google"}</a>${flag ? ` · <a href="${esc(flag)}" target="_blank" rel="noopener"${ti}>Report</a>` : ""}</div>
  </article>`;
}
document.addEventListener("error", e => {                                        // reviewer photo failed: show the initial instead
  const t = e.target; if (t && t.tagName === "IMG" && t.dataset.ini !== undefined) t.replaceWith(document.createTextNode(t.dataset.ini));
}, true);
function renderReviews(d) {
  const list = d.reviews;
  if (!list.length) return showReviewsFallback();
  if (d.rating) {
    const n = Number(d.count) || 0;
    rv.summary.innerHTML = `<b>${esc(Number(d.rating).toFixed(1))}</b> <span class="rv-stars" aria-hidden="true">${starRow(d.rating)}</span>${n ? ` <span>· ${esc(n.toLocaleString("en-IN"))} Google review${n === 1 ? "" : "s"}</span>` : ""}`;
    rv.summary.hidden = false;
  }
  const still = list.length <= 2 || reduceMotion;                                // 1-2 reviews (or reduced motion): no looping strip
  rv.wrap.classList.toggle("rv-static", still);
  if (still) {
    rv.track.innerHTML = `<div class="rv-set">${list.map(r => reviewCard(r, false)).join("")}</div>`;
  } else {
    const reps = Math.max(1, Math.ceil(8 / list.length));
    const set = hide => Array.from({ length: reps }, (_, i) => list.map(r => reviewCard(r, hide || i > 0)).join("")).join("");
    rv.track.innerHTML = `<div class="rv-set">${set(false)}</div><div class="rv-set" aria-hidden="true">${set(true)}</div>`;
    rv.track.style.setProperty("--dur", (list.length * reps * 11) + "s");        // about 11 s per card: slow
  }
  rv.wrap.hidden = false; rv.empty.hidden = true; rv.note.hidden = false;
}
async function loadGoogleReviews() {
  if (rvLoading) return; rvLoading = true;
  try {
    await loadMapsScript();
    const { Place } = await google.maps.importLibrary("places");
    const place = new Place({ id: placeId });
    await place.fetchFields({ fields: ["rating", "userRatingCount", "reviews"] });
    const reviews = (place.reviews || []).filter(r => asText(r.text) || asText(r.originalText));
    renderReviews({ rating: place.rating, count: place.userRatingCount, reviews });
    rvLoadedAt = Date.now();
  } catch (err) {
    console.warn("[Kote] Google reviews unavailable:", err);
    if (!rvLoadedAt) showReviewsFallback();
  } finally { rvLoading = false; }
}
(function initReviews() {
  if (!CONFIG.googleMapsApiKey || !placeId) return showReviewsFallback();
  const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); loadGoogleReviews(); } }, { rootMargin: "700px 0px" });
  io.observe(rv.sec);
  document.addEventListener("visibilitychange", () => {                          // installed app left open: refresh after 30 min
    if (document.visibilityState === "visible" && rvLoadedAt && Date.now() - rvLoadedAt > 30 * 60 * 1000) loadGoogleReviews();
  });
})();

/* ------------------------------------------------------------ PWA */
if ("serviceWorker" in navigator) addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
let deferred; const ib = $("#installBtn");
addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferred = e; ib.hidden = false; });
ib.addEventListener("click", async () => { if (!deferred) return; deferred.prompt(); await deferred.userChoice; deferred = null; ib.hidden = true; });
