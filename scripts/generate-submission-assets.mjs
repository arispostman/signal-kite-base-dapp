import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import sharp from "sharp";

const outDir = resolve(process.cwd(), "base-submission");
await mkdir(outDir, { recursive: true });

const c = { ink: "#102033", sky: "#dff6ff", blue: "#55b6e8", deep: "#19658e", coral: "#ff6b57", sun: "#ffd166", lime: "#7bdc83", paper: "#fffaf0" };
const esc = (value) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const t = (x, y, value, size, fill = c.ink, weight = 900, anchor = "start") => `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Arial" font-size="${size}" font-weight="${weight}" fill="${fill}">${esc(value)}</text>`;
const ml = (x, y, value, size, fill = c.ink, weight = 900, gap = size * 1.05) => `<text x="${x}" y="${y}" font-family="Arial" font-size="${size}" font-weight="${weight}" fill="${fill}">${value.split("\n").map((line, index) => `<tspan x="${x}" dy="${index ? gap : 0}">${esc(line)}</tspan>`).join("")}</text>`;
const defs = `<defs><filter id="sh"><feDropShadow dx="0" dy="26" stdDeviation="22" flood-color="#19658e" flood-opacity=".25"/></filter><pattern id="wind" width="180" height="120" patternUnits="userSpaceOnUse"><path d="M8 36C60 10 112 62 172 34M20 92C70 64 118 112 170 88" fill="none" stroke="#19658e" stroke-opacity=".12" stroke-width="5" stroke-linecap="round"/></pattern></defs>`;

