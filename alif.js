const translationMap = {
  اطبع: "console.log",
  اذا: "if",
  والا: "else",
  بينما: "while",
  لاجل: "for",
  دالة: "function",
  ارجع: "return",
  كسر: "break",
  html: {
    تصميم: "style",
    عنوان: "title",
    عنوان1: "h1",
    عنوان2: "h2",
    عنوان3: "h3",
    عنوان4: "h4",
    عنوان5: "h5",
    مجموعة: "div",
    ادخل: "input",
    نص: "p",
    رابط: "a",
    سطر: "br",
    خط: "hr",
  },
};

function translateToJavaScript(arabicCode) {
  let translatedJS = arabicCode;

  for (const [arabicKeyword, jsKeyword] of Object.entries(translationMap)) {
    let regex, replacement;

    switch (arabicKeyword) {
      case "اطبع":
        regex = new RegExp(`${arabicKeyword}\\s*\\((.*?)\\)`, "g");
        replacement = `${jsKeyword}($1);`;
        break;
      case "اذا":
      case "بينما":
      case "لاجل":
        regex = new RegExp(`${arabicKeyword}\\s*\\((.*?)\\)`, "g");
        replacement = `${jsKeyword} ($1)`;
        break;
      case "دالة":
        regex = new RegExp(`${arabicKeyword}\\s+([^\s(]+)\\s*\\((.*?)\\)`, "g");
        replacement = `${jsKeyword} $1($2)`;
        break;
      case "والا":
        regex = new RegExp(arabicKeyword, "g");
        replacement = `${jsKeyword}`;
        break;
      case "ارجع":
      case "كسر":
        regex = new RegExp(arabicKeyword, "g");
        replacement = `${jsKeyword};`;
        break;
    }

    translatedJS = translatedJS.replace(regex, replacement);
  }

  // معالجة عناصر HTML بشكل منفصل
  for (const [arabicElement, jsElement] of Object.entries(
    translationMap.html
  )) {
    let regex;
    let replacement;

    if (arabicElement === "رابط") {
      regex = new RegExp(
        `${arabicElement}\\s*\\((['"]?)(.*?)\\1,\\s*(['"]?)(.*?)\\3,\\s*(['"]?)(.*?)\\5?\\)`,
        "g"
      );
      replacement = `document.write('<${jsElement} href="$2" style="$6">$4</${jsElement}>');`;
      // ------------------------------------ المجموعة
    } else if (arabicElement === "مجموعة") {
      regex = new RegExp(`${arabicElement}\\s*\\((['"])(.*?)\\1\\)`, "g");

      replacement = `document.write(\`<${jsElement}>\`); \${RegExp.$2} document.write(\`</${jsElement}>\`);`;

      // ------------------------------------- الباقي
    } else if (arabicElement === "تصميم" || arabicElement === "عنوان") {
      regex = new RegExp(`${arabicElement}\\s*\\((['"]?)(.*?)\\1\\)`, "g");
      replacement = `document.write(\`<${jsElement}>$2</${jsElement}>\`)`;
    } else if (arabicElement === "سطر" || arabicElement === "خط") {
      regex = new RegExp(arabicElement, "g");
      replacement = `document.write(\`<${jsElement}>\`)`;
    } else if (arabicElement === "ادخل") {
      regex = new RegExp(
        `${arabicElement}\\s*\\((['"]?)(.*?)\\1,\\s*(['"]?)(.*?)\\3\\)`,
        "g"
      );
      replacement = `document.write(\`<${jsElement} style="$4">$2</${jsElement}>\`)`;
    } else {
      regex = new RegExp(
        `${arabicElement}\\s*\\((['"]?)(.*?)\\1,\\s*(['"]?)(.*?)\\3\\)`,
        "g"
      );
      replacement = `document.write(\`<${jsElement} style="$4">$2</${jsElement}>\`)`;
    }

    translatedJS = translatedJS.replace(regex, replacement);
  }

  return translatedJS;
}

module.exports = { translateToJavaScript };
