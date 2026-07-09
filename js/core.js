// ============================================================
// UrusDuit — CORE — Global State, Init, Theme, Modals, Toasts, Month Nav
// ============================================================

// --- CUSTOM DROPDOWN ENGINE ---
function initCustomDropdown(selectId) {
    const selectEl = document.getElementById(selectId);
    if(!selectEl) return;

    let wrapper = selectEl.nextElementSibling;
    if (wrapper && wrapper.classList.contains('custom-select-wrapper')) {
        wrapper.remove();
    }

    selectEl.style.display = 'none';

    const container = document.createElement('div');
    container.className = 'custom-select-wrapper relative w-full text-left';

    const selectedDiv = document.createElement('div');
    selectedDiv.className = selectEl.className.replace('hidden', '') + ' flex justify-between items-center cursor-pointer';
    selectedDiv.style.display = 'flex'; 

    const selectedText = document.createElement('span');
    selectedText.className = 'truncate pointer-events-none flex-1';

    let selectedOption = selectEl.options[selectEl.selectedIndex];
    if(!selectedOption && selectEl.options.length > 0) {
        selectedOption = selectEl.options[0];
        selectEl.selectedIndex = 0;
    }

    selectedText.innerHTML = selectedOption ? selectedOption.text : "Pilih...";

    const icon = document.createElement('i');
    icon.className = 'fa-solid fa-chevron-down text-[10px] opacity-70 pointer-events-none transition-transform duration-200 ml-2';

    selectedDiv.appendChild(selectedText);
    selectedDiv.appendChild(icon);

    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'custom-options hidden absolute z-[1000] w-full mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl shadow-2xl max-h-48 overflow-y-auto custom-scrollbar';

    Array.from(selectEl.children).forEach(child => {
        if (child.tagName.toLowerCase() === 'optgroup') {
            const groupLabel = document.createElement('div');
            groupLabel.className = 'px-3 py-1.5 text-[9px] font-bold opacity-60 uppercase tracking-wider bg-slate-100 dark:bg-slate-900/50 sticky top-0';
            groupLabel.innerText = child.label;
            optionsDiv.appendChild(groupLabel);

            Array.from(child.children).forEach(opt => {
                const optDiv = document.createElement('div');
                optDiv.className = 'px-3 py-2 text-xs cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-500/20 text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-700/50 last:border-0 transition-colors truncate';
                optDiv.innerHTML = opt.text;
                optDiv.dataset.value = opt.value;
                if(opt.selected) optDiv.classList.add('bg-indigo-50', 'dark:bg-indigo-500/20', 'font-bold', 'text-indigo-600', 'dark:text-indigo-400');
                
                optDiv.addEventListener('click', (e) => {
                    e.stopPropagation();
                    selectEl.value = opt.value;
                    selectedText.innerHTML = opt.text;
                    optionsDiv.classList.add('hidden');
                    icon.style.transform = 'rotate(0deg)';
                    selectEl.dispatchEvent(new Event('change'));
                    
                    Array.from(optionsDiv.querySelectorAll('.cursor-pointer')).forEach(el => el.classList.remove('bg-indigo-50', 'dark:bg-indigo-500/20', 'font-bold', 'text-indigo-600', 'dark:text-indigo-400'));
                    optDiv.classList.add('bg-indigo-50', 'dark:bg-indigo-500/20', 'font-bold', 'text-indigo-600', 'dark:text-indigo-400');
                });
                optionsDiv.appendChild(optDiv);
            });
        } else if (child.tagName.toLowerCase() === 'option') {
            const optDiv = document.createElement('div');
            optDiv.className = 'px-3 py-2 text-xs cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-500/20 text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-700/50 last:border-0 transition-colors truncate';
            optDiv.innerHTML = child.text;
            optDiv.dataset.value = child.value;
            if(child.selected) optDiv.classList.add('bg-indigo-50', 'dark:bg-indigo-500/20', 'font-bold', 'text-indigo-600', 'dark:text-indigo-400');

            optDiv.addEventListener('click', (e) => {
                e.stopPropagation();
                selectEl.value = child.value;
                selectedText.innerHTML = child.text;
                optionsDiv.classList.add('hidden');
                icon.style.transform = 'rotate(0deg)';
                selectEl.dispatchEvent(new Event('change'));

                Array.from(optionsDiv.querySelectorAll('.cursor-pointer')).forEach(el => el.classList.remove('bg-indigo-50', 'dark:bg-indigo-500/20', 'font-bold', 'text-indigo-600', 'dark:text-indigo-400'));
                optDiv.classList.add('bg-indigo-50', 'dark:bg-indigo-500/20', 'font-bold', 'text-indigo-600', 'dark:text-indigo-400');
            });
            optionsDiv.appendChild(optDiv);
        }
    });

    selectedDiv.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.custom-options').forEach(drop => {
            if(drop !== optionsDiv) {
                drop.classList.add('hidden');
                if(drop.previousElementSibling) drop.previousElementSibling.querySelector('i').style.transform = 'rotate(0deg)';
            }
        });

        optionsDiv.classList.toggle('hidden');
        icon.style.transform = optionsDiv.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
    });

    container.appendChild(selectedDiv);
    container.appendChild(optionsDiv);
    selectEl.parentNode.insertBefore(container, selectEl.nextSibling);
}

