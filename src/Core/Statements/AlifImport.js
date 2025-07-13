import { تحليل_الشفرة } from "../../AlifLexer.js";
import { محلل_الرموز } from "../../AlifParser.js";
import { إنشاء_الشفرة } from "../../AlifGenerator.js";

import { دوال_استيراد_الرياضيات } from "../Libraries/AlifMath.js";
import { دوال_استيراد_الوقت } from "../Libraries/AlifTime.js";
import {
    إعادة_تعيين_المؤشر,
    احصل,
    التالي,
    تحقق,
    تطابق,
} from "../TokenUtils.js";
import { دوال_استيراد_الواجهة } from "./AlifUI.js";

export function محلل_استورد(الرموز) {
    تطابق(الرموز, "كلمة", "استورد");

    let قيم = [];
    while (true) {
        قيم.push(احصل(الرموز).القيمة);
        التالي(الرموز);
        if (تحقق(الرموز, "نقطة")) التالي(الرموز);
        if (تحقق(الرموز, "سطر_جديد")) break;
    }
    return { نوع: "استورد", قيم };
}

let path, fs;
if (typeof window === "undefined")
    (async () => {
        path = (await import("path")).default;
        fs = (await import("fs")).default;
    })();
export function منشئ_استورد(عقدة) {
    if (عقدة.قيم.length == 0) return "";
    else if (عقدة.قيم[0] == "واجهة") return دوال_استيراد_الواجهة();
    else if (عقدة.قيم[0] == "الرياضيات") return دوال_استيراد_الرياضيات();
    else if (عقدة.قيم[0] == "الوقت") return دوال_استيراد_الوقت();

    const مسار_الملف = path.join(
        process.cwd(),
        ...عقدة.قيم.slice(0, -1),
        عقدة.قيم.at(-1) + ".aliflib"
    );
    const شفرة_الملف = fs.readFileSync(مسار_الملف, "utf8");

    إعادة_تعيين_المؤشر();
    const شفرة_مترجمة = إنشاء_الشفرة(
        محلل_الرموز(تحليل_الشفرة(شفرة_الملف))
    ).slice(520, -30);

    function استخراج_العامة(الشفرة) {
        const الدوال = [];
        const المتغيرات = [];
        let المستوى = 0;
        const السطور = الشفرة.split("\n");
        for (let سطر of السطور) {
            const نظيف = سطر.trim().replace(/\/\/.*$/g, "");
            if (المستوى === 0) {
                const تطابق_دالة = نظيف.match(
                    /^async\s+function\s+([a-zA-Z_\u0600-\u06FF][\w\u0600-\u06FF]*)|^function\s+([a-zA-Z_\u0600-\u06FF][\w\u0600-\u06FF]*)/
                );
                if (تطابق_دالة) {
                    الدوال.push(تطابق_دالة[1] || تطابق_دالة[2]);
                }
                const تطابق_متغير = نظيف.match(
                    /^(let|const|var)\s+([a-zA-Z_\u0600-\u06FF][\w\u0600-\u06FF]*)/
                );
                if (تطابق_متغير) {
                    المتغيرات.push(تطابق_متغير[2]);
                }
            }
            for (let حرف of سطر) {
                if (حرف === "{") المستوى++;
                if (حرف === "}") المستوى--;
            }
        }
        return { الدوال, المتغيرات };
    }
    const { الدوال, المتغيرات } = استخراج_العامة(شفرة_مترجمة);

    const الشفرة_المستردة = `
    function دالة_استيراد_${عقدة.قيم.at(-1)}() {
        ${شفرة_مترجمة}
        return { ${الدوال.join(", ")}, ${المتغيرات.join(", ")}};
    }
    const ${عقدة.قيم.at(-1)} = دالة_استيراد_${عقدة.قيم.at(-1)}();
    `;
    return الشفرة_المستردة;
}
