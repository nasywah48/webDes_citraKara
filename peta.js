import { ISO_PROVINCE_NAMES } from "./provinsi.js";

const SVG_URL = "assets/destinasi_page/Indonesian_provinsi_map.svg";
const IMG_DIR = "assets/destinasi_page/provinsi/";
const DEFAULT_IMG = `${IMG_DIR}default.png`;
const DETAIL_PAGE = "destinasi.html";

// Isi khusus per provinsi (opsional). Kuncinya adalah nama provinsi dalam bentuk slug.
// Provinsi yang tidak ada di sini memakai teks dan gambar default.
const INFO = {
    "kalimantan-timur": {
        image: `${IMG_DIR}kalimantan-timur.png`,
        desc: "Jelajahi Kalimantan Timur, sebuah daerah yang dikenal dengan hutan hujan yang luas, satwa liar yang beragam, dan warisan budaya yang kaya.",
    },
};

export const toSlug = (t) => t.toLowerCase().trim().replace(/\s+/g, "-");

export function readRegionName(el) {
    const named = el.dataset?.region || el.dataset?.name || el.getAttribute("name");
    if (named) return named.trim();
    return ISO_PROVINCE_NAMES[(el.id ?? "").toUpperCase().replace(/^ID-?/, "")] ?? "";
}

async function init() {
    const $ = (id) => document.getElementById(id);
    const mount = $("petaMount");
    if (!mount) return;

    try {
        // muat SVG
        const res = await fetch(SVG_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status} saat memuat ${SVG_URL}`);
        const parsed = new DOMParser().parseFromString(await res.text(), "image/svg+xml").documentElement;
        if (parsed.localName !== "svg") throw new Error(`${SVG_URL} bukan SVG yang valid`);
        parsed.removeAttribute("width");
        parsed.removeAttribute("height");
        const svg = document.importNode(parsed, true);
        mount.replaceChildren(svg);

        // kelompokkan path per wilayah; path ga ada namanya, dekorasi
        const regions = new Map();
        for (const p of svg.querySelectorAll("path, polygon")) {
            const name = readRegionName(p);
            if (!name) {
                p.setAttribute("pointer-events", "none");
                if (!p.hasAttribute("fill")) p.setAttribute("fill", "none");
                continue;
            }
            p.dataset.region = name;
            regions.set(name, [...(regions.get(name) ?? []), p]);
        }
        if (!regions.size) return console.warn("[peta] SVG belum punya path bernama.");

        // satu tab-stop per wilayah
        for (const [name, [first]] of regions) {
            first.tabIndex = 0;
            first.setAttribute("role", "button");
            first.setAttribute("aria-label", name);
        }

        const wrap = $("petaWrap"), tip = $("petaTooltip");
        const modal = $("petaModal"), overlay = $("petaOverlay"), closeBtn = $("petaModalClose");
        const mImg = $("petaModalImg"), mTitle = $("petaModalTitle");
        const mDesc = $("petaModalDesc"), mLink = $("petaModalLink");
        let hovered = null, active = null;

        const nameOf = (t) => t.closest?.("[data-region]")?.dataset.region ?? null;

        const paint = () =>
            regions.forEach((parts, name) => {
                const state = name === active ? "active" : name === hovered ? "hover" : null;
                for (const p of parts) {
                    if (state) p.dataset.state = state;
                    else delete p.dataset.state;
                }
                parts[0].setAttribute("aria-pressed", String(name === active));
            });

        const hover = (name) => { hovered = name; paint(); };

        /* popup */
        const openModal = (name) => {
            const slug = toSlug(name);
            const info = INFO[slug] ?? {};

            mImg.onerror = () => { mImg.onerror = null; mImg.src = DEFAULT_IMG; };
            mImg.src = info.image ?? `${IMG_DIR}${slug}.png`;
            mImg.alt = name;
            mTitle.textContent = name;
            mDesc.textContent =
                info.desc ??
                `Jelajahi ${name}, sebuah daerah dengan keindahan alam, budaya, dan tradisi yang menunggu untuk ditemukan.`;
            mLink.href = `${DETAIL_PAGE}?provinsi=${slug}`;

            active = name;
            paint();

            modal.inert = false;
            modal.dataset.visible = "true";
            document.body.style.overflow = "hidden";
            closeBtn.focus({ preventScroll: true });
        };

        const closeModal = () => {
            modal.dataset.visible = "false";
            modal.inert = true;
            document.body.style.overflow = "";
            active = null;
            paint();
        };

        closeBtn.addEventListener("click", closeModal);
        overlay.addEventListener("click", closeModal);
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && modal.dataset.visible === "true") closeModal();
        });

        /* tooltip */
        const place = (e) => {
            const { left, top } = wrap.getBoundingClientRect();
            tip.style.left = `${e.clientX - left}px`;
            tip.style.top = `${e.clientY - top - 14}px`;
        };

        svg.addEventListener("pointerover", (e) => {
            const name = nameOf(e.target);
            hover(name);
            tip.dataset.visible = String(!!name && e.pointerType === "mouse");
            if (name) { tip.textContent = name; place(e); }
        });
        svg.addEventListener("pointermove", (e) => {
            if (hovered && e.pointerType === "mouse") place(e);
        });
        svg.addEventListener("pointerleave", () => {
            hover(null);
            tip.dataset.visible = "false";
        });
        // biar browser ge berfokus di satu provinsi pas diklik, biar ga ada bordernya lagi 
        svg.addEventListener("mousedown", (e) => e.preventDefault());

        svg.addEventListener("click", (e) => {
            const name = nameOf(e.target);
            if (name) {
                tip.dataset.visible = "false";
                openModal(name);
            }
        });        svg.addEventListener("focusin", (e) => hover(nameOf(e.target)));
        svg.addEventListener("focusout", () => hover(null));
        svg.addEventListener("keydown", (e) => {
            const name = nameOf(e.target);
            if (name && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                openModal(name);
            }
        });
    } catch (err) {
        console.error("[peta]", err);
        mount.textContent = "Peta belum dapat dimuat. Coba muat ulang halaman.";
    }
}

init();