function syncCustomDropdown(selectId) {
    const select = document.getElementById(selectId);
    const container = select.nextElementSibling;
    if(container && container.classList.contains('custom-select-wrapper')) {
        const textSpan = container.querySelector('span.truncate');
        const selectedOpt = select.options[select.selectedIndex];
        if(selectedOpt) textSpan.innerHTML = selectedOpt.text;
        
        container.querySelectorAll('.custom-options div.cursor-pointer').forEach(optDiv => {
            if(optDiv.dataset.value === select.value) {
                optDiv.classList.add('bg-indigo-50', 'dark:bg-indigo-500/20', 'font-bold', 'text-indigo-600', 'dark:text-indigo-400');
            } else {
                optDiv.classList.remove('bg-indigo-50', 'dark:bg-indigo-500/20', 'font-bold', 'text-indigo-600', 'dark:text-indigo-400');
            }
        });
    }
}

document.addEventListener('click', () => {
    document.querySelectorAll('.custom-options').forEach(drop => {
        drop.classList.add('hidden');
        if(drop.previousElementSibling) {
            let icon = drop.previousElementSibling.querySelector('i');
            if(icon) icon.style.transform = 'rotate(0deg)';
        }
    });
});

// --- CORE APPLICATION LOGIC ---
let masterDatabase = {
    isDarkMode: true,
    themeStyle: "default",
    customKategori: [],
    customHutangKategori: [], 
    laporanTemplates: {},
    geminiApiKey: "",
    bulan: {}
};

let bulanAktif = "";
let toastTimeout = null;
let modalConfirmAction = null;
let idHutangSedangDiedit = null;
let idKomitmenSedangDiedit = null;

window.onload = function() {
    janaSenaraiBulan();
    
    if(localStorage.getItem('urusduit_v6_db')) {
        masterDatabase = JSON.parse(localStorage.getItem('urusduit_v6_db'));
    } else {
        simpanKeLocalStorage();
    }

    const date = new Date();
    bulanAktif = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    document.getElementById('select-bulan-aktif').value = bulanAktif;
    
    syncCustomDropdown('select-bulan-aktif');

    segarkanDropdownKategori();
    segarkanDropdownHutangKategori();
    initCustomDropdown('input-status-hutang');
    initCustomDropdown('sort-hutang-mode');

    terapkanTemaSemasa();
    muatDataBalanSemasa();
    requestAnimationFrame(() => kemaskiniPosisiNavPill());
};

