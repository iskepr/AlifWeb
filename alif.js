const readTranslations = require("./readTranslations"); // ✅ استيراد بشكل صحيح
const { translateToHtml } = require("./translateHtml");
const { translateToCSS } = require("./translateStyle");

function alifToJs(arabicCode) {
  let translatedJS = arabicCode;
  const translationMap = readTranslations.getTranslationMap(); // ✅ استخدمها بهذه الطريقة

  if (!translationMap || Object.keys(translationMap).length === 0) {
    console.error("❌ خطأ: لم يتم تحميل الترجمة بشكل صحيح.");
    return arabicCode;
  }

  for (const [arabicKeyword, jsKeyword] of Object.entries(
    translationMap["js"]
  )) {
    let regex, replacement;

    switch (arabicKeyword) {
      case "اطبع":
      case "اشعار":
        regex = new RegExp(`${arabicKeyword}\\s*\\((.*?)\\)`, "g");
        replacement = `${jsKeyword}($1);`;
        break;

      case "اذا":
      case "بينما":
        regex = new RegExp(
          `${arabicKeyword}\\s+(.+)?:\\s*\\n(?:\\s*(.+)\\n?)`,
          "g"
        );

        // regex = /(بينما|اذا)\s+(.+):\s*\n(?:\s*(.+)\n?)/g;
        replacement = `${jsKeyword} ($1) {\n$2\n`;
        break;
      case "لاجل":
        regex = new RegExp(
          `${arabicKeyword}\\s+(\\S+)\\s+في\\s+مدى\\((\\S+)\\)\\s*:\\s*`,
          "g"
        );
        replacement = (match, varName, range) =>
          `for (let ${varName} = 0; ${varName} < ${range}; ${varName}++) {`;
        break;
      case "دالة":
        regex = new RegExp(
          `${arabicKeyword}\\s+([^\s(]+)\\s*\\((.*?)\\)\\s*:\\s*`,
          "g"
        );
        replacement = `${jsKeyword} $1($2) {\n`;
        break;
      case "والا":
        regex = new RegExp(`${arabicKeyword}\\s*:`, "g");
        replacement = `} else {\n`;
        break;
      case "ارجع":
      case "توقف":
        regex = new RegExp(arabicKeyword, "g");
        replacement = `${jsKeyword};`;
        break;
      case "صح":
      case "خطا":
        regex = new RegExp(arabicKeyword, "g");
        replacement = `${jsKeyword}`;
        break;
      case "# ":
        regex = new RegExp(arabicKeyword, "g");
        replacement = `${jsKeyword}`;
        break;
      case "":
        regex = /\b(\w+)\s*=\s*(.+)/g;
        replacement = `let $1 = $2;`;
        break;
      default:
        regex = new RegExp(`(?<!["'])\\b${arabicKeyword}\\b(?!["'])`, "g");
        replacement = `${jsKeyword}`;
        break;
    }

    translatedJS = translatedJS.replace(regex, replacement);
  }

  translatedJS = translateToHtml(translatedJS, translationMap["html"]);
  translatedJS = translateToCSS(translatedJS, {
    ...translationMap["الالوان"],
    ...translationMap["css"],
  });

  return translatedJS;
}

module.exports = { alifToJs };