(function () {                                                   // ← BARIS BARU (1)

const videoContainer = document.getElementById("videoContainer");
if (!videoContainer) return;                                     // ← BARIS BARU (2)

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

// ANIMATION 
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

// sound
const music = document.getElementById("bgMusic");
const musicToggle = document.getElementById("musicToggle");
const musicIcon = document.getElementById("musicIcon");
const musicLabel = document.getElementById("musicLabel");

musicToggle.addEventListener("click", async () => {
    if (music.paused) {
        try {
            await music.play();

            musicLabel.textContent = "Music On";
            musicIcon.className = "ri-volume-up-line text-lg";
            musicToggle.setAttribute("aria-label", "Matikan musik");
            musicToggle.setAttribute("aria-pressed", "true");
        } catch (error) {
            console.error("Musik gagal diputar:", error);
            musicLabel.textContent = "Try Again";
        }
    } else {
        music.pause();

        musicLabel.textContent = "Music Off";
        musicIcon.className = "ri-music-2-line text-lg";
        musicToggle.setAttribute("aria-label", "Putar musik");
        musicToggle.setAttribute("aria-pressed", "false");
    }
});



// EVENTS  
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

// section 2: scroll vertikal -> geser horizontal
(function () {
    const section = document.getElementById("budayaScroll");
    const track   = document.getElementById("discTrack");
    if (!section || !track) return;

    const items = Array.from(track.querySelectorAll(".disc"));

    // CONFIG
    const START_INDEX = 2;     // piringan ke-3 (index 2) di tengah saat awal
    const MIN_SCALE   = 0.66;  // ukuran piringan yang jauh dari tengah
    const SCROLL_RATIO = 1;    // 1 = jarak scroll sama dengan jarak geser; makin besar makin pelan

    const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
    const lerp  = (a, b, t) => a + (b - a) * t;

    let centers = [];   // posisi tengah tiap piringan di dalam track
    let size = 0;

    function measure() {
        centers = items.map(el => el.offsetLeft + el.offsetWidth / 2);
        size = items[0].offsetWidth;

        const dist = centers[centers.length - 1] - centers[START_INDEX];
        section.style.height = `${window.innerHeight + dist * SCROLL_RATIO}px`;
    }

    function update() {
        const total = section.offsetHeight - window.innerHeight;
        if (total <= 0) return;

        const p = clamp(-section.getBoundingClientRect().top / total);

        const vwCenter = window.innerWidth / 2;
        const from = centers[START_INDEX];
        const to   = centers[centers.length - 1];

        // geser track supaya titik "from -> to" selalu melewati tengah layar
        const x = vwCenter - lerp(from, to, p);
        track.style.transform = `translate3d(${x}px, 0, 0)`;

        // piringan makin dekat tengah makin besar
        items.forEach((el, i) => {
            const d = Math.abs(centers[i] + x - vwCenter);
            const t = clamp(d / (size * 0.95));
            const s = lerp(1, MIN_SCALE, t);

            el.style.transform = `scale(${s})`;
            el.style.zIndex = Math.round(s * 100);
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

    window.addEventListener("resize", () => { measure(); update(); });
    window.addEventListener("load", () => { measure(); update(); });

    measure();
    update();
})();

// section 3: piringan berputar tanpa putus
(function () {
    const section = document.getElementById("budayaScroll");
    const stage   = document.getElementById("discTrack");
    if (!section || !stage) return;

    // buang salinan lama kalau masih ada
    stage.querySelectorAll(".disc[data-clone]").forEach(el => el.remove());

    const items = Array.from(stage.querySelectorAll(".disc"));
    const N = items.length;

    // CONFIG
    const START_INDEX  = 2;     // piringan ke-3 di tengah saat awal
    const MIN_SCALE    = 0.66;  // ukuran piringan yang jauh dari tengah
    const GAP          = -48;   // jarak antar piringan (negatif = rapat)
    const LOOPS        = 1;     // berapa putaran penuh sebelum lanjut scroll ke bawah
    const SCROLL_RATIO = 1.2;   // makin besar = putaran makin pelan
    const FADE_STEPS   = 1;     // lebar zona memudar di tepi (satuan: 1 piringan)

    const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
    const lerp  = (a, b, t) => a + (b - a) * t;

    let size = 0, step = 0, total = 0;

    function build() {
        size  = items[0].offsetWidth;
        step  = size + GAP;
        total = N * step;   // keliling lingkaran = 1 putaran penuh

        section.style.height =
            `${window.innerHeight + total * LOOPS * SCROLL_RATIO}px`;
    }

    function update() {
        const range = section.offsetHeight - window.innerHeight;
        if (range <= 0) return;

        const p = clamp(-section.getBoundingClientRect().top / range);

        // pusat LAYAR dalam koordinat #discTrack
        const center = window.innerWidth / 2 - stage.getBoundingClientRect().left;

        const shift = START_INDEX * step + p * total * LOOPS;
        const half  = total / 2;

        items.forEach((el, i) => {
            // jarak dari tengah, dibungkus supaya melingkar
            let rel = i * step - shift;
            rel = ((rel + half) % total + total) % total - half;

            // makin dekat tengah makin besar
            const t = clamp(Math.abs(rel) / (size * 0.95));
            const s = lerp(1, MIN_SCALE, t);

            // memudar menjelang titik loncat (±half), jadi tidak ada piringan ganda
            const o = clamp((half - Math.abs(rel)) / (FADE_STEPS * step));

            el.style.transform =
                `translate3d(${center + rel - size / 2}px, 0, 0) scale(${s})`;
            el.style.opacity = o;
            el.style.zIndex  = Math.round(s * 100);
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

    window.addEventListener("resize", () => { build(); update(); });
    window.addEventListener("load",   () => { build(); update(); });

    build();
    update();
})();

// section 3 garis/bulatan berlawanan arah
(function () {
    const section  = document.getElementById("sejarah");
    const timeline = document.getElementById("timeline");
    const line     = document.getElementById("tlLine");
    if (!section || !timeline) return;

    const dots = Array.from(timeline.querySelectorAll("[data-dot]"));
    const reveals = Array.from(document.querySelectorAll("[data-reveal]"));

    // ---------- CONFIG ----------
    const DIST      = 280;   // jarak geser garis/bulatan (px). Harus lebih kecil dari 160 (-inset-y-40)
    const DOT_BOOST = 0.5;   // bulatan di tengah layar membesar sampai 1 + 0.9 = 1.9x

    const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // REVEAL SOFT 
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

    // GARIS & BULATAN BERLAWANAN ARAH
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


//  PETA INTERAKTIF "DIAANN GUWEH PUYENK"
(function () {
    const mount   = document.getElementById("petaMount");
    const wrap    = document.getElementById("petaWrap");
    const tooltip = document.getElementById("petaTooltip");
    const info    = document.getElementById("petaInfo");
    const nama    = document.getElementById("petaNama");
    const link    = document.getElementById("petaLink");
    if (!mount) return;

    const SVG_URL     = encodeURI("assets/destinasi/peta_provinsi.svg");  // ganti sesuai nama file barumu
    const HOVER_FILL  = "#9fb8e3";
    const ACTIVE_FILL = "#d97b3f";   // samakan dengan warna "secondary"

    const slugify  = (s) => s.toLowerCase().trim().replace(/\s+/g, "-");
    const prettify = (s) => s.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    // kode ISO 3166-2:ID -> nama provinsi (dipakai kalau SVG hanya punya kode di id)
    const NAMA_PROVINSI = {
        AC: "Aceh",                SU: "Sumatera Utara",      SB: "Sumatera Barat",
        RI: "Riau",                JA: "Jambi",               SS: "Sumatera Selatan",
        BE: "Bengkulu",            LA: "Lampung",             BB: "Kepulauan Bangka Belitung",
        KR: "Kepulauan Riau",      JK: "DKI Jakarta",         JB: "Jawa Barat",
        JT: "Jawa Tengah",         YO: "DI Yogyakarta",       JI: "Jawa Timur",
        BT: "Banten",              BA: "Bali",                NB: "Nusa Tenggara Barat",
        NT: "Nusa Tenggara Timur", KB: "Kalimantan Barat",    KT: "Kalimantan Tengah",
        KS: "Kalimantan Selatan",  KI: "Kalimantan Timur",    KU: "Kalimantan Utara",
        SA: "Sulawesi Utara",      ST: "Sulawesi Tengah",     SN: "Sulawesi Selatan",
        SG: "Sulawesi Tenggara",   GO: "Gorontalo",           SR: "Sulawesi Barat",
        MA: "Maluku",              MU: "Maluku Utara",        PA: "Papua",
        PB: "Papua Barat",         PS: "Papua Selatan",       PT: "Papua Tengah",
        PE: "Papua Pegunungan",    PD: "Papua Barat Daya"
    };

    function readName(el) {
        const titleElement = el.querySelector(":scope > title");

        // Ambil nama asli provinsi dari atribut SVG
        const raw = (
            el.getAttribute("data-name") ||
            el.getAttribute("name") ||
            el.getAttribute("title") ||
            el.getAttribute("aria-label") ||
            el.getAttribute("inkscape:label") ||
            titleElement?.textContent ||
            ""
        ).trim();

        // Hapus title agar tooltip browser tidak muncul bersamaan
        if (titleElement) titleElement.remove();

        if (raw) {
            return raw;
        }

        // Jika nama tidak tersedia, gunakan ID provinsi
        const code = (el.id || "")
            .toUpperCase()
            .replace(/[^A-Z]/g, "")
            .replace(/^ID(?=[A-Z]{2}$)/, "");

        return NAMA_PROVINSI[code] || "";
    }

    function initPeta(svg) {
        const groups = new Map();               // nama provinsi -> semua bagiannya (pulau-pulau)
        let unnamed = 0;

        svg.querySelectorAll("path, polygon").forEach((el) => {
            const name = readName(el);
            if (!name) {                        // garis batas / bagian tanpa nama
                el.style.pointerEvents = "none";
                unnamed++;
                return;
            }
            el.dataset.name = name;
            el.style.cursor = "pointer";
            el.style.transition = "fill .25s ease";
            el.setAttribute("vector-effect", "non-scaling-stroke");
            if (!groups.has(name)) groups.set(name, []);
            groups.get(name).push(el);
        });

        if (!groups.size) {
            console.error("SVG ini tidak punya nama provinsi di path-nya (data-name / name / title / id). Pakai SVG per provinsi yang sudah bernama.");
            return;
        }

        let hovered = null;
        let active  = null;

        function render(name) {
            if (!name) return;
            const fill = name === active ? ACTIVE_FILL : name === hovered ? HOVER_FILL : "";
            groups.get(name).forEach((p) => (p.style.fill = fill));
        }

        function moveTooltip(e) {
            const r = wrap.getBoundingClientRect();
            tooltip.style.left = `${e.clientX - r.left}px`;
            tooltip.style.top  = `${e.clientY - r.top - 14}px`;
        }

        function selectProvince(name) {
            const prev = active;
            if (prev === name) {                // klik lagi = batal pilih
                active = null;
                render(name);
                info.classList.add("opacity-0", "translate-y-3");
                return;
            }
            active = name;
            render(prev);
            render(name);

            nama.textContent = name;
            link.href = `destinasi.html?provinsi=${slugify(name)}`;
            info.classList.remove("opacity-0", "translate-y-3");
        }

        groups.forEach((els, name) => {
            els.forEach((el) => {
                el.addEventListener("pointerenter", (e) => {
                    hovered = name;
                    render(name);
                    if (e.pointerType !== "mouse") return;
                    tooltip.textContent = name;
                    tooltip.classList.remove("hidden");
                    moveTooltip(e);
                });
                el.addEventListener("pointermove", (e) => {
                    if (e.pointerType === "mouse") moveTooltip(e);
                });
                el.addEventListener("pointerleave", () => {
                    hovered = null;
                    render(name);
                    tooltip.classList.add("hidden");
                });
                el.addEventListener("click", () => selectProvince(name));
            });

            // akses keyboard: cukup di bagian pertama tiap provinsi
            const first = els[0];
            first.setAttribute("tabindex", "0");
            first.setAttribute("role", "button");
            first.setAttribute("aria-label", name);
            first.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    selectProvince(name);
                }
            });
        });

        // cek di Console: harus ~34-38 provinsi. Hapus kalau sudah beres.
        console.table([...groups].map(([n, els]) => ({ provinsi: n, bagian: els.length })));
        if (unnamed) console.info(`${unnamed} path tanpa nama (garis batas/dekorasi) dibuat tidak bisa diklik.`);
    }

    fetch(SVG_URL)
        .then((r) => {
            if (!r.ok) throw new Error(r.status);
            return r.text();
        })
        .then((text) => {
            mount.innerHTML = text;
            const svg = mount.querySelector("svg");
            svg.removeAttribute("width");
            svg.removeAttribute("height");
            initPeta(svg);
        })
        .catch((err) => console.error("Gagal memuat peta:", err));
})();