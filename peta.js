import { ISO_PROVINCE_NAMES } from "./provinsi.js";

const SVG_URL = "assets/destinasi_page/Indonesian_provinsi_map.svg";
const IMG_DIR = "assets/destinasi_page/provinsi/";
const DEFAULT_IMG = `${IMG_DIR}default.png`;
const DETAIL_PAGE = "destinasi.html";

// Isi khusus per provinsi (opsional). Kuncinya adalah nama provinsi dalam bentuk slug.
// Provinsi yang tidak ada di sini memakai teks dan gambar default.
const INFO = {
    "aceh": {
        image: "assets/destinasi_page/provinsi/aceh.png",
        desc: "Dikenal sebagai Serambi Mekkah, Aceh menyimpan Masjid Raya Baiturrahman, keindahan Pulau Weh, dan tradisi Islam yang kuat, termasuk Tari Saman.",
    },
    "sumatera-utara": {
        image: "assets/destinasi_page/provinsi/sumatera_utara.png",
        desc: "Rumah bagi Danau Toba dan Pulau Samosir, dengan budaya Batak yang kaya serta panorama dataran tinggi Berastagi.",
    },
    "sumatera-barat": {
        image: "assets/destinasi_page/provinsi/sumatera_barat.png",
        desc: "Tanah Minangkabau dengan rumah gadang, Jam Gadang, Ngarai Sianok, dan kuliner rendang yang mendunia.",
    },
    "riau": {
        image: "assets/destinasi_page/provinsi/riau.png",
        desc: "Pusat budaya Melayu dengan Istana Siak, Candi Muara Takus, dan sungai-sungai besar yang menjadi jalur peradaban.",
    },
    "jambi": {
        image: "assets/destinasi_page/provinsi/jambi.png",
        desc: "Menyimpan kompleks Candi Muaro Jambi, kawasan Kerinci Seblat, dan batik khas dengan motif yang terinspirasi alam.",
    },
    "sumatera-selatan": {
        image: "assets/destinasi_page/provinsi/sumatera_selatan.png",
        desc: "Palembang dengan Jembatan Ampera dan Sungai Musi, kota tua yang terkenal akan pempek dan kain songketnya.",
    },
    "bengkulu": {
        image: "assets/destinasi_page/provinsi/bengkulu.png",
        desc: "Dikenal dengan bunga Rafflesia arnoldii, Benteng Marlborough, dan pantai-pantai tenang di pesisir barat Sumatera.",
    },
    "lampung": {
        image: "assets/destinasi_page/provinsi/lampung.png",
        desc: "Tempat berkunjung ke gajah di Way Kambas, melihat Gunung Anak Krakatau, dan menikmati pulau-pulau seperti Pahawang.",
    },
    "kepulauan-bangka-belitung": {
        image: "assets/destinasi_page/provinsi/kepulauan_bangka_belitung.png",
        desc: "Pantai berbatu granit raksasa dengan air laut jernih, serta pulau-pulau kecil yang menawan di Bangka dan Belitung.",
    },
    "kepulauan-riau": {
        image: "assets/destinasi_page/provinsi/kepulauan_riau.png",
        desc: "Gugusan pulau seperti Batam, Bintan, dan Pulau Penyengat, dengan warisan budaya Melayu dan wisata bahari.",
    },
    "dki-jakarta": {
        image: "assets/destinasi_page/provinsi/dki_jakarta.png",
        desc: "Ibu kota dengan Monas, Kota Tua, dan beragam museum, tempat budaya Betawi bertemu denyut kota modern.",
    },
    "jawa-barat": {
        image: "assets/destinasi_page/provinsi/jawa_barat.png",
        desc: "Pegunungan hijau, kawah Tangkuban Perahu, kebun teh, dan budaya Sunda yang hidup lewat angklung dan seni tradisinya.",
    },
    "jawa-tengah": {
        image: "assets/destinasi_page/provinsi/jawa_tengah.png",
        desc: "Rumah Candi Borobudur, dataran tinggi Dieng, Karimunjawa, dan tradisi batik dari Solo hingga Pekalongan.",
    },
    "di-yogyakarta": {
        image: "assets/destinasi_page/provinsi/di_yogyakarta.png",
        desc: "Kota budaya dengan Keraton, Malioboro, dan candi-candi bersejarah, pusat batik, gamelan, dan seni pertunjukan Jawa.",
    },
    "jawa-timur": {
        image: "assets/destinasi_page/provinsi/jawa_timur.png",
        desc: "Gunung Bromo, kawah Ijen, dan kekayaan budaya dari reog Ponorogo hingga tradisi masyarakat Tengger.",
    },
    "banten": {
        image: "assets/destinasi_page/provinsi/banten.png",
        desc: "Menyimpan Taman Nasional Ujung Kulon, kampung adat Baduy, dan pantai-pantai seperti Anyer dan Tanjung Lesung.",
    },
    "bali": {
        image: "assets/destinasi_page/provinsi/bali.png",
        desc: "Pulau dewata yang memadukan pura megah, sawah terasering, tradisi yang masih hidup, dan pantai yang memikat wisatawan dunia.",
    },
    "nusa-tenggara-barat": {
        image: "assets/destinasi_page/provinsi/nusa_tenggara_barat.png",
        desc: "Gunung Rinjani, Gili yang jernih, dan pesisir Lombok serta Sumbawa dengan budaya Sasak dan Samawa.",
    },
    "nusa-tenggara-timur": {
        image: "assets/destinasi_page/provinsi/nusa_tenggara_timur.png",
        desc: "Rumah bagi komodo di Labuan Bajo, Pulau Padar, danau tiga warna Kelimutu, dan kain tenun ikat yang sarat makna.",
    },
    "kalimantan-barat": {
        image: "assets/destinasi_page/provinsi/kalimantan_barat.png",
        desc: "Dilintasi garis khatulistiwa di Pontianak, dengan Sungai Kapuas yang megah serta budaya Dayak dan Melayu.",
    },
    "kalimantan-tengah": {
        image: "assets/destinasi_page/provinsi/kalimantan_tengah.png",
        desc: "Taman Nasional Tanjung Puting tempat orangutan hidup bebas, dengan sungai-sungai besar yang menembus hutan hujan.",
    },
    "kalimantan-selatan": {
        image: "assets/destinasi_page/provinsi/kalimantan_selatan.png",
        desc: "Pasar terapung Banjarmasin, Pegunungan Meratus, dan budaya Banjar yang lekat dengan kehidupan di atas sungai.",
    },
    "kalimantan-timur": {
        image: "assets/destinasi_page/provinsi/kalimantan_timur.png",
        desc: "Jelajahi Kalimantan Timur, sebuah daerah yang dikenal dengan hutan hujan yang luas, satwa liar yang beragam, dan warisan budaya yang kaya.",
    },
    "kalimantan-utara": {
        image: "assets/destinasi_page/provinsi/kalimantan_utara.png",
        desc: "Provinsi termuda di Kalimantan, dengan kawasan Kayan Mentarang, dataran tinggi Krayan, dan budaya Dayak yang lestari.",
    },
    "sulawesi-utara": {
        image: "assets/destinasi_page/provinsi/sulawesi_utara.png",
        desc: "Taman Laut Bunaken yang kaya terumbu karang, hutan Tangkoko, dan budaya Minahasa yang hangat.",
    },
    "sulawesi-tengah": {
        image: "assets/destinasi_page/provinsi/sulawesi_tengah.png",
        desc: "Kepulauan Togean, Danau Poso, Taman Nasional Lore Lindu, dan air terjun tersembunyi di tengah hutan tropis.",
    },
    "sulawesi-selatan": {
        image: "assets/destinasi_page/provinsi/sulawesi_selatan.png",
        desc: "Tanah Toraja dengan rumah adatnya, pantai Tanjung Bira, tradisi pembuatan kapal pinisi, dan kota Makassar.",
    },
    "sulawesi-tenggara": {
        image: "assets/destinasi_page/provinsi/sulawesi_tenggara.png",
        desc: "Rumah Wakatobi, surga selam dengan terumbu karang alami, serta Benteng Keraton Buton yang bersejarah.",
    },
    "gorontalo": {
        image: "assets/destinasi_page/provinsi/gorontalo.png",
        desc: "Pulau Saronde yang jernih, hiu paus di Botubarani, dan Benteng Otanaha yang menyimpan jejak sejarah.",
    },
    "sulawesi-barat": {
        image: "assets/destinasi_page/provinsi/sulawesi_barat.png",
        desc: "Pesisir Mamuju dengan pantai dan pulau-pulau kecil, serta budaya Mandar yang lekat dengan perahu sandeq.",
    },
    "maluku": {
        image: "assets/destinasi_page/provinsi/maluku.png",
        desc: "Tanah rempah dengan Ambon, Banda Neira, dan perkebunan pala, lengkap dengan benteng peninggalan masa lalu.",
    },
    "maluku-utara": {
        image: "assets/destinasi_page/provinsi/maluku_utara.png",
        desc: "Ternate dan Tidore, pusat kejayaan cengkih dan pala, dengan Gunung Gamalama dan pulau-pulau indah di Morotai.",
    },
    "papua": {
        image: "assets/destinasi_page/provinsi/papua.png",
        desc: "Jayapura dengan Danau Sentani yang tenang, dikelilingi budaya adat yang kuat dan alam yang masih terjaga.",
    },
    "papua-barat": {
        image: "assets/destinasi_page/provinsi/papua_barat.png",
        desc: "Manokwari, Pegunungan Arfak, dan perairan Teluk Cenderawasih, rumah bagi burung cenderawasih dan keanekaragaman hayati.",
    },
    "papua-selatan": {
        image: "assets/destinasi_page/provinsi/papua_selatan.png",
        desc: "Merauke dengan Taman Nasional Wasur, hamparan savana dan rawa yang menjadi rumah satwa dan masyarakat adat.",
    },
    "papua-tengah": {
        image: "assets/destinasi_page/provinsi/papua_tengah.png",
        desc: "Danau Paniai, hutan pegunungan, dan Puncak Jaya, puncak tertinggi di Indonesia yang diselimuti salju abadi.",
    },
    "papua-pegunungan": {
        image: "assets/destinasi_page/provinsi/papua_pegunungan.png",
        desc: "Lembah Baliem di Wamena, tempat Suku Dani menjaga tradisi dan menggelar festival budaya yang termasyhur.",
    },
    "papua-barat-daya": {
        image: "assets/destinasi_page/provinsi/papua_barat_daya.png",
        desc: "Rumah bagi Raja Ampat, gugusan pulau karst dengan keanekaragaman hayati laut tertinggi di dunia.",
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