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
        if (!شفرة.trim() || شفرة === "اكتب كود لغة ألف هنا...")
            return عرض_النتيجة("الرجاء إدخال كود للتنفيذ", "error");

        الناتج.innerHTML = "جاري التشغيل...";
        const رموز = تحليل_الشفرة(شفرة);
        const ast = محلل_الرموز(رموز);
        const كود_مترجم = إنشاء_الشفرة(ast);
        const الأصل = {
            log: console.log,
            error: console.error,
            warn: console.warn,
        };

        const طباعة_في_العنصر = (...args) => {
            const div = document.createElement("div");
            div.className = "output-content";
            args.forEach((val, idx) => {
                const span = document.createElement("span");
                if (typeof val === "object" && val !== null) {
                    span.textContent = JSON.stringify(val, null, 2);
                } else {
                    span.textContent =
                        typeof val === "string" ? `"${val}"` : String(val);
                }
                div.appendChild(span);
                if (idx < args.length - 1)
                    div.appendChild(document.createElement("br"));
            });
            الناتج.appendChild(div);
        };

        ["log", "error", "warn"].forEach((k) => {
            console[k] = (...args) => {
                طباعة_في_العنصر(...args);
                الأصل[k](...args);
            };
        });

        try {
            الناتج.innerHTML = "";
            await new Promise(async (resolve, reject) => {
                try {
                    const result = eval(كود_مترجم);
                    if (result instanceof Promise) {
                        const resolvedResult = await result;
                        if (resolvedResult !== undefined)
                            طباعة_في_العنصر(resolvedResult);
                    } else if (result !== undefined) {
                        طباعة_في_العنصر(result);
                    }
                    resolve();
                } catch (error) {
                    reject(error);
                } finally {
                    Object.assign(console, الأصل);
                }
            });
            الناتج.className = "output-code success";
        } catch (خطأ_التنفيذ) {
            await عرض_النتيجة(
                `خطأ أثناء التنفيذ: ${خطأ_التنفيذ.message}`,
                "error"
            );
        }
    } catch (خطأ) {
        await عرض_النتيجة(`حدث خطأ: ${خطأ.message}`, "error");
    }
}

async function عرض_النتيجة(نص, نوع) {
    الناتج.innerHTML = "";
    if (
        نص instanceof DocumentFragment ||
        (typeof نص === "string" && نص.includes("[object DocumentFragment]"))
    )
        return;
    if (نص instanceof Promise) {
        try {
            return عرض_النتيجة(await نص, نوع);
        } catch (error) {
            return عرض_النتيجة(`${error}`, "error");
        }
    }
    const append = (content) => {
        const div = document.createElement("div");
        div.className = "output-content";
        div.textContent = content;
        الناتج.appendChild(div);
    };
    if (Array.isArray(نص)) {
        if (!نص.length) append("");
        else
            نص.forEach((item) =>
                append(
                    typeof item === "object" && item !== null
                        ? JSON.stringify(item, null, 2)
                        : item ?? ""
                )
            );
    } else {
        let text = نص;
        if (نص === null || نص === undefined) text = "";
        else if (typeof نص === "object") {
            try {
                text = JSON.stringify(نص, null, 2);
            } catch {
                text = String(نص);
            }
        }
        String(text)
            .split("\n")
            .forEach((line) => {
                if (line.trim() !== "" || text.split("\n").length === 1)
                    append(line);
            });
    }
    الناتج.className = `output-code ${نوع}`;
    const placeholder = الناتج.querySelector(".placeholder");
    if (placeholder) placeholder.remove();
}
