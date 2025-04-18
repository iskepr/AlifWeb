function تحليل_الشفرة(شفرة) {
    const كلمات = [
        "دالة",
        "اذا",
        "والا",
        "اواذا",
        "بينما",
        "لاجل",
        "في",
        "ارجع",
        "توقف",
        "استمر",
        "صح",
        "خطا",
        "عدم",
        "و",
        "او",
        "ليس",
        "صنف",
        "استورد",
        "من",
        "لاجل",
        "اطبع",
        "نص",
    ];

    const نمط_الرموز = [
        { النوع: "مسافة", regex: /^[ \t]+/ },
        { النوع: "تعليق", regex: /^#.*\n?/ },
        { النوع: "سطر_جديد", regex: /^\n/ },
        {
            النوع: "معرف",
            regex: /^[a-zA-Z\u0600-\u06FF_][a-zA-Z0-9\u0600-\u06FF_]*/,
        },
        { النوع: "رقم", regex: /^\d+(\.\d+)?/ },
        { النوع: "نص", regex: /^(['"])(.*?)\1/ },
        {
            النوع: "رمز_حسابي",
            regex: /^(==|!=|<=|>=|<|>|\+|\-|\*|\\|\\\\|\*\\|\^|\^\\|:|،)/,
        },
        { النوع: "اقواس", regex: /^(\(|\)|\[|\]|\{|\}|\.)/ },
        { النوع: "فاصلة", regex: /^,/ },
        { النوع: "علامة_إسناد", regex: /^=/ },
    ];

    let رموز = [];
    let سطر = 1;
    let التبويب_الحالي = 0;

    while (شفرة.length > 0) {
        let matched = false;

        // التعامل مع المسافات في بداية السطر
        if (/^[ \t]+/.test(شفرة)) {
            const المسافة = شفرة.match(/^[ \t]+/)[0];
            if (المسافة.length > 1) {
                رموز.push({ النوع: "مسافة", القيمة: المسافة, سطر });
            }
            شفرة = شفرة.slice(المسافة.length); // إزالة المسافة من الشفرة
        }

        for (const النمط of نمط_الرموز) {
            const match = شفرة.match(النمط.regex);
            if (match) {
                const القيمة = match[0];
                if (النمط.النوع === "تعليق") {
                    if (القيمة.includes("\n")) سطر++;
                } else if (النمط.النوع === "سطر_جديد") {
                    رموز.push({ النوع: "سطر_جديد", القيمة: "\n", سطر });
                    سطر++;
                } else if (النمط.النوع === "معرف" && كلمات.includes(القيمة)) {
                    رموز.push({ النوع: "كلمة", القيمة, سطر });
                } else {
                    رموز.push({ النوع: النمط.النوع, القيمة, سطر });
                }

                شفرة = شفرة.slice(القيمة.length);
                matched = true;
                break;
            }
        }

        if (!matched) {
            console.error(`رمز غير معروف في سطر ${سطر}: ${شفرة.slice(0, 10)}`);
        }
    }

    return رموز;
}

module.exports = { تحليل_الشفرة };
