// translateStyle.js
const translateToCSS = (code, translations) => {
  let translatedCode = code;
  for (const [arabicStyle, jsKeyword] of Object.entries(translations)) {
    let regex = new RegExp(arabicStyle, "g");
    translatedCode = translatedCode.replace(regex, jsKeyword);
  }
  return translatedCode;
};

module.exports = { translateToCSS };
