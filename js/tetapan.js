// ============================================================
// UrusDuit — TETAPAN (Settings) — Backup/Restore, Report Templates
// ============================================================

let _tukarLayoutTerakhir = 0;
function tukarLayoutMode(mod) {
    const sekarang = Date.now();
    if(sekarang - _tukarLayoutTerakhir < 250) return;
    _tukarLayoutTerakhir = sekarang;

    if(masterDatabase.layoutMode === mod) return;
    masterDatabase.layoutMode = mod;
    simpanKeLocalStorage();
    terapkanTemaSemasa();
    const mesejMod = mod === "modern" ? "UI Moden diaktifkan ✨" : (mod === "dynamic" ? "UI Dynamic (Konsta) diaktifkan 🟪" : "UI Klasik diaktifkan.");
    paparToast("Reka Bentuk Ditukar", mesejMod, "sukses");
}

function paparLayoutModeAktif() {
    const mod = masterDatabase.layoutMode || "classic";
    const btnKlasik = document.getElementById('btn-layout-classic');
    const btnModen = document.getElementById('btn-layout-modern');
    const btnDinamik = document.getElementById('btn-layout-dynamic');
    if(!btnKlasik || !btnModen || !btnDinamik) return;

    const aktifKelas = ['bg-indigo-600', 'text-white', 'shadow-sm'];
    const tidakAktifKelas = ['text-slate-700', 'dark:text-slate-400'];

    btnKlasik.classList.remove(...aktifKelas, ...tidakAktifKelas);
    btnKlasik.classList.add(...(mod === 'classic' ? aktifKelas : tidakAktifKelas));

    btnModen.classList.remove(...aktifKelas, ...tidakAktifKelas);
    btnModen.classList.add(...(mod === 'modern' ? aktifKelas : tidakAktifKelas));

    btnDinamik.classList.remove(...aktifKelas, ...tidakAktifKelas);
    btnDinamik.classList.add(...(mod === 'dynamic' ? aktifKelas : tidakAktifKelas));
}

function menuKebabPlaceholder() {
    paparToast("Menu Pantas", "Menu tindakan lanjut akan datang tidak lama lagi.", "info");
}

function bukaTemaModal() {
    if(!masterDatabase.themeStyle) masterDatabase.themeStyle = "default";
    paparPilihanTema();
    document.getElementById('tema-modal').classList.remove('hidden');
    document.getElementById('tema-modal').classList.add('flex');
    document.body.classList.add('overflow-hidden');
}

function tutupTemaModal() {
    document.getElementById('tema-modal').classList.add('hidden');
    document.getElementById('tema-modal').classList.remove('flex');
    document.body.classList.remove('overflow-hidden');
}

function paparPilihanTema() {
    const temaAktif = masterDatabase.themeStyle || "default";
    document.querySelectorAll('#tema-modal .tema-kad').forEach(kad => {
        const temaKad = kad.dataset.tema;
        const isActive = temaKad === temaAktif;
        kad.classList.toggle('ring-2', isActive);
        kad.classList.toggle('ring-indigo-500', isActive);
        const check = kad.querySelector('.tema-check');
        if(check) check.classList.toggle('hidden', !isActive);
    });
}

let _pilihTemaTerakhir = 0;
function pilihTema(tema) {
    const sekarang = Date.now();
    if(sekarang - _pilihTemaTerakhir < 250) return;
    _pilihTemaTerakhir = sekarang;

    masterDatabase.themeStyle = tema;
    simpanKeLocalStorage();
    terapkanTemaSemasa();
    paparPilihanTema();
    paparToast("Tema Ditukar", tema === "liquidglass" ? "Liquid Glass diaktifkan ✨" : "Tema Lalai diaktifkan.", "sukses");
}

function eksportData() {
    const dataStr = JSON.stringify(masterDatabase, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const now = new Date();
    const yy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const timestamp = `${yy}${mm}${dd}_${hh}${min}`;
    const fileName = "urusduit_backup_" + timestamp + ".json";
    
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", url);
    downloadAnchorNode.setAttribute("download", "UrusDuit/Backup/" + fileName);
    
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    document.body.removeChild(downloadAnchorNode);
    URL.revokeObjectURL(url);
    
    paparToast("Backup Berjaya", "Fail backup dimuat turun. (Nota: Lokasi folder bergantung pada tetapan browser anda)", "sukses");
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if(importedData && importedData.bulan) {
                masterDatabase = importedData;
                simpanKeLocalStorage();
                paparToast("Data Dipulihkan", "Rekod berjaya di-restore. Muat semula aplikasi...", "sukses");
                setTimeout(() => location.reload(), 1500); 
            } else {
                paparToast("Ralat Format", "Fail JSON tidak sah untuk aplikasi ini.", "amaran");
            }
        } catch (err) {
            paparToast("Ralat", "Gagal membaca fail.", "amaran");
        }
    };
    reader.readAsText(file);
}

