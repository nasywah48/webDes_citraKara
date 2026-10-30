// navbar: hamburger mobile
(function () {
    const nav = document.getElementById("navbar");
    const toggle = document.getElementById("navToggle");
    const menu = document.getElementById("navMenu");
    const icon = document.getElementById("navIcon");

    if (!nav || !toggle || !menu || !icon) return;

    function setOpen(open) {
        menu.dataset.open = String(open);
        menu.inert = !open;
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
        icon.className = `${open ? "ri-close-line" : "ri-menu-line"} text-2xl`;
    }

    toggle.addEventListener("click", () => setOpen(menu.dataset.open !== "true"));

    // tutup saat salah satu link diklik
    menu.addEventListener("click", (e) => {
        if (e.target.closest("a")) setOpen(false);
    });

    // tutup saat klik di luar navbar atau tekan Esc
    document.addEventListener("click", (e) => {
        if (!nav.contains(e.target)) setOpen(false);
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") setOpen(false);
    });

    // tutup otomatis kalau layar dilebarkan ke ukuran desktop
    window.matchMedia("(min-width: 768px)").addEventListener("change", (e) => {
        if (e.matches) setOpen(false);
    });
})();

/* hero section, video */
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
    const n = cards.length;
    if (!n) return;

    const START_INDEX = 2;   // CD yang di tengah saat halaman dibuka (0 = CD pertama)
    const SIDE_SCALE = 0.8;  // ukuran CD samping
    const GAP = 8;           // jarak antar CD (px)
    const DURATION = 500;    // lama geser (ms), makin besar makin pelan

    const half = n / 2;
    const mod = (x, m) => ((x % m) + m) % m;
    const ease = (t) => 1 - Math.pow(1 - t, 3); // easeOutCubic

    let pos = START_INDEX;    // posisi saat ini (pecahan, terus bergerak)
    let target = START_INDEX; // posisi tujuan
    let raf = 0;

    const getStep = () => cards[0].offsetWidth + GAP;

    function render() {
        const step = getStep();

        cards.forEach((card, i) => {
            // rel: jarak card dari tengah, melingkar (-half .. half)
            const rel = mod(i - pos + half, n) - half;
            const abs = Math.abs(rel);

            const scale = 1 - (1 - SIDE_SCALE) * Math.min(1, abs);
            // card di ujung memudar sebelum pindah sisi, jadi loncatannya tidak terlihat
            const opacity = Math.max(0, Math.min(1, half - abs));

            card.style.transform = `translateX(${rel * step}px) translateX(-50%) scale(${scale})`;
            card.style.opacity = String(opacity);
            card.style.zIndex = String(Math.round(10 - abs));
            card.style.pointerEvents = opacity === 0 ? "none" : "";
        });
    }

    function animateTo(to, duration = DURATION) {
        cancelAnimationFrame(raf);
        const from = pos;
        const start = performance.now();
        target = to;

        const tick = (now) => {
            const t = Math.min(1, (now - start) / duration);
            pos = from + (to - from) * ease(t);
            render();
            if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
    }

    const go = (delta) => animateTo(Math.round(target) + delta);

    next.addEventListener("click", () => go(1));
    prev.addEventListener("click", () => go(-1));

    /* ---------- drag mouse & swipe jari ---------- */
    let startX = 0;
    let startPos = 0;
    let dx = 0;
    let moved = false;

    viewport.addEventListener("dragstart", (e) => e.preventDefault());

    viewport.addEventListener("pointerdown", (e) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        cancelAnimationFrame(raf);
        moved = false;
        startX = e.clientX;
        startPos = pos;
        dx = 0;
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
        window.addEventListener("pointercancel", onUp);
    });

    function onMove(e) {
        dx = e.clientX - startX;
        if (Math.abs(dx) > 5) moved = true;
        pos = startPos - dx / getStep(); // CD mengikuti jari/kursor
        render();
    }

    function onUp() {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);

        const step = getStep();
        const base = Math.round(startPos);
        let t = Math.round(pos);
        if (t === base && Math.abs(dx) > step * 0.2) t = base + (dx < 0 ? 1 : -1); // flick kecil
        t = Math.max(base - 2, Math.min(base + 2, t));

        animateTo(t, 400);
    }

    // klik CD samping untuk memindahkannya ke tengah
    cards.forEach((card, i) => {
        card.addEventListener("click", () => {
            if (moved) return;
            const rel = Math.round(mod(i - target + half, n) - half);
            if (rel) go(rel);
        });
    });

    /* ---------- touchpad (geser dua jari ke samping) ---------- */
    let wheelAcc = 0;
    let wheelLock = false;
    let wheelTimer;

    viewport.addEventListener(
        "wheel",
        (e) => {
            if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return; // scroll vertikal biarkan lewat
            e.preventDefault();

            clearTimeout(wheelTimer);
            wheelTimer = setTimeout(() => {
                wheelLock = false;
                wheelAcc = 0;
            }, 120);

            if (wheelLock) return;
            wheelAcc += e.deltaX;
            if (Math.abs(wheelAcc) >= 50) {
                go(Math.sign(wheelAcc));
                wheelLock = true;
                wheelAcc = 0;
            }
        },
        { passive: false }
    );

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

