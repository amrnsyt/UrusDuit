// ============================================================
// UrusDuit — DASHBOARD — Main Render, Quick Pay, Payment History
// ============================================================

function janaSenaraiBulanSejarah() {
    const selectSejarah = document.getElementById('select-bulan-sejarah');
    if(!selectSejarah) return;

    let html = '';
    const namaBulan = ["Januari", "Februari", "Mac", "April", "Mei", "Jun", "Julai", "Ogos", "September", "Oktober", "November", "Disember"];
    let adaRekod = false;

    let availableMonths = Object.keys(masterDatabase.bulan).sort();
    availableMonths.forEach(b => {
        let data = masterDatabase.bulan[b];
        if (data && data.bayaranHistory && data.bayaranHistory.length > 0) {
            let [y, m] = b.split('-');
            let teksBulan = `${namaBulan[parseInt(m) - 1]} ${y}`;
            html += `<option value="${b}" class="text-slate-900">${teksBulan}</option>`;
            adaRekod = true;
        }
    });

    if (!adaRekod) {
        let [y, m] = bulanAktif.split('-');
        let teksBulan = `${namaBulan[parseInt(m) - 1]} ${y}`;
        html += `<option value="${bulanAktif}" class="text-slate-900">${teksBulan}</option>`;
    }

    let prevVal = selectSejarah.value;
    selectSejarah.innerHTML = html;
    
    if (html.includes(`value="${prevVal}"`)) {
        selectSejarah.value = prevVal;
    } else if (html.includes(`value="${bulanAktif}"`)) {
        selectSejarah.value = bulanAktif;
    } else if (availableMonths.length > 0) {
        selectSejarah.selectedIndex = selectSejarah.options.length - 1;
    }

    initCustomDropdown('select-bulan-sejarah');
}

function bukaQuickPayModal() {
    document.getElementById('quick-pay-modal').classList.remove('hidden');
    document.getElementById('quick-pay-modal').classList.add('flex');
    document.body.classList.add('overflow-hidden');
}
function tutupQuickPayModal() {
    document.getElementById('quick-pay-modal').classList.add('hidden');
    document.getElementById('quick-pay-modal').classList.remove('flex');
    document.body.classList.remove('overflow-hidden');
    const akaunSection = document.getElementById('quick-pay-hutang-akaun-section');
    if(akaunSection) { akaunSection.classList.add('hidden'); akaunSection.innerHTML = ""; }
}

function onQuickPaySelectChange() {
    const selectEl = document.getElementById('quick-pay-select');
    const val = selectEl.value;
    const akaunSection = document.getElementById('quick-pay-hutang-akaun-section');
    document.getElementById('quick-pay-amount').value = "";

    if(val && val.startsWith('catHut_')) {
        const kategori = val.split('_').slice(1).join('_');
        renderQuickPayHutangAkaunList(kategori);
        akaunSection.classList.remove('hidden');
    } else {
        akaunSection.classList.add('hidden');
        akaunSection.innerHTML = "";
    }
}

function renderQuickPayHutangAkaunList(kategori) {
    const section = document.getElementById('quick-pay-hutang-akaun-section');
    const data = masterDatabase.bulan[bulanAktif];

    let html = `<label class="text-[9px] uppercase font-bold tracking-wider opacity-70 mb-1.5 flex items-center gap-1.5"><i class="fa-solid fa-file-invoice-dollar"></i> Pilih Akaun Hutang Dalam Kategori Ini</label>`;
    html += `<select id="quick-pay-hutang-akaun-select" class="w-full glass-input rounded-xl px-3 py-2.5 text-xs bg-transparent border shadow-sm" onchange="onQuickPayHutangAkaunChange()">`;
    html += `<option value="" class="text-slate-900">-- Bayaran Am Kategori (Automatik) --</option>`;

    let ada = false;
    data.hutang.forEach(h => {
        let kat = h.kategori || "Lain-lain";
        if(kat === kategori && h.status === 'Aktif') {
            let baki = Math.max(0, h.jumlahAsal - h.sudahDibayar);
            if(baki > 0) {
                ada = true;
                html += `<option value="${h.id}" class="text-slate-900">${h.nama} [Baki: RM ${baki.toFixed(2)}]</option>`;
            }
        }
    });
    html += `</select>`;

    if(!ada) {
        html += `<p class="text-[10px] text-slate-500 mt-2">Tiada akaun aktif dalam kategori ini.</p>`;
    }

    section.innerHTML = html;
    initCustomDropdown('quick-pay-hutang-akaun-select');
}

function onQuickPayHutangAkaunChange() {
    const akaunSelectEl = document.getElementById('quick-pay-hutang-akaun-select');
    const amountInput = document.getElementById('quick-pay-amount');
    if(!akaunSelectEl) return;

    const hutangId = akaunSelectEl.value;
    if(!hutangId) { amountInput.value = ""; return; }

    const data = masterDatabase.bulan[bulanAktif];
    const target = data.hutang.find(h => h.id === parseInt(hutangId));
    if(!target) return;
    const baki = Math.max(0, target.jumlahAsal - target.sudahDibayar);
    amountInput.value = baki.toFixed(2);
}

