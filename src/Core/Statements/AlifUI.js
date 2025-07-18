import { احصل, التالي, تحقق, تطابق } from "../TokenUtils.js";
import { محلل_التعبير } from "../Expressions.js";
import { إدارة_المسافة_البادئة } from "../Indentation.js";
import { إنشاء_الشفرة } from "../../AlifGenerator.js";
import { رمي_خطأ } from "../AlifErrors.js";

export function محلل_الواجهة(الرموز, الدالة_الام, الكلمة) {
    تطابق(الرموز, "كلمة", الكلمة);
    تطابق(الرموز, "اقواس", "(");
    const قيم = [];
    // تخطي المسافات والاسطر الفارغة
    while (تحقق(الرموز, "مسافة") || تحقق(الرموز, "سطر_جديد")) التالي(الرموز);

    while (!تحقق(الرموز, "اقواس", ")")) {
        while (تحقق(الرموز, "مسافة") || تحقق(الرموز, "سطر_جديد"))
            التالي(الرموز);

        let المفتاح;
        if (تحقق(الرموز, "نص")) {
            const رمز_المفتاح = تطابق(الرموز, "نص");
            المفتاح = رمز_المفتاح.القيمة.slice(1, -1);
        } else if (تحقق(الرموز, "معرف")) {
            const رمز_المفتاح = تطابق(الرموز, "معرف");
            المفتاح = رمز_المفتاح.القيمة;
        } else رمي_خطأ(`لا مفتاح في فهرس قبل ":"`, الرموز, الدالة_الام);

        if (!تطابق(الرموز, "نقطتان"))
            رمي_خطأ(`توقعت ":" بعد تعريف الصنف`, الرموز, الدالة_الام);

        const القيمة = محلل_التعبير(الرموز, الدالة_الام);
        if (!القيمة)
            رمي_خطأ(`خطأ في تحليل القيمة داخل الأقواس`, الرموز, الدالة_الام);

        قيم.push({ المفتاح, القيمة });
        if (تحقق(الرموز, "فاصلة")) التالي(الرموز);
    }
    if (!تطابق(الرموز, "اقواس", ")"))
        رمي_خطأ(`لم يتم اغلاق القوس ")" بعد "${الكلمة}"`, الرموز, الدالة_الام);
    if (تطابق(الرموز, "نقطتان")) {
        const اوامر = إدارة_المسافة_البادئة(الرموز, الدالة_الام, الكلمة);
        if (!تحقق(الرموز, "مسافة")) {
            return { نوع: الكلمة, قيم, اوامر };
        }
        return { نوع: الكلمة, قيم, اوامر };
    }
    return { نوع: الكلمة, قيم };
}

export function منشئ_عام_الواجهة(عقدة, عداد, نوع = "div", التصميم) {
    عداد.قيمة++;
    const اسم = `عنصر${عداد.قيمة}`;
    const سطور = [`const ${اسم} = document.createElement("${نوع}");`];

    // لو نوعه صوت، ضيف controls
    if (نوع === "audio") سطور.push(`${اسم}.controls = true;`);

    // إضافة التصميم
    if (التصميم) سطور.push(`${اسم}.style = "${التصميم}";`);

    عقدة.قيم.forEach(({ المفتاح, القيمة }) => {
        const قيمة = القيمة.قيمة
            ? القيمة.قيمة
            : القيمة.اسم
            ? القيمة.اسم
            : إنشاء_الشفرة(القيمة);

        if (!قيمة) return;
        switch (المفتاح) {
            case "النص":
                سطور.push(`${اسم}.innerHTML = ${قيمة};`);
                break;
            case "اللون":
                سطور.push(`${اسم}.style.color = ${قيمة};`);
                break;
            case "الخلفية":
                سطور.push(`${اسم}.style.backgroundColor = ${قيمة};`);
                break;
            case "الرابط":
                سطور.push(`${اسم}.href = ${قيمة};`);
                break;
            case "التصميم":
                سطور.push(`${اسم}.style.cssText += ${قيمة};`);
                break;
            case "العنوان":
                سطور.push(`document.title = ${قيمة};`);
                break;
            case "الشعار":
                سطور.push(`const الشعار = document.createElement("link");
                                الشعار.rel = "icon";
                                الشعار.href = ${قيمة};
                                document.head.appendChild(الشعار);`);
                break;
            case "المصدر":
                if (نوع === "audio")
                    سطور.push(`const مصدر${عداد.قيمة} = document.createElement("source");
                                مصدر${عداد.قيمة}.src = ${قيمة};
                                مصدر${عداد.قيمة}.type = "audio/mpeg";
                                ${اسم}.appendChild(مصدر${عداد.قيمة});`);
                else سطور.push(`${اسم}.src = ${قيمة};`);
                break;
            default:
                سطور.push(`${اسم}.setAttribute("${المفتاح}", ${قيمة});`);
        }
    });

    if (عقدة.اوامر) {
        عقدة.اوامر.forEach((عنصر) => {
            const كود = إنشاء_الشفرة(عنصر, 0, عداد).replace(/__fragment/g, اسم);
            سطور.push(كود);
        });
    }
    سطور.push(`__fragment.appendChild(${اسم});`);
    return سطور.join("\n\t");
}

export function دوال_استيراد_الواجهة() {
    return `const __fragment = document.getElementById("root");
                    const التصميم = document.createElement("style");
                    التصميم.textContent = \`* {padding: 0; margin: 0; box-sizing: border-box;}\`;
                    document.head.appendChild(التصميم);`;
}
