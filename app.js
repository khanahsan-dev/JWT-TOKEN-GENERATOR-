/* DOM Elements */
const uidInput = document.getElementById("uid");
const passInput = document.getElementById("password");
const rememberChk = document.getElementById("remember");
const output = document.getElementById("output");
const outputContainer = document.getElementById("outputContainer");
const statusMsg = document.getElementById("status");

/* Icon Elements */
const eyeIcon = document.getElementById("eyeIcon");
const pasteIcon = document.getElementById("pasteIcon");
const pasteBtn = document.getElementById("pasteClearBtn");
const btn = document.getElementById("submitBtn");
const btnText = document.getElementById("btnText");

/* --- Initialization --- */
window.onload = () => {
    if (localStorage.getItem("remember") === "true") {
        uidInput.value = localStorage.getItem("uid") || "";
        passInput.value = localStorage.getItem("password") || "";
        rememberChk.checked = true;
        updatePasteBtnState();
    }
};

/* --- Input Handling --- */
function togglePassword() {
    const isPass = passInput.type === "password";
    passInput.type = isPass ? "text" : "password";
    
    // Toggle Icon Class
    if (isPass) {
        eyeIcon.className = "ri-eye-off-line";
    } else {
        eyeIcon.className = "ri-eye-line";
    }
}

function passwordInputChanged() {
    updatePasteBtnState();
    saveIfRemembered();
}

function updatePasteBtnState() {
    // If text exists, show Close (X). If empty, show Clipboard.
    if (passInput.value) {
        pasteIcon.className = "ri-close-line";
        pasteBtn.title = "Clear";
    } else {
        pasteIcon.className = "ri-clipboard-line";
        pasteBtn.title = "Paste from Clipboard";
    }
}

async function pasteOrClear() {
    if (passInput.value) {
        // Clear Action
        passInput.value = "";
        passInput.focus();
    } else {
        // Paste Action
        try {
            const text = await navigator.clipboard.readText();
            passInput.value = text;
        } catch (err) {
            updateStatus("⚠️ Clipboard blocked. Use Ctrl+V", "#f59e0b");
            passInput.focus();
        }
    }
    updatePasteBtnState();
    saveIfRemembered();
}

rememberChk.onchange = () => {
    if (!rememberChk.checked) {
        localStorage.clear();
    } else {
        saveIfRemembered();
    }
};

function saveIfRemembered() {
    if (rememberChk.checked) {
        localStorage.setItem("remember", "true");
        localStorage.setItem("uid", uidInput.value);
        localStorage.setItem("password", passInput.value);
    }
}

/* --- API Logic --- */
async function fetchToken() {
    const uid = uidInput.value.trim();
    const password = passInput.value.trim();

    // Reset UI
    outputContainer.classList.remove("show");
    
    if (!uid || !password) {
        updateStatus("❌ User ID & Password required", "#ef4444");
        shakeInput();
        return;
    }

    // Loading State
    btn.disabled = true;
    const originalBtnContent = btnText.innerHTML;
    btnText.innerHTML = `<div class="spinner"></div> Fetching...`;
    updateStatus("Connecting to server...", "#6366f1");

    // Proxy/API Logic
    const targetUrl = `https://raihan-access-to-jwt.vercel.app/token?uid=${encodeURIComponent(uid)}&password=${encodeURIComponent(password)}`;
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;

    try {
        const res = await fetch(proxyUrl);
        const textData = await res.text();

        output.value = textData;
        
        if (res.ok) {
            updateStatus("Get your token below", "#10b981");
            outputContainer.classList.add("show");
        } else {
            updateStatus(" Please entire a valid uid, and password", "#ef4444");
            outputContainer.classList.add("show");
        }

    } catch (e) {
        updateStatus("⚠️ Network error", "#f59e0b");
        output.value = e.message;
        outputContainer.classList.add("show");
    } finally {
        btn.disabled = false;
        btnText.innerHTML = originalBtnContent;
    }
}

/* --- Copy Logic --- */
function appCopyToken() {
    const text = output.value.trim();
    const copyBtn = document.getElementById("copyBtn");
    const originalHTML = copyBtn.innerHTML;

    if (!text) return;

    let tokenToCopy = text;
    try {
        const json = JSON.parse(text);
        if (json.token) tokenToCopy = json.token;
    } catch (e) { /* Not JSON */ }

    navigator.clipboard.writeText(tokenToCopy)
        .then(() => {
            copyBtn.innerHTML = `<i class="ri-check-line"></i> Copied`;
            copyBtn.style.color = "#10b981";
            copyBtn.style.borderColor = "#10b981";
            
            setTimeout(() => {
                copyBtn.innerHTML = originalHTML;
                copyBtn.style.color = ""; 
                copyBtn.style.borderColor = ""; 
            }, 2000);
        })
        .catch(() => updateStatus(" Copy failed", "red"));
}

/* --- Helpers --- */
function updateStatus(msg, color) {
    statusMsg.textContent = msg;
    statusMsg.style.color = color;
}

function shakeInput() {
    const container = document.querySelector('.container');
    container.style.animation = 'none';
    container.offsetHeight; /* trigger reflow */
    container.style.animation = 'shake 0.4s';
}
