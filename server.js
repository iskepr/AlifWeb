const express = require("express");
const fs = require("fs");
const path = require("path");
const chokidar = require("chokidar");
const { translateToJavaScript } = require("./alif");
const net = require("net");
const { exec } = require("child_process");

const app = express();
const PORT = 3000;

async function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", (err) => {
      if (err.code === "EADDRINUSE") {
        resolve(true);
      } else {
        resolve(false);
      }
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
        console.error(`❌ خطأ أثناء إغلاق البورت ${port}:`, stderr);
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

    if (!fs.existsSync(filePath)) {
      return res.status(404).send("❌ الملف غير موجود!");
    }

    try {
      const arabicCode = fs.readFileSync(filePath, "utf8");
      const translatedJS = translateToJavaScript(arabicCode);

      res.send(`
        <!DOCTYPE html>
        <html>
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
      `);
    } catch (error) {
      console.error("❌ خطأ أثناء قراءة الملف:", error);
      res.status(500).send("❌ حدث خطأ أثناء معالجة الملف.");
    }
  });

  let clients = [];

  app.get("/events", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    clients.push(res);
    res.write("data: connected\n\n");

    req.on("close", () => {
      clients = clients.filter((client) => client !== res);
    });
  });

  const watcher = chokidar.watch("*.alif", { ignoreInitial: true });

  watcher.on("change", (filePath) => {
    console.log(`🔄 تم تعديل الملف: ${path.basename(filePath)}`);

    clients.forEach((client) => {
      client.write("data: update\n\n");
    });
  });

  const server = app.listen(PORT, () => {
    console.log(`🚀 السيرفر يعمل على http://localhost:${PORT}/`);
  });

  process.on("SIGINT", () => {
    console.log("🛑 إيقاف السيرفر...");
    watcher.close();
    server.close(() => {
      console.log("✅ السيرفر تم إيقافه بنجاح.");
      process.exit(0);
    });
  });

  process.on("uncaughtException", (err) => {
    console.error("❌ خطأ غير متوقع:", err);
  });
})();