// section 4 popup
(function () {
    const section = document.getElementById("alam");
    const modal = document.getElementById("alamModal");
    if (!section || !modal) return;

    const $ = (id) => document.getElementById(id);
    const overlay = $("alamOverlay"), closeBtn = $("alamModalClose");
    const img = $("alamModalImg"), title = $("alamModalTitle"), lokasi = $("alamModalLokasi");
    const desc = $("alamModalDesc"), body = $("alamModalBody");
    const now = $("alamModalNow"), total = $("alamModalTotal");
    const prev = $("alamModalPrev"), next = $("alamModalNext");

    // Kunci = isi atribut alt gambar di kartu galeri. Ganti teksnya dengan naskahmu sendiri.
    const INFO = {
        "Pulau Padar": {
            lokasi: "Taman Nasional Komodo, Nusa Tenggara Timur",
            desc: [
                "Pulau Padar merupakan salah satu destinasi paling ikonik di Taman Nasional Komodo. Pulau ini terkenal dengan panorama perbukitan savana yang membentang di antara teluk-teluk berair biru jernih.",
                "Dari puncaknya, pengunjung dapat menikmati pemandangan beberapa teluk sekaligus, menjadikannya salah satu tempat terbaik untuk menyaksikan matahari terbit dan mengabadikan keindahan alam Indonesia.",
            ],
        },
        "Tanjung Bira": {
            lokasi: "Bulukumba, Sulawesi Selatan",
            desc: [
                "Tanjung Bira dikenal dengan hamparan pasir putih halus dan air laut yang jernih, cocok untuk berenang, snorkeling, dan menikmati senja di tepi pantai.",
                "Kawasan ini juga lekat dengan tradisi pembuatan kapal pinisi, warisan maritim masyarakat Bulukumba yang telah diakui dunia.",
            ],
        },
        "Tangkuban Perahu": {
            lokasi: "Bandung, Jawa Barat",
            desc: [
                "Tangkuban Perahu adalah gunung berapi aktif di utara Kota Bandung dengan kawah-kawah yang bisa dilihat langsung dari bibir kawah, seperti Kawah Ratu.",
                "Namanya berasal dari legenda Sangkuriang, kisah rakyat Sunda tentang perahu yang ditendang hingga terbalik dan menjadi gunung.",
            ],
        },
        "Air Terjun Laumarang": {
            lokasi: "Banggai, Sulawesi Tengah",
            desc: [
                "Air Terjun Laumarang tersembunyi di tengah hutan tropis Kabupaten Banggai. Aliran airnya jatuh di antara tebing hijau yang rimbun dan menciptakan suasana yang sejuk dan tenang.",
                "Tempat ini cocok bagi pencinta alam yang ingin menikmati keindahan Sulawesi Tengah jauh dari keramaian.",
            ],
        },
        "Raja Ampat": {
            lokasi: "Sorong, Papua Barat Daya",
            desc: [
                "Raja Ampat adalah gugusan pulau karst dengan laut yang menyimpan keanekaragaman hayati bawah laut salah satu yang terkaya di dunia.",
                "Terumbu karang yang masih terjaga, laguna berwarna tosca, dan panorama pulau-pulau kecilnya menjadikan Raja Ampat surga bagi penyelam dan pencinta alam.",
            ],
        },
        "Gunung Bromo": {
            lokasi: "Probolinggo, Jawa Timur",
            desc: [
                "Gunung Bromo terkenal dengan lautan pasir dan kawahnya yang masih aktif. Pemandangan matahari terbit dari Penanjakan adalah salah satu yang paling dicari di Indonesia.",
                "Kawasan ini juga menjadi tempat tinggal masyarakat Tengger, yang setiap tahun menggelar upacara Yadnya Kasada di kawah Bromo.",
            ],
        },
        "Pantai Merah": {
            lokasi: "Pulau Komodo, Nusa Tenggara Timur",
            desc: [
                "Pantai Merah, atau Pink Beach, memiliki pasir berwarna merah muda yang berasal dari serpihan karang merah yang bercampur dengan pasir putih.",
                "Airnya yang jernih dan terumbu karangnya yang indah menjadikan pantai ini tempat yang sempurna untuk snorkeling di kawasan Taman Nasional Komodo.",
            ],
        },
    };

    const cards = Array.from(section.querySelectorAll(".group"));
    const pad = (v) => String(v).padStart(2, "0");
    const visibleCards = () => cards.filter((c) => c.offsetParent !== null); // di mobile satu kartu disembunyikan

    let list = [];
    let index = 0;
    let lastFocus = null;
    let swapTimer;

    function fill(card) {
        const photo = card.querySelector("img");
        const name = photo?.alt ?? "";
        const info = INFO[name] ?? {
            lokasi: "Indonesia",
            desc: [`Jelajahi ${name}, sebuah destinasi dengan keindahan alam yang menunggu untuk ditemukan.`],
        };

        img.src = photo?.currentSrc || photo?.src || "";
        img.alt = name;
        title.textContent = name;
        lokasi.textContent = info.lokasi;

        desc.replaceChildren(
            ...info.desc.map((text) => {
                const p = document.createElement("p");
                p.className = "m-0";
                p.textContent = text;
                return p;
            })
        );

        now.textContent = pad(index + 1);
        total.textContent = pad(list.length);
        body.scrollTop = 0;
    }

    function show(i, animate = true) {
        index = (i + list.length) % list.length;
        clearTimeout(swapTimer);

        if (!animate) return fill(list[index]);

        // fade singkat saat pindah antar destinasi
        body.style.opacity = "0";
        swapTimer = setTimeout(() => {
            fill(list[index]);
            body.style.opacity = "1";
        }, 180);
    }

    function open(card) {
        list = visibleCards();
        index = Math.max(0, list.indexOf(card));
        lastFocus = document.activeElement;
        show(index, false);

        body.style.opacity = "1";
        modal.inert = false;
        modal.dataset.visible = "true";
        document.body.style.overflow = "hidden";
        closeBtn.focus({ preventScroll: true });
    }

    function close() {
        modal.dataset.visible = "false";
        modal.inert = true;
        document.body.style.overflow = "";
        lastFocus?.focus?.({ preventScroll: true });
    }

    cards.forEach((card) => {
        card.classList.add("cursor-pointer");
        card.setAttribute("role", "button");
        card.tabIndex = 0;
        card.addEventListener("click", () => open(card));
        card.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                open(card);
            }
        });
    });

    closeBtn.addEventListener("click", close);
    overlay.addEventListener("click", close);
    prev.addEventListener("click", () => show(index - 1));
    next.addEventListener("click", () => show(index + 1));

    document.addEventListener("keydown", (e) => {
        if (modal.dataset.visible !== "true") return;
        if (e.key === "Escape") close();
        if (e.key === "ArrowLeft") show(index - 1);
        if (e.key === "ArrowRight") show(index + 1);
    });
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

