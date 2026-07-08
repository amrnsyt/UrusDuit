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
    customKategori: [],
    customHutangKategori: [], 
    laporanTemplates: {},
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
    document.body.className = masterDatabase.isDarkMode ? "dark-theme dark min-h-screen flex flex-col justify-between pb-32" : "light-theme min-h-screen flex flex-col justify-between pb-32";
    document.documentElement.classList.toggle('dark', masterDatabase.isDarkMode);
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
    return { gajiPokok: 0, ot15: 0, ot20: 0, epfRate: 11, pcb: 0, socsoAuto: true, socsoManualVal: 0, eisManualVal: 0, komitmen: [], hutang: [], bayaranHistory: [], hutangCatPaid: {} };
}

function muatDataBalanSemasa() {
    if (!masterDatabase.bulan[bulanAktif]) {
        masterDatabase.bulan[bulanAktif] = janaStrukturBulanKosong();
    }
    const data = masterDatabase.bulan[bulanAktif];
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

function tukarTab(tabName, element) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById('tab-' + tabName).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('text-indigo-400', 'active-menu');
        btn.classList.add('text-slate-400');
    });
    element.classList.remove('text-slate-400');
    element.classList.add('text-indigo-400', 'active-menu');
}
