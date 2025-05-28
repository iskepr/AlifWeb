import { محلل_التعبير } from "../Expressions.js";
import { احصل, التالي, تحقق, تطابق } from "../TokenUtils.js";

export function محلل_استورد(الرموز) {
    if (!الرموز || !Array.isArray(الرموز)) {
        throw new Error(
            'الرموز غير معرفة أو غير صحيحة "محلل_استورد" ' + الرموز
        );
    }
    تطابق(الرموز, "كلمة", "استورد");
    if (تحقق(الرموز, "معرف", "واجهة")) {
        التالي(الرموز);
        return { نوع: "استورد", قيمة: "واجهة" };
    } else if (تحقق(الرموز, "كلمة", "الوقت")) {
        التالي(الرموز);
        return { نوع: "استورد", قيمة: null };
    } else if (تحقق(الرموز, "كلمة")) {
        const قيمة = احصل(الرموز).القيمة;
        التالي(الرموز);
        return { نوع: "استورد", قيمة };
    } else {
        const قيمة = محلل_التعبير(الرموز);
        return { نوع: "استورد", قيمة };
    }
}

export function منشئ_استورد(عقدة, مستوى, عداد) {
    if (عقدة.قيمة == null) {
        return "";
    } else if (عقدة.قيمة == "واجهة") {
        return `const __fragment = document.getElementById("root");
                    const التصميم = document.createElement("style");
                    التصميم.textContent = \`* {padding: 0; margin: 0; box-sizing: border-box;}\`;
                    document.head.appendChild(التصميم);`;
    } else if (عقدة.قيمة == "الرياضيات") {
        return `function المضروب(رقم) {
                        if (رقم < 0) return undefined;
                        if (رقم === 0 || رقم === 1) return 1;
                        let الناتج = 1;
                        for (let i = 2; i <= رقم; i++) {
                            الناتج *= i;
                        }
                        return الناتج;
                    }
                    function مسافة(نقطة1, نقطة2) {
                        return Math.sqrt((نقطة2[0] - نقطة1[0]) ** 2 + (نقطة2[1] - نقطة1[1]) ** 2);
                    }`;
    } else {
        return `import "${عقدة.قيمة}";`;
    }
}
