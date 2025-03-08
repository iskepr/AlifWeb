const translateToHtml = (code, translations) => {
  let translatedCode = code;

  for (const [arabicElement, jsElement] of Object.entries(translations)) {
    let regex, replacement;

    switch (arabicElement) {
      case "رابط":
        regex = new RegExp(
          `${arabicElement}\\s*\\((['"]?)(.*?)\\1,\\s*(['"]?)(.*?)\\3,\\s*(['"]?)(.*?)\\5?\\)`,
          "g"
        );
        replacement = `document.write('<${jsElement} href="$2" style="$6">$4</${jsElement}>');`;
        break;
      case "شعار":
        regex = new RegExp(`${arabicElement}\\s*\\((['"]?)(.*?)\\1\\)`, "g");
        replacement = `document.write(\`<link rel="shortcut icon" href="$2" type="image/x-icon">\`);`;
        break;
      case "مجموعة":
        regex = /مجموعة\s*\(\s*"(.*?)"\s*\):\n([\s\S]*?)(?=\n\s*\w|\n?$)/g;
        replacement = (_, className, content) =>
          `document.write(\`<div class="${className}">\`); 
            ${content.replace(
              /^\s*نص\("(.*?)"\)/gm,
              "document.write(`<p>$1</p>`);"
            )}
            document.write(\`</div>\`);`;
        break;
      case "تصميم":
      case "عنوان":
        regex = new RegExp(`${arabicElement}\\s*\\((['"]?)(.*?)\\1\\)`, "g");
        replacement = `document.write(\`<${jsElement}>$2</${jsElement}>\`);`;
        break;
      case "سطر":
      case "خط":
        regex = new RegExp(`${arabicElement}`, "g");
        replacement = `document.write(\`<${jsElement}>\`);`;
        break;
      case "ادخل":
        regex = new RegExp(
          `${arabicElement}\\s*\\((['"]?)(.*?)\\1,\\s*(['"]?)(.*?)\\3\\)`,
          "g"
        );
        replacement = `document.write(\`<${jsElement} style="$4">$2</${jsElement}>\`);`;
        break;
        default:
          regex = new RegExp(
            `${arabicElement}\\s*\\((['"]?)(.*?)\\1,?\\s*(['"]?)(.*?)?\\3\\)`,
            "g"
          );
          replacement = `$1$2$1`
              ? `document.write(\`<${jsElement} style="$4">$1$2$1</${jsElement}>\`);` 
              : `document.write(\`<${jsElement}>$\{$4\}</${jsElement}>\`);`;
          break;
      
    }
    translatedCode = translatedCode.replace(regex, replacement);
  }

  return translatedCode;
};

module.exports = { translateToHtml };