function mohonResetSemuaData() {
    bukaModal("Padam Semua Data?", "Tindakan ini memadam kesemua rekod selama-lamanya. Anda pasti?", "fa-triangle-exclamation", "bg-rose-500/20", "text-rose-500", "bg-rose-600 hover:bg-rose-700", "fa-skull", "Padam Semua", () => { localStorage.clear(); location.reload(); });
}

function muatSenaraiTemplateLaporan() {
    const select = document.getElementById('select-laporan-template');
    if(!masterDatabase.laporanTemplates) masterDatabase.laporanTemplates = {};
    let html = '<option value="" class="text-slate-900">-- Tiada Template --</option>';
    for(let key in masterDatabase.laporanTemplates) {
        html += `<option value="${key}" class="text-slate-900">${key}</option>`;
    }
    select.innerHTML = html;
    initCustomDropdown('select-laporan-template');
}

function simpanTemplateLaporan() {
    const tajuk = document.getElementById('laporan-tajuk').value;
    if(!tajuk) return paparToast("Ralat", "Sila masukkan Tajuk Laporan untuk dijadikan nama template.", "amaran");

    const checkedBoxes = document.querySelectorAll('#laporan-modal input[type="checkbox"]:checked');
    let templateData = { tajuk: tajuk, komitmenIds: [], hutangGroups: [] };

    checkedBoxes.forEach(box => {
        if(box.value.startsWith('kom_')) {
            templateData.komitmenIds.push(box.value);
        } else if(box.value.startsWith('hutgrp_')) {
            let kat = box.value.split('_')[1];
            templateData.hutangGroups.push(kat);
        }
    });

    if(!masterDatabase.laporanTemplates) masterDatabase.laporanTemplates = {};
    masterDatabase.laporanTemplates[tajuk] = templateData;
    simpanKeLocalStorage();
    
    muatSenaraiTemplateLaporan();
    document.getElementById('select-laporan-template').value = tajuk;
    syncCustomDropdown('select-laporan-template');
    
    paparToast("Berjaya", "Template laporan anda telah disimpan.", "sukses");
}

function muatTemplateLaporan() {
    const nama = document.getElementById('select-laporan-template').value;
    if(!nama) return;
    const tpl = masterDatabase.laporanTemplates[nama];
    if(!tpl) return;

    document.getElementById('laporan-tajuk').value = tpl.tajuk;
    document.querySelectorAll('#laporan-modal input[type="checkbox"]').forEach(cb => cb.checked = false);

    tpl.komitmenIds.forEach(val => {
        let cb = document.querySelector(`#laporan-modal input[value="${val}"]`);
        if(cb) cb.checked = true;
    });

    tpl.hutangGroups.forEach(kat => {
        let cb = document.querySelector(`#laporan-modal input[value^="hutgrp_${kat}_"]`);
        if(cb) cb.checked = true;
    });
}

function padamTemplateLaporan() {
    const nama = document.getElementById('select-laporan-template').value;
    if(!nama) return paparToast("Pilih Template", "Sila pilih template untuk dipadam.", "amaran");
    
    if(masterDatabase.laporanTemplates[nama]) {
        delete masterDatabase.laporanTemplates[nama];
        simpanKeLocalStorage();
        muatSenaraiTemplateLaporan();
        document.getElementById('laporan-tajuk').value = "Senarai Bayaran Bulanan";
        paparToast("Berjaya", "Template telah dipadam.", "sukses");
    }
}

function tentukanBulanLaporan() {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
}