function box(x, y, w, h, label, value) {
  return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="34" fill="rgba(255,250,240,.7)" stroke="#102033" stroke-opacity=".12" stroke-width="3"/>${t(x + 30, y + 48, label, 18, "rgba(16,32,51,.58)", 950)}${ml(x + 30, y + 108, value, 42, c.ink, 950, 46)}</g>`;
}

function kiteCard(x, y, title, wind, color, note, flyer = "--", date = "--", accent = c.coral) {
  return `<g filter="url(#sh)"><rect x="${x}" y="${y}" width="1080" height="1140" rx="58" fill="#dff6ff" stroke="#102033" stroke-opacity=".12" stroke-width="4"/><rect x="${x}" y="${y}" width="1080" height="1140" rx="58" fill="url(#wind)"/><circle cx="${x + 860}" cy="${y + 140}" r="94" fill="${c.sun}" opacity=".85"/><path d="M${x + 120} ${y + 188}C${x + 230} ${y + 92} ${x + 360} ${y + 194} ${x + 500} ${y + 130}" fill="none" stroke="#fff" stroke-width="54" stroke-linecap="round" opacity=".76"/><g transform="translate(${x + 540} ${y + 340}) rotate(45)"><rect x="-118" y="-118" width="118" height="118" fill="${accent}" stroke="#102033" stroke-opacity=".18" stroke-width="5"/><rect x="0" y="-118" width="118" height="118" fill="${c.sun}" stroke="#102033" stroke-opacity=".18" stroke-width="5"/><rect x="0" y="0" width="118" height="118" fill="#fff" stroke="#102033" stroke-opacity=".18" stroke-width="5"/><rect x="-118" y="0" width="118" height="118" fill="${c.blue}" stroke="#102033" stroke-opacity=".18" stroke-width="5"/></g><path d="M${x + 540} ${y + 506}C${x + 460} ${y + 620} ${x + 610} ${y + 702} ${x + 500} ${y + 806}" fill="none" stroke="#102033" stroke-opacity=".34" stroke-width="5"/><rect x="${x + 118}" y="${y + 780}" width="844" height="220" rx="34" fill="rgba(255,250,240,.86)" stroke="#102033" stroke-opacity=".12" stroke-width="3"/>${t(x + 156, y + 842, `${wind} / ${color}`, 28, c.deep, 950)}${ml(x + 156, y + 940, title, 66, c.ink, 950, 66)}${ml(x + 156, y + 1022, note, 27, "rgba(16,32,51,.72)", 850, 32)}${box(x + 96, y + 1038, 420, 74, "FLYER", flyer)}${box(x + 560, y + 1038, 420, 74, "RAISED", date)}</g>`;
}

const base = (body) => `<svg width="1284" height="2778" viewBox="0 0 1284 2778" xmlns="http://www.w3.org/2000/svg">${defs}<rect width="1284" height="2778" fill="#bfeeff"/><rect width="1284" height="2778" fill="url(#wind)"/><circle cx="1078" cy="172" r="250" fill="${c.sun}" opacity=".55"/>${body}</svg>`;
const head = (title, sub) => `${t(92,154,"Signal Kite",62,c.ink,950)}${ml(96,282,title,82,c.ink,950,82)}${t(102,438,sub,31,"rgba(16,32,51,.7)",850)}`;

const shot1 = base(`${head("Raise a\nsignal.", "Wind, color, wallet, and time on Base.")}${kiteCard(102,570,"Launch\nSignal","East","Coral","A bright signal for the next small\nlaunch on Base.","--","--",c.coral)}${box(102,1868,500,250,"1 WIND","Pick the\ndirection.")}${box(682,1868,500,250,"2 RAISE","Save it\non Base.")}`);
const shot2 = base(`${head("Choose the\ncolor.", "Tune the kite before raising it.")}${box(102,540,322,170,"WIND","North")}${box(480,540,322,170,"COLOR","Sky")}${box(860,540,322,170,"STATUS","Ready")}${kiteCard(102,820,"Clear\nSky","North","Sky","Keep the line simple, visible,\nand easy to follow.","0x4265...af62","May 20",c.blue)}`);
const shot3 = base(`${head("Read any\nsignal.", "Load a kite card by ID.")}${kiteCard(102,590,"Soft\nLanding","Calm","Sun","A quiet marker for work that has\nsafely landed.","0xdD8f...5c36","May 20",c.sun)}${box(102,1880,500,250,"LOOKUP","Enter ID\nand read.")}${box(682,1880,500,250,"PROOF","Flyer, wind,\nand time.")}`);
const thumb = `<svg width="1910" height="1000" viewBox="0 0 1910 1000" xmlns="http://www.w3.org/2000/svg">${defs}<rect width="1910" height="1000" fill="#bfeeff"/><rect width="1910" height="1000" fill="url(#wind)"/>${t(88,166,"Signal Kite",112,c.ink,950)}${t(98,250,"Raise a kite signal on Base.",42,"rgba(16,32,51,.7)",850)}${box(96,390,540,210,"WIND","Pick direction.")}${box(96,655,540,210,"PROOF","Wallet and time.")}${kiteCard(752,20,"Launch\nSignal","East","Coral","A bright signal for the next small\nlaunch on Base.","0x4265...af62","May 20",c.coral)}</svg>`;
const icon = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">${defs}<rect width="1024" height="1024" fill="#bfeeff"/><rect width="1024" height="1024" fill="url(#wind)"/><circle cx="806" cy="146" r="112" fill="${c.sun}"/><g transform="translate(512 380) rotate(45)"><rect x="-142" y="-142" width="142" height="142" fill="${c.coral}"/><rect x="0" y="-142" width="142" height="142" fill="${c.sun}"/><rect x="0" y="0" width="142" height="142" fill="#fff"/><rect x="-142" y="0" width="142" height="142" fill="${c.blue}"/></g><path d="M512 580C410 710 612 760 460 900" fill="none" stroke="${c.ink}" stroke-opacity=".45" stroke-width="20" stroke-linecap="round"/></svg>`;

async function png(name, svg, width, height) {
  await sharp(Buffer.from(svg)).resize(width, height).png({ compressionLevel: 9 }).toFile(join(outDir, name));
}

await png("screenshot-1.png", shot1, 1284, 2778);
await png("screenshot-2.png", shot2, 1284, 2778);
await png("screenshot-3.png", shot3, 1284, 2778);
await sharp(Buffer.from(thumb)).resize(1200, 628).jpeg({ quality: 88 }).toFile(join(outDir, "app-thumbnail.jpg"));
await sharp(Buffer.from(icon)).resize(1024, 1024).jpeg({ quality: 90 }).toFile(join(outDir, "app-icon.jpg"));
await writeFile(join(outDir, "submission-copy.md"), `# Signal Kite\n\nApp Name: Signal Kite\nTagline: Raise a signal\nDescription: Raise a kite signal with wind, color, note, wallet, and time on Base.\n\nScreenshots:\n- screenshot-1.png: default first screen, showing the kite signal action.\n- screenshot-2.png: interaction state, showing wind and color choices.\n- screenshot-3.png: result/lookup state, showing a loaded signal by ID.\n`, "utf8");
await writeFile(join(outDir, "asset-manifest.json"), JSON.stringify({
  generatedAt: new Date().toISOString(),
  assets: ["app-icon.jpg", "app-thumbnail.jpg", "screenshot-1.png", "screenshot-2.png", "screenshot-3.png", "submission-copy.md"].map((name) => join(outDir, name)),
}, null, 2), "utf8");
