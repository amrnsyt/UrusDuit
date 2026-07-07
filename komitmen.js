function bukaKomitmenModal() {
    document.getElementById('komitmen-form-modal').classList.remove('hidden');
    document.getElementById('komitmen-form-modal').classList.add('flex');
    document.body.classList.add('overflow-hidden');
}
function tutupKomitmenModal() {
    document.getElementById('komitmen-form-modal').classList.add('hidden');
    document.getElementById('komitmen-form-modal').classList.remove('flex');
    document.body.classList.remove('overflow-hidden');
}

function tambahKategoriCustom() {
    const inputVal = document.getElementById('custom-kategori-nama').value.trim();
    if(!inputVal) return;
    if(!masterDatabase.customKategori) masterDatabase.customKategori = [];
    masterDatabase.customKategori.push(inputVal);
    simpanKeLocalStorage();
    segarkanDropdownKategori();
    document.getElementById('custom-kategori-nama').value = "";
    paparToast("Kategori Dibuat", `Kategori "${inputVal}" sedia dipilih.`, 'sukses');
}

function segarkanDropdownKategori() {
    const select = document.getElementById('input-icon-komitmen');
    if(!select) return;
    select.innerHTML = `
        <option value="fa-house" class="text-slate-900">🏠 Rumah</option>
        <option value="fa-car" class="text-slate-900">🚗 Kenderaan</option>
        <option value="fa-credit-card" class="text-slate-900">?? Kad Kredit</option>
        <option value="fa-bolt" class="text-slate-900">⚡ Bil / Utiliti</option>
        <option value="fa-heart" class="text-slate-900">❤️ Takaful</option>
    `;
    if(masterDatabase.customKategori) {
        masterDatabase.customKategori.forEach(kat => {
            select.innerHTML += `<option value="fa-folder" class="text-slate-900">📁 ${kat}</option>`;
        });
    }
    initCustomDropdown('input-icon-komitmen');
}

function tambahKomitmen() {
    const nama = document.getElementById('input-nama-komitmen').value.trim();
    const amaun = parseFloat(document.getElementById('input-amaun-komitmen').value) || 0;
    const selectEl = document.getElementById('input-icon-komitmen');
    const icon = selectEl.value;
    const textKategori = selectEl.options[selectEl.selectedIndex].text;

    if(!nama || amaun <= 0) return paparToast("Borang Tidak Lengkap", "Sila masukkan nama dan amaun komitmen.", "amaran");

    masterDatabase.bulan[bulanAktif].komitmen.push({ id: Date.now(), nama: `${textKategori.split(' ')[0]} ${nama}`, amaun: amaun, icon: icon, kategori: textKategori, paid: false });
    simpanKeLocalStorage();
    kemaskiniSemuaPaparan();
    tutupKomitmenModal();
    paparToast("Komitmen Ditambah", `Item "${nama}" berjaya didaftarkan.`, "sukses");
    document.getElementById('input-nama-komitmen').value = "";
    document.getElementById('input-amaun-komitmen').value = "";
}

function padamKomitmen(id) {
    masterDatabase.bulan[bulanAktif].komitmen = masterDatabase.bulan[bulanAktif].komitmen.filter(i => i.id !== id);
    simpanKeLocalStorage();
    kemaskiniSemuaPaparan();
    paparToast("Item Dipadam", "Komitmen telah dikeluarkan daripada senarai.", "padam");
}

function mohonPadamKomitmen(id, namaItem) {
    bukaModal("Padam Komitmen?", `Keluarkan "${namaItem}" dari memori bulan ini?`, "fa-trash-can", "bg-rose-500/20", "text-rose-500", "bg-rose-600 hover:bg-rose-700", "fa-trash", "Padam", () => { padamKomitmen(id); });
}

function editAmaunKomitmen(id) { bukaEditAmaunModal(id); }

function bukaEditAmaunModal(id) {
    const item = masterDatabase.bulan[bulanAktif].komitmen.find(k => k.id === id);
    if(!item) return;
    idKomitmenSedangDiedit = id;
    document.getElementById('edit-amaun-komitmen-nama').innerText = item.nama;
    document.getElementById('edit-amaun-komitmen-icon').className = `fa-solid ${item.icon || 'fa-pen-to-square'}`;
    const inputEl = document.getElementById('input-edit-amaun-komitmen');
    inputEl.value = item.amaun.toFixed(2);
    const modal = document.getElementById('edit-amaun-komitmen-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => { inputEl.focus(); inputEl.select(); }, 150);
}

function tutupEditAmaunModal() {
    document.getElementById('edit-amaun-komitmen-modal').classList.add('hidden');
    document.getElementById('edit-amaun-komitmen-modal').classList.remove('flex');
    idKomitmenSedangDiedit = null;
}

function labKomitmenAmaun(delta) {
    const inputEl = document.getElementById('input-edit-amaun-komitmen');
    const semasa = parseFloat(inputEl.value) || 0;
    inputEl.value = Math.max(0, semasa + delta).toFixed(2);
}

function simpanEditAmaunKomitmen() {
    if(idKomitmenSedangDiedit === null) return;
    const item = masterDatabase.bulan[bulanAktif].komitmen.find(k => k.id === idKomitmenSedangDiedit);
    if(!item) return;
    const amaunBaru = parseFloat(document.getElementById('input-edit-amaun-komitmen').value);
    if(isNaN(amaunBaru) || amaunBaru < 0) return paparToast("Ralat Amaun", "Sila masukkan amaun yang sah.", "amaran");
    item.amaun = amaunBaru;
    simpanKeLocalStorage();
    kemaskiniSemuaPaparan();
    tutupEditAmaunModal();
    paparToast("Berjaya Dikemaskini", `Amaun "${item.nama}" telah dikemaskini kepada RM ${amaunBaru.toFixed(2)}.`, "sukses");
}
