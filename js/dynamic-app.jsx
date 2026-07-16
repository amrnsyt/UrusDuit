// ============================================================
// UrusDuit — DYNAMIC LAYOUT (Konsta UI / React, no-build ESM)
// Mounted once into #konsta-dynamic-root; only visible when
// masterDatabase.layoutMode === "dynamic" (see css/styles.css).
// Reads/writes the SAME in-memory state as the classic/modern UI
// via window.getMasterDatabase() / window.getBulanAktif(), so all
// three layouts always stay in sync with one shared localStorage.
// ============================================================
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import {
    App,
    Page,
    Navbar,
    Link,
    Block,
    BlockTitle,
    Card,
    Button,
    List,
    ListItem,
    ListInput,
    Toggle,
    Tabbar,
    TabbarLink,
    ToolbarPane,
} from 'konsta/react';

function fmt(n) {
    return `RM ${(Number(n) || 0).toFixed(2)}`;
}

function hitungRingkasan(data) {
    if (!data) return null;
    const kadarJamAsas = (data.gajiPokok || 0) / 26 / 8;
    const totalOt15 = (data.ot15 || 0) * (kadarJamAsas * 1.5);
    const totalOt20 = (data.ot20 || 0) * (kadarJamAsas * 2.0);
    const jumlahGajiKasar = (data.gajiPokok || 0) + totalOt15 + totalOt20;

    const potonganEpf = jumlahGajiKasar * ((data.epfRate || 0) / 100);
    let potonganSocso = 0;
    let potonganEis = 0;
    if (data.socsoAuto !== false) {
        if (jumlahGajiKasar > 0) {
            potonganSocso = jumlahGajiKasar * 0.005 + 5.5;
            potonganEis = jumlahGajiKasar * 0.002;
        }
    } else {
        potonganSocso = data.socsoManualVal || 0;
        potonganEis = data.eisManualVal || 0;
    }
    const totalPotongan = potonganEpf + potonganSocso + potonganEis + (data.pcb || 0);
    const bakiGajiBersih = jumlahGajiKasar - totalPotongan;

    let totalKomitmen = 0, komitmenBelum = 0, komitmenSudah = 0;
    (data.komitmen || []).forEach((i) => {
        totalKomitmen += i.amaun;
        if (i.paid) komitmenSudah += i.amaun; else komitmenBelum += i.amaun;
    });

    let totalAnsuranHutang = 0, totalBakiHutang = 0;
    (data.hutang || []).forEach((h) => {
        const baki = Math.max(0, h.jumlahAsal - h.sudahDibayar);
        totalBakiHutang += baki;
        if (h.status === 'Aktif' && h.isMonthlyPay !== false) totalAnsuranHutang += h.ansuran;
    });

    const bakiSebenar = bakiGajiBersih - totalKomitmen - totalAnsuranHutang;
    return { bakiGajiBersih, jumlahGajiKasar, totalKomitmen, totalAnsuranHutang, totalBakiHutang, komitmenBelum, komitmenSudah, bakiSebenar };
}

const TAJUK_TAB = {
    dashboard: 'UrusDuit',
    gaji: 'Gaji',
    komitmen: 'Komitmen',
    agihan: 'Agihan',
    hutang: 'Hutang',
    tetapan: 'Tetapan',
};

