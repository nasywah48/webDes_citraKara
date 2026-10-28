(function () {                                                   

const videoContainer = document.getElementById("videoContainer");
if (!videoContainer) return;                                     

const videoShade     = document.getElementById("videoShade");
const darkOverlay    = document.getElementById("darkOverlay");
const textTop        = document.getElementById("textTop");
const textBottom     = document.getElementById("textBottom");
const heroFinal      = document.getElementById("heroFinal");

const hero = videoContainer.closest("section");

// CONFIG 
const START_RADIUS = 250;
const APPEAR_END   = 0.25;
const EXPAND_END   = 0.8;
const FINAL_START  = 0.78;  // teks akhir mulai muncul
const FINAL_END    = 0.95;  // teks akhir muncul penuh
const SMOOTH       = 0.08;

// HELPERS 
const clamp      = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const lerp       = (a, b, t) => a + (b - a) * t;
const easeOut    = (t) => 1 - Math.pow(1 - t, 3);
const smoothstep = (t) => t * t * (3 - 2 * t);

function getProgress() {
    const distance = hero.offsetHeight - window.innerHeight;
    if (distance <= 0) return 0;
    return clamp(-hero.getBoundingClientRect().top / distance);
}

// animasi 
function updateHero(p) {
    // video muncul
    const a = smoothstep(clamp(p / APPEAR_END));

    // lingkaran membesar sampai fullscreen
    const e = easeOut(clamp((p - APPEAR_END) / (EXPAND_END - APPEAR_END)));

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const startR = Math.min(START_RADIUS, Math.min(vw, vh) * 0.45);
    const endR   = Math.hypot(vw, vh) / 2;
    const radius = lerp(0, startR, a) + (endR - startR) * e;

    videoContainer.style.clipPath = `circle(${radius}px at 50% 50%)`;
    videoContainer.style.opacity  = a;

    if (videoShade) videoShade.style.opacity = lerp(0.5, 0.25, e);

    const move = e * 70;
    const fade = 1 - clamp((p - 0.25) / 0.35);

    if (textTop) {
        textTop.style.transform = `translate3d(${-move}vw, 0, 0)`;
        textTop.style.opacity   = fade;
    }
    if (textBottom) {
        textBottom.style.transform = `translate3d(${move}vw, 0, 0)`;
        textBottom.style.opacity   = fade;
    }

    // teks "Jelajahi Keindahan NUSANTARA"
    const f = smoothstep(clamp((p - FINAL_START) / (FINAL_END - FINAL_START)));
    if (heroFinal) {
        heroFinal.style.opacity   = f;
        heroFinal.style.transform = `translate3d(0, ${(1 - f) * 30}px, 0)`;
    }

    if (darkOverlay) darkOverlay.style.opacity = 0.3 + 0.45 * p;
}

// events  
let current = getProgress();
let target  = current;
let raf     = null;

function tick() {
    current += (target - current) * SMOOTH;
    if (Math.abs(target - current) < 0.0005) current = target;

    updateHero(current);
    raf = current !== target ? requestAnimationFrame(tick) : null;
}

window.addEventListener("scroll", () => {
    target = getProgress();
    if (!raf) raf = requestAnimationFrame(tick);
}, { passive: true });

window.addEventListener("resize", () => {
    target = current = getProgress();
    updateHero(current);
});

updateHero(current);
})();                                                            

 // section 2: Navigasi CD dengan tombol arrow
(function () {
    const viewport = document.getElementById("discViewport");
    const track = document.getElementById("discTrack");
    const prev = document.getElementById("discPrev");
    const next = document.getElementById("discNext");

    if (!viewport || !track || !prev || !next) return;

    const cards = Array.from(track.querySelectorAll(".disc"));
    if (!cards.length) return;

    const ACTIVE_SCALE = 1;
    const SIDE_SCALE = 0.80;
    let activeIndex = 2;

    function getGap() {
        return parseFloat(getComputedStyle(track).columnGap) || 0;
    }

    function getStep() {
        const card = cards[0];
        return card.getBoundingClientRect().width + getGap();
    }

    function render() {
        const step = getStep();
        const viewportCenter = viewport.clientWidth / 2;

        // memusatkan CD aktif di tengah viewport
        const targetScroll =
            cards[activeIndex].offsetLeft +
            cards[activeIndex].offsetWidth / 2 -
            viewportCenter;

        viewport.scrollTo({
            left: Math.max(
                0,
                Math.min(
                    targetScroll,
                    viewport.scrollWidth - viewport.clientWidth
                )
            ),
            behavior: "smooth"
        });
        cards.forEach((card, index) => {
            const distance = Math.abs(index - activeIndex);
            const scale = distance === 0 ? ACTIVE_SCALE : SIDE_SCALE;

            card.style.transform = `scale(${scale})`;
            card.style.zIndex = distance === 0 ? "2" : "1";
            card.style.opacity = distance > 2 ? "0.65" : "1";
        });
    }

    next.addEventListener("click", () => {
        activeIndex = Math.min(activeIndex + 1, cards.length - 1);
        render();
    });

    prev.addEventListener("click", () => {
        activeIndex = Math.max(activeIndex - 1, 0);
        render();
    });

    window.addEventListener("resize", render);

    render();
})();

