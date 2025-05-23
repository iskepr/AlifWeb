import { احصل } from "./TokenUtils.js";

/**
 * دالة لإنشاء خطأ مع رسالة وسطر الخطأ
 * @param {string} الرسالة - رسالة الخطأ
 * @param {object} الرموز - كائن الرموز للحصول على رقم السطر
 * @throws {Error} - يرمي خطأ مع رسالة وسطر
 */
export function رمي_خطأ(الرسالة, الرموز) {
    const error = new Error(الرسالة);
    error.line = `في السطر ` + (احصل(الرموز)?.السطر || "غير معروف");
    throw error;
}
