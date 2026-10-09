const slides = [...document.querySelectorAll(".deck .slide")];
const deck = document.getElementById("deck");
const prev = document.getElementById("prev");
const next = document.getElementById("next");
const jump = document.getElementById("jump");
const panel = document.getElementById("jump-panel");
const current = document.getElementById("current");
const total = document.getElementById("total");
const progress = document.getElementById("progress");

let index = 0;

function titleOf(slide) {
  const heading = slide.querySelector("h1, h2");
  return heading ? heading.textContent.replace(/\s+/g, " ").trim() : "スライド";
}

function buildMenu() {
  panel.innerHTML = slides.map((slide, i) => {
    const number = String(i + 1).padStart(2, "0");
    return `<a href="#${i + 1}" data-index="${i}"><span>${number}</span>${titleOf(slide)}</a>`;
  }).join("");
}

function closeMenu() {
  panel.hidden = true;
  jump.setAttribute("aria-expanded", "false");
}

function show(nextIndex, updateHash = true) {
  index = Math.max(0, Math.min(slides.length - 1, nextIndex));
  slides.forEach((slide, i) => {
    const active = i === index;
    slide.classList.toggle("is-active", active);
    slide.setAttribute("aria-hidden", active ? "false" : "true");
    slide.inert = !active;
    if (active) slide.scrollTop = 0;
  });
  current.textContent = String(index + 1).padStart(2, "0");
  total.textContent = String(slides.length).padStart(2, "0");
  progress.style.width = `${((index + 1) / slides.length) * 100}%`;
  prev.disabled = index === 0;
  next.disabled = index === slides.length - 1;
  panel.querySelectorAll("a").forEach((link, i) => {
    link.classList.toggle("is-current", i === index);
  });
  if (updateHash) history.replaceState(null, "", `#${index + 1}`);
}

buildMenu();

const fromHash = Number(location.hash.replace("#", ""));
show(Number.isInteger(fromHash) && fromHash >= 1 ? fromHash - 1 : 0, false);

prev.addEventListener("click", () => show(index - 1));
next.addEventListener("click", () => show(index + 1));

jump.addEventListener("click", () => {
  panel.hidden = !panel.hidden;
  jump.setAttribute("aria-expanded", String(!panel.hidden));
});

panel.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (!link) return;
  event.preventDefault();
  show(Number(link.dataset.index));
  closeMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.target.closest("input, textarea, [contenteditable='true']")) return;
  if (event.key === "Escape") {
    closeMenu();
    return;
  }
  const forward = ["ArrowRight", "ArrowDown", "PageDown", " "];
  const back = ["ArrowLeft", "ArrowUp", "PageUp"];
  if (forward.includes(event.key)) {
    event.preventDefault();
    show(index + 1);
  } else if (back.includes(event.key)) {
    event.preventDefault();
    show(index - 1);
  } else if (event.key === "Home") {
    show(0);
  } else if (event.key === "End") {
    show(slides.length - 1);
  }
});

window.addEventListener("hashchange", () => {
  const number = Number(location.hash.replace("#", ""));
  if (Number.isInteger(number) && number >= 1 && number <= slides.length) {
    show(number - 1, false);
    closeMenu();
  }
});

let startX = 0;
let startY = 0;
deck.addEventListener("touchstart", (event) => {
  startX = event.touches[0].clientX;
  startY = event.touches[0].clientY;
}, { passive: true });

deck.addEventListener("touchend", (event) => {
  const dx = event.changedTouches[0].clientX - startX;
  const dy = event.changedTouches[0].clientY - startY;
  if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy)) return;
  show(index + (dx < 0 ? 1 : -1));
}, { passive: true });
