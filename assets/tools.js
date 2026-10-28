// Interactive tools for the day-3 deck: floating timer (T), talk builder, room simulation,
// topic cards with PREP. Every tool binds by class, so it also works in the one-page preview.
(function () {
  const pad = (n) => String(n).padStart(2, "0");
  const fmt = (s) => `${Math.floor(s / 60)}:${pad(s % 60)}`;

  // ---- floating timer: T toggles; presets; any [data-timer="seconds"] button starts it ----
  const box = document.createElement("div");
  box.className = "timer tool";
  box.hidden = true;
  box.innerHTML =
    `<button class="t-close" aria-label="Close timer">×</button><b>Timer</b>` +
    `<div class="t-time" aria-live="polite">0:00</div>` +
    `<div class="t-row">${[1, 2, 3, 5, 10, 15].map((m) => `<button data-set="${m * 60}">${m} min</button>`).join("")}</div>` +
    `<div class="t-row"><button data-act="go">Start / pause</button><button data-act="reset">Reset</button></div>`;
  document.body.appendChild(box);
  const tTime = box.querySelector(".t-time");
  let left = 0, total = 0, tick = null;
  const show = () => { tTime.textContent = fmt(left); box.classList.toggle("done", total > 0 && left === 0); };
  const stop = () => { clearInterval(tick); tick = null; };
  const run = () => {
    if (tick || left <= 0) return;
    tick = setInterval(() => { left = Math.max(0, left - 1); show(); if (!left) stop(); }, 1000);
  };
  const set = (s, start) => { stop(); total = left = s; show(); box.hidden = false; if (start) run(); };
  box.addEventListener("click", (e) => {
    e.stopPropagation();
    const b = e.target.closest("button");
    if (!b) return;
    if (b.classList.contains("t-close")) box.hidden = true;
    else if (b.dataset.set) set(+b.dataset.set, false);
    else if (b.dataset.act === "go") tick ? stop() : run();
    else if (b.dataset.act === "reset") set(total, false);
  });
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-timer]");
    if (b) { e.stopPropagation(); set(+b.dataset.timer, true); }
  }, true);
  document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.target.closest?.("input, textarea")) return;
    if (e.key === "t" || e.key === "T") box.hidden = !box.hidden;
  });

  // ---- talk builder: words and seconds at a calm pace (about 130 words a minute) ----
  document.querySelectorAll(".builder-tool").forEach((tool) => {
    const out = tool.querySelector(".meter");
    const update = () => {
      const text = Array.from(tool.querySelectorAll("textarea")).map((t) => t.value).join(" ");
      const words = (text.match(/[\p{L}\p{N}'’-]+/gu) || []).length;
      const secs = Math.round(words / 130 * 60);
      out.querySelector(".words").textContent = `${words} words`;
      out.querySelector(".secs").textContent = `≈ ${secs} s at a calm pace`;
      out.querySelector(".fill").style.width = Math.min(100, secs / 72 * 100) + "%";
      out.classList.toggle("over", secs > 60);
    };
    tool.addEventListener("input", update);
    update();
  });

  // ---- room simulation: share of bored listeners ----
  const face = (bored) =>
    `<svg viewBox="0 0 40 40" class="${bored ? "bored" : ""}" aria-hidden="true">` +
    `<circle cx="20" cy="20" r="17" fill="${bored ? "#cfcabb" : "var(--spot)"}" stroke="#16181d" stroke-width="2"/>` +
    (bored
      ? `<path d="M12 18h5M23 18h5" stroke="#16181d" stroke-width="2.4" stroke-linecap="round"/><path d="M15 28h10" stroke="#16181d" stroke-width="2.2" stroke-linecap="round"/>`
      : `<circle cx="14.5" cy="17" r="2.4" fill="#16181d"/><circle cx="25.5" cy="17" r="2.4" fill="#16181d"/><path d="M13 25c4 4 10 4 14 0" fill="none" stroke="#16181d" stroke-width="2.2" stroke-linecap="round"/>`) +
    `</svg>`;
  document.querySelectorAll(".room-tool").forEach((tool) => {
    const room = tool.querySelector(".room");
    const range = tool.querySelector("input[type=range]");
    const label = tool.querySelector(".share");
    const n = +room.dataset.listeners || 18;
    // fixed shuffled order, so moving the slider adds or removes one listener at a time
    const order = Array.from({ length: n }, (_, k) => (k * 7) % n);
    const draw = () => {
      const bored = new Set(order.slice(0, Math.round(n * range.value / 100)));
      room.innerHTML = Array.from({ length: n }, (_, k) => face(bored.has(k))).join("");
      label.textContent = `${range.value}%`;
    };
    range.addEventListener("input", draw);
    draw();
  });

  // ---- on the spot: draw a topic card, then PREP lights one step every 15 seconds ----
  document.querySelectorAll(".spot-tool").forEach((tool) => {
    const topics = JSON.parse(tool.querySelector(".topics").textContent);
    const topic = tool.querySelector(".topic");
    const cards = Array.from(tool.querySelectorAll(".prep .card"));
    const clock = tool.querySelector(".clock");
    let deck = [], t = null, sec = 0;
    const light = () => cards.forEach((c, k) => c.classList.toggle("lit", t !== null && k === Math.min(3, Math.floor(sec / 15))));
    const halt = () => { clearInterval(t); t = null; light(); clock.textContent = ""; };
    tool.querySelector("[data-draw]").addEventListener("click", () => {
      if (!deck.length) deck = topics.slice().sort(() => Math.random() - 0.5);
      topic.textContent = deck.pop();
      topic.classList.remove("empty");
    });
    tool.querySelector("[data-speak]").addEventListener("click", () => {
      if (t !== null) { halt(); return; }
      sec = 0; clock.textContent = "0:00";
      t = setInterval(() => {
        sec++;
        clock.textContent = fmt(sec);
        if (sec >= 60) halt(); else light();
      }, 1000);
      light();
    });
  });
})();