function janaSenaraiBulan() {
    const select = document.getElementById('select-bulan-aktif');
    select.innerHTML = '';
    const namaBulan = ["Januari", "Februari", "Mac", "April", "Mei", "Jun", "Julai", "Ogos", "September", "Oktober", "November", "Disember"];
    
    let html = '';
    for (let y = 2024; y <= 2040; y++) {
        for (let m = 1; m <= 12; m++) {
            let nilaiBulan = `${y}-${m.toString().padStart(2, '0')}`;
            let teksBulan = `${namaBulan[m - 1]} ${y}`;
            html += `<option value="${nilaiBulan}" class="text-slate-900">${teksBulan}</option>`;
        }
    }
    select.innerHTML = html;
    initCustomDropdown('select-bulan-aktif');
}

function anjakBulan(arah) {
    const select = document.getElementById('select-bulan-aktif');
    let indexSemasa = select.selectedIndex;
    let indexBaru = indexSemasa + arah;

    if (indexBaru >= 0 && indexBaru < select.options.length) {
        select.selectedIndex = indexBaru;
        syncCustomDropdown('select-bulan-aktif');
        tukarBulan();
    } else {
        paparToast("Had Maksimum", "Navigasi bulan telah mencapai had senarai.", "amaran");
    }
}

// --- THEME & UI ---
function toggleDarkMode() {
    masterDatabase.isDarkMode = !masterDatabase.isDarkMode;
    simpanKeLocalStorage();
    terapkanTemaSemasa();
    paparToast("Tema Paparan", masterDatabase.isDarkMode ? "Mod Gelap diaktifkan." : "Mod Terang diaktifkan.", "info");
}
function terapkanTemaSemasa() {
    if(!masterDatabase.themeStyle) masterDatabase.themeStyle = "default";
    let kelasAsas = masterDatabase.isDarkMode ? "dark-theme dark min-h-screen flex flex-col justify-between pb-32" : "light-theme min-h-screen flex flex-col justify-between pb-32";
    if(masterDatabase.themeStyle === "liquidglass") kelasAsas += " theme-liquidglass";

    document.body.classList.add('theme-switching');
    document.body.className = kelasAsas + " theme-switching";
    document.documentElement.classList.toggle('dark', masterDatabase.isDarkMode);

    let wallpaperEl = document.getElementById('liquidglass-wallpaper');
    if(masterDatabase.themeStyle === "liquidglass") {
        if(!wallpaperEl) {
            wallpaperEl = document.createElement('div');
            wallpaperEl.id = 'liquidglass-wallpaper';
            wallpaperEl.innerHTML = `<span class="lg-blob lg-blob-1"></span><span class="lg-blob lg-blob-2"></span><span class="lg-blob lg-blob-3"></span>`;
            document.body.prepend(wallpaperEl);
        }
    } else if(wallpaperEl) {
        wallpaperEl.remove();
    }

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            document.body.classList.remove('theme-switching');
        });
    });

    if(typeof kemaskiniPosisiNavPill === 'function') {
        requestAnimationFrame(() => kemaskiniPosisiNavPill());
    }
}

function bukaModal(tajuk, mesej, iconClass, wrapperClass, textIconClass, btnClass, iconBtnClass, btnText, action) {
    document.getElementById('modal-title').innerText = tajuk;
    document.getElementById('modal-message').innerText = mesej;
    
    const iconWrapper = document.getElementById('modal-icon-wrapper');
    iconWrapper.className = `w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${wrapperClass}`;
    
    const icon = document.getElementById('modal-icon');
    icon.className = `fa-solid ${iconClass} ${textIconClass} text-xl`;
    
    const btn = document.getElementById('modal-confirm-btn');
    btn.className = `flex-1 py-3 rounded-xl text-xs font-semibold text-white shadow-lg cursor-pointer flex items-center justify-center gap-1.5 ${btnClass}`;
    btn.innerHTML = `<i class="fa-solid ${iconBtnClass}"></i> ${btnText}`;
    
    modalConfirmAction = action;

    btn.onclick = function() {
        if (modalConfirmAction) modalConfirmAction();
        tutupModal();
    };

    document.getElementById('interactive-modal').classList.remove('hidden');
    document.getElementById('interactive-modal').classList.add('flex');
    document.body.classList.add('overflow-hidden');
}
function tutupModal() {
    document.getElementById('interactive-modal').classList.add('hidden');
    document.getElementById('interactive-modal').classList.remove('flex');
    modalConfirmAction = null;
    document.body.classList.remove('overflow-hidden');
}

