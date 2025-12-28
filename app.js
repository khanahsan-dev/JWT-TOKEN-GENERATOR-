/* DOM Elements */
const uidInput = document.getElementById("uid");
const passInput = document.getElementById("password");
const rememberChk = document.getElementById("remember");
const output = document.getElementById("output");
const outputContainer = document.getElementById("outputContainer");
const pasteBtn = document.getElementById("pasteClearBtn");
const statusMsg = document.getElementById("status");
const copyBtn = document.getElementById("copyBtn");
const eyeIcon = document.getElementById("eyeIcon");

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
    eyeIcon.textContent = isPass ? "🚫" : "👁️";
}

function passwordInputChanged() {
    updatePasteBtnState();
    saveIfRemembered();
}

function updatePasteBtnState() {
    // If text exists, show X (clear). If empty, show Clipboard (paste).
    pasteBtn.textContent = passInput.value ? "❌" : "📋";
    pasteBtn.title = passInput.value ? "Clear" : "Paste from Clipboard";
}

async function pasteOrClear() {
    if (passInput.value) {
        passInput.value = ""; // Clear
        passInput.focus();
    } else {
        try {
            const text = await navigator.clipboard.readText();
            passInput.value = text;
        } catch (err) {
            updateStatus("⚠️ Clipboard permission denied", "red");
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
    const btn = document.getElementById("submitBtn");

    // Reset UI
    outputContainer.classList.remove("show");
    copyBtn.style.display = "none";
    
    if (!uid || !password) {
        updateStatus("❌ UID & Password required", "#ef4444");
        shakeInput();
        return;
    }

    // Loading State
    btn.disabled = true;
    btn.innerHTML = `<div class="spinner"></div> Fetching...`;
    updateStatus("Connecting...", "#6366f1");

    // Proxy/API Logic
    const targetUrl = `https://raihan-access-to-jwt.vercel.app/token?uid=${encodeURIComponent(uid)}&password=${encodeURIComponent(password)}`;
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;

    try {
        const res = await fetch(proxyUrl);
        const textData = await res.text();

        output.value = textData;
        
        if (res.ok) {
            updateStatus("✅ Token fetched successfully", "#10b981");
            outputContainer.classList.add("show");
            copyBtn.style.display = "flex"; // Show copy button only on success
        } else {
            updateStatus("❌ Fetch failed", "#ef4444");
            outputContainer.classList.add("show"); // Show error in box
        }

    } catch (e) {
        updateStatus("⚠️ Network error", "#f59e0b");
        output.value = e.message;
        outputContainer.classList.add("show");
    } finally {
        btn.disabled = false;
        btn.innerHTML = "Get Token";
    }
}

/* --- Copy Logic --- */
function appCopyToken() {
    const text = output.value.trim();

    if (!text) return;

    let tokenToCopy = text;

    try {
        const json = JSON.parse(text);
        if (json.token) {
            tokenToCopy = json.token;
        }
    } catch (e) { /* Not JSON, ignore */ }

    navigator.clipboard.writeText(tokenToCopy)
        .then(() => {
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = "✅ Copied!";
            copyBtn.style.background = "#d1fae5"; // Light green
            copyBtn.style.borderColor = "#10b981";
            
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
                copyBtn.style.background = ""; 
                copyBtn.style.borderColor = ""; 
            }, 2000);
        })
        .catch(() => {
            updateStatus("❌ Copy failed", "red");
        });
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
async function pasteOrClear() {
    // 1. If text exists, this button acts as a "Clear" button
    if (passInput.value) {
        passInput.value = ""; 
        passInput.focus();
        updatePasteBtnState();
        saveIfRemembered();
        return;
    }

    // 2. If empty, this button acts as a "Paste" button
    try {
        // Attempt to read from clipboard
        const text = await navigator.clipboard.readText();
        passInput.value = text;
        updateStatus("", ""); // Clear any error messages
    } catch (err) {
        // 3. Fallback: If browser blocks access, just focus the input
        // so the user can press Ctrl+V or Long-Press to paste manually.
        console.error("Clipboard access denied:", err);
        passInput.focus();
        updateStatus("⚠️ Browser blocked auto-paste. Press Ctrl+V.", "#f59e0b");
    }
    
    updatePasteBtnState();
    saveIfRemembered();
}
// Inside fetchToken()
const btnText = document.getElementById("btnText");
const btn = document.getElementById("submitBtn");

// When loading starts:
btn.disabled = true;
btnText.innerHTML = `<div class="spinner"></div> Fetching...`;

// When loading ends (inside finally block):
btn.disabled = false;
btnText.innerHTML = "Get Token";

