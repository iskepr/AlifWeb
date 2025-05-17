import { منشئ_عام_للاقواس } from "./Core/Statements/AlifGeneral.js";
import { منشئ_متغير, منشئ_متغير_مجمع } from "./Core/Statements/AlifVariable.js";
import { منشئ_لاجل } from "./Core/Statements/AlifFor.js";
import { منشئ_بينما } from "./Core/Statements/AlifWhile.js";
import { منشئ_دالة } from "./Core/Statements/AlifFunction.js";
import { منشئ_اذا } from "./Core/Statements/AlifIF.js";
import { منشئ_عمليات } from "./Core/Statements/AlifOperations.js";
import { منشئ_عام_الواجهة } from "./Core/Statements/AlifUI.js";

export function إنشاء_الشفرة(
    ast,
    مستوى = 0,
    عداد = { قيمة: 0 },
    داخل_برنامج = false
) {
    const مولدات = {
        برنامج: (عقدة) => {
            const كود = عقدة.جمل
                .map((ج) => إنشاء_الشفرة(ج, مستوى, عداد, true))
                .join("\n");
            return `const __fragment = document.createDocumentFragment();
                    const التصميم = document.createElement("style");
                        التصميم.textContent = \`
                        * {padding: 0; margin: 0; box-sizing: border-box;}
                        \`;
                        document.head.appendChild(التصميم);
                    ${كود}
                document.body.appendChild(__fragment);`;
        },

        متغير: (عقدة) => منشئ_متغير(مستوى, عداد, عقدة),
        متغير_مجمع: (عقدة) => منشئ_متغير_مجمع(مستوى, عداد, عقدة),

        اطبع: منشئ_عام_للاقواس(مستوى, عداد, "console.log"),
        ادخل: منشئ_عام_للاقواس(مستوى, عداد, "prompt"),
        طول: منشئ_عام_للاقواس(مستوى, عداد, "Object.keys", { اضافة: ".length" }),
        اقصى: منشئ_عام_للاقواس(مستوى, عداد, "Math.max", { عداد_مصوفة: true }),
        ادنى: منشئ_عام_للاقواس(مستوى, عداد, "Math.min", { عداد_مصوفة: true }),
        اشعار: منشئ_عام_للاقواس(مستوى, عداد, "alert"),
        صحيح: منشئ_عام_للاقواس(مستوى, عداد, "parseInt"),
        عشري: (عقدة) => {
            const vals = عقدة.قيم.map((v) => إنشاء_الشفرة(v, مستوى, عداد));
            let القيمة;
            if (vals[0] == '"لانهائي"') {
                القيمة = "Infinity";
            } else if (vals[0] == '"-لانهائي"') {
                القيمة = "-Infinity";
            } else {
                القيمة = vals.join(", ");
            }
            return `parseFloat(${القيمة})`;
        },
        مصفوفة: منشئ_عام_للاقواس(مستوى, عداد, "JSON.parse", {
            هل_مصفوفة: true,
        }),

        // جلب: (عقدة) => {
        //     const القيم = عقدة.قيم.map((v) => إنشاء_الشفرة(v, مستوى, عداد));
        //     if (القيم[0] == "\"جسون\"") {
        //         return `getData();
        //         async function getData() {
        //             try {
        //                 const response = await fetch(القيم[1]);  // استدعاء الـ API
        //                 const data = await response.json(); // تحويل الاستجابة إلى JSON
        //                 return data; // إرجاع البيانات
        //             } catch (error) {
        //                 console.error(error);
        //             }
        //         }`;
        //     } else {
        //         return `fetch(${القيم[1]})`;
        //     }
        // },

        اضف: (عقدة) => {
            const قيم = عقدة.قيم
                .map((القيمة) => `${إنشاء_الشفرة(القيمة, 0, عداد)}`)
                .join(", ");
            return `${عقدة.المتغير}.push(${قيم});`;
        },
        امسح: (عقدة) => {
            const قيم = عقدة.قيم
                .map((القيمة) => `${إنشاء_الشفرة(القيمة, 0, عداد)}`)
                .join(", ");
            return `const index = ${عقدة.المتغير}.indexOf(${قيم});if (index > -1) {${عقدة.المتغير}.splice(index, 1);}`;
        },
        ادرج: (عقدة) => {
            const قيم = عقدة.قيم.map((القيمة) => إنشاء_الشفرة(القيمة, 0, عداد));
            return `${عقدة.المتغير}.splice(${قيم[0]}, 0, ${قيم[1]});`;
        },
        مفاتيح: (عقدة) => {
            return `Object.keys(${عقدة.المتغير})`;
        },

        ارجع: (عقدة) => `return ${إنشاء_الشفرة(عقدة.قيمة, مستوى, عداد)};`,
        استورد: (عقدة) => `import "${إنشاء_الشفرة(عقدة.قيمة, مستوى, عداد)}";`,
        احذف: (عقدة) => `${إنشاء_الشفرة(عقدة.قيمة, مستوى, عداد)} = undefined;`,
        عام: () => ``,
        استمر: () => `continue;`,
        توقف: () => `break;`,
        صح: () => `true`,
        خطأ: () => `false`,
        عدم: () => `null`,

        لاجل: (عقدة) => منشئ_لاجل(مستوى, عداد, عقدة, داخل_برنامج),
        بينما: (عقدة) => منشئ_بينما(مستوى, عداد, عقدة, داخل_برنامج),
        دالة: (عقدة) => منشئ_دالة(مستوى, عداد, عقدة, داخل_برنامج),
        اذا: (عقدة) => منشئ_اذا(مستوى, عداد, عقدة, داخل_برنامج),

        قيمة: (عقدة) => {
            const v = عقدة.قيمة;
            if (typeof v === "boolean") return v ? "صح" : "خطا";
            if (v === null) return "عدم";
            if (!isNaN(v)) return v;
            return v;
        },
        معرف: (عقدة) => `${عقدة.اسم}`,
        عملية: (عقدة) => منشئ_عمليات(عقدة, مستوى, عداد),
        تعابيرات: (عقدة) => {
            const list = عقدة.قيم
                .map((v) => إنشاء_الشفرة(v, 0, عداد))
                .join(", ");
            return `[${list}]`;
        },
        فهرس: (عقدة) => {
            const props = عقدة.خصائص
                .map(
                    ({ المفتاح, القيمة }) =>
                        `"${المفتاح}": ${إنشاء_الشفرة(القيمة, 0, عداد)}`
                )
                .join(", ");
            return `{${props}}`;
        },
        قائمة: (عقدة) => {
            const قيم = عقدة.قيم
                .map((القيمة) => `${إنشاء_الشفرة(القيمة, 0, عداد)}`)
                .join(", ");
            return `[${قيم}]`;
        },
        قائمة_اقواس: (عقدة) => {
            const قيم = عقدة.قيم
                .map((القيمة) => `${إنشاء_الشفرة(القيمة, 0, عداد)}`)
                .join(", ");
            return `(${قيم})`;
        },

        // دعم الفهرس المربع مثلا: مصفوفة[س]
        فهرس_عنصر: (عقدة) => {
            const list = إنشاء_الشفرة(عقدة.list, 0, عداد);
            const index = إنشاء_الشفرة(عقدة.index, 0, عداد);
            return `${list}[${index}]`;
        },

        // الواجهة
        صفحة: (عقدة) =>
            منشئ_عام_الواجهة(
                عقدة,
                عداد,
                "div",
                "height: 100vh; direction: rtl;"
            ),

        نص: (عقدة) => منشئ_عام_الواجهة(عقدة, عداد, "p"),
        رابط: (عقدة) => منشئ_عام_الواجهة(عقدة, عداد, "a"),

        عمودي: (عقدة) =>
            منشئ_عام_الواجهة(
                عقدة,
                عداد,
                "div",
                "display:flex; flex-direction:column;"
            ),
        رأسي: (عقدة) =>
            منشئ_عام_الواجهة(
                عقدة,
                عداد,
                "div",
                "display:flex; flex-direction:row;"
            ),
        توسيط: (عقدة) =>
            منشئ_عام_الواجهة(
                عقدة,
                عداد,
                "div",
                "display:flex; align-items: center; justify-content: center;"
            ),
        بطاقة: (عقدة) =>
            منشئ_عام_الواجهة(
                عقدة,
                عداد,
                "div",
                "margin: 10px; padding: 10px; border-radius: 10px; backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); background-color: #ffffff05;"
            ),
        رأسي: (عقدة) =>
            منشئ_عام_الواجهة(
                عقدة,
                عداد,
                "div",
                "display:flex; flex-direction:row;"
            ),
        توسيط: (عقدة) =>
            منشئ_عام_الواجهة(
                عقدة,
                عداد,
                "div",
                "display:flex; align-items: center; justify-content: center;"
            ),
        بطاقة: (عقدة) =>
            منشئ_عام_الواجهة(
                عقدة,
                عداد,
                "div",
                "margin: 10px; padding: 10px; border-radius: 10px; backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); background-color: #ffffff05;"
            ),
    };

    const مولد = مولدات[ast.نوع];
    if (!مولد) {
        const error = new Error(`"${ast.رمز.القيمة}" غير معروف`);
        error.line = `في السطر ` + ast.رمز?.السطر;
        throw error;
    }
    const خطوط = مولد(ast).split("\n");
    return خطوط.map((خط) => `${خط}`).join("\n");
}
