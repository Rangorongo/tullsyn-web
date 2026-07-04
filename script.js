// Tullsyn — landningssidans animationer
// Tre delar: scroll-intoning, uppräknande siffror och hero-demon.
// Allt är byggt med webbläsarens inbyggda verktyg — inga bibliotek.

// --- 1. Scroll-intoning: element med .reveal tonas in när de blir synliga ---
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

// --- 2. Uppräknande siffror: räknar från 0 när de scrollas fram ---
function raknaUpp(el) {
  const mal = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || "";
  const start = performance.now();
  const tid = 1400;

  function steg(nu) {
    const p = Math.min((nu - start) / tid, 1);
    const easing = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(mal * easing) + suffix;
    if (p < 1) requestAnimationFrame(steg);
  }
  requestAnimationFrame(steg);
}

const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        raknaUpp(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);
document.querySelectorAll(".stat-value[data-count]").forEach((el) => statObserver.observe(el));

// --- 3. Hero-demon: fakturarader granskas, domar landar, summan räknas upp ---
const demoRader = [
  { namn: "Elektronikkort, PCB", farg: "var(--gron)", dom: "godkänd" },
  { namn: "Polypropylengranulat", farg: "var(--gron)", dom: "godkänd" },
  { namn: "Strömförsörjning 24V", farg: "var(--rod)", dom: "felklassificerad" },
  { namn: "Mikroprocessor ARM", farg: "var(--gul)", dom: "bör granskas" },
  { namn: "Kablar, koppar", farg: "var(--gron)", dom: "godkänd" },
];

const demoHost = document.getElementById("demo-rows");
const demoStatus = document.getElementById("demo-status");
const demoSum = document.getElementById("demo-sum");

function korDemo() {
  if (!demoHost) return;
  demoHost.innerHTML = "";

  const divs = demoRader.map((rad) => {
    const div = document.createElement("div");
    div.className = "demo-row";
    div.innerHTML =
      '<span class="demo-dot"></span>' +
      '<span class="demo-name">' + rad.namn + "</span>" +
      '<span class="demo-verdict"></span>';
    demoHost.appendChild(div);
    return div;
  });

  let i = 0;
  const malBelopp = 21970; // 219,70 kr i ören — undviker decimalfel

  function nastaRad() {
    if (i < divs.length) {
      const div = divs[i];
      const rad = demoRader[i];
      div.classList.add("visible");
      setTimeout(() => {
        div.querySelector(".demo-dot").style.background = rad.farg;
        div.querySelector(".demo-verdict").textContent = rad.dom;
      }, 380);
      i++;
      demoStatus.textContent = "rad " + i + " av " + divs.length;
      setTimeout(nastaRad, 620);
    } else {
      requestAnimationFrame(raknaSumma);
    }
  }

  let sumStart = null;
  function raknaSumma(nu) {
    if (!sumStart) sumStart = nu;
    const p = Math.min((nu - sumStart) / 1500, 1);
    const easing = 1 - Math.pow(1 - p, 3);
    const oren = Math.round(malBelopp * easing);
    demoSum.textContent = (oren / 100).toFixed(2).replace(".", ",") + " kr";
    if (p < 1) {
      requestAnimationFrame(raknaSumma);
    } else {
      // Paus, sedan börjar demon om från början
      setTimeout(() => {
        sumStart = null;
        demoSum.textContent = "0,00 kr";
        demoStatus.textContent = "rad 0 av 5";
        korDemo();
      }, 4500);
    }
  }

  setTimeout(nastaRad, 600);
}

korDemo();
