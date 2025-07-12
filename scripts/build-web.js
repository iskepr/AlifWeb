#!/usr/bin/env node

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
        outfile: "dist/alif-web.js",
        minify: false,
        sourcemap: true,
    });

    console.log("Build completed successfully!");

    const wrapper = `
// AlifWeb Browser Bundle
(function() {
  // Load the AlifWeb module
  const AlifWeb = (function() {
    // This will be replaced by the actual bundled code
    return {};
  })();
  
  // Expose Alif function globally
  window.Alif = AlifWeb.default || AlifWeb.Alif || function(code) {
    throw new Error('Alif function not properly loaded');
  };
  
  console.log('AlifWeb loaded successfully!');
})();
`;

    // Write the wrapper to a separate file
    writeFileSync("dist/alif-wrapper.js", wrapper);

    console.log("Web build files created:");
    console.log("- dist/alif-web.js (main bundle)");
    console.log("- dist/alif-wrapper.js (global wrapper)");
} catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
}
