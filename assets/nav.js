// Slide order. Add new slide files here; navigation, counter and keys follow automatically.
const SLIDES = [
  "s0-01-cover.html",
  "s0-02-rules.html",
  "s0-03-map.html",
  "s1-00-map.html",
  "s1-01-steps.html",
  "s1-02-story.html",
  "s1-03-body.html",
  "s2-00-map.html",
  "s2-01-listen.html",
  "s2-02-structure.html",
  "s2-03-builder.html",
  "s3-00-map.html",
  "s3-01-audience.html",
  "s3-03-room-tools.html",
  "s3-04-feedback.html",
  "s4-00-map.html",
  "s4-01-prep.html",
  "s4-02-tough.html",
  "s4-03-end.html"
];

// Slide titles for the overview (O). Keep in sync when adding slides.
const TITLES = {
 "s0-01-cover.html": "Cover",
 "s0-02-rules.html": "Four rules",
 "s0-03-map.html": "Map",
 "s1-00-map.html": "Map: the steps",
 "s1-01-steps.html": "The steps",
 "s1-02-story.html": "Need a story?",
 "s1-03-body.html": "Breath, feet, eyes",
 "s2-00-map.html": "Map: build a talk",
 "s2-01-listen.html": "Listen first",
 "s2-02-structure.html": "Hook, one idea, call to action",
 "s2-03-builder.html": "Your talk",
 "s3-00-map.html": "Map: the audience",
 "s3-01-audience.html": "The audience decides",
 "s3-02-room-sim.html": "Room: bored listeners",
 "s3-03-room-tools.html": "How to work with the room",
 "s3-04-feedback.html": "Feedback",
 "s4-00-map.html": "Map: on the spot",
 "s4-01-prep.html": "Draw a card · PREP",
 "s4-02-tough.html": "Tough questions",
 "s4-03-end.html": "End"
};

const CHAPTER_COLOURS = ["var(--c0)", "var(--c1)", "var(--c2)", "var(--c3)", "var(--c4)"];

// First slide of each part: map cards and the parts page link here.
const CHAPTER_START = ["s0-01-cover.html", "s1-00-map.html", "s2-00-map.html", "s3-00-map.html", "s4-00-map.html"];

(function () {
  const file = location.pathname.split("/").pop() || SLIDES[0];
  const i = SLIDES.indexOf(file);
  const ch = document.body.dataset.chapter;
  if (ch !== undefined && CHAPTER_COLOURS[ch]) {
    document.documentElement.style.setProperty("--chap", CHAPTER_COLOURS[ch]);
  }

  // footer: prev · counter · next
  const foot = document.querySelector(".foot");
  if (foot) {
    const prev = i > 0 ? SLIDES[i - 1] : null;
    const next = i >= 0 && i < SLIDES.length - 1 ? SLIDES[i + 1] : null;
    foot.innerHTML =
      `<a href="${prev || "#"}" aria-disabled="${!prev}">← Back</a>` +
      `<span><a href="index.html" class="home">All parts</a> ${i + 1} / ${SLIDES.length}</span>` +
      `<a href="${next || "#"}" aria-disabled="${!next}">Next →</a>`;
  }

  // step-by-step reveals before moving on
  const steps = Array.from(document.querySelectorAll(".reveal"));
  let shown = 0;
  function forward() {
    if (shown < steps.length) { steps[shown++].classList.add("on"); return; }
    if (i >= 0 && i < SLIDES.length - 1) location.href = SLIDES[i + 1];
  }
  function back() {
    if (shown > 0) { steps[--shown].classList.remove("on"); return; }
    if (i > 0) location.href = SLIDES[i - 1];
  }
  // N: trainer note (the first HTML comment in <body>)
  const noteText = Array.from(document.body.childNodes).find((n) => n.nodeType === 8)?.textContent.trim();
  const note = document.createElement("aside");
  note.className = "note";
  note.textContent = noteText || "";
  document.body.appendChild(note);

  // O: overview of the current part, with links to the other parts
  const chapterOf = (f) => (/^s(\d)-/.exec(f) || [0, 0])[1] * 1;
  const here = chapterOf(file === "index.html" ? SLIDES[0] : file);
  const ov = document.createElement("div");
  ov.className = "overview";
  ov.hidden = true;
  ov.innerHTML =
    `<div class="ov-panel"><div class="ov-chapters">` +
    CHAPTER_START.map((f, n) => `<a href="${f}"${n === here ? ' aria-current="true"' : ""}>${n}</a>`).join("") +
    `<a href="index.html">All parts</a></div><ol class="ov-list">` +
    SLIDES.map((f, n) => [f, n]).filter(([f]) => chapterOf(f) === here)
      .map(([f, n]) => `<li><a href="${f}"${f === file ? ' aria-current="true"' : ""}><b>${n + 1}</b> ${TITLES[f] || f}</a></li>`).join("") +
    `</ol><p class="ov-keys">← → move · N notes · T timer · F fullscreen · O close</p></div>`;
  document.body.appendChild(ov);
  ov.addEventListener("click", (e) => { if (e.target === ov) ov.hidden = true; });

  // typing in a field or using a control must not turn the slide
  const busy = (t) => t.closest && t.closest("input, textarea, button, select, .tool");

  document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || busy(e.target)) return;
    const k = e.key.toLowerCase();
    if (k === "o" || (k === "escape" && !ov.hidden)) { ov.hidden = !ov.hidden || k === "escape"; return; }
    if (!ov.hidden) return;
    if (k === "n") { document.body.classList.toggle("notes"); return; }
    if (k === "f") {
      if (document.fullscreenElement) document.exitFullscreen?.();
      else document.documentElement.requestFullscreen?.().catch(() => {});
      return;
    }
    if (["ArrowRight", "PageDown", " ", "Enter"].includes(e.key)) { e.preventDefault(); forward(); }
    if (["ArrowLeft", "PageUp", "Backspace"].includes(e.key)) { e.preventDefault(); back(); }
  });
  document.querySelector(".content")?.addEventListener("click", (e) => { if (!busy(e.target)) forward(); });

  // map slides: each part card opens that part
  document.querySelectorAll(".map .card").forEach((card, n) => {
    card.style.cursor = "pointer";
    card.addEventListener("click", (e) => { e.stopPropagation(); location.href = CHAPTER_START[card.dataset.part ?? n]; });
  });
})();
