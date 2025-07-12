import { build } from "esbuild";
import { readFileSync, writeFileSync } from "fs";

console.log("Building AlifWeb for browser...");

try {
    const result = await build({
        entryPoints: ["./scripts/AlifCDN.js"],
        bundle: true,
        format: "iife",
        globalName: "AlifWeb",
        platform: "browser",
        target: "es2020",
        outfile: "Lib/AlifWeb.js",
        minify: false,
        sourcemap: true,
    });

    console.log("تم بنجاح بناء المكتبة!");
    console.log("Lib/AlifWeb.js");
} catch (error) {
    console.error("فشل البناء:", error);
    process.exit(1);
}