function bukaHistoryModal() {
    document.getElementById('history-modal').classList.remove('hidden');
    document.getElementById('history-modal').classList.add('flex');
    document.body.classList.add('overflow-hidden');
    try {
        janaSenaraiBulanSejarah();
        kemaskiniSemuaPaparan();
    } catch (err) {
        console.error('Ralat memuatkan sejarah:', err);
    }
}
function tutupHistoryModal() {
    document.getElementById('history-modal').classList.add('hidden');
    document.getElementById('history-modal').classList.remove('flex');
    document.body.classList.remove('overflow-hidden');
}

function toggleKomitmenPaid(id) {
    const index = masterDatabase.bulan[bulanAktif].komitmen.findIndex(i => i.id === id);
    if(index !== -1) {
        const item = masterDatabase.bulan[bulanAktif].komitmen[index];
        item.paid = !item.paid;
        
        if(!masterDatabase.bulan[bulanAktif].bayaranHistory) masterDatabase.bulan[bulanAktif].bayaranHistory = [];
        let kategoriTarget = item.kategori || item.icon;

        if(item.paid) {
            const t = new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' });
            masterDatabase.bulan[bulanAktif].bayaranHistory.push({
                id: Date.now(), tipe: 'catKom', targetId: kategoriTarget, nama: `Kategori Komitmen: ${kategoriTarget}`, amaun: item.amaun, tarikh: t, itemId: item.id
            });
        } else {
            masterDatabase.bulan[bulanAktif].bayaranHistory = masterDatabase.bulan[bulanAktif].bayaranHistory.filter(h => !(h.tipe === 'catKom' && h.itemId === item.id));
        }

        simpanKeLocalStorage();
        kemaskiniSemuaPaparan();
    }
}

function toggleHutangCatPaid(kategori) {
    const data = masterDatabase.bulan[bulanAktif];
    if(!data.hutangCatPaid) data.hutangCatPaid = {};
    if(!data.hutangCatPaidDeltas) data.hutangCatPaidDeltas = {};
    data.hutangCatPaid[kategori] = !data.hutangCatPaid[kategori];
    
    if(!data.bayaranHistory) data.bayaranHistory = [];
    
    if(data.hutangCatPaid[kategori]) {
        if(!data.hutang) data.hutang = [];

        let totalAnsuranKategori = 0;
        data.hutang.forEach(h => {
            if(h.status === 'Aktif' && h.isMonthlyPay !== false && (h.kategori || 'Lain-lain') === kategori) {
                totalAnsuranKategori += (parseFloat(h.ansuran) || 0);
            }
        });

        let sudahDibayarQuickPay = 0;
        data.bayaranHistory.forEach(log => {
            if(log.tipe === 'catHut' && log.targetId === kategori) sudahDibayarQuickPay += log.amaun;
        });

        let bakiPool = Math.max(0, totalAnsuranKategori - sudahDibayarQuickPay);

        let amt = 0;
        const deltas = {};
        data.hutang.forEach(h => {
            if(bakiPool > 0 && h.status === 'Aktif' && h.isMonthlyPay !== false && (h.kategori || 'Lain-lain') === kategori) {
                const bakiHutang = Math.max(0, h.jumlahAsal - h.sudahDibayar);
                const payAmt = Math.min(bakiHutang, bakiPool);
                if(payAmt > 0) {
                    h.sudahDibayar += payAmt;
                    if(h.sudahDibayar > h.jumlahAsal) h.sudahDibayar = h.jumlahAsal;
                    amt += payAmt;
                    deltas[h.id] = payAmt;
                    bakiPool -= payAmt;
                }
            }
        });
        data.hutangCatPaidDeltas[kategori] = deltas;
        const t = new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' });
        data.bayaranHistory.push({
            id: Date.now(), tipe: 'catHutCheck', targetId: kategori, nama: `Ansuran Hutang: ${kategori}`, amaun: amt, tarikh: t
        });
    } else {
        if(!data.hutang) data.hutang = [];
        const deltas = data.hutangCatPaidDeltas[kategori] || {};
        data.hutang.forEach(h => {
            if(h.status === 'Aktif' && h.isMonthlyPay !== false && (h.kategori || 'Lain-lain') === kategori) {
                const payAmt = deltas[h.id] || 0;
                h.sudahDibayar -= payAmt;
                if(h.sudahDibayar < 0) h.sudahDibayar = 0;
            }
        });
        delete data.hutangCatPaidDeltas[kategori];
        data.bayaranHistory = data.bayaranHistory.filter(h => !(h.tipe === 'catHutCheck' && h.targetId === kategori));
    }
    
    simpanKeLocalStorage();
    kemaskiniSemuaPaparan();
}