function paparToast(tajuk, mesej, jenis = 'sukses') {
    const toast = document.getElementById('premium-toast');
    const toastBody = document.getElementById('toast-body');
    const iconWrapper = document.getElementById('toast-icon-wrapper');
    const icon = document.getElementById('toast-icon');
    const titleEl = document.getElementById('toast-title');
    const msgEl = document.getElementById('toast-message');
    const closeBtn = document.getElementById('toast-close-btn');
    const closeIcon = document.getElementById('toast-close-icon');

    toastBody.className = "w-full max-w-xs rounded-2xl p-4 flex items-center gap-3.5 shadow-2xl border pointer-events-auto backdrop-blur-2xl ios-spring-in";
    
    if (jenis === 'sukses') {
        toastBody.classList.add('bg-emerald-600', 'border-emerald-300', 'text-white');
        iconWrapper.className = "w-9 h-9 rounded-xl flex items-center justify-center text-sm shadow-inner bg-white/25 text-white shrink-0";
        icon.className = "fa-solid fa-circle-check";
        closeBtn.className = "w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer shrink-0";
        closeIcon.className = "fa-solid fa-xmark text-xs text-white";
    } else if (jenis === 'info') {
        toastBody.classList.add('bg-blue-600', 'border-blue-300', 'text-white');
        iconWrapper.className = "w-9 h-9 rounded-xl flex items-center justify-center text-sm shadow-inner bg-white/25 text-white shrink-0";
        icon.className = "fa-solid fa-circle-info";
        closeBtn.className = "w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer shrink-0";
        closeIcon.className = "fa-solid fa-xmark text-xs text-white";
    } else if (jenis === 'padam') {
        toastBody.classList.add('bg-rose-600', 'border-rose-300', 'text-white');
        iconWrapper.className = "w-9 h-9 rounded-xl flex items-center justify-center text-sm shadow-inner bg-white/25 text-white shrink-0";
        icon.className = "fa-solid fa-trash-can";
        closeBtn.className = "w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer shrink-0";
        closeIcon.className = "fa-solid fa-xmark text-xs text-white";
    } else if (jenis === 'amaran') {
        toastBody.classList.add('bg-amber-400', 'border-amber-200', 'text-slate-900');
        iconWrapper.className = "w-9 h-9 rounded-xl flex items-center justify-center text-sm shadow-inner bg-slate-900/10 text-slate-900 shrink-0";
        icon.className = "fa-solid fa-triangle-exclamation";
        closeBtn.className = "w-6 h-6 rounded-full bg-slate-900/10 hover:bg-slate-900/20 flex items-center justify-center cursor-pointer shrink-0";
        closeIcon.className = "fa-solid fa-xmark text-xs text-slate-900";
    }

    titleEl.innerText = tajuk;
    msgEl.innerText = mesej;

    if (toastTimeout) clearTimeout(toastTimeout);
    toast.classList.remove('hidden');
    toast.classList.add('flex');

    toastTimeout = setTimeout(() => { tutupToastAwal(); }, 1800);
}

function tutupToastAwal() {
    document.getElementById('premium-toast').classList.add('hidden');
    document.getElementById('premium-toast').classList.remove('flex');
}

function simpanKeLocalStorage() {
    localStorage.setItem('urusduit_v6_db', JSON.stringify(masterDatabase));
}