function bukaLaporanBulanan() {
    bulanLaporanSemasa = tentukanBulanLaporan();
    const data = masterDatabase.bulan[bulanLaporanSemasa] || janaStrukturBulanKosong();
    const komitmenList = document.getElementById('laporan-komitmen-list');
    const hutangList = document.getElementById('laporan-hutang-list');
    
    komitmenList.innerHTML = '';
    hutangList.innerHTML = '';
    document.getElementById('laporan-output-container').classList.add('hidden');
    document.getElementById('btn-copy-laporan').classList.add('hidden');
    
    if(!data) return;
    muatSenaraiTemplateLaporan();

    let bilKomitmenAktif = 0;
    data.komitmen.forEach(k => {
        bilKomitmenAktif++;
        let badgePaid = k.paid ? `<span class="text-[8px] font-bold text-emerald-500 shrink-0"><i class="fa-solid fa-circle-check"></i> Sudah Bayar</span>` : '';
        komitmenList.innerHTML += `
            <label class="flex items-center gap-3 text-[10px] bg-slate-500/5 hover:bg-slate-500/10 p-2.5 rounded-lg border border-slate-500/10 cursor-pointer transition-colors">
                <input type="checkbox" class="ios-checkbox w-4 h-4 shrink-0" value="kom_${k.id}" ${k.paid ? 'checked' : ''}>
                <span class="flex-1 font-semibold ${k.paid ? 'opacity-60' : ''}">${k.nama}</span>
                ${badgePaid}
                <span class="font-bold text-rose-500 shrink-0">RM ${k.amaun.toFixed(2)}</span>
            </label>
        `;
    });

    if(!data.hutang) data.hutang = [];
    
    if(!data.hutangCatPaid) data.hutangCatPaid = {};

    const groupedHutang = {};
    data.hutang.forEach(h => {
        let kat = h.kategori || "Lain-lain";
        let sudahSetelBulanIni = h.isMonthlyPay !== false && !!data.hutangCatPaid[kat];
        if (isHutangSelesai(h) && !sudahSetelBulanIni) return;
        if(!groupedHutang[kat]) {
            groupedHutang[kat] = { totalBaki: 0, monthlyAnsuranSum: 0, hasMonthly: false, hasAdhoc: false, adhocLogAmount: 0 };
        }
        groupedHutang[kat].totalBaki += Math.max(0, h.jumlahAsal - h.sudahDibayar);
        if (h.isMonthlyPay !== false) {
            groupedHutang[kat].monthlyAnsuranSum += h.ansuran;
            groupedHutang[kat].hasMonthly = true;
        } else {
            groupedHutang[kat].hasAdhoc = true;
        }
    });

    if (data.bayaranHistory) {
        data.bayaranHistory.forEach(log => {
            if (log.tipe === 'catHut' && groupedHutang[log.targetId] && groupedHutang[log.targetId].hasAdhoc) {
                groupedHutang[log.targetId].adhocLogAmount += log.amaun;
            }
        });
    }

    let bilHutangAktif = 0;
    for (let kat in groupedHutang) {
        let grp = groupedHutang[kat];
        let sudahSetel = grp.hasMonthly && !!data.hutangCatPaid[kat];
        bilHutangAktif++;
        let amountForReport = grp.monthlyAnsuranSum + grp.adhocLogAmount;
        let infoTambahan = grp.hasAdhoc ? `<span class="text-[8px] font-bold text-indigo-400 mt-0.5"><i class="fa-solid fa-bolt"></i> Dari Log Bayaran: RM ${grp.adhocLogAmount.toFixed(2)}</span>` : '';
        let badgeSetel = sudahSetel ? `<span class="text-[8px] font-bold text-emerald-500 mt-0.5"><i class="fa-solid fa-circle-check"></i> Sudah Setel</span>` : '';

        hutangList.innerHTML += `
            <label class="flex items-center gap-3 text-[10px] bg-slate-500/5 hover:bg-slate-500/10 p-2.5 rounded-lg border border-slate-500/10 cursor-pointer transition-colors">
                <input type="checkbox" class="ios-checkbox w-4 h-4 shrink-0" value="hutgrp_${kat}_${amountForReport}" ${sudahSetel ? 'checked' : ''}>
                <div class="flex-1 flex flex-col ${sudahSetel ? 'opacity-60' : ''}">
                    <span class="font-semibold">Kategori Hutang: ${kat}</span>
                    <span class="text-[8px] opacity-70 mt-0.5">Outstanding Baki: RM ${grp.totalBaki.toFixed(2)}</span>
                    ${infoTambahan}
                    ${badgeSetel}
                </div>
                <span class="font-bold text-amber-500 shrink-0">RM ${amountForReport.toFixed(2)}</span>
            </label>
        `;
    }

    if(bilKomitmenAktif === 0) komitmenList.innerHTML = '<p class="text-[10px] opacity-50 italic px-2">Tiada rekod komitmen aktif bulan ini.</p>';
    if(bilHutangAktif === 0) hutangList.innerHTML = '<p class="text-[10px] opacity-50 italic px-2">Tiada rekod hutang aktif bulan ini (semua sudah setel).</p>';

    document.getElementById('laporan-modal').classList.remove('hidden');
    document.getElementById('laporan-modal').classList.add('flex');
    document.body.classList.add('overflow-hidden');
}