function prosesBayaranPantas() {
    const selectEl = document.getElementById('quick-pay-select');
    const targetValue = selectEl.value;
    const amaunLog = parseFloat(document.getElementById('quick-pay-amount').value) || 0;

    if(!targetValue) return paparToast("Pilihan Kosong", "Sila pilih kategori aliran terlebih dahulu.", "amaran");
    if(amaunLog <= 0) return paparToast("Ralat Amaun", "Sila masukkan jumlah bayaran yang sah.", "amaran");

    const parts = targetValue.split('_');
    const jenis = parts[0];
    const namaKategori = parts.slice(1).join('_');

    const data = masterDatabase.bulan[bulanAktif];
    let namaTarget = "";
    let remaining = amaunLog;
    let hutangIdTarget = null;
    let komitmenPaidIds = null;

    if(jenis === 'catKom') {
        let paidIds = [];
        data.komitmen.forEach(i => {
            let kat = i.kategori || i.icon;
            if(kat === namaKategori && !i.paid && remaining >= i.amaun) {
                i.paid = true;
                paidIds.push(i.id);
                remaining -= i.amaun;
            }
        });
        namaTarget = `Kategori Komitmen: ${namaKategori}`;
        komitmenPaidIds = paidIds;
    } else if(jenis === 'catHut') {
        const akaunSelectEl = document.getElementById('quick-pay-hutang-akaun-select');
        const hutangIdVal = akaunSelectEl ? akaunSelectEl.value : "";

        if(hutangIdVal) {
            const target = data.hutang.find(h => h.id === parseInt(hutangIdVal));
            if(!target) {
                paparToast("Ralat", "Akaun hutang tidak dijumpai.", "amaran");
                return;
            }

            let baki = Math.max(0, target.jumlahAsal - target.sudahDibayar);
            let payAmt = Math.min(baki, remaining);
            target.sudahDibayar = (parseFloat(target.sudahDibayar) || 0) + payAmt;
            remaining -= payAmt;
            namaTarget = `Hutang: ${target.nama}`;
            hutangIdTarget = target.id;
        } else {
            data.hutang.forEach(h => {
                let kat = h.kategori || "Lain-lain";
                if(kat === namaKategori && h.status === 'Aktif' && remaining > 0) {
                    let baki = Math.max(0, h.jumlahAsal - h.sudahDibayar);
                    let payAmt = Math.min(baki, remaining);
                    h.sudahDibayar += payAmt;
                    remaining -= payAmt;
                }
            });
            namaTarget = `Kategori Hutang: ${namaKategori}`;
        }
    }

    const amaunTerpakai = amaunLog - remaining;

    if(amaunTerpakai <= 0) {
        paparToast("Tiada Baki Perlu Dibayar", `"${namaTarget}" sudah tiada baki tertunggak untuk ditolak.`, "amaran");
        return;
    }

    if(!data.bayaranHistory) data.bayaranHistory = [];
    const tarikhHariIni = new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' });
    data.bayaranHistory.push({
        id: Date.now(), tipe: jenis, targetId: namaKategori, hutangId: hutangIdTarget, paidItemIds: komitmenPaidIds, nama: namaTarget, amaun: amaunTerpakai, tarikh: tarikhHariIni
    });

    if(remaining > 0.004) {
        paparToast("Baki Lebihan Tidak Digunakan", `RM ${amaunTerpakai.toFixed(2)} telah ditolak. Baki lebihan RM ${remaining.toFixed(2)} tidak direkod kerana tiada tunggakan lagi.`, "amaran");
    } else {
        paparToast("Baki Berkurang", `RM ${amaunTerpakai.toFixed(2)} telah ditolak daripada "${namaTarget}".`, "sukses");
    }

    document.getElementById('quick-pay-amount').value = "";
    tutupQuickPayModal();
    simpanKeLocalStorage();
    kemaskiniSemuaPaparan();
}