// section 3 garis/bulatan berlawanan arah
(function () {
    const section  = document.getElementById("sejarah");
    const timeline = document.getElementById("timeline");
    const line     = document.getElementById("tlLine");
    if (!section || !timeline) return;

    const dots = Array.from(timeline.querySelectorAll("[data-dot]"));
    const reveals = Array.from(document.querySelectorAll("[data-reveal]"));

    // config
    const DIST      = 280;   // jarak geser garis/bulatan (px). Harus lebih kecil dari 160 (-inset-y-40)
    const DOT_BOOST = 0.5;   // bulatan di tengah layar membesar sampai 1 + 0.9 = 1.9x

    const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // reveal soft 
    if (!reduceMotion) {
        reveals.forEach(el => {
            const group = el.closest("[data-item]") || el.parentElement;
            const i = Array.from(group.querySelectorAll("[data-reveal]")).indexOf(el);
            const delay = Math.min(i, 4) * 120;
            const ease = "cubic-bezier(.22,1,.36,1)";

            el.style.opacity = "0";
            el.style.transform = "translate3d(0, 32px, 0)";
            el.style.filter = "blur(6px)";
            el.style.transition =
                `opacity 1100ms ${ease} ${delay}ms, ` +
                `transform 1100ms ${ease} ${delay}ms, ` +
                `filter 1100ms ${ease} ${delay}ms`;
        });

        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                el.style.opacity = "1";
                el.style.transform = "translate3d(0, 0, 0)";
                el.style.filter = "blur(0)";
                io.unobserve(el);
            });
        }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });

        reveals.forEach(el => io.observe(el));
    }

    // garis dan bulet di tengah
    function update() {
        if (reduceMotion) return;

        const vh   = window.innerHeight;
        const rect = timeline.getBoundingClientRect();

        // 0 saat timeline baru masuk dari bawah, 1 saat sudah keluar lewat atas
        const p = clamp((vh - rect.top) / (vh + rect.height));

        // konten naik, garis & bulatan turun: p 0 -> 1 menghasilkan -DIST -> +DIST
        const offset = (p - 0.5) * 2 * DIST;

        if (line) line.style.transform = `translate3d(0, ${offset}px, 0)`;

        dots.forEach(dot => {
            const r  = dot.getBoundingClientRect();
            const cy = r.top + r.height / 2;
            const t  = clamp(1 - Math.abs(cy - vh / 2) / (vh * 0.45));
            const s  = 1 + t * DOT_BOOST;
            dot.style.transform = `translate3d(0, ${offset}px, 0) scale(${s})`;
        });
    }

    let ticking = false;
    window.addEventListener("scroll", () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            update();
            ticking = false;
        });
    }, { passive: true });

    window.addEventListener("resize", update);
    update();
})();

// section 4 page destinasi
(function () {
    const section = document.getElementById("topDest");
    const stage = document.getElementById("destStage");
    const prev = document.getElementById("destPrev");
    const next = document.getElementById("destNext");
    const fill = document.getElementById("destFill");
    const current = document.getElementById("destCurrent");
    const total = document.getElementById("destTotal");

    if (!section || !stage || !prev || !next) return;

    const cards = Array.from(stage.querySelectorAll(".dest"));
    const n = cards.length;
    if (!n) return;

    const half = Math.floor(n / 2);
    const lastOffset = new Array(n).fill(null);
    let active = 0;

    const cssVar = (name) =>
        parseFloat(getComputedStyle(section).getPropertyValue(name)) || 0;

    const pad = (v) => String(v).padStart(2, "0");

    // titik tengah card berdasarkan jaraknya (d) dari card aktif
    function centerFor(d, w, aw, gap) {
        if (d === 0) return 0;
        const sign = Math.sign(d);
        const dist = Math.abs(d);
        return sign * (aw / 2 + gap + (dist - 1) * (w + gap) + w / 2);
    }

    function render() {
        const w = cssVar("--w");
        const aw = cssVar("--aw");
        const gap = cssVar("--gap");

        cards.forEach((card, i) => {
            // d: -2 .. 2 (melingkar)
            const d = ((i - active + n + half) % n) - half;
            const last = lastOffset[i];
            const wrapped = last !== null && Math.abs(d - last) > half;

            // card yang "loncat" dari ujung ke ujung tidak dianimasikan
            if (wrapped) card.style.transition = "none";

            card.dataset.active = d === 0 ? "true" : "false";
            card.style.transform = `translateX(${centerFor(d, w, aw, gap)}px) translateX(-50%)`;
            card.style.zIndex = d === 0 ? "2" : "1";

            const hidden = Math.abs(d) > 2;
            card.style.opacity = hidden ? "0" : "1";
            card.style.pointerEvents = hidden ? "none" : "";

            if (wrapped) {
                void card.offsetWidth; // paksa reflow
                card.style.transition = "";
            }

            lastOffset[i] = d;
        });

        // tracking
        fill.style.width = `${((active + 1) / n) * 100}%`;
        current.textContent = pad(active + 1);
        total.textContent = pad(n);
    }

    const go = (index) => {
        active = (index + n) % n;
        render();
    };

    next.addEventListener("click", () => go(active + 1));
    prev.addEventListener("click", () => go(active - 1));

    // klik card samping untuk memindahkan ke card itu
    cards.forEach((card, i) => {
        card.addEventListener("click", (e) => {
            if (e.target.closest("a")) return;
            if (i !== active) go(i);
        });
    });

    // swipe untuk mobile
    let startX = null;
    stage.addEventListener("pointerdown", (e) => (startX = e.clientX));
    stage.addEventListener("pointerup", (e) => {
        if (startX === null) return;
        const delta = e.clientX - startX;
        if (Math.abs(delta) > 50) go(active + (delta < 0 ? 1 : -1));
        startX = null;
    });

    window.addEventListener("resize", render);
    render();
})();

