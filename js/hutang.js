// ============================================================
// UrusDuit — HUTANG (Debts) — CRUD, Sub-items, Categories
// ============================================================

function bukaBorangHutangModal() {
    document.getElementById('hutang-form-modal').classList.remove('hidden');
    document.getElementById('hutang-form-modal').classList.add('flex');
    document.body.classList.add('overflow-hidden');
}
function tutupBorangHutangModal() {
    document.getElementById('hutang-form-modal').classList.add('hidden');
    document.getElementById('hutang-form-modal').classList.remove('flex');
    document.body.classList.remove('overflow-hidden');
}

function editHutang(id) {
    idHutangSedangDiedit = id;
    const data = masterDatabase.bulan[bulanAktif];
    const target = data.hutang.find(h => h.id === id);
    if(!target) return;

    document.getElementById('title-borang-hutang').innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Kemaskini Maklumat: ${target.nama}`;
    document.getElementById('input-nama-hutang').value = target.nama;
    document.getElementById('input-kategori-hutang').value = target.kategori;
    document.getElementById('input-pemiutang-hutang').value = target.pemiutang;
    document.getElementById('input-jumlah-asal-hutang').value = target.jumlahAsal;
    document.getElementById('input-ansuran-hutang').value = target.ansuran;
    document.getElementById('input-sudah-dibayar-hutang').value = target.sudahDibayar;
    document.getElementById('input-faedah-hutang').value = target.faedah;
    document.getElementById('input-tarikh-hutang').value = target.tarikhBayar;
    document.getElementById('input-status-hutang').value = target.status;
    document.getElementById('input-is-monthly-pay').checked = target.isMonthlyPay !== false;
    
    syncCustomDropdown('input-kategori-hutang');
    syncCustomDropdown('input-status-hutang');

    document.getElementById('sub-hutang-section').classList.remove('hidden');
    renderSenaraiSubHutang(id);

    document.getElementById('text-btn-hutang').innerText = "Kemaskini Rekod";
    document.getElementById('btn-hantar-hutang').className = "col-span-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1 shadow-md";
    
    paparToast("Mod Edit Aktif", "Maklumat akaun hutang telah diisi ke borang.", "info");
    bukaBorangHutangModal();
}

function padamHutang(id) {
    masterDatabase.bulan[bulanAktif].hutang = masterDatabase.bulan[bulanAktif].hutang.filter(h => h.id !== id);
    if(idHutangSedangDiedit === id) kosongkanBorangHutang();
    simpanKeLocalStorage();
    segarkanDropdownTapisanKategoriHutang();
    kemaskiniSemuaPaparan();
    paparToast("Hutang Dipadam", "Rekod akaun hutang tersebut telah dikeluarkan.", "padam");
}

function mohonPadamHutang(id, namaItem) {
    bukaModal("Padam Rekod Hutang?", `Rekod "${namaItem}" akan dipadamkan terus.`, "fa-trash-can", "bg-rose-500/20", "text-rose-500", "bg-rose-600 hover:bg-rose-700", "fa-trash", "Padam", () => { padamHutang(id); });
}

function tambahHutangKategoriCustom() {
    const inputVal = document.getElementById('custom-hutang-kategori-nama').value.trim();
    if(!inputVal) return;
    if(!masterDatabase.customHutangKategori) masterDatabase.customHutangKategori = [];
    masterDatabase.customHutangKategori.push(inputVal);
    simpanKeLocalStorage();
    segarkanDropdownHutangKategori();
    segarkanDropdownTapisanKategoriHutang();
    document.getElementById('custom-hutang-kategori-nama').value = "";
    paparToast("Kategori Dibuat", `Kategori "${inputVal}" dimasukkan.`, 'sukses');
}

function segarkanDropdownHutangKategori() {
    const select = document.getElementById('input-kategori-hutang');
    if(!select) return;
    select.innerHTML = `
        <option value="Pinjaman Perumahan" class="text-slate-900">🏠 Pinjaman Perumahan</option>
        <option value="Pinjaman Kenderaan" class="text-slate-900">🚗 Pinjaman Kenderaan</option>
        <option value="Kad Kredit" class="text-slate-900">💳 Kad Kredit</option>
        <option value="Pinjaman Peribadi" class="text-slate-900">💰 Pinjaman Peribadi</option>
        <option value="Pendidikan" class="text-slate-900">🎓 Pendidikan / PTPTN</option>
    `;
    if(masterDatabase.customHutangKategori) {
        masterDatabase.customHutangKategori.forEach(kat => {
            select.innerHTML += `<option value="${kat}" class="text-slate-900">📁 ${kat}</option>`;
        });
    }
    initCustomDropdown('input-kategori-hutang');
}

function segarkanDropdownTapisanKategoriHutang() {
    const selectFilter = document.getElementById('filter-hutang-kategori');
    if(!selectFilter) return;
    
    let html = '<option value="semua" class="text-slate-900">Semua Hutang</option>';
    const data = masterDatabase.bulan[bulanAktif];
    let activeCategories = new Set();
    
    if(data && data.hutang) {
        data.hutang.forEach(h => {
            if (h.status === 'Aktif' && (h.jumlahAsal - h.sudahDibayar) > 0) {
                activeCategories.add(h.kategori || "Lain-lain");
            }
        });
    }

    activeCategories.forEach(kat => {
        html += `<option value="${kat}" class="text-slate-900">${kat}</option>`;
    });

    selectFilter.innerHTML = html;
    initCustomDropdown('filter-hutang-kategori');
}

function tambahHutang() {
    const nama = document.getElementById('input-nama-hutang').value.trim();
    const selectKat = document.getElementById('input-kategori-hutang');
    const kategori = selectKat.value || "Lain-lain";
    const pemiutang = document.getElementById('input-pemiutang-hutang').value.trim() || "-";
    const jumlahAsal = parseFloat(document.getElementById('input-jumlah-asal-hutang').value) || 0;
    const ansuran = parseFloat(document.getElementById('input-ansuran-hutang').value) || 0;
    const sudahDibayar = parseFloat(document.getElementById('input-sudah-dibayar-hutang').value) || 0;
    const faedah = parseFloat(document.getElementById('input-faedah-hutang').value) || 0;
    const tarikhBayar = document.getElementById('input-tarikh-hutang').value.trim() || "-";
    const status = document.getElementById('input-status-hutang').value;
    const isMonthlyPay = document.getElementById('input-is-monthly-pay').checked;

    if(!nama || jumlahAsal <= 0) return paparToast("Maklumat Tidak Cukup", "Masukkan Nama Hutang dan Jumlah Asal.", "amaran");

    const data = masterDatabase.bulan[bulanAktif];
    if(!data.hutang) data.hutang = [];

    if(idHutangSedangDiedit !== null) {
        const idx = data.hutang.findIndex(h => h.id === idHutangSedangDiedit);
        if(idx !== -1) {
            let prevSudahDibayar = data.hutang[idx].sudahDibayar;
            
            data.hutang[idx] = {
                ...data.hutang[idx], nama, kategori, pemiutang, jumlahAsal, ansuran, sudahDibayar, faedah, tarikhBayar, status, isMonthlyPay
            };
            
            let diff = sudahDibayar - prevSudahDibayar;
            if (diff !== 0) {
                if (diff < 0 && data.hutangCatPaid && data.hutangCatPaid[kategori]) {
                    data.hutangCatPaid[kategori] = false;
                }
                
                if(!data.bayaranHistory) data.bayaranHistory = [];
                const tarikhHariIni = new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' });
                data.bayaranHistory.push({
                    id: Date.now(), 
                    tipe: 'catHut', 
                    targetId: kategori, 
                    nama: `Edit Akaun: ${nama} ${diff > 0 ? '(Tambah)' : '(Batal)'}`, 
                    amaun: diff, 
                    tarikh: tarikhHariIni
                });
            }

            paparToast("Rekod Dikemaskini", `Akaun "${nama}" berjaya disimpan.`, "sukses");
        }
        idHutangSedangDiedit = null;
    } else {
        data.hutang.push({
            id: Date.now(), nama: nama, kategori: kategori, pemiutang: pemiutang, jumlahAsal: jumlahAsal,
            ansuran: ansuran, sudahDibayar: sudahDibayar, faedah: faedah, tarikhBayar: tarikhBayar, status: status, paid: false, isMonthlyPay: isMonthlyPay 
        });
        paparToast("Hutang Direkod", `Pendaftaran "${nama}" disimpan.`, "sukses");
    }
    
    simpanKeLocalStorage();
    segarkanDropdownTapisanKategoriHutang();
    kemaskiniSemuaPaparan();
    kosongkanBorangHutang();
    tutupBorangHutangModal();
}

function kosongkanBorangHutang() {
    idHutangSedangDiedit = null;
    document.getElementById('title-borang-hutang').innerHTML = `<i class="fa-solid fa-hand-holding-dollar"></i> Daftar Akaun Hutang Baru 💳`;
    document.getElementById('input-nama-hutang').value = "";
    document.getElementById('input-pemiutang-hutang').value = "";
    document.getElementById('input-jumlah-asal-hutang').value = "";
    document.getElementById('input-ansuran-hutang').value = "";
    document.getElementById('input-sudah-dibayar-hutang').value = "";
    document.getElementById('input-faedah-hutang').value = "";
    document.getElementById('input-tarikh-hutang').value = "";
    document.getElementById('input-status-hutang').value = "Aktif";
    document.getElementById('input-is-monthly-pay').checked = true;
    
    syncCustomDropdown('input-status-hutang');
    syncCustomDropdown('input-kategori-hutang');

    document.getElementById('sub-hutang-section').classList.add('hidden');
    document.getElementById('input-nama-subhutang').value = "";
    document.getElementById('input-amaun-subhutang').value = "";

    document.getElementById('text-btn-hutang').innerText = "Simpan Rekod";
    document.getElementById('btn-hantar-hutang').className = "col-span-3 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1 shadow-md";
}

function binaHutangCardTemplate(h) {
    let asal = parseFloat(h.jumlahAsal) || 0;
    let dibayar = parseFloat(h.sudahDibayar) || 0;
    let progress = 0;
    
    if (asal > 0) {
        progress = Math.max(0, Math.min(100, (dibayar / asal) * 100));
    }
    
    let barColorClass = "bg-gradient-to-r from-rose-500 to-orange-500"; 
    if (progress >= 75) {
        barColorClass = "bg-gradient-to-r from-teal-500 to-emerald-500";
    } else if (progress >= 35) {
        barColorClass = "bg-gradient-to-r from-orange-500 to-amber-500";
    }
    
    return `
        <div class="liquid-glass rounded-xl p-3.5 space-y-3 text-[11px]">
            <div class="flex justify-between items-center">
                <div>
                    <div class="flex items-center gap-1.5">
                        <h4 class="font-bold text-slate-800 dark:text-slate-200 text-xs">${h.nama}</h4>
                        ${h.isMonthlyPay !== false ? '<span class="text-[8px] bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded uppercase font-bold">Ansuran</span>' : ''}
                        <span class="text-[8px] bg-slate-500/20 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded font-bold"><i class="fa-solid fa-calendar text-[7px] mr-0.5"></i>Hb ${h.tarikhBayar}</span>
                    </div>
                    <p class="text-[10px] opacity-70 mt-0.5"><span class="font-medium text-slate-600 dark:text-slate-400">${h.kategori}</span></p>
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="editHutang(${h.id})" class="text-indigo-600 dark:text-indigo-400 bg-slate-500/10 border border-slate-300 dark:border-transparent w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors" title="Kemaskini"><i class="fa-solid fa-pen text-[10px]"></i></button>
                    <button onclick="bukaLaporanSubHutang(${h.id})" class="text-purple-600 dark:text-purple-400 bg-slate-500/10 border border-slate-300 dark:border-transparent w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors" title="Laporan Sub-Hutang"><i class="fa-solid fa-file-lines text-[10px]"></i></button>
                    <button onclick="mohonPadamHutang(${h.id}, '${h.nama}')" class="text-rose-600 dark:text-rose-400 bg-slate-500/10 border border-slate-300 dark:border-transparent w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors" title="Padam"><i class="fa-solid fa-trash-can text-[10px]"></i></button>
                </div>
            </div>
            
            <div class="pt-1">
                <div class="flex justify-between text-[9px] mb-1.5 font-bold text-slate-700 dark:text-slate-300">
                    <span>Dibayar: RM ${dibayar.toFixed(2)}</span>
                    <span>Total: RM ${asal.toFixed(2)}</span>
                </div>
                <div class="w-full bg-slate-500/10 h-2 rounded-full overflow-hidden">
                    <div class="${barColorClass} h-full rounded-full transition-all duration-500 ease-out" style="width: ${progress}%"></div>
                </div>
                <div class="flex justify-between text-[9px] mt-1.5 opacity-70 font-bold">
                    <span>Ansuran bulanan: RM ${parseFloat(h.ansuran).toFixed(2)}</span>
                    <span>${progress.toFixed(1)}% Selesai</span>
                </div>
            </div>
        </div>
    `;
}

function tambahSubHutang() {
    if (idHutangSedangDiedit === null) return paparToast("Simpan Dahulu", "Sila simpan Hutang utama sebelum menambah Sub-Hutang.", "amaran");
    const nama = document.getElementById('input-nama-subhutang').value.trim();
    const tarikh = new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' });
    const amaun = parseFloat(document.getElementById('input-amaun-subhutang').value) || 0;
    if (!nama || amaun <= 0) return paparToast("Maklumat Tidak Cukup", "Masukkan Nama dan Amaun Sub-Hutang.", "amaran");

    const data = masterDatabase.bulan[bulanAktif];
    const target = data.hutang.find(h => h.id === idHutangSedangDiedit);
    if (!target) return;
    if (!target.subHutang) target.subHutang = [];
    target.subHutang.push({ id: Date.now(), nama, tarikh, amaun, paid: false });
    target.jumlahAsal = (parseFloat(target.jumlahAsal) || 0) + amaun;

    document.getElementById('input-nama-subhutang').value = "";
    document.getElementById('input-amaun-subhutang').value = "";
    document.getElementById('input-jumlah-asal-hutang').value = target.jumlahAsal;

    simpanKeLocalStorage();
    renderSenaraiSubHutang(idHutangSedangDiedit);
    kemaskiniSemuaPaparan();
    paparToast("Sub-Hutang Ditambah", `"${nama}" telah disenaraikan dan ditambah ke jumlah hutang.`, "sukses");
}

function renderSenaraiSubHutang(id) {
    const listEl = document.getElementById('senarai-subhutang-list');
    if (!listEl) return;
    const data = masterDatabase.bulan[bulanAktif];
    const target = data.hutang.find(h => h.id === id);
    const subList = (target && target.subHutang) ? target.subHutang : [];

    if (subList.length === 0) {
        listEl.innerHTML = `<p class="text-[10px] text-slate-500 text-center py-2">Tiada sub-hutang direkod.</p>`;
        return;
    }

    listEl.innerHTML = subList.map(s => `
        <div class="flex justify-between items-center bg-slate-500/5 border border-slate-500/10 px-2.5 py-1.5 rounded-lg text-[10px]">
            <div>
                <span class="font-bold block">${s.nama}</span>
                <span class="opacity-60">${s.tarikh}</span>
            </div>
            <div class="flex items-center gap-2">
                <span class="font-bold text-purple-600 dark:text-purple-400">RM ${parseFloat(s.amaun).toFixed(2)}</span>
                <button onclick="padamSubHutang(${id}, ${s.id})" class="text-rose-500 w-5 h-5 flex items-center justify-center cursor-pointer"><i class="fa-solid fa-xmark text-[10px]"></i></button>
            </div>
        </div>
    `).join('');
}

function padamSubHutang(hutangId, subId) {
    const data = masterDatabase.bulan[bulanAktif];
    const target = data.hutang.find(h => h.id === hutangId);
    if (!target || !target.subHutang) return;
    const subItem = target.subHutang.find(s => s.id === subId);
    target.subHutang = target.subHutang.filter(s => s.id !== subId);
    if (subItem) {
        target.jumlahAsal = Math.max(0, (parseFloat(target.jumlahAsal) || 0) - (parseFloat(subItem.amaun) || 0));
        if (idHutangSedangDiedit === hutangId) {
            document.getElementById('input-jumlah-asal-hutang').value = target.jumlahAsal;
        }
    }
    simpanKeLocalStorage();
    renderSenaraiSubHutang(hutangId);
    kemaskiniSemuaPaparan();
}

function bukaLaporanSubHutang(id) {
    const data = masterDatabase.bulan[bulanAktif];
    const target = data.hutang.find(h => h.id === id);
    if (!target) return;

    document.getElementById('title-laporan-subhutang').innerHTML = `<i class="fa-solid fa-file-lines"></i> Laporan: ${target.nama}`;
    const subList = target.subHutang || [];
    const isiEl = document.getElementById('isi-laporan-subhutang');
    let totalSub = subList.reduce((sum, s) => sum + (parseFloat(s.amaun) || 0), 0);
    let jumlahAsalSemasa = parseFloat(target.jumlahAsal) || 0;
    let pokok = Math.max(0, jumlahAsalSemasa - totalSub);

    let html = `
        <div class="flex justify-between items-center bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl">
            <div>
                <span class="font-bold block text-slate-800 dark:text-slate-200">${target.nama}</span>
                <span class="opacity-60 text-[10px]">Hutang Asal (Pokok)</span>
            </div>
            <span class="font-extrabold text-amber-600 dark:text-amber-500">RM ${pokok.toFixed(2)}</span>
        </div>
    `;

    if (subList.length === 0) {
        html += `<p class="text-[11px] text-slate-500 text-center py-4 bg-slate-500/5 rounded-xl border border-dashed">Tiada sub-hutang direkod bagi akaun ini.</p>`;
    } else {
        html += subList.map(s => `
            <div class="flex justify-between items-center bg-slate-500/5 border border-slate-500/10 p-2.5 rounded-xl">
                <div>
                    <span class="font-bold block text-slate-800 dark:text-slate-200">${s.nama}</span>
                    <span class="opacity-60 text-[10px]">${s.tarikh}</span>
                </div>
                <span class="font-extrabold text-purple-600 dark:text-purple-400">RM ${parseFloat(s.amaun).toFixed(2)}</span>
            </div>
        `).join('');
    }

    isiEl.innerHTML = html;
    document.getElementById('total-laporan-subhutang').innerText = `RM ${(pokok + totalSub).toFixed(2)}`;

    document.getElementById('laporan-subhutang-modal').classList.remove('hidden');
    document.getElementById('laporan-subhutang-modal').classList.add('flex');
}

function tutupLaporanSubHutang() {
    document.getElementById('laporan-subhutang-modal').classList.add('hidden');
    document.getElementById('laporan-subhutang-modal').classList.remove('flex');
}