function editSejarah(idLog) {
    const data = masterDatabase.bulan[bulanAktif];
    const idxLog = data.bayaranHistory.findIndex(l => l.id === idLog);
    if(idxLog === -1) return;

    const logItem = data.bayaranHistory[idxLog];
    const amaunBaruInput = prompt(`Kemaskini Amaun Bayaran Sejarah untuk "${logItem.nama}":`, logItem.amaun);
    if(amaunBaruInput === null) return;
    let amaunBaru = parseFloat(amaunBaruInput) || 0;
    
    if(logItem.amaun < 0) return paparToast("Dilarang", "Log pemulangan tidak boleh diedit, hanya dipadam.", "amaran");
    if(amaunBaru < 0) return paparToast("Ralat Amaun", "Sila masukkan amaun baru yang sah.", "amaran");

    const perbezaan = amaunBaru - logItem.amaun;

    if(logItem.tipe === 'catHut') {
        if (logItem.hutangId) {
            const h = data.hutang.find(x => x.id === logItem.hutangId);
            if (h) {
                if (perbezaan > 0) {
                    let baki = Math.max(0, h.jumlahAsal - h.sudahDibayar);
                    let applied = Math.min(baki, perbezaan);
                    h.sudahDibayar += applied;
                    amaunBaru = logItem.amaun + applied;
                } else if (perbezaan < 0) {
                    let takeBack = Math.min(h.sudahDibayar, Math.abs(perbezaan));
                    h.sudahDibayar -= takeBack;
                    if(h.sudahDibayar < 0) h.sudahDibayar = 0;
                    amaunBaru = logItem.amaun - takeBack;
                }
            } else {
                paparToast("Makluman", "Akaun hutang asal bagi log ini telah dipadam. Amaun log tidak diubah.", "amaran");
                amaunBaru = logItem.amaun;
            }
        } else if (perbezaan > 0) {
            let remaining = perbezaan;
            for (let i = 0; i < data.hutang.length; i++) {
                let h = data.hutang[i];
                let kat = h.kategori || "Lain-lain";
                if (kat === logItem.targetId && h.status === 'Aktif') {
                    let baki = Math.max(0, h.jumlahAsal - h.sudahDibayar);
                    let payAmt = Math.min(baki, remaining);
                    h.sudahDibayar += payAmt;
                    remaining -= payAmt;
                    if(remaining <= 0) break;
                }
            }
            amaunBaru = amaunBaru - remaining;
        } else if (perbezaan < 0) {
            let diffToRemove = Math.abs(perbezaan);
            for (let i = 0; i < data.hutang.length; i++) {
                let h = data.hutang[i];
                let kat = h.kategori || "Lain-lain";
                if (kat === logItem.targetId && h.sudahDibayar > 0) {
                    let takeBack = Math.min(h.sudahDibayar, diffToRemove);
                    h.sudahDibayar -= takeBack;
                    diffToRemove -= takeBack;
                    if (diffToRemove <= 0) break;
                }
            }
            amaunBaru = logItem.amaun - (Math.abs(perbezaan) - diffToRemove);
        }
    } else if (logItem.tipe === 'editHutang') {
        const h = logItem.hutangId ? data.hutang.find(x => x.id === logItem.hutangId) : null;
        if (h) {
            let novaSudahDibayar = h.sudahDibayar + perbezaan;
            novaSudahDibayar = Math.max(0, Math.min(h.jumlahAsal, novaSudahDibayar));
            h.sudahDibayar = novaSudahDibayar;
        } else {
            paparToast("Makluman", "Akaun hutang asal bagi log ini telah dipadam. Amaun log tidak diubah.", "amaran");
            amaunBaru = logItem.amaun;
        }
    } else if (logItem.tipe === 'catKom') {
        if (logItem.itemId) {
            paparToast("Tidak Boleh Edit", "Log ini terikat terus dengan status 'Sudah Bayar' komitmen tersebut. Padam log ini untuk buka semula, atau kemaskini amaun asal di halaman Komitmen.", "amaran");
            return;
        }
        (logItem.paidItemIds || []).forEach(id => {
            const c = data.komitmen.find(x => x.id === id);
            if (c) c.paid = false;
        });
        let pool = amaunBaru;
        let newPaidIds = [];
        data.komitmen.forEach(c => {
            let kat = c.kategori || c.icon;
            if (kat === logItem.targetId && !c.paid && pool >= c.amaun) {
                c.paid = true;
                newPaidIds.push(c.id);
                pool -= c.amaun;
            }
        });
        logItem.paidItemIds = newPaidIds;
        if (pool > 0.004) {
            paparToast("Baki Lebihan Tidak Digunakan", `RM ${pool.toFixed(2)} tidak dapat digunakan kerana tiada item lagi untuk dibayar penuh dalam kategori ini.`, "amaran");
        }
        amaunBaru = amaunBaru - pool;
    } else if (logItem.tipe === 'catHutCheck') {
        const kat = logItem.targetId;
        if(!data.hutangCatPaidDeltas) data.hutangCatPaidDeltas = {};
        const oldDeltas = data.hutangCatPaidDeltas[kat] || {};
        data.hutang.forEach(h => {
            if (h.status === 'Aktif' && h.isMonthlyPay !== false && (h.kategori || 'Lain-lain') === kat) {
                const payAmt = oldDeltas[h.id] || 0;
                h.sudahDibayar -= payAmt;
                if (h.sudahDibayar < 0) h.sudahDibayar = 0;
            }
        });
        let pool = amaunBaru;
        const newDeltas = {};
        data.hutang.forEach(h => {
            if (pool > 0 && h.status === 'Aktif' && h.isMonthlyPay !== false && (h.kategori || 'Lain-lain') === kat) {
                const baki = Math.max(0, h.jumlahAsal - h.sudahDibayar);
                const payAmt = Math.min(baki, pool);
                if (payAmt > 0) {
                    h.sudahDibayar += payAmt;
                    newDeltas[h.id] = payAmt;
                    pool -= payAmt;
                }
            }
        });
        data.hutangCatPaidDeltas[kat] = newDeltas;
        if (pool > 0.004) {
            paparToast("Baki Lebihan Tidak Digunakan", `RM ${pool.toFixed(2)} tidak dapat digunakan kerana baki hutang kategori ini sudah tiada tunggakan.`, "amaran");
        }
        amaunBaru = amaunBaru - pool;
        if (amaunBaru <= 0 && data.hutangCatPaid) data.hutangCatPaid[kat] = false;
    }

    logItem.amaun = amaunBaru;
    simpanKeLocalStorage();
    kemaskiniSemuaPaparan();
    paparToast("Sejarah Dikemaskini", "Jumlah transaksi log berjaya dikira semula.", "sukses");
}

