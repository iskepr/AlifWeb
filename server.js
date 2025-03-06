const express = require("express");
const fs = require("fs");
const path = require("path");
const { alifToJs } = require("./alif");
const net = require("net");
const { exec } = require("child_process");

const app = express();
const PORT = 3000;

async function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", (err) => {
      resolve(err.code === "EADDRINUSE");
    });

    server.once("listening", () => {
      server.close(() => resolve(false));
    });

    server.listen(port);
  });
}

async function killPort(port) {
  return new Promise((resolve) => {
    exec(`npx kill-port ${port}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ خطأ أثناء إغلاق البورت ${port}:`, stderr.trim());
      } else {
        console.log(`✅ تم إغلاق البورت ${port} بنجاح.`);
      }
      resolve();
    });
  });
}

(async () => {
  if (await isPortInUse(PORT)) {
    console.log(`⚠️ البورت ${PORT} قيد الاستخدام، يتم إغلاقه...`);
    await killPort(PORT);
  }

  app.use(express.static(__dirname));

  app.get("/:file", (req, res) => {
    const fileName = req.params.file + ".alif";
    const filePath = path.join(__dirname, fileName);
    const outputFile = path.join(__dirname, "index.html");

    if (!fs.existsSync(filePath)) {
      return res.status(404).send("❌ الملف غير موجود!");
    }

    try {
      const arabicCode = fs.readFileSync(filePath, "utf8");
      const translatedJS = alifToJs(arabicCode);
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="ar">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
          <script>
            ${translatedJS}
          </script>
        </body>
        </html>
      `;
      
      fs.writeFileSync(outputFile, htmlContent, "utf8");
      console.log("✅ تم إنشاء index.html بنجاح.");
      res.send(htmlContent);
    } catch (error) {
      console.error("❌ خطأ أثناء قراءة الملف:", error);
      res.status(500).send("❌ حدث خطأ أثناء معالجة الملف.");
    }
  });

  const server = app.listen(PORT, () => {
    console.log(`🚀 السيرفر يعمل على http://localhost:${PORT}/main`);
  });

  process.on("SIGINT", () => {
    console.log("🛑 إيقاف السيرفر...");
    server.close(() => {
      console.log("✅ السيرفر تم إيقافه بنجاح.");
      process.exit(0);
    });
  });

  process.on("uncaughtException", (err) => {
    console.error("❌ خطأ غير متوقع:", err);
  });
})();
