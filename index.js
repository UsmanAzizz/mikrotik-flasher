const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log("\n=========================================");
console.log("[+] NeoInstall MVP (Smart Edition)");
console.log("=========================================\n");

// 1. Cari file Netinstall (.exe)
const files = fs.readdirSync(__dirname);
const netinstallFile = files.find(f => f.toLowerCase().includes('netinstall') && f.endsWith('.exe'));

if (!netinstallFile) {
    console.error("[-] ERROR: File netinstall.exe atau netinstall64.exe tidak ditemukan di folder ini!");
    process.exit(1);
}

// 2. Tentukan target firmware dari argumen terminal (misal: node index.js mipsbe)
const targetArch = process.argv[2];
let npkFile = null;

const availableNpks = files.filter(f => f.endsWith('.npk'));

if (!targetArch) {
    console.error("[-] ERROR: Anda belum memilih arsitektur firmware.");
    console.log("[i] Cara penggunaan: node index.js <arsitektur>");
    console.log("[i] Contoh: node index.js mipsbe");
    console.log("\n[i] Firmware yang tersedia di folder ini:");
    availableNpks.forEach(f => console.log(`    - ${f}`));
    process.exit(1);
}

// Cari NPK yang cocok dengan argumen
npkFile = availableNpks.find(f => f.toLowerCase().includes(targetArch.toLowerCase()));

if (!npkFile) {
    console.error(`[-] ERROR: Tidak ada file .npk yang cocok dengan kata kunci '${targetArch}'`);
    process.exit(1);
}

const netinstallExe = path.join(__dirname, netinstallFile);
const npkPath = path.join(__dirname, npkFile);

console.log(`[+] Netinstall Engine : ${netinstallFile}`);
console.log(`[+] Target Firmware   : ${npkFile}\n`);

// 3. Buat Script Injeksi untuk Memusnahkan Password Bawaan
const scriptContent = `
# NeoInstall Payload
/delay 5;
/user set admin password="";
/system script add name="kill-password" source="/user set admin password=\\"\\""
`;
const scriptPath = path.join(__dirname, 'payload.rsc');
fs.writeFileSync(scriptPath, scriptContent);
console.log("[+] Payload pemusnah password berhasil disiapkan.");

// 4. Set IP Komputer ke Static (Butuh akses Administrator)
const adapterName = "Ethernet"; // Sesuaikan jika pakai Wi-Fi atau adapter lain
const routerIp = "192.168.88.1";
const pcIp = "192.168.88.2";

try {
    console.log(`[+] Mengatur IP ${adapterName} ke ${pcIp}...`);
    // execSync(`netsh interface ip set address name="${adapterName}" static ${pcIp} 255.255.255.0 ${routerIp}`);
    console.log("[+] Konfigurasi IP siap.");
} catch (err) {
    console.error("[-] Gagal mengatur IP. Pastikan Run as Administrator.");
}

// 5. Eksekusi Netinstall
console.log("\n[!] MENUNGGU ROUTER... (Silakan colok router sambil tahan tombol Reset/Netinstall)\n");
const netinstallArgs = ['-r', '-a', routerIp, '-s', scriptPath, npkPath];
const proc = spawn(netinstallExe, netinstallArgs, { stdio: 'inherit' });

proc.on('close', (code) => {
    console.log(`\n[+] Proses eksekusi selesai (Kode: ${code})`);
    cleanup();
});

function cleanup() {
    console.log("[+] Mengembalikan IP ke mode DHCP...");
    try {
        // execSync(`netsh interface ip set address name="${adapterName}" dhcp`);
        console.log("[+] Selesai. Komputer kembali normal.");
    } catch (e) {
        console.error("[-] Gagal mereset IP ke DHCP.");
    }
}