function tukarBulan() {
    bulanAktif = document.getElementById('select-bulan-aktif').value;
    kosongkanBorangHutang();
    muatDataBalanSemasa();
    paparToast("Bulan Ditukar", `Kandungan bagi bulan tersebut berjaya dimuatkan.`, 'info');
}

function janaStrukturBulanKosong() {
    return { gajiPokok: 0, ot15: 0, ot20: 0, epfRate: 11, pcb: 0, socsoAuto: true, socsoManualVal: 0, eisManualVal: 0, komitmen: [], hutang: [], bayaranHistory: [], hutangCatPaid: {}, hutangCatPaidDeltas: {}, alokasi: { enabled: [], resit: {} } };
}

function muatDataBalanSemasa() {
    if (!masterDatabase.bulan[bulanAktif]) {
        masterDatabase.bulan[bulanAktif] = janaStrukturBulanKosong();
    }
    const data = masterDatabase.bulan[bulanAktif];
    if (!data.alokasi) data.alokasi = { enabled: [], resit: {} };
    if (!data.hutangCatPaidDeltas) data.hutangCatPaidDeltas = {};
    document.getElementById('input-gaji-pokok').value = data.gajiPokok || "";
    document.getElementById('input-ot-15').value = data.ot15 || "";
    document.getElementById('input-ot-20').value = data.ot20 || "";
    document.getElementById('input-epf-rate').value = data.epfRate !== undefined ? data.epfRate : 11;
    document.getElementById('input-pcb').value = data.pcb || "";
    
    setSocsoMode(data.socsoAuto !== false);
    document.getElementById('input-socso-manual-val').value = data.socsoManualVal || "";
    document.getElementById('input-eis-manual-val').value = data.eisManualVal || "";

    segarkanDropdownTapisanKategoriHutang();
    kemaskiniSemuaPaparan();
}

function salinDataBulanLepas() {
    const senaraiBulan = Array.from(document.getElementById('select-bulan-aktif').options).map(o => o.value);
    const indexSemasa = senaraiBulan.indexOf(bulanAktif);
    
    if(indexSemasa <= 0) {
        paparToast("Tiada Rekod", "Tiada bulan terdahulu untuk disalin.", "amaran");
        return;
    }
    
    const bulanLepas = senaraiBulan[indexSemasa - 1];
    if(!masterDatabase.bulan[bulanLepas]) {
        paparToast("Tiada Data", `Bulan ${bulanLepas} belum mempunyai rekod yang sah.`, "amaran");
        return;
    }
    
    bukaModal(
        "Salin Data Bulan Lepas?", 
        `Tindakan ini akan memadam data bulan ini and menggantikannya dengan rekod dari bulan ${bulanLepas}. Teruskan?`,
        "fa-clone", "bg-indigo-500/20", "text-indigo-500", "bg-indigo-600 hover:bg-indigo-700", "fa-check", "Ya, Salin",
        () => {
            const dataSalinan = JSON.parse(JSON.stringify(masterDatabase.bulan[bulanLepas]));
            if(dataSalinan.komitmen) dataSalinan.komitmen.forEach(i => i.paid = false);
            if(dataSalinan.hutang) dataSalinan.hutang.forEach(h => h.paid = false);
            if(dataSalinan.hutangCatPaid) {
                for(let key in dataSalinan.hutangCatPaid) dataSalinan.hutangCatPaid[key] = false;
            }
            dataSalinan.bayaranHistory = []; 
            
            masterDatabase.bulan[bulanAktif] = dataSalinan;
            simpanKeLocalStorage();
            muatDataBalanSemasa();
            paparToast("Data Berjaya Disalin", `Rekod bulan ${bulanLepas} telah disalin masuk.`, 'sukses');
        }
    );
}

