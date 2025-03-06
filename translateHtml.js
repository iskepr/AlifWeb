const translateToHtml = (code, translations) => {
  let translatedCode = code;

  for (const [arabicElement, jsElement] of Object.entries(translations)) {
    let regex;
    let replacement;

    if (arabicElement === "رابط") {
      regex = new RegExp(
        `${arabicElement}\\s*\\((['"]?)(.*?)\\1,\\s*(['"]?)(.*?)\\3,\\s*(['"]?)(.*?)\\5?\\)`,
        "g"
      );
      replacement = `document.write('<${jsElement} href="$2" style="$6">$4</${jsElement}>');`;
      // -------------------------------------------------------------------------------------
    } else if (arabicElement === "مجموعة") {
      regex = new RegExp(`${arabicElement}\\s*\\((['"])(.*?)\\1\\)`, "g");
      replacement = (_, quote, content) =>
        `document.write(\`<${jsElement}>\`); document.write(\`${content}\`); document.write(\`</${jsElement}>\`);`;
      // -------------------------------------------------------------------------------------
    } else if (["تصميم", "عنوان"].includes(arabicElement)) {
      regex = new RegExp(`${arabicElement}\\s*\\((['"]?)(.*?)\\1\\)`, "g");
      replacement = `document.write(\`<${jsElement}>$2</${jsElement}>\`);`;
      // -------------------------------------------------------------------------------------
    } else if (["سطر", "خط"].includes(arabicElement)) {
      regex = new RegExp(`${arabicElement}`, "g");
      replacement = `document.write(\`<${jsElement}>\`);`;
      // -------------------------------------------------------------------------------------
    } else if (arabicElement === "ادخل") {
      regex = new RegExp(
        `${arabicElement}\\s*\\((['"]?)(.*?)\\1,\\s*(['"]?)(.*?)\\3\\)`,
        "g"
      );
      replacement = `document.write(\`<${jsElement} style="$4">$2</${jsElement}>\`);`;
      // -------------------------------------------------------------------------------------
    } else {
      regex = new RegExp(
        `${arabicElement}\\s*\\((['"]?)(.*?)\\1,\\s*(['"]?)(.*?)\\3\\)`,
        "g"
      );
      replacement = (_, quote1, content, quote2, style) =>
        `document.write(\`<${jsElement} style="${style}">${content}</${jsElement}>\`);`;
    }

    translatedCode = translatedCode.replace(regex, replacement);
  }

  return translatedCode;
};

module.exports = { translateToHtml };
