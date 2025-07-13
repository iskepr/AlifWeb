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
    const كود_مترجم = إنشاء_الشفرة(محلل_الرموز(تحليل_الشفرة(شفرة_الملف)));
    return كود_مترجم.slice(520, -30);
}
