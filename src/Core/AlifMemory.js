export class AlifMemory {
    constructor() {
        this.ذاكرة_المتغيرات = new Map();
        this.ذاكرة_الدوال = new Map();
    }

    تهيئة_ذاكرة_المتغيرات(الدالة_الام) {
        // نحذف الاقواس المربعة
        let نص_منظف = الدالة_الام.trim();
        if (نص_منظف.startsWith("[") && نص_منظف.endsWith("]")) {
            نص_منظف = نص_منظف.slice(1, -1);
        }
        الدالة_الام = نص_منظف.split(" ,").map((s) => s.trim());

        const المفتاح = `[${الدالة_الام.join(" ,")}]`;

        if (!this.ذاكرة_المتغيرات.has(المفتاح)) {
            const الذاكرة_الجديدة = new Map();

            // ندمج المتغيرات من كل المستويات الأعلى بالتدريج
            for (let i = 1; i < الدالة_الام.length; i++) {
                const السياق_الاعلى = الدالة_الام.slice(i);
                const مفتاح_اعلى = `[${السياق_الاعلى.join(" ,")}]`;

                if (this.ذاكرة_المتغيرات.has(مفتاح_اعلى)) {
                    const ذاكرة_اعلى = this.ذاكرة_المتغيرات.get(مفتاح_اعلى);
                    for (const [key, value] of ذاكرة_اعلى.entries()) {
                        // عدم النسخ إلا اذا المتغير غير موجود
                        if (!الذاكرة_الجديدة.has(key)) {
                            الذاكرة_الجديدة.set(key, value);
                        }
                    }
                }
            }

            this.ذاكرة_المتغيرات.set(المفتاح, الذاكرة_الجديدة);
        }

        return this.ذاكرة_المتغيرات.get(المفتاح);
    }

    تحديد_نوع_المتغير(القيمة) {
        let نوع_القيمة;
        if (typeof القيمة !== "string") القيمة = String(القيمة);

        const نص_مقلم = القيمة.trim();
        const مصفوفة = نص_مقلم.startsWith("[") && نص_مقلم.endsWith("]");
        const فهرس = نص_مقلم.startsWith("{") && نص_مقلم.endsWith("}");
        const رقم = !isNaN(نص_مقلم) && نص_مقلم !== "";
        const نص =
            (نص_مقلم.startsWith('"') && نص_مقلم.endsWith('"')) ||
            (نص_مقلم.startsWith("'") && نص_مقلم.endsWith("'"));

        if (مصفوفة) نوع_القيمة = "مصفوفة";
        else if (فهرس) نوع_القيمة = "فهرس";
        else if (رقم) نوع_القيمة = "رقم";
        else if (نص) نوع_القيمة = "نص";
        else نوع_القيمة = "امر";

        return نوع_القيمة;
    }

    متغير_موجود(الدالة_الام, اسم_المتغير) {
        const الذاكرة = this.تهيئة_ذاكرة_المتغيرات(الدالة_الام);
        return الذاكرة.has(اسم_المتغير);
    }

    إضافة_متغير(الدالة_الام, اسم_المتغير, القيمة, نوع_القيمة = null) {
        const الذاكرة = this.تهيئة_ذاكرة_المتغيرات(الدالة_الام);
        if (!نوع_القيمة) {
            نوع_القيمة = this.تحديد_نوع_المتغير(القيمة);
        }
        الذاكرة.set(اسم_المتغير, { القيمة, نوع_القيمة });
    }

    تحديث_قيمة_المتغير(الدالة_الام, اسم_المتغير, القيمة) {
        const نوع_القيمة = this.تحديد_نوع_المتغير(القيمة);
        const الذاكرة = this.تهيئة_ذاكرة_المتغيرات(الدالة_الام);
        الذاكرة.set(اسم_المتغير, { القيمة, نوع_القيمة });
    }

    // نبحث في كل المستويات لكن نبدأ من الأدنى (البرنامج) للأعلى (مثلاً [اذا4, دالة2, برنامج])
    نوع_المتغير(اسم_المتغير) {
        for (const متغيرات of this.ذاكرة_المتغيرات.values()) {
            if (متغيرات.has(اسم_المتغير)) {
                return متغيرات.get(اسم_المتغير).نوع_القيمة;
            }
        }
        return null;
    }

    مسح_ذاكرة_المتغيرات(الدالة_الام) {
        if (typeof الدالة_الام === "string") {
            if (الدالة_الام.startsWith("[") && الدالة_الام.endsWith("]")) {
                الدالة_الام = الدالة_الام.slice(1, -1);
            }
            الدالة_الام = الدالة_الام.split(" ,").map((s) => s.trim());
        }
        const المفتاح = `[${الدالة_الام.join(" ,")}]`;
        this.ذاكرة_المتغيرات.delete(المفتاح);
    }

    مسح_الكل() {
        this.ذاكرة_المتغيرات.clear();
    }
}

export const ذاكرة = new AlifMemory();

export function حفظ_دالة(اسم, دالة) {
    ذاكرة.ذاكرة_الدوال.set(اسم, دالة);
}

export function جلب_دالة(اسم) {
    return ذاكرة.ذاكرة_الدوال.get(اسم);
}

export function تحديث_دالة(اسم, تحديث) {
    const الدالة_الحالية = جلب_دالة(اسم) || {};
    حفظ_دالة(اسم, { ...الدالة_الحالية, ...تحديث });
}

export function تحديث_ذاكرة_المتغير(الدالة_الام, اسم_المتغير, القيمة) {
    ذاكرة.تحديث_قيمة_المتغير(الدالة_الام, اسم_المتغير, القيمة);
}
