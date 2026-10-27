/**
 * Peta interaktif Indonesia.
 *
 * Kontrak dengan SVG: setiap wilayah yang bisa di-hover adalah <path> yang
 * punya nama, dibaca (berurutan) dari data-region, data-name, name, atau id
 * berformat kode ISO (ID-AC / IDAC). Path tanpa nama dianggap dekorasi
 * (mis. garis batas) dan tidak interaktif.
 *
 * Seluruh tampilan diatur Tailwind di HTML lewat atribut data-state
 * ("hover" | "active") dan data-visible ("true" | "false").
 */
import { ISO_PROVINCE_NAMES } from "./provinsi.js";

const CONFIG = Object.freeze({
    svgUrl: "assets/destinasi/peta-provinsi-berlabel.svg",
    detailPage: "destinasi.html",
    tooltipOffsetY: 14,
});

export const toSlug = (text) => text.toLowerCase().trim().replace(/\s+/g, "-");

export function readRegionName(shape) {
    const explicit = shape.dataset?.region || shape.dataset?.name || shape.getAttribute("name");
    if (explicit) return explicit.trim();

    const isoCode = (shape.id ?? "").toUpperCase().replace(/^ID-?/, "");
    return ISO_PROVINCE_NAMES[isoCode] ?? "";
}

/* ---------- Memuat & menyiapkan SVG ---------- */

async function loadSvg(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status} saat memuat ${url}`);

    const doc = new DOMParser().parseFromString(await response.text(), "image/svg+xml");
    const svg = doc.documentElement;
    if (svg.localName !== "svg" || doc.querySelector("parsererror")) {
        throw new Error(`${url} bukan file SVG yang valid`);
    }

    svg.removeAttribute("width");
    svg.removeAttribute("height");
    return document.importNode(svg, true);
}

/** Path tanpa fill akan terisi hitam secara default, jadi dikosongkan. */
function neutralize(shape) {
    shape.setAttribute("pointer-events", "none");
    if (!shape.hasAttribute("fill")) shape.setAttribute("fill", "none");
}

/** @returns {Map<string, SVGElement[]>} nama wilayah → semua bagiannya (pulau/kabupaten). */
function collectRegions(svg) {
    const regions = new Map();

    for (const shape of svg.querySelectorAll("path, polygon")) {
        const name = readRegionName(shape);
        if (!name) {
            neutralize(shape);
            continue;
        }
        shape.dataset.region = name;
        const parts = regions.get(name) ?? [];
        parts.push(shape);
        regions.set(name, parts);
    }
    return regions;
}

/** Satu tab-stop per wilayah, bisa diaktifkan dengan Enter/Spasi. */
function makeAccessible(regions) {
    for (const [name, [anchor]] of regions) {
        anchor.tabIndex = 0;
        anchor.setAttribute("role", "button");
        anchor.setAttribute("aria-label", name);
        anchor.setAttribute("aria-pressed", "false");
    }
}

/* ---------- Komponen UI ---------- */

function requireElement(id) {
    const element = document.getElementById(id);
    if (!element) throw new Error(`Elemen #${id} tidak ditemukan di HTML`);
    return element;
}

function createTooltip(element, container) {
    const move = (event) => {
        const { left, top } = container.getBoundingClientRect();
        element.style.left = `${event.clientX - left}px`;
        element.style.top = `${event.clientY - top - CONFIG.tooltipOffsetY}px`;
    };
    const show = (name, event) => {
        element.textContent = name;
        element.dataset.visible = "true";
        move(event);
    };
    const hide = () => {
        element.dataset.visible = "false";
    };
    return { show, move, hide };
}

function createPanel(panel, title, link) {
    const show = (name) => {
        title.textContent = name;
        link.href = `${CONFIG.detailPage}?provinsi=${toSlug(name)}`;
        panel.dataset.visible = "true";
        panel.inert = false;
    };
    const hide = () => {
        panel.dataset.visible = "false";
        panel.inert = true;
    };
    return { show, hide };
}

/* ---------- Interaksi ---------- */

function bindInteractions({ svg, regions, tooltip, panel }) {
    let hovered = null;
    let active = null;

    const nameOf = (target) => target.closest?.("[data-region]")?.dataset.region ?? null;

    function paint(name) {
        if (!name) return;
        const state = name === active ? "active" : name === hovered ? "hover" : null;
        const parts = regions.get(name);

        for (const part of parts) {
            if (state) part.dataset.state = state;
            else delete part.dataset.state;
        }
        parts[0].setAttribute("aria-pressed", String(name === active));
    }

    function setHovered(name) {
        if (name === hovered) return;
        const previous = hovered;
        hovered = name;
        paint(previous);
        paint(name);
    }

    function toggleActive(name) {
        const previous = active;
        active = name === active ? null : name;
        paint(previous);
        paint(name);
        if (active) panel.show(active);
        else panel.hide();
    }

    svg.addEventListener("pointerover", (event) => {
        const name = nameOf(event.target);
        setHovered(name);
        if (event.pointerType !== "mouse") return;
        if (name) tooltip.show(name, event);
        else tooltip.hide();
    });

    svg.addEventListener("pointermove", (event) => {
        if (hovered && event.pointerType === "mouse") tooltip.move(event);
    });

    svg.addEventListener("pointerleave", () => {
        setHovered(null);
        tooltip.hide();
    });

    svg.addEventListener("click", (event) => {
        const name = nameOf(event.target);
        if (name) toggleActive(name);
    });

    svg.addEventListener("focusin", (event) => setHovered(nameOf(event.target)));
    svg.addEventListener("focusout", () => setHovered(null));

    svg.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        const name = nameOf(event.target);
        if (!name) return;
        event.preventDefault();
        toggleActive(name);
    });
}

/* ---------- Entry point ---------- */

async function init() {
    const mount = document.getElementById("petaMount");
    if (!mount) return;

    try {
        const svg = await loadSvg(CONFIG.svgUrl);
        mount.replaceChildren(svg);

        const regions = collectRegions(svg);
        if (regions.size === 0) {
            console.warn("[peta] SVG belum punya path bernama; peta tampil tanpa interaksi. Beri nama lewat tools/label-peta.html.");
            return;
        }
        makeAccessible(regions);

        bindInteractions({
            svg,
            regions,
            tooltip: createTooltip(requireElement("petaTooltip"), requireElement("petaWrap")),
            panel: createPanel(requireElement("petaInfo"), requireElement("petaNama"), requireElement("petaLink")),
        });
    } catch (error) {
        console.error("[peta]", error);
        mount.textContent = "Peta belum dapat dimuat. Coba muat ulang halaman.";
    }
}

init();