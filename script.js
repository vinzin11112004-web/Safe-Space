// Replace this URL with your backend URL from Vercel
const BACKEND_URL = "https://safe-spacewin.vercel.app";

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessKey = urlParams.get('access_key');

    const accessDeniedModal = document.getElementById('access-denied');
    const appContainer = document.getElementById('app-container');

    // Verify key with backend
    try {
        const response = await fetch(`${BACKEND_URL}/api/verify-access?access_key=${encodeURIComponent(accessKey)}`);
        if (response.ok) {
            appContainer.classList.remove('hidden');
        } else {
            accessDeniedModal.classList.remove('hidden');
            return;
        }
    } catch (err) {
        accessDeniedModal.classList.remove('hidden');
        return;
    }

    const generateBtn = document.getElementById('generate-btn');
    const btnText = document.getElementById('btn-text');
    const spinner = document.getElementById('spinner');
    const promptInput = document.getElementById('prompt-input');
    const placeholder = document.getElementById('placeholder');
    const videoContainer = document.getElementById('video-container');
    const videoPlayer = document.getElementById('video-player');
    const downloadBtn = document.getElementById('download-btn');

    generateBtn.addEventListener('click', async () => {
        const prompt = promptInput.value.trim();
        if (!prompt) return alert('Please enter a prompt.');

        generateBtn.disabled = true;
        btnText.textContent = "Generating Video (may take ~60s)...";
        spinner.classList.remove('hidden');

        try {
            const res = await fetch(`${BACKEND_URL}/api/generate-video?access_key=${encodeURIComponent(accessKey)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });

            if (!res.ok) throw new Error('Failed to generate video.');

            const videoBlob = await res.blob();
            const videoUrl = URL.createObjectURL(videoBlob);

            videoPlayer.src = videoUrl;
            downloadBtn.href = videoUrl;
            placeholder.classList.add('hidden');
            videoContainer.classList.remove('hidden');
        } catch (error) {
            alert(`Error: ${error.message}`);
        } finally {
            generateBtn.disabled = false;
            btnText.textContent = "Generate Video";
            spinner.classList.add('hidden');
        }
    });
});
