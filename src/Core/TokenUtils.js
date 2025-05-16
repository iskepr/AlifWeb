export let المؤشر = 0;
export function إعادة_تعيين_المؤشر() {
    المؤشر = 0;
}

export function احصل(الرموز) {
    if (!الرموز || !Array.isArray(الرموز)) {
        throw new Error('الرموز غير معرفة أو غير صحيحة "احصل" ' + الرموز);
    }
    if (المؤشر >= الرموز.length) {
        return null;
    }
    return الرموز[المؤشر];
}

export function التالي(الرموز) {
    if (!الرموز || !Array.isArray(الرموز)) {
        throw new Error('الرموز غير معرفة أو غير صحيحة " التالي " ' + الرموز);
    }
    المؤشر++;
    return احصل(الرموز);
}

export function السابق(الرموز) {
    if (!الرموز || !Array.isArray(الرموز)) {
        throw new Error('الرموز غير معرفة أو غير صحيحة " السابق " ' + الرموز);
    }
    المؤشر--;
    return احصل(الرموز);
}

export function تحقق(الرموز, النوع, القيمة = null) {
    const الرمز = احصل(الرموز);
    if (!الرمز) return false;
    if (النوع && الرمز.النوع !== النوع) return false;
    if (القيمة !== null && (!الرمز.القيمة || الرمز.القيمة !== القيمة))
        return false;
    return true;
}

export function تطابق(الرموز, النوع, القيمة = null) {
    if (تحقق(الرموز, النوع, القيمة)) {
        const الرمز = احصل(الرموز);
        التالي(الرموز);
        return الرمز;
    }
    return null;
}
