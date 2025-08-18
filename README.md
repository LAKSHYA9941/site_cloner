# Site-cloner

A zero-config CLI that downloads a complete website (HTML, CSS, JS, images, fonts, etc.) and rewrites every link so the copy **works 100 % offline** in one click.

---

## 🚀 Quick Start

```bash
# 1️⃣  Install once (global)
npm install -g site-cloner

# 2️⃣  Clone any site
site-cloner https://example.com --output my-copy

# 3️⃣  Browse offline
open my-copy/index.html
```

---

## 📦 Installation Options

| Method | Command |
|--------|---------|
| Global CLI | `npm install -g site-cloner` |
| Local one-off | `npx site-cloner https://example.com` |
| Manual | clone repo → `chmod +x site-cloner.js` |

> Requires **Node ≥ 14**.

---

## 🎯 Usage

```bash
site-cloner <url> [options]
```

| Option | Default | Description |
|--------|---------|-------------|
| `--output, -o` | `cloned-site` | Folder to save the clone |
| `--help` | – | Show help & exit |
| `--version` | – | Show version |

### Examples

```bash
# Basic
site-cloner https://example.com

# Custom folder
site-cloner https://blog.example.com -o blog-backup

# Run without global install
npx site-cloner https://example.com
```

---

## 🔧 How It Works (30-second read)

1. **Fetch** the page with axios.  
2. **Parse** DOM with Cheerio.  
3. **Download** every linked CSS, JS, image, font, etc.  
4. **Rewrite** all `href`, `src`, `url(...)` to **local** paths.  
5. **Save** a ready-to-run `index.html` + assets.

The result is a **static mirror** you can zip, email, host on any web server, or open directly from disk.

---

## 📁 Output Structure

```
cloned-site/
├── index.html          # rewritten & offline-ready
├── css/
│   └── main.css
├── js/
│   └── app.js
├── images/
│   └── logo.png
└ ... (mirrors server tree)
```

---

## ✅ Guarantees

| Feature | Status |
|---------|--------|
| Works fully offline | ✅ |
| Preserves directory layout | ✅ |
| Handles relative & absolute assets | ✅ |
| Fixes inline CSS `url(...)` | ✅ |
| Cross-platform (macOS, Linux, Windows) | ✅ |
| Zero config | ✅ |

---

## 🧪 Developer Notes

### Run from Source

```bash
git clone https://github.com/yourname/site-cloner.git
cd site-cloner
npm install
chmod +x site-cloner.js
./site-cloner.js https://example.com
```

### Test Suite

```bash
npm test
```

---

## 🚧 Limitations

* Dynamic content that **only** appears via user interaction (e.g. infinite scroll after click) may not be captured.
* Sites behind authentication or heavy anti-bot measures might fail.

---

## ⚖️ Legal & Ethics

Only clone sites **you own** or have **explicit permission** to mirror. Respect `robots.txt`, copyright, and local laws.

---

## 🆘 Troubleshooting

| Problem | Fix |
|---------|-----|
| **Styles still broken** | Check if `url(...)` in external CSS files point to missing files; open DevTools → Network tab. |
| **Timeout** | Increase axios timeout in code or try again. |
| **Nothing downloads** | Ensure the target URL returns `200 OK` and is publicly reachable. |

---

## 🤝 Contributing

PRs welcome!  
Ideas: parallel downloads, React component mode, sitemap crawling.

---

## 📄 License

MIT © 2025 – do whatever you want, just don’t blame us.
