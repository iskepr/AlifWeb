const translateToHtml = (code, translations) => {
  let translatedCode = code;

  for (const [arabicElement, htmlElement] of Object.entries(translations)) {
    let regex, replacement;

    switch (arabicElement) {
      case "رابط":
        regex = new RegExp(
          `${arabicElement}\\s*\\((['"]?)(.*?)\\1,\\s*(['"]?)(.*?)\\3,\\s*(['"]?)(.*?)\\5?\\)`,
          "g"
        );
        replacement = `document.write('<${htmlElement} href="$2" style="$6">$4</${htmlElement}>');`;
        break;
      case "شعار":
        regex = new RegExp(`${arabicElement}\\s*\\((['"]?)(.*?)\\1\\)`, "g");
        replacement = `document.write(\`<link rel="shortcut icon" href="$2" type="image/x-icon">\`);`;
        break;
      case "عمودي":
      case "افقي":
        const direction = arabicElement === "عمودي" ? "column" : "row";
        regex = new RegExp(
          `${arabicElement}:\\s*\\n+((?:\\s{1,4}.+\\n?)+)`,
          "g"
        );
        replacement = (_, content) => {
          return `document.write('<${htmlElement} style="display: flex; flex-direction: ${direction};">');\n${translateToHtml(
            content,
            translations
          )}\ndocument.write('</${htmlElement}>');`;
        };
        break;
      case "تصميم":
      case "عنوان":
        regex = new RegExp(`${arabicElement}\\s*\\((['"]?)(.*?)\\1\\)`, "g");
        replacement = `document.write(\`<${htmlElement}>$2</${htmlElement}>\`);`;
        break;
      case "سطر":
      case "خط":
        regex = new RegExp(`${arabicElement}`, "g");
        replacement = `document.write(\`<${htmlElement}>\`);`;
        break;
      case "ادخل":
        regex = new RegExp(
          `${arabicElement}\\s*\\((['"]?)(.*?)\\1,\\s*(['"]?)(.*?)\\3\\)`,
          "g"
        );
        replacement = `document.write(\`<${htmlElement} style="$4">$2</${htmlElement}>\`);`;
        break;
      default:
        regex = new RegExp(
          `${arabicElement}\\s*\\((['"]?)(.*?)\\1,?\\s*(['"]?)(.*?)?\\3\\)`,
          "g"
        );
        replacement = `$1$2$1`
          ? `document.write(\`<${htmlElement} style="$4">$1$2$1</${htmlElement}>\`);`
          : `document.write(\`<${htmlElement}>$\{$4\}</${htmlElement}>\`);`;
        break;
    }
    translatedCode = translatedCode.replace(regex, replacement);
  }

  return translatedCode;
};

module.exports = { translateToHtml };
