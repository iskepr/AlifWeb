const fs = require("fs");
const http = require("http");
const path = require("path");
const terser = require("terser");

const { تحليل_الشفرة } = require("../AlifLexer");
const { محلل_الرموز } = require("../AlifParser");
const { توليد_كود } = require("../AlifGenerator");

let كود_مترجم = ""; // سيتم تخزين الكود الناتج هنا

function تشغيل_الف(fileName) {
    const مسار_الملف = path.join(
        process.cwd(),
        fileName ? fileName : "./رئيسي.الف"
    );

    let server;

    const buildCode = () => {
        fs.readFile(مسار_الملف, "utf8", async (خطأ, شفرة) => {
            if (خطأ) {
                console.error(`الملف "${مسار_الملف}" غير موجود`);
                return;
            }

            try {
                const رموز = تحليل_الشفرة(شفرة);
                // console.log("--------------------------- تحليل_الشفرة");
                // console.log(رموز);

                const ast = محلل_الرموز(رموز);
                // console.log("-------------------- محلل_الرموز");
                // console.log(ast);

                كود_مترجم = توليد_كود(ast);
                // console.log(" ------------------------------------ توليد_كود");
                // console.log(كود_مترجم);

                console.log("كود جديد تولد");
            } catch (e) {
                console.error("خطأ أثناء التوليد:", e.message);
                كود_مترجم = `console.error("خطأ في التوليد: ${e.message}");`;
            }
        });
    };

    const createServer = () => {
        server = http.createServer((req, res) => {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(`
              <!DOCTYPE html>
              <html lang="ar">
              <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>لغة ألف</title>
              </head>
              <body>
                <script>
                  // إضافة الكود المترجم هنا
                  ${كود_مترجم}
                </script>
              </body>
              </html>
            `);
        });

        const PORT = 3000;

        server
            .listen(PORT, () => {
                console.log(`السيرفر على http://localhost:${PORT}`);
            })
            .on("error", (err) => {
                if (err.code === "EADDRINUSE") {
                    console.error(
                        `المنفذ ${PORT} قيد الاستخدام. سيتم المحاولة على منفذ آخر.`
                    );
                    server.close(() => {
                        server.listen(PORT + 1, () => {
                            console.log(
                                `السيرفر يعمل الآن على http://localhost:${
                                    PORT + 1
                                }`
                            );
                        });
                    });
                    process.exit(1);
                }
            });
    };

    buildCode();
    createServer();

    // متابعة التغييرات في الملف وإعادة بناء الكود
    fs.watchFile(مسار_الملف, () => {
        console.log(`تم تعديل الملف "${مسار_الملف}"`);
        buildCode();
    });
}

module.exports = { تشغيل_الف };