let lgTabSwitchLocked = false;
function tukarTab(tabName, element) {
    // Debounce Input: ignore rapid repeat taps on the same tab mid-transition
    if (lgTabSwitchLocked && element.classList.contains('active-menu')) return;
    lgTabSwitchLocked = true;
    clearTimeout(window._lgTabDebounce);
    window._lgTabDebounce = setTimeout(() => { lgTabSwitchLocked = false; }, 180);

    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById('tab-' + tabName).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('text-indigo-400', 'active-menu');
        btn.classList.add('text-slate-400');
    });
    element.classList.remove('text-slate-400');
    element.classList.add('text-indigo-400', 'active-menu');
    kemaskiniPosisiNavPill(element);
    lgHaptic(10);
}

// --- LIQUID GLASS: interruptible spring physics for the nav pill (Fluid Gestures) ---
const navPillSpring = { pos: null, vel: 0, target: 0, widthPos: null, widthVel: 0, widthTarget: 0, raf: null };
function lgSpringStep() {
    const stiffness = 0.24, damping = 0.60;
    const posForce = (navPillSpring.target - navPillSpring.pos) * stiffness;
    navPillSpring.vel = (navPillSpring.vel + posForce) * damping;
    navPillSpring.pos += navPillSpring.vel;

    const widthForce = (navPillSpring.widthTarget - navPillSpring.widthPos) * stiffness;
    navPillSpring.widthVel = (navPillSpring.widthVel + widthForce) * damping;
    navPillSpring.widthPos += navPillSpring.widthVel;

    const pill = document.getElementById('nav-pill');
    if (pill) {
        // Squash and Stretch: pill stretches along travel direction while in motion
        const stretch = Math.min(Math.abs(navPillSpring.vel) * 0.018, 0.16);
        pill.style.transform = `translateX(${navPillSpring.pos}px) scaleX(${1 + stretch}) scaleY(${1 - stretch * 0.55})`;
        pill.style.width = `${Math.max(navPillSpring.widthPos, 0)}px`;
    }

    const settled = Math.abs(navPillSpring.vel) < 0.03 && Math.abs(navPillSpring.target - navPillSpring.pos) < 0.3 &&
                     Math.abs(navPillSpring.widthVel) < 0.03 && Math.abs(navPillSpring.widthTarget - navPillSpring.widthPos) < 0.3;
    if (settled) {
        navPillSpring.raf = null;
        navPillSpring.pos = navPillSpring.target;
        navPillSpring.widthPos = navPillSpring.widthTarget;
        if (pill) {
            pill.style.transform = `translateX(${navPillSpring.pos}px) scaleX(1) scaleY(1)`;
            pill.style.width = `${navPillSpring.widthPos}px`;
        }
    } else {
        navPillSpring.raf = requestAnimationFrame(lgSpringStep);
    }
}
function kemaskiniPosisiNavPill(elTerpilih) {
    const pill = document.getElementById('nav-pill');
    if (!pill) return;
    const btnAktif = elTerpilih || document.querySelector('.nav-btn.active-menu') || document.querySelector('.nav-btn');
    if (!btnAktif) return;

    navPillSpring.target = btnAktif.offsetLeft;
    navPillSpring.widthTarget = btnAktif.offsetWidth;

    if (navPillSpring.pos === null) {
        // First run: snap instantly, no spring-in from zero
        navPillSpring.pos = navPillSpring.target;
        navPillSpring.widthPos = navPillSpring.widthTarget;
        pill.style.transform = `translateX(${navPillSpring.pos}px)`;
        pill.style.width = `${navPillSpring.widthPos}px`;
        return;
    }
    if (!navPillSpring.raf) navPillSpring.raf = requestAnimationFrame(lgSpringStep);
}

window.addEventListener('resize', () => kemaskiniPosisiNavPill());

// --- LIQUID GLASS: Web-safe haptics (guarded, respects theme + device support) ---
function lgHaptic(durationMs) {
    if (masterDatabase.themeStyle !== 'liquidglass') return;
    if (typeof navigator === 'undefined' || !navigator.vibrate) return;
    try { navigator.vibrate(durationMs || 8); } catch (e) { /* silent */ }
}
document.addEventListener('click', function(e) {
    if (masterDatabase.themeStyle !== 'liquidglass') return;
    if (e.target.closest('.nav-btn')) return; // already handled in tukarTab
    if (e.target.closest('button')) lgHaptic(6);
}, { passive: true });

