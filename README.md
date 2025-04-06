# 📁 Peer-to-Peer File Sharing App

A web-based peer-to-peer (P2P) file sharing app built using **React**, **PeerJS**, and **Express**. Transfer files directly between devices on the same network or over the internet without uploading to any server.

![Demo Screenshot](screenshot.png) <!-- Optional: Add a screenshot -->

---

## ✨ Features

- 🔒 Direct Peer-to-Peer file transfer (no third-party storage)
- 📂 Supports large file transfers (tested up to 10GB)
- 📶 Real-time connection status
- 📱 Works between different devices (e.g. phone ↔ laptop)
- 🌐 Easy deployment with environment-based host config
- ⚡ Built with Vite for lightning-fast performance

---

## 🛠️ Tech Stack

- **Frontend:** React + Vite + PeerJS
- **Backend:** Express + PeerJS WebSocket Server
- **Deployment:** Serve built frontend through Express
- **Config:** Runtime environment variables via `/config.js`

---

## 🚀 Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/your-username/peer-file-transfer.git
cd peer-file-transfer
