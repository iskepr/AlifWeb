// readTranslations.js
const fs = require("fs");

let translationMap = null;

function loadTranslations() {
  try {
    const data = fs.readFileSync("translations.json", "utf8");
    translationMap = JSON.parse(data);
    console.log("✅ تم تحميل الترجمة بنجاح!");
  } catch (error) {
    console.error("❌ خطأ في قراءة وتحليل JSON:", error);
    translationMap = {};
  }
}

function getTranslationMap() {
  if (!translationMap) {
    loadTranslations();
  }
  return translationMap;
}

// تأكد أن التصدير صحيح
module.exports = { getTranslationMap };
