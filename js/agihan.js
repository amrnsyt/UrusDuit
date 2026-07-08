// ============================================================
// UrusDuit — AGIHAN (Allocate) — Derived from Komitmen, Receipt Scan (Gemini), Sub-Resit Extraction
// ============================================================

let idKomitmenAgihanAktif = null;
let resitFailBase64Semasa = null;
let resitFailMimeSemasa = null;

function pastikanAlokasiWujud() {
    const data = masterDatabase.bulan[bulanAktif];
    if (!data.alokasi) data.alokasi = { enabled: [], resit: {} };
    if (!data.alokasi.enabled) data.alokasi.enabled = [];
    if (!data.alokasi.resit) data.alokasi.resit = {};
    return data.alokasi;
}

function hitungTotalResit(komitmenId) {
    const alokasi = pastikanAlokasiWujud();
    const senarai = alokasi.resit[komitmenId] || [];
    return senarai.reduce((sum, r) => sum + (parseFloat(r.jumlah) || 0), 0);
}

// --- PILIH KOMITMEN UNTUK AGIHAN ---
function bukaPilihAgihanModal() {
    renderPilihAgihanList();
    document.getElementById('pilih-agihan-modal').classList.remove('hidden');
    document.getElementById('pilih-agihan-modal').classList.add('flex');
    document.body.classList.add('overflow-hidden');
}
function tutupPilihAgihanModal() {
    document.getElementById('pilih-agihan-modal').classList.add('hidden');
    document.getElementById('pilih-agihan-modal').classList.remove('flex');
    document.body.classList.remove('overflow-hidden');
}

function renderPilihAgihanList() {
    const listEl = document.getElementById('pilih-agihan-list');
    if (!listEl) return;
    const data = masterDatabase.bulan[bulanAktif];
    const alokasi = pastikanAlokasiWujud();

    if (!data.komitmen || data.komitmen.length === 0) {
        listEl.innerHTML = `<p class="text-[11px] text-slate-500 text-center py-4 italic bg-slate-500/5 rounded-xl border border-dashed">Tiada komitmen didaftarkan di halaman Komitmen lagi.</p>`;
        return;
    }

    listEl.innerHTML = data.komitmen.map(item => `
        <label class="flex items-center justify-between gap-2 bg-slate-500/5 border border-slate-500/10 p-2.5 rounded-xl cursor-pointer">
            <span class="flex items-center gap-2 text-xs font-bold">
                <input type="checkbox" class="ios-checkbox agihan-pilih-checkbox" data-id="${item.id}" ${alokasi.enabled.includes(item.id) ? 'checked' : ''}>
                ${item.nama}
            </span>
            <span class="text-[10px] font-bold opacity-70">RM ${item.amaun.toFixed(2)}</span>
        </label>
    `).join('');
}

function simpanPilihanAgihan() {
    const alokasi = pastikanAlokasiWujud();
    const dipilih = Array.from(document.querySelectorAll('.agihan-pilih-checkbox'))
        .filter(cb => cb.checked)
        .map(cb => parseInt(cb.dataset.id));

    alokasi.enabled = dipilih;
    simpanKeLocalStorage();
    tutupPilihAgihanModal();
    renderAgihanPage();
    paparToast("Pilihan Disimpan", "Senarai komitmen untuk agihan telah dikemaskini.", "sukses");
}

