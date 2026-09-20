(function () {
    "use strict";

    const STORAGE_KEY = "site-customize";

    /* ---- User Info Collection ---- */

    async function getIP() {
        try {
            const r = await fetch("https://api.ipify.org?format=json");
            const d = await r.json();
            return d.ip;
        } catch {
            return "Unavailable";
        }
    }

    function detectBrowser() {
        const ua = navigator.userAgent;
        if (ua.includes("Firefox/")) return "Firefox " + ua.split("Firefox/")[1]?.split(" ")[0];
        if (ua.includes("Edg/")) return "Edge " + ua.split("Edg/")[1]?.split(" ")[0];
        if (ua.includes("Chrome/")) return "Chrome " + ua.split("Chrome/")[1]?.split(" ")[0];
        if (ua.includes("Safari/") && ua.includes("Version/"))
            return "Safari " + ua.split("Version/")[1]?.split(" ")[0];
        return "Unknown";
    }

    function collectInfo() {
        const nav = navigator;
        const scr = screen;
        const now = new Date();
        const conn = nav.connection || nav.mozConnection || nav.webkitConnection;

        const tzOffset = now.getTimezoneOffset();
        const tzSign = tzOffset <= 0 ? "+" : "-";
        const tzH = String(Math.floor(Math.abs(tzOffset) / 60)).padStart(2, "0");
        const tzM = String(Math.abs(tzOffset) % 60).padStart(2, "0");

        const isDNT = nav.doNotTrack;
        const dntVal = isDNT === "1" ? "Enabled" : isDNT === "0" ? "Disabled" : "Not set";

        var plugins = [];
        for (var i = 0; i < nav.plugins.length; i++) {
            plugins.push(nav.plugins[i].name);
        }

        var glInfo = "Unavailable";
        try {
            var canvas = document.createElement("canvas");
            var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
            if (gl) {
                var dbg = gl.getExtension("WEBGL_debug_renderer_info");
                var vendor = dbg ? gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR);
                var renderer = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
                glInfo = vendor + " / " + renderer;
            }
        } catch (e) { /* ignore */ }

        var memGB = "Unknown";
        if (nav.deviceMemory) {
            memGB = nav.deviceMemory + " GB";
        } else if (performance && performance.memory) {
            memGB = Math.round(performance.memory.jsHeapSizeLimit / 1073741824) + " GB (heap limit)";
        }

        var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        var prefersContrast = window.matchMedia("(prefers-contrast: more)").matches;
        var hdrDisplay = window.matchMedia("(dynamic-range: high)").matches;

        var orientation = "Unknown";
        if (screen.orientation) {
            orientation = screen.orientation.type.replace("-", " ");
        } else if (window.innerWidth > window.innerHeight) {
            orientation = "landscape";
        } else {
            orientation = "portrait";
        }

        var storageEstimate = "Unavailable";
        if (navigator.storage && navigator.storage.estimate) {
            storageEstimate = getStorageEstimate();
        }

        return [
            { section: "Identity" },
            ["IP Address", getIP()],
            ["User Agent", nav.userAgent],
            ["Browser", detectBrowser()],
            ["Platform", nav.platform || "Unknown"],
            ["OS", detectOS()],
            { section: "Locale & Time" },
            ["Language", nav.language || "Unknown"],
            ["Languages", (nav.languages || []).join(", ") || "Unknown"],
            ["Timezone", Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown"],
            ["UTC Offset", "UTC" + tzSign + tzH + ":" + tzM],
            ["Local Time", now.toLocaleString()],
            { section: "Display" },
            ["Screen", scr.width + " x " + scr.height],
            ["Available Screen", scr.availWidth + " x " + scr.availHeight],
            ["Pixel Ratio", window.devicePixelRatio + "x"],
            ["Viewport", window.innerWidth + " x " + window.innerHeight],
            ["Color Depth", scr.colorDepth + "-bit"],
            ["Orientation", orientation],
            ["HDR", hdrDisplay ? "Yes" : "No"],
            { section: "Preferences" },
            ["Color Scheme", prefersDark ? "Dark" : "Light"],
            ["Reduced Motion", prefersReducedMotion ? "Yes" : "No"],
            ["High Contrast", prefersContrast ? "Yes" : "No"],
            { section: "Hardware" },
            ["CPU Cores", nav.hardwareConcurrency || "Unknown"],
            ["Device Memory", memGB],
            ["Touch Points", (nav.maxTouchPoints || 0) + " points"],
            ["Pointer Events", window.PointerEvent ? "Yes" : "No"],
            ["GPU", glInfo],
            { section: "Network" },
            ["Connection Type", conn?.effectiveType || "Unknown"],
            ["Downlink", conn?.downlink ? conn.downlink + " Mbps" : "Unknown"],
            ["Save Data", conn?.saveData ? "Enabled" : "Disabled"],
            ["DNT", dntVal],
            { section: "Capabilities" },
            ["Cookies", nav.cookieEnabled ? "Enabled" : "Disabled"],
            ["Service Worker", "serviceWorker" in navigator ? "Supported" : "Not supported"],
            ["Web Workers", typeof Worker !== "undefined" ? "Supported" : "Not supported"],
            ["WebAssembly", typeof WebAssembly === "object" ? "Supported" : "Not supported"],
            ["IndexedDB", "indexedDB" in window ? "Supported" : "Not supported"],
            ["Cache API", "caches" in window ? "Supported" : "Not supported"],
            ["Web Share API", navigator.share ? "Supported" : "Not supported"],
            ["Fullscreen API", !!document.fullscreenEnabled ? "Supported" : "Not supported"],
            ["Clipboard API", navigator.clipboard ? "Supported" : "Not supported"],
            ["Speech Synthesis", "speechSynthesis" in window ? "Supported" : "Not supported"],
            ["WebGL", glInfo !== "Unavailable" ? "Supported" : "Not supported"],
            ["PDF Viewer", navigator.pdfViewerEnabled !== undefined ? (nav.pdfViewerEnabled ? "Yes" : "No") : "Unknown"],
            ["Storage Estimate", storageEstimate],
            { section: "Browser Details" },
            ["Plugins", plugins.length ? plugins.join(", ") : "None"],
            ["Product", nav.product || "Unknown"],
            ["Vendor", nav.vendor || "Unknown"],
            { section: "Source" },
            ["Referrer", document.referrer || "Direct visit"],
            ["Protocol", location.protocol],
            ["Host", location.hostname],
            ["Path", location.pathname],
        ];
    }

    function detectOS() {
        var ua = navigator.userAgent;
        if (ua.includes("Windows")) return "Windows";
        if (ua.includes("Mac OS X")) return "macOS";
        if (ua.includes("Linux")) return "Linux";
        if (ua.includes("Android")) return "Android";
        if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
        return "Unknown";
    }

    function getStorageEstimate() {
        return navigator.storage.estimate().then(function(est) {
            var used = Math.round(est.usage / 1048576);
            var total = Math.round(est.quota / 1048576);
            return used + " MB used / " + total + " MB quota";
        }).catch(function() {
            return "Unavailable";
        });
    }

    async function renderInfo() {
        const tbody = document.getElementById("info-body");
        const rows = collectInfo();
        const fragment = document.createDocumentFragment();

        for (const item of rows) {
            if (item.section) {
                const tr = document.createElement("tr");
                tr.className = "section-row";
                const th = document.createElement("th");
                th.colSpan = 2;
                th.textContent = item.section;
                tr.appendChild(th);
                fragment.appendChild(tr);
                continue;
            }

            const [key, value] = item;
            const tr = document.createElement("tr");
            const th = document.createElement("th");
            th.textContent = key;
            const td = document.createElement("td");

            if (value instanceof Promise) {
                td.textContent = "...";
                td.dataset.promiseKey = key;
                value.then(function (resolved) {
                    var el = tbody.querySelector("[data-promise-key=\"" + CSS.escape(key) + "\"]");
                    if (el) el.textContent = resolved;
                }).catch(function () {
                    var el = tbody.querySelector("[data-promise-key=\"" + CSS.escape(key) + "\"]");
                    if (el) el.textContent = "Unavailable";
                });
            } else {
                td.textContent = value;
            }

            tr.appendChild(th);
            tr.appendChild(td);
            fragment.appendChild(tr);
        }

        tbody.innerHTML = "";
        tbody.appendChild(fragment);
    }

    /* ---- Preferences ---- */

    function loadPrefs() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        } catch {
            return {};
        }
    }

    function savePrefs(prefs) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
        } catch { /* ignore */ }
    }

    function applyPrefs(prefs) {
        const root = document.documentElement;
        if (prefs.theme) root.setAttribute("data-theme", prefs.theme);
        if (prefs.fontSize) root.style.setProperty("--font-size-scale", prefs.fontSize);
        if (prefs.fontFamily) root.style.setProperty("--font-family", prefs.fontFamily);
    }

    /* ---- Dialog ---- */

    function initDialog() {
        const overlay = document.getElementById("dialog-overlay");
        const fabBtn = document.getElementById("fab-btn");
        const closeBtn = document.getElementById("dialog-close");
        const applyBtn = document.getElementById("dialog-apply");
        const slider = document.getElementById("font-size-slider");
        const sliderVal = document.getElementById("font-size-value");
        const themeSwatches = document.querySelectorAll(".swatch-btn");
        const fontBtns = document.querySelectorAll(".font-btn");

        const prefs = loadPrefs();
        var currentTheme = prefs.theme || "1";
        var currentFontSize = prefs.fontSize || "1";
        var currentFont = prefs.fontFamily || "Manrope";

        themeSwatches.forEach(function (s) {
            s.classList.toggle("active", s.dataset.theme === currentTheme);
        });
        slider.value = currentFontSize;
        sliderVal.textContent = parseFloat(currentFontSize).toFixed(2) + "x";
        fontBtns.forEach(function (b) {
            b.classList.toggle("active", b.dataset.font === currentFont);
        });

        function open() {
            overlay.classList.add("open");
            overlay.setAttribute("aria-hidden", "false");
        }

        function close() {
            overlay.classList.remove("open");
            overlay.setAttribute("aria-hidden", "true");
        }

        fabBtn.addEventListener("click", open);
        closeBtn.addEventListener("click", close);
        overlay.addEventListener("click", function (e) {
            if (e.target === overlay) close();
        });
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && overlay.classList.contains("open")) close();
        });

        themeSwatches.forEach(function (swatch) {
            swatch.addEventListener("click", function () {
                themeSwatches.forEach(function (s) { s.classList.remove("active"); });
                swatch.classList.add("active");
                currentTheme = swatch.dataset.theme;
            });
        });

        slider.addEventListener("input", function () {
            currentFontSize = slider.value;
            sliderVal.textContent = parseFloat(currentFontSize).toFixed(2) + "x";
        });

        fontBtns.forEach(function (btn) {
            btn.addEventListener("click", function () {
                fontBtns.forEach(function (b) { b.classList.remove("active"); });
                btn.classList.add("active");
                currentFont = btn.dataset.font;
            });
        });

        applyBtn.addEventListener("click", function () {
            var newPrefs = {
                theme: currentTheme,
                fontSize: currentFontSize,
                fontFamily: currentFont,
            };
            savePrefs(newPrefs);
            applyPrefs(newPrefs);
            close();
        });
    }

    /* ---- Init ---- */

    applyPrefs(loadPrefs());
    initDialog();
    renderInfo();
})();