function tutupLaporan() {
    document.getElementById('laporan-modal').classList.add('hidden');
    document.getElementById('laporan-modal').classList.remove('flex');
    document.body.classList.remove('overflow-hidden');
}

function janaTeksLaporan() {
    const data = masterDatabase.bulan[bulanLaporanSemasa] || janaStrukturBulanKosong();
    const tajuk = document.getElementById('laporan-tajuk').value || "Laporan Bayaran";
    let teks = `*${tajuk}*\nBulan: ${bulanLaporanSemasa}\n\n`;
    
    let total = 0;
    const checkedBoxes = document.querySelectorAll('#laporan-modal input[type="checkbox"]:checked');
    
    if(checkedBoxes.length === 0) {
        paparToast("Tiada Pilihan", "Sila pilih sekurang-kurangnya satu item untuk dijana.", "amaran");
        return;
    }

    let hasKomitmen = false;
    let hasHutang = false;
    let hutangText = "";
    let komitmenText = "";

    checkedBoxes.forEach(box => {
        const val = box.value;
        if(val.startsWith('kom_')) {
            const id = parseInt(val.split('_')[1]);
            const k = data.komitmen.find(x => x.id === id);
            if(k) {
                komitmenText += `🔹 ${k.nama}: RM ${k.amaun.toFixed(2)}\n`;
                total += k.amaun;
                hasKomitmen = true;
            }
        } else if(val.startsWith('hutgrp_')) {
            const parts = val.split('_');
            const kat = parts[1];

            let itemsInKat = data.hutang.filter(x => (x.kategori || "Lain-lain") === kat && (!isHutangSelesai(x) || (x.isMonthlyPay !== false && data.hutangCatPaid && data.hutangCatPaid[kat])));
            if(itemsInKat.length > 0) {
                let adhocItems = itemsInKat.filter(x => x.isMonthlyPay === false);
                let adhocLogTotal = 0;
                if (data.bayaranHistory) {
                    data.bayaranHistory.forEach(log => {
                        if (log.tipe === 'catHut' && log.targetId === kat) adhocLogTotal += log.amaun;
                    });
                }
                let adhocPerItem = adhocItems.length > 0 ? (adhocLogTotal / adhocItems.length) : 0;
                let katTotal = 0;

                itemsInKat.forEach(x => {
                    let bakiInd = Math.max(0, x.jumlahAsal - x.sudahDibayar);
                    let amtInd = x.isMonthlyPay !== false ? x.ansuran : adhocPerItem;
                    katTotal += amtInd;
                    hutangText += `🔸 ${x.nama}: RM ${amtInd.toFixed(2)}\n   (Baki Terkini: RM ${bakiInd.toFixed(2)})\n`;
                });
                total += katTotal;
            }
            hasHutang = true;
        }
    });

    if(hasKomitmen) teks += `*📝 KOMITMEN:*\n${komitmenText}\n`;
    if(hasHutang) teks += `*💳 HUTANG / ANSURAN:*\n${hutangText}\n`;
    teks += `===================\n`;
    teks += `*JUMLAH KESELURUHAN: RM ${total.toFixed(2)}*\n`;
    teks += `===================`;

    const outputEl = document.getElementById('laporan-output-text');
    outputEl.value = teks;
    document.getElementById('laporan-output-container').classList.remove('hidden');
    document.getElementById('btn-copy-laporan').classList.remove('hidden');
    
    const modalContent = document.querySelector('#laporan-modal .overflow-y-auto');
    setTimeout(() => { modalContent.scrollTop = modalContent.scrollHeight; }, 100);
}

function salinLaporan() {
    const copyText = document.getElementById("laporan-output-text");
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(copyText.value);
    paparToast("Berjaya Disalin", "Teks laporan sedia untuk di-paste (Tampal).", "sukses");
}
