import { احصل, التالي, السابق } from "./TokenUtils.js";

export function رمي_خطأ(الرسالة, الرموز) {
    const error = new Error(الرسالة);
    let السطر = احصل(الرموز);
    if (!السطر) {
        السابق(الرموز);
        السطر = احصل(الرموز);
        التالي(الرموز);
    }
    error.line = `في السطر ` + (السطر?.السطر || "غير معروف");
    throw error;
}