function padamSejarah(idLog) {
    const data = masterDatabase.bulan[bulanAktif];
    const idxLog = data.bayaranHistory.findIndex(l => l.id === idLog);
    if(idxLog === -1) return;

    const logItem = data.bayaranHistory[idxLog];

    if(logItem.tipe === 'editHutang') {
        const h = logItem.hutangId ? data.hutang.find(x => x.id === logItem.hutangId) : null;
        if (h) {
            let novaSudahDibayar = h.sudahDibayar - logItem.amaun;
            h.sudahDibayar = Math.max(0, Math.min(h.jumlahAsal, novaSudahDibayar));
        } else {
            paparToast("Makluman", "Akaun hutang asal bagi log ini telah dipadam. Baki akaun lain tidak diubah.", "amaran");
        }
    } else if(logItem.tipe === 'catHut') {
        if (logItem.hutangId) {
            const h = data.hutang.find(x => x.id === logItem.hutangId);
            if (h) {
                if (logItem.amaun > 0) {
                    let takeBack = Math.min(h.sudahDibayar, logItem.amaun);
                    h.sudahDibayar -= takeBack;
                    if(h.sudahDibayar < 0) h.sudahDibayar = 0;
                } else if (logItem.amaun < 0) {
                    let baki = Math.max(0, h.jumlahAsal - h.sudahDibayar);
                    h.sudahDibayar += Math.min(baki, Math.abs(logItem.amaun));
                }
            } else {
                paparToast("Makluman", "Akaun hutang asal bagi log ini telah dipadam. Baki akaun lain tidak diubah.", "amaran");
            }
        } else if (logItem.amaun > 0) {
            let diffToRemove = logItem.amaun;
            for (let i = 0; i < data.hutang.length; i++) {
                let h = data.hutang[i];
                let kat = h.kategori || "Lain-lain";
                if (kat === logItem.targetId && h.sudahDibayar > 0) {
                    let takeBack = Math.min(h.sudahDibayar, diffToRemove);
                    h.sudahDibayar -= takeBack;
                    diffToRemove -= takeBack;
                    if (diffToRemove <= 0) break;
                }
            }
        } else if (logItem.amaun < 0) {
            let diffToAdd = Math.abs(logItem.amaun);
            for (let i = 0; i < data.hutang.length; i++) {
                let h = data.hutang[i];
                let kat = h.kategori || "Lain-lain";
                if (kat === logItem.targetId && h.status === 'Aktif') {
                    let baki = Math.max(0, h.jumlahAsal - h.sudahDibayar);
                    let toAdd = Math.min(baki, diffToAdd);
                    h.sudahDibayar += toAdd;
                    diffToAdd -= toAdd;
                    if (diffToAdd <= 0) break;
                }
            }
        }
    } else if(logItem.tipe === 'catKom') {
        if (logItem.itemId) {
            const cIdx = data.komitmen.findIndex(c => c.id === logItem.itemId);
            if(cIdx !== -1) data.komitmen[cIdx].paid = false;
        } else if (logItem.paidItemIds) {
            logItem.paidItemIds.forEach(id => {
                const c = data.komitmen.find(x => x.id === id);
                if (c) c.paid = false;
            });
        } else {
            data.komitmen.forEach(c => {
                let kat = c.kategori || c.icon;
                if (kat === logItem.targetId) c.paid = false;
            });
        }
    } else if(logItem.tipe === 'catHutCheck') {
        if(data.hutangCatPaid) data.hutangCatPaid[logItem.targetId] = false;
        if(!data.hutang) data.hutang = [];
        const deltas = (data.hutangCatPaidDeltas && data.hutangCatPaidDeltas[logItem.targetId]) || null;
        data.hutang.forEach(h => {
            if(h.status === 'Aktif' && h.isMonthlyPay !== false && (h.kategori || 'Lain-lain') === logItem.targetId) {
                const payAmt = deltas ? (deltas[h.id] || 0) : h.ansuran;
                h.sudahDibayar -= payAmt;
                if(h.sudahDibayar < 0) h.sudahDibayar = 0;
            }
        });
        if(data.hutangCatPaidDeltas) delete data.hutangCatPaidDeltas[logItem.targetId];
    }

    data.bayaranHistory.splice(idxLog, 1);
    simpanKeLocalStorage();
    kemaskiniSemuaPaparan();
    paparToast("Transaksi Dipadam", "Log bayaran dikeluarkan, baki dipulangkan asal.", "padam");
}

function isHutangSelesai(h) {
    let asal = parseFloat(h.jumlahAsal) || 0;
    let dibayar = parseFloat(h.sudahDibayar) || 0;
    let progress = asal > 0 ? (dibayar / asal) * 100 : 0;
    return h.status === 'Selesai' || progress >= 100;
}

