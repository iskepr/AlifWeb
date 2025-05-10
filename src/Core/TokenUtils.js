export let المؤشر = 0;

export function احصل(الرموز) {
    return الرموز[المؤشر];
}

export function التالي(الرموز) {
    المؤشر++;
    return احصل(الرموز, المؤشر);
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