function DynamicApp() {
    const [, setTick] = useState(0);
    const [activeTab, setActiveTab] = useState('dashboard');

    useEffect(() => {
        window.__refreshDynamicApp = () => setTick((t) => t + 1);
        return () => { delete window.__refreshDynamicApp; };
    }, []);

    const db = typeof window.getMasterDatabase === 'function' ? window.getMasterDatabase() : null;
    const bulanAktif = typeof window.getBulanAktif === 'function' ? window.getBulanAktif() : '';
    const data = db && db.bulan ? db.bulan[bulanAktif] : null;
    const ringkasan = hitungRingkasan(data);
    const layoutMode = db ? db.layoutMode : 'dynamic';
    const darkMode = db ? !!db.isDarkMode : true;

    const persistDanSegar = () => {
        if (typeof window.simpanKeLocalStorage === 'function') window.simpanKeLocalStorage();
        if (typeof window.kemaskiniSemuaPaparan === 'function') window.kemaskiniSemuaPaparan();
        setTick((t) => t + 1);
    };

    const toggleKomitmen = (id) => {
        if (typeof window.toggleKomitmenPaid === 'function') window.toggleKomitmenPaid(id);
        setTick((t) => t + 1);
    };

    const kemaskiniMedanGaji = (medan, nilai) => {
        if (!data) return;
        data[medan] = nilai === '' ? 0 : parseFloat(nilai);
        persistDanSegar();
    };

    return (
        <Page className="pb-safe-24">
            <Navbar
                title={TAJUK_TAB[activeTab]}
                subtitle={bulanAktif ? `Bulan ${bulanAktif}` : ''}
                right={
                    <Link
                        navbar
                        onClick={() => { if (typeof window.toggleDarkMode === 'function') window.toggleDarkMode(); persistDanSegar(); }}
                    >
                        <i className={`fa-solid ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
                    </Link>
                }
            />

            {activeTab === 'dashboard' && (
                <>
                    <BlockTitle>Baki Bersih Sebenar Bulan Ini</BlockTitle>
                    <Card>
                        <div className="text-3xl font-bold text-green-500 mb-1">
                            {ringkasan ? fmt(ringkasan.bakiSebenar) : 'RM 0.00'}
                        </div>
                        <p className="text-xs opacity-60 m-0">
                            (Gaji Bersih - Komitmen &amp; Ansuran Hutang Bulanan)
                        </p>
                    </Card>

                    <List strong inset>
                        <ListItem title="Belum Setel (Komitmen)" after={fmt(ringkasan && ringkasan.komitmenBelum)} />
                        <ListItem title="Sudah Setel (Komitmen)" after={fmt(ringkasan && ringkasan.komitmenSudah)} />
                        <ListItem title="Gaji Bersih" after={fmt(ringkasan && ringkasan.bakiGajiBersih)} />
                        <ListItem title="Total Komitmen" after={fmt(ringkasan && ringkasan.totalKomitmen)} />
                        <ListItem title="Total Ansuran Hutang" after={fmt(ringkasan && ringkasan.totalAnsuranHutang)} />
                    </List>

                    <BlockTitle>Semakan Komitmen Bulan Ini</BlockTitle>
                    <List strong inset>
                        {data && data.komitmen && data.komitmen.length ? (
                            data.komitmen.map((item) => (
                                <ListItem
                                    key={item.id}
                                    title={item.nama}
                                    after={fmt(item.amaun)}
                                    media={<Toggle checked={!!item.paid} onChange={() => toggleKomitmen(item.id)} />}
                                />
                            ))
                        ) : (
                            <ListItem title="Tiada komitmen direkodkan." />
                        )}
                    </List>

                    <Block strong inset className="grid grid-cols-2 gap-3">
                        <Button onClick={() => window.bukaQuickPayModal && window.bukaQuickPayModal()}>
                            <i className="fa-solid fa-bolt mr-2"></i>Bayaran Pantas
                        </Button>
                        <Button outline onClick={() => window.bukaHistoryModal && window.bukaHistoryModal()}>
                            <i className="fa-solid fa-clock-rotate-left mr-2"></i>Sejarah Log
                        </Button>
                    </Block>
                </>
            )}

            {activeTab === 'gaji' && (
                <>
                    <BlockTitle>Maklumat Gaji Bulan Ini</BlockTitle>
                    <List strong inset>
                        <ListInput label="Gaji Pokok (RM)" type="number" value={data ? data.gajiPokok : 0} onChange={(e) => kemaskiniMedanGaji('gajiPokok', e.target.value)} />
                        <ListInput label="Jam OT 1.5x" type="number" value={data ? data.ot15 : 0} onChange={(e) => kemaskiniMedanGaji('ot15', e.target.value)} />
                        <ListInput label="Jam OT 2.0x" type="number" value={data ? data.ot20 : 0} onChange={(e) => kemaskiniMedanGaji('ot20', e.target.value)} />
                        <ListInput label="Kadar EPF (%)" type="number" value={data ? data.epfRate : 0} onChange={(e) => kemaskiniMedanGaji('epfRate', e.target.value)} />
                        <ListInput label="PCB (RM)" type="number" value={data ? data.pcb : 0} onChange={(e) => kemaskiniMedanGaji('pcb', e.target.value)} />
                    </List>
                    <List strong inset>
                        <ListItem title="Gaji Kasar" after={fmt(ringkasan && ringkasan.jumlahGajiKasar)} />
                        <ListItem title="Gaji Bersih" after={fmt(ringkasan && ringkasan.bakiGajiBersih)} />
                    </List>
                </>
            )}

            {activeTab === 'komitmen' && (
                <>
                    <BlockTitle>Senarai Komitmen</BlockTitle>
                    <List strong inset>
                        {data && data.komitmen && data.komitmen.length ? (
                            data.komitmen.map((item) => (
                                <ListItem
                                    key={item.id}
                                    title={item.nama}
                                    subtitle={item.kategori || ''}
                                    after={fmt(item.amaun)}
                                    media={<Toggle checked={!!item.paid} onChange={() => toggleKomitmen(item.id)} />}
                                />
                            ))
                        ) : (
                            <ListItem title="Tiada komitmen direkodkan." />
                        )}
                    </List>
                    <Block strong inset>
                        <Button onClick={() => window.bukaKomitmenModal && window.bukaKomitmenModal()}>
                            <i className="fa-solid fa-plus mr-2"></i>Tambah Komitmen
                        </Button>
                    </Block>
                </>
            )}

            {activeTab === 'hutang' && (
                <>
                    <BlockTitle>Senarai Akaun Hutang</BlockTitle>
                    <List strong inset>
                        {data && data.hutang && data.hutang.length ? (
                            data.hutang.map((h) => {
                                const baki = Math.max(0, h.jumlahAsal - h.sudahDibayar);
                                return (
                                    <ListItem
                                        key={h.id}
                                        title={h.nama}
                                        subtitle={h.kategori || h.status}
                                        after={fmt(baki)}
                                        text={h.isMonthlyPay !== false ? `Ansuran bulanan: ${fmt(h.ansuran)}` : 'Bukan ansuran bulanan'}
                                    />
                                );
                            })
                        ) : (
                            <ListItem title="Tiada akaun hutang." />
                        )}
                    </List>
                    <List strong inset>
                        <ListItem title="Total Baki Hutang" after={fmt(ringkasan && ringkasan.totalBakiHutang)} />
                        <ListItem title="Total Ansuran Bulanan" after={fmt(ringkasan && ringkasan.totalAnsuranHutang)} />
                    </List>
                    <Block strong inset>
                        <Button onClick={() => window.bukaBorangHutangModal && window.bukaBorangHutangModal()}>
                            <i className="fa-solid fa-plus mr-2"></i>Tambah Akaun Hutang
                        </Button>
                    </Block>
                </>
            )}

            {activeTab === 'agihan' && (
                <>
                    <BlockTitle>Agihan Resit (OCR)</BlockTitle>
                    <Card>
                        <p className="text-sm mb-3">
                            Imbas resit untuk mengagihkan perbelanjaan ke komitmen berkaitan secara automatik menggunakan AI.
                        </p>
                        <Button onClick={() => window.bukaPilihAgihanModal && window.bukaPilihAgihanModal()}>
                            <i className="fa-solid fa-camera mr-2"></i>Imbas Resit
                        </Button>
                    </Card>
                </>
            )}

            {activeTab === 'tetapan' && (
                <>
                    <BlockTitle>Reka Bentuk Antara Muka</BlockTitle>
                    <List strong inset>
                        <ListItem
                            link
                            title="Klasik"
                            after={layoutMode === 'classic' ? <i className="fa-solid fa-check text-green-500"></i> : null}
                            onClick={() => window.tukarLayoutMode && window.tukarLayoutMode('classic')}
                        />
                        <ListItem
                            link
                            title="Moden"
                            after={layoutMode === 'modern' ? <i className="fa-solid fa-check text-green-500"></i> : null}
                            onClick={() => window.tukarLayoutMode && window.tukarLayoutMode('modern')}
                        />
                        <ListItem
                            link
                            title="Dynamic (Konsta)"
                            after={layoutMode === 'dynamic' ? <i className="fa-solid fa-check text-green-500"></i> : null}
                            onClick={() => window.tukarLayoutMode && window.tukarLayoutMode('dynamic')}
                        />
                    </List>

                    <BlockTitle>Paparan</BlockTitle>
                    <List strong inset>
                        <ListItem
                            title="Mod Gelap"
                            after={<Toggle checked={darkMode} onChange={() => { if (typeof window.toggleDarkMode === 'function') window.toggleDarkMode(); persistDanSegar(); }} />}
                        />
                    </List>
                </>
            )}

            <Tabbar labels icons className="left-0 bottom-0 fixed">
                <ToolbarPane>
                    <TabbarLink active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<i className="fa-solid fa-chart-pie text-lg"></i>} label="Utama" />
                    <TabbarLink active={activeTab === 'gaji'} onClick={() => setActiveTab('gaji')} icon={<i className="fa-solid fa-money-check-dollar text-lg"></i>} label="Gaji" />
                    <TabbarLink active={activeTab === 'komitmen'} onClick={() => setActiveTab('komitmen')} icon={<i className="fa-solid fa-receipt text-lg"></i>} label="Komitmen" />
                    <TabbarLink active={activeTab === 'agihan'} onClick={() => setActiveTab('agihan')} icon={<i className="fa-solid fa-camera text-lg"></i>} label="Agihan" />
                    <TabbarLink active={activeTab === 'hutang'} onClick={() => setActiveTab('hutang')} icon={<i className="fa-solid fa-hand-holding-dollar text-lg"></i>} label="Hutang" />
                    <TabbarLink active={activeTab === 'tetapan'} onClick={() => setActiveTab('tetapan')} icon={<i className="fa-solid fa-sliders text-lg"></i>} label="Tetapan" />
                </ToolbarPane>
            </Tabbar>
        </Page>
    );
}

function mount() {
    const el = document.getElementById('konsta-dynamic-root');
    if (!el) return;
    const root = createRoot(el);
    root.render(
        <App theme="ios" safeAreas={true}>
            <DynamicApp />
        </App>
    );
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
} else {
    mount();
}