function kemaskiniSemuaPaparan() {
    const data = masterDatabase.bulan[bulanAktif];
    if(!data.bayaranHistory) data.bayaranHistory = [];
    if(!data.hutangCatPaid) data.hutangCatPaid = {};

    const kadarJamAsas = (data.gajiPokok / 26 / 8);
    const totalOt15 = data.ot15 * (kadarJamAsas * 1.5);
    const totalOt20 = data.ot20 * (kadarJamAsas * 2.0);
    const jumlahGajiKasar = data.gajiPokok + totalOt15 + totalOt20;

    const potonganEpf = jumlahGajiKasar * (data.epfRate / 100);
    
    let potonganSocso = 0;
    let potonganEis = 0;
    if(data.socsoAuto !== false) {
        if(jumlahGajiKasar > 0) {
            potonganSocso = (jumlahGajiKasar * 0.005) + 5.50;
            potonganEis = (jumlahGajiKasar * 0.002);
        }
    } else {
        potonganSocso = data.socsoManualVal || 0;
        potonganEis = data.eisManualVal || 0;
    }

    const totalPotongan = potonganEpf + potonganSocso + potonganEis + data.pcb;
    const bakiGajiBersih = jumlahGajiKasar - totalPotongan;

    let totalKomitmen = 0;
    let komitmenBelumBayar = 0;
    let komitmenSudahBayar = 0;

    data.komitmen.forEach(i => {
        totalKomitmen += i.amaun;
        if (i.paid) komitmenSudahBayar += i.amaun;
        else komitmenBelumBayar += i.amaun;
    });

    let quickPayHutang = {};
    if (data.bayaranHistory) {
        data.bayaranHistory.forEach(log => {
            if (log.tipe === 'catHut') { 
                if (!quickPayHutang[log.targetId]) quickPayHutang[log.targetId] = 0;
                quickPayHutang[log.targetId] += log.amaun;
            }
        });
    }

    let totalAnsuranHutang = 0;
    let totalBakiHutang = 0;
    let totalBakiAnsuran = 0; 
    let totalBakiBiasa = 0;    
    let ansuranKategori = {};
    let bakiKategoriSemua = {};
    
    if(!data.hutang) data.hutang = [];
    
    data.hutang.forEach(h => {
        let bakiHutangAkaun = Math.max(0, h.jumlahAsal - h.sudahDibayar);
        totalBakiHutang += bakiHutangAkaun;

        if(h.status === 'Aktif') {
            let katSemua = h.kategori || "Lain-lain";
            if(!bakiKategoriSemua[katSemua]) bakiKategoriSemua[katSemua] = 0;
            bakiKategoriSemua[katSemua] += bakiHutangAkaun;
        }

        if(h.status === 'Aktif' && h.isMonthlyPay !== false) {
            totalAnsuranHutang += h.ansuran;
            let kat = h.kategori || "Lain-lain";
            if(!ansuranKategori[kat]) ansuranKategori[kat] = 0;
            ansuranKategori[kat] += h.ansuran;
            totalBakiAnsuran += bakiHutangAkaun; 
        } else if(h.status === 'Aktif') {
            totalBakiBiasa += bakiHutangAkaun; 
        }
    });

    let hutangBelumBayar = 0;
    let hutangSudahBayar = 0;

    for(let kat in ansuranKategori) {
        let isPaid = data.hutangCatPaid[kat] || false;
        let amt = ansuranKategori[kat];
        let quickPaid = quickPayHutang[kat] || 0;
        
        if(isPaid) {
            hutangSudahBayar += amt;
        } else {
            let normalizedQuickPay = Math.max(0, quickPaid);
            let remaining = Math.max(0, amt - normalizedQuickPay);
            hutangBelumBayar += remaining;
            hutangSudahBayar += Math.min(amt, normalizedQuickPay);
        }
    }

    const bakiSebenarSelepasSemua = bakiGajiBersih - totalKomitmen - totalAnsuranHutang;

    document.getElementById('display-baki-sebenar').innerText = `RM ${bakiSebenarSelepasSemua.toFixed(2)}`;
    document.getElementById('display-belum-dibayar').innerText = `RM ${(komitmenBelumBayar + hutangBelumBayar).toFixed(2)}`;
    document.getElementById('display-sudah-dibayar').innerText = `RM ${(komitmenSudahBayar + hutangSudahBayar).toFixed(2)}`;
    
    document.getElementById('display-gaji-bersih').innerText = `RM ${bakiGajiBersih.toFixed(2)}`;
    document.getElementById('display-gaji-kasar').innerText = `RM ${jumlahGajiKasar.toFixed(2)}`;
    document.getElementById('display-jumlah-potongan').innerText = `Potongan: RM ${totalPotongan.toFixed(2)}`;
    document.getElementById('display-total-komitmen').innerText = `RM ${totalKomitmen.toFixed(2)}`;
    
    if(document.getElementById('display-total-komitmen-page')) {
        document.getElementById('display-total-komitmen-page').innerText = `RM ${totalKomitmen.toFixed(2)}`;
    }
    if(document.getElementById('total-komitmen-count')) {
        document.getElementById('total-komitmen-count').innerText = `${data.komitmen.length} Item`;
    }

    document.getElementById('display-total-ansuran-hutang').innerText = `RM ${totalAnsuranHutang.toFixed(2)}`;
    document.getElementById('display-total-baki-hutang').innerText = `RM ${totalBakiHutang.toFixed(2)}`;
    document.getElementById('total-hutang-count').innerText = `${data.hutang.length} Akaun`;
    
    if(document.getElementById('display-baki-ansuran')) {
        document.getElementById('display-baki-ansuran').innerText = `RM ${totalBakiAnsuran.toFixed(2)}`;
    }
    if(document.getElementById('display-baki-biasa')) {
        document.getElementById('display-baki-biasa').innerText = `RM ${totalBakiBiasa.toFixed(2)}`;
    }

    const quickPaySelect = document.getElementById('quick-pay-select');
    if(quickPaySelect) {
        let catKomitmen = {};
        data.komitmen.forEach(i => {
            let kat = i.kategori || i.icon;
            if (!catKomitmen[kat]) catKomitmen[kat] = 0;
            if (!i.paid) catKomitmen[kat] += i.amaun;
        });
        
        let catHutang = {};
        data.hutang.forEach(h => {
            if (h.status === 'Aktif') {
                let kat = h.kategori || "Lain-lain";
                if (!catHutang[kat]) catHutang[kat] = 0;
                let baki = Math.max(0, h.jumlahAsal - h.sudahDibayar);
                catHutang[kat] += baki;
            }
        });

        let optionsHtml = '<option value="" class="text-slate-900">-- Pilih Kategori Aliran --</option>';
        optionsHtml += '<optgroup label="📋 Komitmen (Kategori)" class="text-slate-900">';
        for (let kat in catKomitmen) {
            if(catKomitmen[kat] > 0) {
                optionsHtml += `<option value="catKom_${kat}" class="text-slate-900">${kat} (Total: RM ${catKomitmen[kat].toFixed(2)})</option>`;
            }
        }
        optionsHtml += '</optgroup>';
        optionsHtml += '<optgroup label="💳 Hutang (Kategori)" class="text-slate-900">';
        for (let kat in catHutang) {
            if(catHutang[kat] > 0) {
                optionsHtml += `<option value="catHut_${kat}" class="text-slate-900">${kat} [Total Baki: RM ${catHutang[kat].toFixed(2)}]</option>`;
            }
        }
        optionsHtml += '</optgroup>';
        quickPaySelect.innerHTML = optionsHtml;
        initCustomDropdown('quick-pay-select');
    }

    const sejarahContainer = document.getElementById('sejarah-log-list');
    const bulanTapisSejarah = document.getElementById('select-bulan-sejarah') ? document.getElementById('select-bulan-sejarah').value : bulanAktif;
    
    if(sejarahContainer) {
        sejarahContainer.innerHTML = "";
        let dbSejarahBulanTerpilih = masterDatabase.bulan[bulanTapisSejarah];
        let senaraiLog = (dbSejarahBulanTerpilih && dbSejarahBulanTerpilih.bayaranHistory) ? dbSejarahBulanTerpilih.bayaranHistory : [];
        
        let totalAmaunSejarah = 0;

        if(senaraiLog.length === 0) {
            sejarahContainer.innerHTML = `<p class="text-[10px] text-slate-500 text-center py-4 bg-slate-500/5 rounded-xl border border-dashed italic">Tiada transaksi log bagi bulan ini.</p>`;
        } else {
            senaraiLog.forEach(log => {
                totalAmaunSejarah += log.amaun;
                let labelTipe = log.tipe === 'catHut' ? '💳 Hutang (Baki)' : (log.tipe === 'catHutCheck' ? '💳 Hutang (Ansuran)' : (log.tipe === 'editHutang' ? '✏️ Hutang (Pembetulan)' : '📋 Komitmen'));
                sejarahContainer.innerHTML += `
                    <div class="flex justify-between items-center bg-slate-500/10 dark:bg-white/5 border border-slate-300 dark:border-transparent p-2.5 rounded-xl text-[10px] hover:bg-slate-500/20 transition-colors">
                        <div class="flex flex-col">
                            <span class="font-bold text-slate-900 dark:text-slate-100">${log.nama}</span>
                            <span class="text-[9px] opacity-60 mt-0.5"><i class="fa-solid fa-calendar-day text-[8px]"></i> ${log.tarikh} | ${labelTipe}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="font-extrabold ${log.amaun < 0 ? 'text-rose-500' : 'text-indigo-600 dark:text-indigo-400'}">RM ${log.amaun.toFixed(2)}</span>
                            <button onclick="editSejarah(${log.id})" class="text-indigo-500 bg-indigo-500/10 w-6 h-6 flex items-center justify-center rounded hover:bg-indigo-500/20"><i class="fa-solid fa-pen text-[9px]"></i></button>
                            <button onclick="padamSejarah(${log.id})" class="text-rose-500 bg-rose-500/10 w-6 h-6 flex items-center justify-center rounded hover:bg-rose-500/20"><i class="fa-solid fa-trash text-[9px]"></i></button>
                        </div>
                    </div>
                `;
            });
        }
        if(document.getElementById('display-total-sejarah')) {
            document.getElementById('display-total-sejarah').innerText = `RM ${totalAmaunSejarah.toFixed(2)}`;
        }
    }

    const checklistContainer = document.getElementById('dashboard-checklist-container');
    let itemSelesai = 0;
    let totalItemChecklist = data.komitmen.length + Object.keys(ansuranKategori).length;

    if(checklistContainer) {
        checklistContainer.innerHTML = "";
        if (totalItemChecklist === 0) {
            checklistContainer.innerHTML = `<p class="text-[11px] text-slate-500 text-center py-4 italic bg-slate-500/5 rounded-xl border border-dashed">Tiada item berdaftar.</p>`;
        }

        data.komitmen.forEach(item => {
            if(item.paid) itemSelesai++;
            checklistContainer.innerHTML += `
                <div class="flex justify-between items-center bg-slate-500/5 border border-slate-500/10 p-2.5 rounded-xl text-xs hover:border-slate-500/20 transition-all">
                    <div class="flex items-center gap-2.5">
                        <input type="checkbox" class="ios-checkbox" onchange="toggleKomitmenPaid(${item.id})" ${item.paid ? 'checked' : ''}>
                        <span class="font-bold text-slate-800 dark:text-slate-200 ${item.paid ? 'line-through opacity-40' : ''}">${item.nama}</span>
                    </div>
                    <span class="font-extrabold ${item.paid ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}">RM ${item.amaun.toFixed(2)}</span>
                </div>
            `;
        });

        for(let kat in ansuranKategori) {
            let isPaid = data.hutangCatPaid[kat] || false;
            let targetAnsuranPenuh = ansuranKategori[kat];
            let quickPaidAmount = quickPayHutang[kat] || 0;
            
            let amtToShow = Math.max(0, targetAnsuranPenuh - Math.max(0, quickPaidAmount));
            let isCompleted = isPaid || amtToShow <= 0;

            if (isCompleted) itemSelesai++;
            
            let displayAmount = isPaid ? targetAnsuranPenuh : amtToShow;
            
            checklistContainer.innerHTML += `
                <div class="flex justify-between items-center bg-amber-500/5 border border-amber-500/20 p-2.5 rounded-xl text-xs hover:border-amber-500/30 transition-all">
                    <div class="flex items-center gap-2.5">
                        <input type="checkbox" class="ios-checkbox" onchange="toggleHutangCatPaid('${kat}')" ${isPaid ? 'checked' : ''} ${(!isPaid && amtToShow <= 0) ? 'disabled' : ''}>
                        <span class="font-bold text-slate-800 dark:text-slate-200 ${isCompleted ? 'line-through opacity-40' : ''}">💳 Hutang: ${kat}</span>
                    </div>
                    <span class="font-extrabold ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-500'}">RM ${displayAmount.toFixed(2)}</span>
                </div>
            `;
        }

        document.getElementById('checklist-progresi').innerText = `${itemSelesai}/${totalItemChecklist} Setel`;
    }

    const cContainer = document.getElementById('komitmen-list-manage-container');
    if(cContainer) {
        cContainer.innerHTML = data.komitmen.length === 0 ? `<p class="text-[11px] text-slate-500 text-center py-4 bg-slate-500/5 rounded-xl border border-dashed">Tiada rekod komitmen.</p>` : "";
        data.komitmen.forEach(item => {
            cContainer.innerHTML += `
                <div class="liquid-glass rounded-xl p-2.5 flex justify-between items-center text-xs">
                    <div class="flex items-center gap-2">
                        <i class="fa-solid ${item.icon} text-indigo-500 w-4 text-center"></i>
                        <span class="font-bold">${item.nama}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="font-extrabold text-rose-600 dark:text-rose-400 cursor-pointer underline decoration-dotted underline-offset-2" onclick="bukaEditAmaunModal(${item.id})">RM ${item.amaun.toFixed(2)}</span>
                        <button onclick="mohonPadamKomitmen(${item.id}, '${item.nama}')" class="text-slate-400 hover:text-rose-500 cursor-pointer w-6 h-6 flex items-center justify-center rounded-md"><i class="fa-solid fa-trash-can text-[10px]"></i></button>
                    </div>
                </div>`;
        });
    }

    const hContainer = document.getElementById('hutang-list-container');
    const filterEl = document.getElementById('filter-hutang-kategori');
    const filterKategori = filterEl ? (filterEl.value || 'semua') : 'semua';
    const sortMode = document.getElementById('sort-hutang-mode') ? document.getElementById('sort-hutang-mode').value : 'default';
    
    if(hContainer) {
        hContainer.innerHTML = "";
        let hutangDiproses = [...data.hutang];
        
        if (sortMode === 'default') {
            hutangDiproses.sort((a, b) => {
                let tA = parseInt(a.tarikhBayar) || 99;
                let tB = parseInt(b.tarikhBayar) || 99;
                return tA - tB;
            });
        }

        if (filterKategori !== 'semua') {
            hutangDiproses = hutangDiproses.filter(h => (h.kategori || "Lain-lain") === filterKategori);
        }

        let hutangAktifSenarai = hutangDiproses.filter(h => !isHutangSelesai(h));
        let hutangSelesaiSenarai = hutangDiproses.filter(h => isHutangSelesai(h));
        
        if (hutangDiproses.length === 0) {
            hContainer.innerHTML = `<p class="text-[11px] text-slate-500 text-center py-4 bg-slate-500/5 rounded-xl border border-dashed">Tiada rekod hutang ditemui.</p>`;
        } else if (sortMode === 'kategori') {
            const kelompokHutang = {};
            hutangAktifSenarai.forEach(h => {
                let safeKat = h.kategori || "Lain-lain";
                if (!kelompokHutang[safeKat]) kelompokHutang[safeKat] = [];
                kelompokHutang[safeKat].push(h);
            });

            Object.keys(kelompokHutang).sort().forEach(kat => {
                let subTotalBakiKategori = 0;
                kelompokHutang[kat].forEach(h => {
                    subTotalBakiKategori += Math.max(0, h.jumlahAsal - h.sudahDibayar);
                });

                let kategoriBlockHtml = `
                    <div class="space-y-2 pt-1">
                        <div class="flex justify-between items-center bg-slate-500/10 dark:bg-slate-500/20 px-3 py-1.5 rounded-lg border-l-4 border-amber-500">
                            <span class="text-[10px] font-extrabold uppercase text-slate-700 dark:text-slate-200"><i class="fa-solid fa-folder-open text-amber-500 mr-1.5"></i>${kat}</span>
                            <span class="text-[10px] font-extrabold text-amber-600 dark:text-amber-400">Total Baki: RM ${subTotalBakiKategori.toFixed(2)}</span>
                        </div>
                        <div class="space-y-2">
                `;

                kelompokHutang[kat].forEach(h => {
                    kategoriBlockHtml += binaHutangCardTemplate(h);
                });

                kategoriBlockHtml += `</div></div>`;
                hContainer.innerHTML += kategoriBlockHtml;
            });

        } else {
            hutangAktifSenarai.forEach(h => {
                hContainer.innerHTML += binaHutangCardTemplate(h);
            });
        }

        if (hutangSelesaiSenarai.length > 0) {
            let selesaiBlockHtml = `
                <div class="space-y-2 pt-2 opacity-50">
                    <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg border-l-4 border-slate-400">
                        <span class="text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400"><i class="fa-solid fa-check-double mr-1.5"></i>Selesai (${hutangSelesaiSenarai.length})</span>
                    </div>
                    <div class="space-y-2">
            `;
            hutangSelesaiSenarai.forEach(h => {
                selesaiBlockHtml += binaHutangCardTemplate(h);
            });
            selesaiBlockHtml += `</div></div>`;
            hContainer.innerHTML += selesaiBlockHtml;
        }
    }

    if (typeof renderAgihanPage === 'function') renderAgihanPage();
}