// --- GEMINI API KEY (POPUP) ---
function bukaGeminiKeyModal() {
    const keyInput = document.getElementById('input-gemini-api-key');
    if (keyInput) keyInput.value = masterDatabase.geminiApiKey || "";

    const modal = document.getElementById('gemini-key-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.classList.add('overflow-hidden');
}

function tutupGeminiKeyModal() {
    const modal = document.getElementById('gemini-key-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.classList.remove('overflow-hidden');
}

function simpanGeminiApiKey() {
    const key = document.getElementById('input-gemini-api-key').value.trim();
    masterDatabase.geminiApiKey = key;
    simpanKeLocalStorage();
    tutupGeminiKeyModal();
    paparToast("API Key Disimpan", "Gemini API Key telah disimpan pada peranti ini.", "sukses");
}

// --- RENDER HALAMAN AGIHAN ---
function renderAgihanPage() {
    const container = document.getElementById('agihan-list-container');
    if (!container) return;

    const data = masterDatabase.bulan[bulanAktif];
    const alokasi = pastikanAlokasiWujud();

    const komitmenDipilih = data.komitmen.filter(k => alokasi.enabled.includes(k.id));

    let totalBakiKeseluruhan = 0;
    komitmenDipilih.forEach(item => {
        const totalResit = hitungTotalResit(item.id);
        totalBakiKeseluruhan += Math.max(0, item.amaun - totalResit);
    });

    if (document.getElementById('display-total-baki-agihan')) {
        document.getElementById('display-total-baki-agihan').innerText = `RM ${totalBakiKeseluruhan.toFixed(2)}`;
    }
    if (document.getElementById('total-agihan-count')) {
        document.getElementById('total-agihan-count').innerText = `${komitmenDipilih.length} Komitmen Dipilih`;
    }

    if (komitmenDipilih.length === 0) {
        container.innerHTML = `<p class="text-[11px] text-slate-500 text-center py-4 italic bg-slate-500/5 rounded-xl border border-dashed">Tiada komitmen dipilih untuk agihan. Ketik "Pilih Komitmen Untuk Agihan" di atas.</p>`;
        return;
    }

    container.innerHTML = komitmenDipilih.map(item => {
        const senaraiResit = alokasi.resit[item.id] || [];
        const totalResit = hitungTotalResit(item.id);
        const baki = Math.max(0, item.amaun - totalResit);
        const progress = item.amaun > 0 ? Math.min(100, (totalResit / item.amaun) * 100) : 0;

        let resitHtml = "";
        if (senaraiResit.length === 0) {
            resitHtml = `<p class="text-[10px] text-slate-500 text-center py-2">Tiada resit direkodkan lagi.</p>`;
        } else {
            resitHtml = senaraiResit.map(r => `
                <div class="flex justify-between items-center bg-slate-500/5 border border-slate-500/10 px-2.5 py-1.5 rounded-lg text-[10px]">
                    <div>
                        <span class="font-bold block">${r.kedai}</span>
                        <span class="opacity-60">${r.tarikh}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="font-bold text-rose-600 dark:text-rose-400">- RM ${parseFloat(r.jumlah).toFixed(2)}</span>
                        <button onclick="mohonPadamResit(${item.id}, ${r.id})" class="text-rose-500 w-5 h-5 flex items-center justify-center cursor-pointer"><i class="fa-solid fa-xmark text-[10px]"></i></button>
                    </div>
                </div>
            `).join('');
        }

        return `
            <div class="liquid-glass rounded-xl p-3.5 space-y-3 text-[11px]">
                <div class="flex justify-between items-center">
                    <div>
                        <h4 class="font-bold text-slate-800 dark:text-slate-200 text-xs">${item.nama}</h4>
                        <p class="text-[10px] opacity-70 mt-0.5">Komitmen Asal: RM ${item.amaun.toFixed(2)}</p>
                    </div>
                    <button onclick="bukaScanResitModal(${item.id})" class="bg-emerald-600 hover:bg-emerald-700 text-white w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer shadow" title="Imbas Resit">
                        <i class="fa-solid fa-camera text-xs"></i>
                    </button>
                </div>

                <div class="pt-1">
                    <div class="flex justify-between text-[9px] mb-1.5 font-bold text-slate-700 dark:text-slate-300">
                        <span>Diagihkan: RM ${totalResit.toFixed(2)}</span>
                        <span>Baki: RM ${baki.toFixed(2)}</span>
                    </div>
                    <div class="w-full bg-slate-500/10 h-2 rounded-full overflow-hidden">
                        <div class="bg-emerald-500 h-full rounded-full transition-all duration-500 ease-out" style="width: ${progress}%"></div>
                    </div>
                </div>

                <div class="pt-2 border-t border-slate-500/10 space-y-1.5">
                    ${resitHtml}
                </div>
            </div>
        `;
    }).join('');
}

// --- SCAN RESIT (GEMINI) ---
function bukaScanResitModal(komitmenId) {
    idKomitmenAgihanAktif = komitmenId;
    resitFailBase64Semasa = null;
    resitFailMimeSemasa = null;

    const data = masterDatabase.bulan[bulanAktif];
    const item = data.komitmen.find(k => k.id === komitmenId);

    document.getElementById('title-scan-resit').innerHTML = `<i class="fa-solid fa-receipt"></i> Imbas Resit: ${item ? item.nama : ''}`;
    document.getElementById('input-file-resit-kamera').value = "";
    document.getElementById('input-file-resit-upload').value = "";
    document.getElementById('input-resit-kedai').value = "";
    document.getElementById('input-resit-jumlah').value = "";
    document.getElementById('label-scan-resit').innerText = "Belum ada gambar resit dipilih.";
    document.getElementById('preview-resit-wrapper').classList.add('hidden');
    document.getElementById('scan-resit-status').classList.add('hidden');

    const modal = document.getElementById('scan-resit-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.classList.add('overflow-hidden');
}

function tutupScanResitModal() {
    document.getElementById('scan-resit-modal').classList.add('hidden');
    document.getElementById('scan-resit-modal').classList.remove('flex');
    document.body.classList.remove('overflow-hidden');
    idKomitmenAgihanAktif = null;
    resitFailBase64Semasa = null;
    resitFailMimeSemasa = null;
}

function onFailResitDipilih(event) {
    const fail = event.target.files[0];
    if (!fail) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const hasil = e.target.result;
        resitFailBase64Semasa = hasil.split(',')[1];
        resitFailMimeSemasa = fail.type || 'image/jpeg';

        const previewImg = document.getElementById('preview-resit-img');
        previewImg.src = hasil;
        document.getElementById('preview-resit-wrapper').classList.remove('hidden');
        document.getElementById('label-scan-resit').innerText = fail.name || "Gambar resit dipilih.";

        imbasResitDenganGemini();
    };
    reader.readAsDataURL(fail);
}

async function imbasResitDenganGemini() {
    const apiKey = (masterDatabase.geminiApiKey || "").trim();
    if (!apiKey) {
        paparToast("Tiada API Key", "Sila tetapkan Gemini API Key di Tetapan dahulu. Anda masih boleh isi manual.", "amaran");
        return;
    }
    if (!resitFailBase64Semasa) return;

    const statusEl = document.getElementById('scan-resit-status');
    statusEl.classList.remove('hidden');

    // Cuba beberapa model secara berturutan sekiranya satu tidak tersedia untuk API key/akaun ini.
    const senaraiModel = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest'];
    const prompt = 'Anda ialah enjin OCR resit. Lihat gambar resit pembelian ini dengan teliti. Ekstrak DUA maklumat sahaja: (1) nama kedai/pasaraya, (2) jumlah TOTAL/JUMLAH BESAR akhir yang perlu dibayar (selepas rounding/pembundaran jika ada, biasanya baris terakhir berlabel "TOTAL", "JUMLAH", "GRAND TOTAL" atau "AMOUNT DUE"). Balas HANYA dalam format JSON tepat seperti ini, tanpa markdown dan tanpa teks lain: {"kedai": "Nama Kedai", "jumlah": 0.00}';

    let ralatTerakhir = null;

    for (const model of senaraiModel) {
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: prompt },
                            { inline_data: { mime_type: resitFailMimeSemasa, data: resitFailBase64Semasa } }
                        ]
                    }],
                    generationConfig: { response_mime_type: "application/json", temperature: 0 }
                })
            });

            const hasilJson = await response.json();

            if (!response.ok) {
                const mesejRalat = (hasilJson && hasilJson.error && hasilJson.error.message) ? hasilJson.error.message : `Ralat HTTP ${response.status}`;
                ralatTerakhir = mesejRalat;
                continue; // cuba model seterusnya
            }

            const kandungan = hasilJson.candidates && hasilJson.candidates[0] && hasilJson.candidates[0].content;
            const teks = kandungan && kandungan.parts && kandungan.parts[0] && kandungan.parts[0].text;

            if (!teks) {
                const sebab = (hasilJson.candidates && hasilJson.candidates[0] && hasilJson.candidates[0].finishReason) || "Tiada respons teks";
                ralatTerakhir = `Model tidak memulangkan data (${sebab})`;
                continue;
            }

            const teksBersih = teks.replace(/```json|```/g, '').trim();
            const dataResit = JSON.parse(teksBersih);

            document.getElementById('input-resit-kedai').value = dataResit.kedai || "";
            document.getElementById('input-resit-jumlah').value = dataResit.jumlah ? parseFloat(dataResit.jumlah).toFixed(2) : "";

            paparToast("Imbasan Berjaya", "Sila semak maklumat sebelum simpan.", "sukses");
            statusEl.classList.add('hidden');
            return;

        } catch (err) {
            ralatTerakhir = err.message || String(err);
        }
    }

    console.error('Ralat imbasan Gemini:', ralatTerakhir);
    paparToast("Imbasan Gagal", `${ralatTerakhir || "Tidak dapat menghubungi Gemini API"}. Sila isi manual.`, "amaran");
    statusEl.classList.add('hidden');
}

