import { منشئ_عام_للاقواس } from "./Core/Statements/AlifGeneral.js";
import { منشئ_متغير, منشئ_متغير_مجمع } from "./Core/Statements/AlifVariable.js";
import { منشئ_لاجل } from "./Core/Statements/AlifFor.js";
import { منشئ_بينما } from "./Core/Statements/AlifWhile.js";
import { منشئ_دالة } from "./Core/Statements/AlifFunction.js";
import { منشئ_اذا } from "./Core/Statements/AlifIF.js";
import { منشئ_عمليات } from "./Core/Statements/AlifOperations.js";

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
        عشري: منشئ_عام_للاقواس(مستوى, عداد, "parseFloat"),
        مصفوفة: منشئ_عام_للاقواس(مستوى, عداد, "JSON.parse"),

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
            if (!عقدة?.المتغير || !عقدة?.قيمة) {
                console.error("خطأ: المتغير أو القيمة غير معرّفة");
                return "// خطأ: المتغير أو القيمة غير معرّفة";
            }
            return `${إنشاء_الشفرة(
                عقدة.المتغير,
                مستوى,
                عداد
            )}.push(${إنشاء_الشفرة(عقدة.قيمة, مستوى, عداد)});`;
        },
        امسح: (عقدة) => {
            if (!عقدة?.المتغير || !عقدة?.قيمة) {
                console.error("خطأ: المتغير أو القيمة غير معرّفة");
                return "// خطأ: المتغير أو القيمة غير معرّفة";
            }
            return `const index = ${إنشاء_الشفرة(
                عقدة.المتغير,
                مستوى,
                عداد
            )}.indexOf(${إنشاء_الشفرة(
                عقدة.قيمة,
                مستوى,
                عداد
            )});if (index > -1) {${إنشاء_الشفرة(
                عقدة.المتغير,
                مستوى,
                عداد
            )}.splice(index, 1);}`;
        },
        ادرج: (عقدة) => {
            if (!عقدة?.المتغير || !عقدة?.موقع || !عقدة?.قيمة) {
                console.error("خطأ: المتغير أو الموقع أو القيمة غير معرّفة");
                return "// خطأ: المتغير أو الموقع أو القيمة غير معرّفة";
            }
            return `${إنشاء_الشفرة(
                عقدة.المتغير,
                مستوى,
                عداد
            )}.splice(${إنشاء_الشفرة(
                عقدة.موقع,
                مستوى,
                عداد
            )}, 0, ${إنشاء_الشفرة(عقدة.قيمة, مستوى, عداد)});`;
        },
        مفاتيح: (عقدة) => {
            if (!عقدة?.المتغير || !عقدة?.قيمة) {
                console.error("خطأ: المتغير أو القيمة غير معرّفة");
                return "// خطأ: المتغير أو القيمة غير معرّفة";
            }
            return `Object.keys(${إنشاء_الشفرة(عقدة.المتغير, مستوى, عداد)})`;
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
        عملية: (عقدة) => منشئ_عمليات(عقدة),
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

        // الواجه
        صفحة: (عقدة) => {
            عداد.قيمة++;
            const قيم = عقدة.قيم.map(({ القيمة }) =>
                إنشاء_الشفرة(القيمة, 0, عداد)
            );
            const اسم = `عنصر${عداد.قيمة}`;
            const البيانات = `
            document.title = ${قيم[0]};
            const الشعار = document.createElement("link");
            الشعار.rel = "icon";
            الشعار.href = ${قيم[1]};
            document.head.appendChild(الشعار);
            `;
            const تعريف = `const ${اسم} = document.createElement("div");`;
            const تصميم = `${اسم}.style = "height: 100vh; direction: rtl;" + ${قيم[2]};`;
            const العناصر = عقدة.اوامر
                .map((عنصر) => {
                    const كود = إنشاء_الشفرة(عنصر, 0, عداد);
                    return كود.replace(/__fragment/g, اسم);
                })
                .join("\n\t");
            const تجميع = `__fragment.appendChild(${اسم});`;
            return [البيانات, تعريف, تصميم, العناصر, تجميع].join("\n\t");
        },
        نص: (عقدة) => {
            عداد.قيمة++;
            const قيم = عقدة.قيم.map(({ القيمة }) =>
                إنشاء_الشفرة(القيمة, 0, عداد)
            );
            const اسم = `عنصر${عداد.قيمة}`;
            const سطر1 = `const ${اسم} = document.createElement("p");`;
            const سطر2 = `${اسم}.innerHTML = ${قيم[0]};`;
            const سطر3 = `${اسم}.style = ${قيم[1]};`;
            const سطر4 = `__fragment.appendChild(${اسم});`;
            return [سطر1, سطر2, سطر3, سطر4].join("\n\t");
        },
        رابط: (عقدة) => {
            عداد.قيمة++;
            const قيم = عقدة.قيم.map(({ القيمة }) =>
                إنشاء_الشفرة(القيمة, 0, عداد)
            );
            const اسم = `عنصر${عداد.قيمة}`;
            const سطر1 = `const ${اسم} = document.createElement("a");`;
            const سطر2 = `${اسم}.innerHTML = ${قيم[0]};`;
            const سطر3 = `${اسم}.href = ${قيم[1]};`;
            const سطر4 = `${اسم}.style = ${قيم[2]};`;
            const سطر5 = `__fragment.appendChild(${اسم});`;
            return [سطر1, سطر2, سطر3, سطر4, سطر5].join("\n\t");
        },
        عمودي: (عقدة) => {
            عداد.قيمة++;
            const قيم = عقدة.قيم.map(({ القيمة }) =>
                إنشاء_الشفرة(القيمة, 0, عداد)
            );
            const اسم = `عنصر${عداد.قيمة}`;
            const تعريف = `const ${اسم} = document.createElement("div");`;
            const تصميم = `${اسم}.style = "display:flex; flex-direction:column;" + ${قيم[0]};`;
            const العناصر = عقدة.اوامر
                .map((عنصر) => {
                    const كود = إنشاء_الشفرة(عنصر, 0, عداد);
                    return كود.replace(/__fragment/g, اسم);
                })
                .join("\n\t");
            const تجميع = `__fragment.appendChild(${اسم});`;
            return [تعريف, تصميم, العناصر, تجميع].join("\n\t");
        },
        رأسي: (عقدة) => {
            عداد.قيمة++;
            const قيم = عقدة.قيم.map(({ القيمة }) =>
                إنشاء_الشفرة(القيمة, 0, عداد)
            );
            const اسم = `عنصر${عداد.قيمة}`;
            const تعريف = `const ${اسم} = document.createElement("div");`;
            const تصميم = `${اسم}.style = "display:flex; flex-direction:row;" + ${قيم[0]};`;
            const العناصر = عقدة.اوامر
                .map((عنصر) => {
                    const كود = إنشاء_الشفرة(عنصر, 0, عداد);
                    return كود.replace(/__fragment/g, اسم);
                })
                .join("\n\t");
            const تجميع = `__fragment.appendChild(${اسم});`;
            return [تعريف, تصميم, العناصر, تجميع].join("\n\t");
        },
        توسيط: (عقدة) => {
            عداد.قيمة++;
            const قيم = عقدة.قيم.map(({ القيمة }) =>
                إنشاء_الشفرة(القيمة, 0, عداد)
            );
            const اسم = `عنصر${عداد.قيمة}`;
            const تعريف = `const ${اسم} = document.createElement("div");`;
            const تصميم = `${اسم}.style = "display:flex; align-items: center; justify-content: center;" + ${قيم[0]};`;
            const العناصر = عقدة.اوامر
                .map((عنصر) => {
                    const كود = إنشاء_الشفرة(عنصر, 0, عداد);
                    return كود.replace(/__fragment/g, اسم);
                })
                .join("\n\t");
            const تجميع = `__fragment.appendChild(${اسم});`;
            return [تعريف, تصميم, العناصر, تجميع].join("\n\t");
        },
        بطاقة: (عقدة) => {
            عداد.قيمة++;
            const قيم = عقدة.قيم.map(({ القيمة }) =>
                إنشاء_الشفرة(القيمة, 0, عداد)
            );
            const اسم = `عنصر${عداد.قيمة}`;
            const تعريف = `const ${اسم} = document.createElement("div");`;
            const تصميم = `${اسم}.style = "margin: 10px; padding: 10px; border-radius: 10px; backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); background-color: #ffffff05;" + ${قيم[0]};`;
            const العناصر = عقدة.اوامر
                .map((عنصر) => {
                    const كود = إنشاء_الشفرة(عنصر, 0, عداد);
                    return كود.replace(/__fragment/g, اسم);
                })
                .join("\n\t");
            const تجميع = `__fragment.appendChild(${اسم});`;
            return [تعريف, تصميم, العناصر, تجميع].join("\n\t");
        },
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
