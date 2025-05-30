export function منشئ_اشعار(عقدة) {
    const عنوان = عقدة.قيم.find((e) => e["المفتاح"] === "العنوان")?.["القيمة"]
        .قيمة;
    const محتوى = عقدة.قيم.find((e) => e["المفتاح"] === "المحتوى")?.["القيمة"]
        .قيمة;
    const شعار = عقدة.قيم.find((e) => e["المفتاح"] === "الشعار")?.["القيمة"]
        .قيمة;
    const أمر_عند_الضغط = عقدة.قيم.find((e) => e["المفتاح"] === "عند_الضغط")?.[
        "القيمة"
    ].قيمة;
    return `
        if ("Notification" in window) {
            Notification.requestPermission().then(function (permission) {
            if (permission === "granted") {
                const notification = new Notification(
                ${عنوان}, {
                body: ${محتوى},
                icon: ${شعار}
                });
                notification.onclick = function () {
                ${أمر_عند_الضغط.replaceAll('"', "")}
                };
            } else {
                console.error("المستخدم رفض الإشعارات");
            }
            });
        } else {
            console.error("المتصفح لا يدعم الإشعارات");
        }`;
}
