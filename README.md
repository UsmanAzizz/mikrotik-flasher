# MikroTik Flasher (NeoInstall) ??

![NeoInstall Engine](https://img.shields.io/badge/Status-Weaponized-red.svg) ![Tauri](https://img.shields.io/badge/Tauri-v2-blue.svg) ![React](https://img.shields.io/badge/React-Vite-cyan.svg) ![Rust](https://img.shields.io/badge/Rust-Backend-orange.svg)

**MikroTik Flasher** (formerly *NeoInstall*) is a hyper-optimized, cross-platform GUI tool designed to flash RouterOS effortlessly and **eradicate factory-default "sticker" passwords**.

By bypassing the notoriously buggy Windows Netinstall implementation, this tool leverages a headless **VirtualBox Alpine Linux VM** as the backend engine. This ensures 100% reliable TFTP/BOOTP packet delivery, spoofing the DHCP server IP to overcome stubborn bootloaders.

---

## ?? Why This Exists?
Standard Netinstall on Windows is notoriously difficult to use:
- **UDP Packet Drops:** Windows Firewall, Hyper-V, and WSL2 often swallow BOOTP/TFTP broadcasts.
- **Silent Failures:** The process frequently hangs at "Waiting for RouterBOARD..." with zero debug logs.
- **Hardcoded Bootloaders:** Older MikroTik bootROMs strictly expect the TFTP server at `192.168.88.1`, which is hard to orchestrate cleanly on a noisy Windows host.

**The Solution:**
This application spins up a lightweight, headless Alpine Linux VM in VirtualBox, bridges it directly to your physical Ethernet port, forcefully assigns it `192.168.88.1`, and runs the Linux `netinstall-cli` natively over an SSH tunnel. **It never fails.**

---

## ? Features
- **Visual PXE Guide:** Interactive UI guiding you through the physical "Death Dance" (Reset sequence).
- **Zero-Configuration Network:** Automatically disables interfering VirtualBox Host-Only adapters and takes over your Windows Ethernet adapter to avoid IP conflicts.
- **Auto-Firmware Detection:** Automatically selects the correct `.npk` architecture for your router.
- **Sticker Password Eradication:** Automatically injects a `payload.rsc` script to wipe out the factory-locked branding and sticker passwords.

---

## ??? Prerequisites
Before running this project, ensure you have the following installed on your system:
1. [Node.js](https://nodejs.org/)
2. [Rust / Cargo](https://rustup.rs/)
3. [Oracle VirtualBox 7.0+](https://www.virtualbox.org/)

---

## ?? Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/UsmanAzizz/mikrotik-flasher.git
cd mikrotik-flasher/neo-ui
npm install
```

### 2. Prepare the Linux Engine (One-Time Setup)
This script downloads the Alpine Linux image, imports it to VirtualBox, configures the bridged adapters, and sets up SSH port-forwarding.
```bash
node scripts/vbox_setup.cjs
```

### 3. Launch the Application
```bash
npm run tauri dev
```

---

## ?? How to Use (The "Death Dance")

Because the MikroTik bootloader physically restricts PXE booting to **PORT 1 (WAN)**, zero-touch API automation is impossible for the flashing stage. Follow these steps carefully:

1. **Plug In:** Connect your PC's Ethernet cable directly to **PORT 1** of the MikroTik router.
2. **Execute:** Open the app, ensure the firmware is selected, and click **EXECUTE NETINSTALL**.
3. **The Physical Reset:**
   - Unplug the power from the router.
   - Using a pen, **press and hold** the physical `RESET` button.
   - Plug the power back in while **CONTINUING TO HOLD** the reset button.
   - Hold it for exactly **15 seconds** until the UI flashes green and the log says: `[INFO] ROUTER TERDETEKSI!`.
4. **Victory:** The Alpine VM will catch the BOOTP broadcast, send the `.npk` file via TFTP, inject the password-killer payload, and reboot your router.

When it reboots, log in via Winbox on Port 2 with username `admin` and a **blank password**. The sticker password is gone forever.

---

## ??? License
This project is built for network administrators and engineers to recover and standardize their own hardware. Use responsibly.
