import { تحليل_الشفرة } from "../src/AlifLexer.js";
import { محلل_الرموز } from "../src/AlifParser.js";
import { إنشاء_الشفرة } from "../src/AlifGenerator.js";
import { إعادة_تعيين_المؤشر } from "../src/Core/TokenUtils.js";

const editor = window.editor;
const زر_التشغيل = document.getElementById("run");
const الناتج = document.getElementById("output");

زر_التشغيل.addEventListener("click", تشغيل_الكود);

async function تشغيل_الكود() {
    try {
        إعادة_تعيين_المؤشر();

        const شفرة = editor.getValue();

        if (!شفرة.trim() || شفرة === "اكتب كود لغة ألف هنا...") {
            عرض_النتيجة("الرجاء إدخال كود للتنفيذ", "error");
            return;
        }

        الناتج.innerHTML = "جاري التشغيل...";

        const رموز = تحليل_الشفرة(شفرة);
        console.log("تم تحليل الشفرة إلى رموز");

        const ast = محلل_الرموز(رموز);
        console.log("تم تحليل الشفرة المجردة (AST)");

        const كود_مترجم = إنشاء_الشفرة(ast);
        console.log("تم إنشاء الشفرة المترجمة");

        try {
            console.log("جاري تنفيذ الكود...");
            const الناتج_المعدل = [];

            const consoleLogOriginal = console.log;
            console.log = function () {
                const args = Array.from(arguments);
                الناتج_المعدل.push(args.join(" "));
                consoleLogOriginal.apply(console, arguments);
            };

            let result;
            try {
                result = eval(كود_مترجم);
                if (result instanceof DocumentFragment) {
                    result = undefined;
                }
            } finally {
                console.log = consoleLogOriginal;
            }

            if (result !== undefined) {
                if (result instanceof Promise) {
                    try {
                        const resolvedResult = await result;
                        if (resolvedResult !== undefined) {
                            الناتج_المعدل.push(String(resolvedResult));
                        }
                    } catch (error) {
                        console.error("Error in Promise:", error);
                        return عرض_النتيجة(`Error: ${error.message}`, "error");
                    }
                } else {
                    الناتج_المعدل.push(String(result));
                }
            }

            if (الناتج_المعدل.length > 0) {
                await عرض_النتيجة(الناتج_المعدل.join("\n"), "success");
            } else {
                await عرض_النتيجة("حدث خطأ", "error");
            }
        } catch (خطأ_التنفيذ) {
            console.error("خطأ أثناء التنفيذ:", خطأ_التنفيذ);
            await عرض_النتيجة(
                `خطأ أثناء التنفيذ: ${خطأ_التنفيذ.message}`,
                "error"
            );
        }
    } catch (خطأ) {
        console.error("حدث خطأ:", خطأ);
        await عرض_النتيجة(`حدث خطأ: ${خطأ.message}`, "error");
    }
}

async function عرض_النتيجة(نص, نوع) {
    الناتج.innerHTML = "";

    if (
        نص instanceof DocumentFragment ||
        (typeof نص === "string" && نص.includes("[object DocumentFragment]"))
    ) {
        return;
    }

    if (نص instanceof Promise) {
        try {
            const result = await نص;
            return عرض_النتيجة(result, نوع);
        } catch (error) {
            console.error("Error in Promise:", error);
            return عرض_النتيجة(`Error: ${error.message}`, "error");
        }
    }

    if (Array.isArray(نص)) {
        if (نص.length === 0) {
            const emptyContainer = document.createElement("div");
            emptyContainer.className = "output-content";
            emptyContainer.textContent = "";
            الناتج.appendChild(emptyContainer);
        } else {
            نص.forEach((item) => {
                const itemContainer = document.createElement("div");
                itemContainer.className = "output-content";

                if (item === null || item === undefined) {
                    itemContainer.textContent = "";
                } else if (typeof item === "object") {
                    try {
                        itemContainer.textContent = JSON.stringify(
                            item,
                            null,
                            2
                        );
                    } catch (e) {
                        itemContainer.textContent = String(item);
                    }
                } else {
                    itemContainer.textContent = String(item);
                }

                الناتج.appendChild(itemContainer);
            });
        }
    } else {
        let textToDisplay = "";

        if (نص === null || نص === undefined) {
            textToDisplay = "";
        } else if (typeof نص === "object") {
            try {
                textToDisplay = JSON.stringify(نص, null, 2);
            } catch (e) {
                textToDisplay = String(نص);
            }
        } else {
            textToDisplay = String(نص);
        }

        const lines = textToDisplay.split("\n");
        lines.forEach((line) => {
            if (line.trim() !== "" || lines.length === 1) {
                const container = document.createElement("div");
                container.className = "output-content";
                container.textContent = line;
                الناتج.appendChild(container);
            }
        });
    }

    الناتج.className = `output-code ${نوع}`;

    const placeholder = الناتج.querySelector(".placeholder");
    if (placeholder) {
        placeholder.remove();
    }
}
