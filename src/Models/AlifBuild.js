const fs = require("fs");
const path = require("path");
const terser = require("terser");

const { تحليل_الشفرة } = require("../AlifLexer");
const { محلل_الرموز } = require("../AlifParser");
const { توليد_كود } = require("../AlifGenerator");

async function بناء_الف(fileName) {
    const مسار_الملف = path.join(
        process.cwd(),
        fileName ? fileName : "./رئيسي.الف"
    );

    try {
        const شفرة = fs.readFileSync(مسار_الملف, "utf8");

        const رموز = تحليل_الشفرة(شفرة);
        const ast = محلل_الرموز(رموز);
        const كود_مترجم = توليد_كود(ast);

        const تصغير = async (الكود) => {
            const { code } = await terser.minify(الكود);
            return code;
        };

        const كود_مصغر = await تصغير(كود_مترجم);
        const htmlTemplate = `
        <!DOCTYPE html>
        <html lang="ar">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>لغة ألف</title>
        </head>
        <body>
          <script>
            ${كود_مصغر}
          </script>
        </body>
        </html>
        `;

        fs.writeFileSync("index.html", htmlTemplate);

        console.log("تم بناء الملف index.html بنجاح");
    } catch (e) {
        console.error("خطأ أثناء التوليد:", e.message);
    }
}

module.exports = { بناء_الف };