// --- LIQUID GLASS: Contextual Blur Trigger (flatten heavy backdrop-filter while flinging, debounced restore) ---
let lgScrollDebounce = null;
window.addEventListener('scroll', function() {
    if (masterDatabase.themeStyle !== 'liquidglass') return;
    document.body.classList.add('lg-scrolling');
    clearTimeout(lgScrollDebounce);
    lgScrollDebounce = setTimeout(() => document.body.classList.remove('lg-scrolling'), 160);
}, { passive: true });

// --- LIQUID GLASS: Over-scroll rubber-band elasticity on the main content wrapper ---
(function() {
    let startY = 0, isPulling = false;
    document.addEventListener('touchstart', function(e) {
        if (masterDatabase.themeStyle !== 'liquidglass' || adaModalTerbuka()) return;
        startY = e.touches[0].clientY;
        isPulling = false;
    }, { passive: true });
    document.addEventListener('touchmove', function(e) {
        if (masterDatabase.themeStyle !== 'liquidglass' || adaModalTerbuka()) return;
        const wrap = document.getElementById('lg-elastic-wrap');
        if (!wrap || window.scrollY > 0) return;
        const dy = e.touches[0].clientY - startY;
        if (dy > 0) {
            isPulling = true;
            const damped = Math.min(dy * 0.32, 64);
            wrap.style.transition = 'none';
            wrap.style.transform = `translateY(${damped}px)`;
        }
    }, { passive: true });
    document.addEventListener('touchend', function() {
        const wrap = document.getElementById('lg-elastic-wrap');
        if (!wrap || !isPulling) return;
        wrap.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        wrap.style.transform = 'translateY(0)';
        isPulling = false;
    }, { passive: true });
})();

// --- NAVIGASI SWIPE ANTARA TAB ---
const susunanTabSwipe = ['dashboard', 'gaji', 'komitmen', 'agihan', 'hutang', 'tetapan'];
let swipeStartX = 0;
let swipeStartY = 0;

function adaModalTerbuka() {
    return Array.from(document.querySelectorAll('[id$="-modal"]')).some(m => m.classList.contains('flex'));
}

function navigasiTabSwipe(arah) {
    const tabAktifEl = document.querySelector('.tab-content.active');
    if (!tabAktifEl) return;
    const tabAktif = tabAktifEl.id.replace('tab-', '');
    const indeksSemasa = susunanTabSwipe.indexOf(tabAktif);
    if (indeksSemasa === -1) return;

    const indeksBaru = indeksSemasa + arah;
    if (indeksBaru < 0 || indeksBaru >= susunanTabSwipe.length) return;

    const navButtons = document.querySelectorAll('.nav-btn');
    const btnBaru = navButtons[indeksBaru];
    if (btnBaru) tukarTab(susunanTabSwipe[indeksBaru], btnBaru);
}

document.addEventListener('touchstart', function(e) {
    if (adaModalTerbuka()) return;
    swipeStartX = e.touches[0].clientX;
    swipeStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', function(e) {
    if (adaModalTerbuka()) return;
    const swipeEndX = e.changedTouches[0].clientX;
    const swipeEndY = e.changedTouches[0].clientY;
    const diffX = swipeEndX - swipeStartX;
    const diffY = swipeEndY - swipeStartY;

    const ambangMinimum = 65;
    if (Math.abs(diffX) > ambangMinimum && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
        if (diffX > 0) {
            navigasiTabSwipe(-1); // swipe kiri ke kanan -> tab sebelum ini
        } else {
            navigasiTabSwipe(1); // swipe kanan ke kiri -> tab seterusnya
        }
    }
}, { passive: true });
