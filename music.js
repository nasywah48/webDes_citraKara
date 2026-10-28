const music = document.getElementById("bgMusic");
const musicToggle = document.getElementById("musicToggle");
const musicIcon = document.getElementById("musicIcon");
const musicLabel = document.getElementById("musicLabel");

if (music && musicToggle && musicIcon && musicLabel) {
    let userPausedMusic = false;

    function updateMusicUI() {
        const isPlaying = !music.paused;

        musicLabel.textContent = isPlaying ? "Music On" : "Music Off";
        musicIcon.className = isPlaying
            ? "ri-volume-up-line text-lg"
            : "ri-volume-mute-line text-lg";

        musicToggle.setAttribute("aria-pressed", String(isPlaying));
        musicToggle.setAttribute(
            "aria-label",
            isPlaying ? "Jeda musik" : "Putar musik"
        );
    }

    async function playMusic() {
        if (document.hidden || userPausedMusic) return;

        try {
            await music.play();
        } catch (error) {
            console.info("Autoplay diblokir. Klik tombol musik untuk memulai.");
        }

        updateMusicUI();
    }

    musicToggle.addEventListener("click", async () => {
        if (music.paused) {
            userPausedMusic = false;
            await playMusic();
        } else {
            userPausedMusic = true;
            music.pause();
            updateMusicUI();
        }
    });

    music.addEventListener("play", updateMusicUI);
    music.addEventListener("pause", updateMusicUI);

    // Berhenti saat tab disembunyikan.
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            music.pause();
            updateMusicUI();
        } else if (!userPausedMusic) {
            playMusic();
        }
    });

    // Coba autoplay saat halaman dibuka.
    window.addEventListener("load", playMusic);

    // Hentikan musik saat halaman ditinggalkan.
    window.addEventListener("pagehide", () => {
        music.pause();
    });

    updateMusicUI();
}
