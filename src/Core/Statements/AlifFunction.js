import { احصل, التالي, تحقق, تطابق } from "../TokenUtils.js";
import { إدارة_المسافة_البادئة } from "../Indentation.js";
import { إنشاء_الشفرة } from "../../AlifGenerator.js";
import { محلل_الجملة } from "../../AlifParser.js";
import { رمي_خطأ } from "../AlifErrors.js";

let ذاكرة_الدوال = [];

export function محلل_دالة(الرموز) {
    تطابق(الرموز, "كلمة", "دالة");

    let اسم;

    if (تحقق(الرموز, "كلمة", "_تهيئة_")) {
        اسم = تطابق(الرموز, "كلمة", "_تهيئة_");
    } else {
        اسم = تطابق(الرموز, "معرف");
    }
    if (!اسم) رمي_خطأ("لا يوجد اسم للدالة", الرموز);

    ذاكرة_الدوال.push(اسم.القيمة);

    تطابق(الرموز, "اقواس", "(");
    const معاملات = [];
    while (!تحقق(الرموز, "اقواس", ")")) {
        if (تحقق(الرموز, "معرف")) {
            const اسم_المعرف = احصل(الرموز).القيمة;
            التالي(الرموز);

            if (تحقق(الرموز, "علامة_إسناد")) {
                التالي(الرموز);
                const قيمة = محلل_الجملة(الرموز);
                if (قيمة) {
                    معاملات.push({ اسم: اسم_المعرف, قيمة: قيمة.رمز.القيمة });
                }
            } else {
                معاملات.push({ قيمة: اسم_المعرف });
            }
        } else {
            const قيمة = محلل_الجملة(الرموز);
            if (قيمة) معاملات.push({ قيمة: قيمة.القيمة });
        }
        if (تحقق(الرموز, "فاصلة")) التالي(الرموز);
    }
    if (!تطابق(الرموز, "اقواس", ")")) رمي_خطأ(`لم يتم اغلاق القوس ")"`, الرموز);
    if (!تطابق(الرموز, "نقطتان")) رمي_خطأ(`توقعت ":" بعد تعريف الدالة`, الرموز);

    const اوامر = إدارة_المسافة_البادئة(الرموز, "دالة");
    if (!تحقق(الرموز, "مسافة")) {
        return { نوع: "دالة", اسم: اسم.القيمة, معاملات, اوامر };
    }
    return {
        نوع: "دالة",
        اسم: اسم.القيمة,
        معاملات,
        اوامر,
    };
}

export function منشئ_دالة(مستوى, عداد, عقدة, داخل_برنامج) {
    const اسم = عقدة.اسم;
    const معاملات = Array.isArray(عقدة.معاملات)
        ? عقدة.معاملات
              .map((م) => {
                  if (م.اسم) {
                      return `${م.اسم} = ${م.قيمة}`;
                  }
                  return م.قيمة;
              })
              .join(", ")
        : "خطأ";
    const اوامر = عقدة.اوامر
        .map((ج) => إنشاء_الشفرة(ج, مستوى + 1, عداد, داخل_برنامج))
        .join("\n");

    // الدوال داخل صنف
    if (اسم === "_تهيئة_") return `constructor (${معاملات}) {\n${اوامر}\n}`;

    return `function ${اسم}(${معاملات}) {\n${اوامر}\n}`;
}

export function محلل_إستدعاء_دالة(الرموز) {
    const اسم = تطابق(الرموز, "معرف").القيمة;
    if (!ذاكرة_الدوال.includes(اسم))
        رمي_خطأ(`الدالة "${اسم}" غير موجودة`, الرموز);

    تطابق(الرموز, "اقواس", "(");
    const معاملات = [];
    while (!تحقق(الرموز, "اقواس", ")")) {
        if (تحقق(الرموز, "معرف")) {
            const اسم_المعرف = احصل(الرموز).القيمة;
            التالي(الرموز);

            معاملات.push({ قيمة: اسم_المعرف });
        } else if (تحقق(الرموز, "رقم")) {
            const قيمة = احصل(الرموز).القيمة;
            التالي(الرموز);
            معاملات.push({ قيمة });
        } else {
            const قيمة = محلل_الجملة(الرموز);
            if (قيمة) معاملات.push(قيمة);
        }
        if (تحقق(الرموز, "فاصلة")) التالي(الرموز);
    }
    if (!تطابق(الرموز, "اقواس", ")")) رمي_خطأ(`لم يتم اغلاق القوس ")"`, الرموز);
    return {
        نوع: "استدعاء_دالة",
        اسم,
        معاملات,
    };
}

export function منشئ_استدعاء_دالة(عقدة) {
    const اسم = عقدة.اسم;
    const معاملات = Array.isArray(عقدة.معاملات)
        ? عقدة.معاملات
              .map((م) => {
                  if (typeof م === "object" && م !== null) {
                      if (م.نوع && Array.isArray(م.قيم)) {
                          return إنشاء_الشفرة(م);
                      } else if (م.قيمة !== undefined) {
                          return م.قيمة;
                      }
                      return "";
                  }
                  return م;
              })
              .join(", ")
        : "خطأ";
    return `${اسم}(${معاملات})`;
}