function simpanResit() {
    if (idKomitmenAgihanAktif === null) return;

    const kedai = document.getElementById('input-resit-kedai').value.trim();
    const jumlah = parseFloat(document.getElementById('input-resit-jumlah').value) || 0;

    if (!kedai || jumlah <= 0) {
        return paparToast("Maklumat Tidak Cukup", "Sila masukkan Nama Kedai dan Jumlah yang sah.", "amaran");
    }

    const alokasi = pastikanAlokasiWujud();
    if (!alokasi.resit[idKomitmenAgihanAktif]) alokasi.resit[idKomitmenAgihanAktif] = [];

    const tarikh = new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' });
    alokasi.resit[idKomitmenAgihanAktif].push({ id: Date.now(), kedai, jumlah, tarikh });

    simpanKeLocalStorage();
    tutupScanResitModal();
    renderAgihanPage();
    paparToast("Resit Ditambah", `RM ${jumlah.toFixed(2)} telah ditolak daripada baki agihan.`, "sukses");
}

function mohonPadamResit(komitmenId, resitId) {
    bukaModal("Padam Resit?", "Rekod resit ini akan dikeluarkan dan baki agihan akan dikembalikan.", "fa-trash-can", "bg-rose-500/20", "text-rose-500", "bg-rose-600 hover:bg-rose-700", "fa-trash", "Padam", () => { padamResit(komitmenId, resitId); });
}

function padamResit(komitmenId, resitId) {
    const alokasi = pastikanAlokasiWujud();
    if (!alokasi.resit[komitmenId]) return;
    alokasi.resit[komitmenId] = alokasi.resit[komitmenId].filter(r => r.id !== resitId);
    simpanKeLocalStorage();
    renderAgihanPage();
    paparToast("Resit Dipadam", "Rekod resit telah dikeluarkan.", "padam");
}
