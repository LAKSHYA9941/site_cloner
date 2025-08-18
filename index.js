#!/usr/bin/env node
/*  1. Shebang – tells the OS to execute this file with Node.js.
    2. Makes the file an executable CLI tool on macOS/Linux when you run `chmod +x site-cloner.js` */

const axios = require("axios");      // 3. Promise-based HTTP client – fetches remote files.
const cheerio = require("cheerio");    // 4. jQuery-like server-side HTML parser.
const fs = require("fs-extra");   // 5. fs + extra helpers (ensureDir, etc.).
const path = require("path");       // 6. Cross-platform path utilities.
const { Command } = require("commander"); // 7. CLI argument parser.

/*  8. Instantiate Commander’s main command object */
const program = new Command();

program
  .name("site-cloner")
  .description("CLI tool to clone a website’s HTML, CSS, JS and make it work OFFLINE")
  .version("2.0.0")
  .argument("<url>", "Website URL to clone")
  .option("-o, --output <folder>", "Output folder", "cloned-site")
  .action(async (targetUrl, options) => {
    /* 9. Commander passes the URL and parsed CLI flags here. */

    console.log(`🎯 Cloning: ${targetUrl}`);

    /* 10. Build absolute base URL – needed to resolve relative assets. */
    const base = new URL(targetUrl);
    /* 11. Resolve output path to absolute – avoids surprises when cd’ing around. */
    const outputDir = path.resolve(options.output);
    /* 12. Create folder tree synchronously (empty if already exists). */
    await fs.ensureDir(outputDir);

    /* 13. Fetch raw HTML – axios auto-follows redirects. */
    const { data: html } = await axios.get(targetUrl, { timeout: 15000 });
    /* 14. Load HTML into Cheerio for jQuery-like manipulation. */
    const $ = cheerio.load(html);

    /* 15. Save the *original* HTML first (in case something crashes). */
    await fs.writeFile(path.join(outputDir, "index.html"), html);
    console.log("✅ Saved raw index.html");

    /* 16. Array to collect every asset we need to download. */
    const assets = [];

    /* 17. Collect external CSS files */
    $("link[rel='stylesheet']").each((_, el) => {
      const href = $(el).attr("href");
      if (href) assets.push({ type: "css", src: href, el });
    });

    /* 18. Collect external JavaScript files */
    $("script[src]").each((_, el) => {
      const src = $(el).attr("src");
      if (src) assets.push({ type: "js", src, el });
    });

    /* 19. Collect images */
    $("img[src]").each((_, el) => {
      const src = $(el).attr("src");
      if (src) assets.push({ type: "img", src, el });
    });

    /* 20. Utility: convert any src/href to absolute, download, and return local path. */
    const downloadAsset = async (srcUrl) => {
      /* 21. Build absolute URL for relatives. */
      const assetUrl = srcUrl.startsWith("http") ? srcUrl : new URL(srcUrl, base).href;
      const parsed = new URL(assetUrl);

      /* 22. Mirror server folder structure inside outputDir. */
      const assetPath = path.join(outputDir, parsed.pathname.replace(/^\/+/, ""));
      await fs.ensureDir(path.dirname(assetPath));

      try {
        const res = await axios.get(assetUrl, { responseType: "arraybuffer", timeout: 15000 });
        await fs.writeFile(assetPath, res.data);
        console.log(`✅ Saved ${assetPath}`);
        /* 23. Return path *relative to outputDir* so it works in <link>, <img>, etc. */
        return path.relative(outputDir, assetPath).replace(/\\/g, "/");
      } catch (err) {
        console.warn(`⚠️  Failed to download ${assetUrl}`);
        return null;
      }
    };

    /* 24. Iterate and download each asset, then update DOM to point to local file. */
    for (const asset of assets) {
      const newPath = await downloadAsset(asset.src);
      if (newPath) {
        if (asset.type === "css") $(asset.el).attr("href", newPath);
        else if (asset.type === "js") $(asset.el).attr("src", newPath);
        else if (asset.type === "img") $(asset.el).attr("src", newPath);
      }
    }

    /* 25. Inline <style> tags often contain url(...) references. */
    $("style").each((_, el) => {
      let css = $(el).html();
      css = css.replace(/url\(['"]?(.*?)['"]?\)/g, (match, url) => {
        const abs = url.startsWith("http") ? url : new URL(url, base).href;
        const parsed = new URL(abs);
        const local = path.relative(
          outputDir,
          path.join(outputDir, parsed.pathname)
        ).replace(/\\/g, "/");
        return `url("${local}")`;
      });
      $(el).html(css);
    });

    /* 26. Same fix for inline style="..." attributes. */
    $("[style]").each((_, el) => {
      let style = $(el).attr("style");
      style = style.replace(/url\(['"]?(.*?)['"]?\)/g, (match, url) => {
        const abs = url.startsWith("http") ? url : new URL(url, base).href;
        const parsed = new URL(abs);
        const local = path.relative(
          outputDir,
          path.join(outputDir, parsed.pathname)
        ).replace(/\\/g, "/");
        return `url("${local}")`;
      });
      $(el).attr("style", style);
    });

    /* 27. Final HTML now points to local assets – overwrite index.html. */
    await fs.writeFile(path.join(outputDir, "index.html"), $.html());
    console.log("✅ index.html updated with offline-ready links");

    console.log("🎉 Clone complete!");
    console.log(`📁 Open in browser: ${path.join(outputDir, "index.html")}`);
  });

/* 28. Kick off Commander’s CLI parsing. */
program.parse(process.argv);