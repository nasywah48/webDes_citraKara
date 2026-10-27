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



const music = document.getElementById("bgMusic");
const musicToggle = document.getElementById("musicToggle");
const musicIcon = document.getElementById("musicIcon");
const musicLabel = document.getElementById("musicLabel");

let autoPlayAttempted = false;
let userPausedMusic = false;

function updateMusicButton(isPlaying) {
    musicLabel.textContent = isPlaying ? "Music On" : "Music Off";

    musicIcon.className = isPlaying
        ? "ri-volume-up-line text-lg"
        : "ri-volume-mute-line text-lg";

    musicToggle.setAttribute(
        "aria-label",
        isPlaying ? "Jeda musik" : "Putar musik"
    );

    musicToggle.setAttribute("aria-pressed", String(isPlaying));
}

async function playMusic() {
    if (!music || document.hidden) return;

    try {
        await music.play();
        updateMusicButton(true);
    } catch (error) {
        // Autoplay bersuara mungkin diblokir oleh browser.
        updateMusicButton(false);
        console.info("Autoplay diblokir. Menunggu interaksi pengguna.");
    }
}

// Coba autoplay sekali ketika hero mulai muncul.
// Fungsi ini dipanggil dari update progress animasi hero.
function tryHeroMusic(progress) {
    if (progress > 0.02 && !autoPlayAttempted) {
        autoPlayAttempted = true;

        if (!userPausedMusic) {
            playMusic();
        }
    }
}

// Tombol tetap bisa dipakai di seluruh section.
musicToggle.addEventListener("click", async () => {
    if (music.paused) {
        userPausedMusic = false;
        await playMusic();
    } else {
        userPausedMusic = true;
        music.pause();
        updateMusicButton(false);
    }
});

// Sinkronisasi status tombol jika audio berubah.
music.addEventListener("play", () => updateMusicButton(true));
music.addEventListener("pause", () => updateMusicButton(false));

// Hentikan musik saat tab disembunyikan,
// misalnya saat pindah tab atau meminimalkan browser.

document.addEventListener("visibilitychange", async () => {
    if (document.hidden) {
        // User pindah tab: hentikan musik.
        music.pause();
    } else {
        // User kembali ke tab: coba nyalakan lagi,
        // selama user tidak sengaja menekan Pause.
        if (!userPausedMusic) {
            await playMusic();
        }
    }
});

// Coba autoplay saat halaman pertama kali dibuka.
window.addEventListener("load", () => {
    if (!autoPlayAttempted) {
        autoPlayAttempted = true;
        playMusic();
    }
});

// Hentikan musik saat halaman ditinggalkan atau ditutup.
window.addEventListener("pagehide", () => {
    music.pause();
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


 // SECTION 2: Piringan bergerak mengikuti scroll halaman
(function () {
    const section = document.getElementById("budayaScroll");
    const track = document.getElementById("discTrack");

    if (!section || !track) return;

    const items = Array.from(track.querySelectorAll(".disc"));
    if (!items.length) return;

    // CONFIG
    const START_INDEX = 2;
    const MIN_SCALE = 0.66;
    const GAP = 24;

    const clamp = (v, min = 0, max = 1) =>
        Math.min(max, Math.max(min, v));

    const lerp = (a, b, t) => a + (b - a) * t;

    let size = 0;
    let step = 0;
    let total = 0;
    let ticking = false;

    function measure() {
        size = items[0].offsetWidth;
        step = size + GAP;
        total = items.length * step;

        // Scroll halaman mengontrol pergerakan piringan
        section.style.height =
            `${window.innerHeight + total * 1.2}px`;
    }

    function update() {
        const maxScroll =
            section.offsetHeight - window.innerHeight;

        if (maxScroll <= 0) return;

        const rect = section.getBoundingClientRect();
        const progress = clamp(-rect.top / maxScroll);

        // Pusat layar
        const centerX = window.innerWidth / 2;

        // Piringan bergerak sesuai scroll, bukan otomatis
        const shift =
            START_INDEX * step + progress * total;

        items.forEach((item, i) => {
            let relative = i * step - shift;

            // Membuat susunan berulang tanpa duplikasi elemen
            const half = total / 2;
            relative =
                ((relative + half) % total + total) % total - half;

            const distance = Math.abs(relative);
            const scaleProgress = clamp(distance / (size * 0.95));
            const scale = lerp(1, MIN_SCALE, scaleProgress);

            const x = centerX + relative - size / 2;

            item.style.transform =
                `translate3d(${x}px, 0, 0) scale(${scale})`;

            item.style.opacity = clamp(
                (half - distance) / step
            );

            item.style.zIndex = Math.round(scale * 100);
        });
    }

    function requestUpdate() {
        if (ticking) return;

        ticking = true;

        requestAnimationFrame(() => {
            update();
            ticking = false;
        });
    }

    window.addEventListener("scroll", requestUpdate, {
        passive: true
    });

    window.addEventListener("resize", () => {
        measure();
        update();
    });

    measure();
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