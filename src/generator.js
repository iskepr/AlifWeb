function توليد_كود(jsAST) {
    if (jsAST.نوع === "برنامج") {
        return jsAST.جمل.map(توليد_كود).join("\n");
    }

    if (jsAST.نوع === "اطبع") {
        return `console.log(${توليد_كود(jsAST.قيمة)});`;
    }

    if (jsAST.نوع === "نص") {
        return `document.write('<p>${توليد_كود(jsAST.قيمة).replace(/["']/g, "")}</p>');`;
    }

    if (jsAST.نوع === "ارجع") {
        return `return ${توليد_كود(jsAST.قيمة)};`;
    }

    if (jsAST.نوع === "قيمة") {
        const v = jsAST.قيمة;
        return isNaN(v) ? `${v}` : v;
    }

    throw new Error("نوع غير مدعوم: " + jsAST.نوع);
}

module.exports = { توليد_كود };
