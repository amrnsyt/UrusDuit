function bukaGajiModal() {
    document.getElementById('gaji-form-modal').classList.remove('hidden');
    document.getElementById('gaji-form-modal').classList.add('flex');
    document.body.classList.add('overflow-hidden');
}
function tutupGajiModal() {
    document.getElementById('gaji-form-modal').classList.add('hidden');
    document.getElementById('gaji-form-modal').classList.remove('flex');
    document.body.classList.remove('overflow-hidden');
}

function setSocsoMode(isAuto) {
    masterDatabase.bulan[bulanAktif].socsoAuto = isAuto;
    const btnAuto = document.getElementById('btn-socso-auto');
    const btnManual = document.getElementById('btn-socso-manual');
    const wrapper = document.getElementById('wrapper-socso-manual');

    if(isAuto) {
        btnAuto.className = "text-[10px] px-2.5 py-1 rounded-md font-bold cursor-pointer transition-all bg-indigo-600 text-white shadow-sm";
        btnManual.className = "text-[10px] px-2.5 py-1 rounded-md font-bold cursor-pointer transition-all text-slate-500 dark:text-slate-400";
        wrapper.classList.add('hidden');
    } else {
        btnManual.className = "text-[10px] px-2.5 py-1 rounded-md font-bold cursor-pointer transition-all bg-indigo-600 text-white shadow-sm";
        btnAuto.className = "text-[10px] px-2.5 py-1 rounded-md font-bold cursor-pointer transition-all text-slate-500 dark:text-slate-400";
        wrapper.classList.remove('hidden');
    }
}

function kiraGaji() {
    const data = masterDatabase.bulan[bulanAktif];
    data.gajiPokok = parseFloat(document.getElementById('input-gaji-pokok').value) || 0;
    data.ot15 = parseFloat(document.getElementById('input-ot-15').value) || 0;
    data.ot20 = parseFloat(document.getElementById('input-ot-20').value) || 0;
    data.epfRate = parseFloat(document.getElementById('input-epf-rate').value) || 0;
    data.pcb = parseFloat(document.getElementById('input-pcb').value) || 0;
    
    if(!data.socsoAuto) {
        data.socsoManualVal = parseFloat(document.getElementById('input-socso-manual-val').value) || 0;
        data.eisManualVal = parseFloat(document.getElementById('input-eis-manual-val').value) || 0;
    }

    simpanKeLocalStorage();
    kemaskiniSemuaPaparan();
    tutupGajiModal();
    paparToast("Gaji Disimpan", "Maklumat pendapatan baharu telah direkodkan.", "sukses");
}
