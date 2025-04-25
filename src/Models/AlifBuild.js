const fs = require("fs");
const path = require("path");
const esbuild = require("esbuild");
const terser = require("terser");

const { تحليل_الشفرة } = require("../AlifLexer");
const { محلل_الرموز } = require("../AlifParser");
const { توليد_كود } = require("../AlifGenerator");

async function بناء_الف(fileName) {
    const مسار_الملف = path.join(
        process.cwd(),
        fileName ? fileName : "./رئيسي.الف"
    );
    const اسم_المف = fileName
        ? path.basename(fileName, path.extname(fileName))
        : "رئيسي";

    try {
        const شفرة = fs.readFileSync(مسار_الملف, "utf8");

        const رموز = تحليل_الشفرة(شفرة);
        const ast = محلل_الرموز(رموز);
        const كود_مترجم = توليد_كود(ast);

        const تصغير = async (الكود) => {
            const esbuildResult = await esbuild.transform(الكود, {
                minify: true,
                target: "es2020",
                format: "iife",
                charset: "utf8",
            });

            const terserResult = await terser.minify(esbuildResult.code, {
                compress: true,
                mangle: true,
            });

            return terserResult.code;
        };

        const كود_مصغر = await تصغير(كود_مترجم);

        const مجلد_الويب = path.join(process.cwd(), "بناء", "ويب");
        fs.mkdirSync(مجلد_الويب, { recursive: true });

        fs.writeFileSync(
            path.join(مجلد_الويب, `${اسم_المف}.alif.js`),
            كود_مصغر,
            "utf8"
        );

        const htmlTemplate = `
<!DOCTYPE html>
<html lang="ar">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${اسم_المف}</title>
</head>
<body>
  <script src="${اسم_المف}.alif.js"></script>
</body>
</html>
`;

        fs.writeFileSync(
            path.join(مجلد_الويب, "index.html"),
            htmlTemplate,
            "utf8"
        );

        console.log("✅ تم بناء المشروع وتحسينه داخل بناء/ويب/");
    } catch (e) {
        console.error("❌ خطأ أثناء التوليد:", e.message);
    }
}

module.exports = { بناء_الف };
