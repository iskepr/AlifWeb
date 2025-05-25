import fs from "fs";
import path from "path";
import { exec } from "child_process";
import readline from "readline";
import { createClient } from "@supabase/supabase-js";
import fetch from "node-fetch";
import { fileName } from "./alifweb";

const supabaseUrl = "https://gfyxjkwchsnczsmthpiw.supabase.co";
const supabaseKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmeXhqa3djaHNuY3pzbXRocGl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyODUyODUsImV4cCI6MjA1OTg2MTI4NX0.b40Gi7Jsk_XkJSW-W5OU8oXyQZMHLUfqVw0R09Njyj4";
const supabase = createClient(supabaseUrl, supabaseKey);

const isPkg = typeof process.pkg !== "undefined";
const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);
let alifDir = isPkg ? path.dirname(process.execPath) : __dirname;

// دالة النشر
export function pubLib() {
    checkGit();

    if (!fileName) {
        console.error("ادخل اسم المكتبة");
        process.exit(1);
    }

    const pkgPath = path.join(process.cwd(), "مكتبة.الف");
    if (!fs.existsSync(pkgPath)) {
        console.error('ملف "مكتبة.الف" غير موجود في المجلد');
        process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    const requiredFields = [
        "الاسم",
        "اسم_المستودع",
        "الاصدار",
        "الوصف",
        "الصورة",
        "المطور",
        "حساب_المطور",
    ];
    requiredFields.forEach((field) => {
        if (!Object.keys(data).includes(field)) {
            console.error(`الحقل "${field}" غير موجود في ملف مكتبة.الف`);
            process.exit(1);
        }
    });
    if (data["الاسم"].replaceAll(" ", "_") !== fileName) {
        console.error(
            `اسم المكتبة "${fileName}" لاكن بدل المسافة "_" يجب ان يكون مساوي لـ"الاسم" في ملف "مكتبة.الف"`
        );
        process.exit(1);
    }

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.question(
        "هل تم إنشاء مستودع على GitHub ورفع الملفات؟ (نعم/لا): ",
        (answer) => {
            if (answer === "نعم" || answer === "y") {
                // التحقق من وجود المستودع على GitHub
                const repoUrl = `https://github.com/${data["حساب_المطور"]}/${data["اسم_المستودع"]}`;
                exec(`git ls-remote ${repoUrl}`, (gitError, stdout, stderr) => {
                    if (gitError || stderr) {
                        console.error(
                            `تعذر الوصول إلى المستودع على GitHub: ${repoUrl}. تأكد من صحة الحساب واسم المستودع.`
                        );
                        process.exit(1);
                    } else {
                        console.log(
                            "تم التحقق من وجود المستودع على GitHub بنجاح."
                        );
                        // رفع الي قاعدة البيانات
                        const finalData = {
                            الاسم: data["الاسم"].replaceAll(" ", "_"),
                            اسم_المستودع: data["اسم_المستودع"],
                            الاصدار: data["الاصدار"],
                            الوصف: data["الوصف"],
                            الصورة: data["الصورة"],
                            المطور: data["المطور"],
                            حساب_المطور: data["حساب_المطور"],
                            المستودع: `https://github.com/${data["حساب_المطور"]}/${data["اسم_المستودع"]}/`,
                            التحميلات: 0,
                        };

                        supabase
                            .from("libraries")
                            .insert(finalData)
                            .then(({ error }) => {
                                if (error) {
                                    if (
                                        error.message.includes(
                                            "duplicate key"
                                        ) &&
                                        error.message.includes("الاسم")
                                    ) {
                                        console.error("يوجد مكتبة بنفس الاسم");
                                    } else if (
                                        error.message.includes(
                                            "duplicate key"
                                        ) &&
                                        error.message.includes("المستودع")
                                    ) {
                                        console.error(
                                            "المستودع موجود في مكتبة اخري"
                                        );
                                    } else {
                                        console.error(
                                            "حدث خطا اثناء رفع المكتبة",
                                            error
                                        );
                                    }
                                    process.exit(1);
                                } else {
                                    console.log("تم رفع المكتبة بنجاح!");
                                    process.exit(0);
                                }
                            });
                    }
                });
            } else if (answer === "لا" || answer === "n") {
                console.log(
                    "يرجى إنشاء مستودع على GitHub أولاً ثم إعادة المحاولة."
                );
            } else {
                console.error("رد ب نعم او لا");
            }
            rl.close();
        }
    );
}

// دالة التحميل
export function getLib() {
    async function install(fileName) {
        try {
            const libDir = path.join(alifDir, "libraries", fileName);
            // console.log(`مكان المكتبات: ${alifDir}`);

            await new Promise((resolve, reject) => {
                supabase
                    .from("libraries")
                    .select("*")
                    .eq("الاسم", fileName)
                    .then(({ data, error }) => {
                        if (error || !data || data.length === 0) {
                            reject(
                                `حدث خطأ: لم يتم العثور على المكتبة "${fileName}"`
                            );
                        } else {
                            const developer = data[0].حساب_المطور;
                            const repoName = data[0].اسم_المستودع;
                            // تحميل المكتبة من الجيت هاب
                            exec(
                                `npx degit ${developer}/${repoName} ${libDir}`,
                                (err) => {
                                    if (err) {
                                        if (
                                            String(err).includes(
                                                "destination directory is not empty"
                                            )
                                        ) {
                                            reject(
                                                `"المكتبة "${fileName}"  موجودة بالفعل`
                                            );
                                        } else {
                                            reject(`حدث خطأ: "${err}"`);
                                        }
                                    } else {
                                        //  زيادة عدد التحميلات
                                        const downloads = data[0].التحميلات + 1;
                                        supabase
                                            .from("libraries")
                                            .update({ التحميلات: downloads })
                                            .eq("الاسم", fileName)
                                            .then(({ error }) => {
                                                if (error) {
                                                    console.error(
                                                        "حدث خطأ أثناء تحديث عدد التحميلات:",
                                                        error
                                                    );
                                                }
                                            });
                                        console.log("تم تحميل المكتبة بنجاح!");
                                        resolve();
                                    }
                                }
                            );
                        }
                    });
            });
        } catch (error) {
            console.error(error);
        }
    }

    if (!fileName) {
        console.error("اكتب اسم المكتبة صح");
    } else {
        install(fileName);
    }
}
// دالة تحديث المكتبة
export function updateLib() {
    async function reinstall(fileName) {
        try {
            const libDir = path.join(alifDir, "libraries", fileName);

            if (!fs.existsSync(libDir)) {
                console.error(
                    `المكتبة غير موجودة حملها بكتابة "alif install ${fileName}"`
                );
                process.exit(1);
            }

            const libFile = path.join(libDir, "مكتبة.الف");
            let localVersion = null;

            if (fs.existsSync(libFile)) {
                const fileContent = JSON.parse(
                    fs.readFileSync(libFile, "utf8")
                );
                if (fileContent && fileContent["الاصدار"]) {
                    localVersion = fileContent["الاصدار"];
                }
            }

            await new Promise((resolve, reject) => {
                supabase
                    .from("libraries")
                    .select("*")
                    .eq("الاسم", fileName)
                    .then(({ data, error }) => {
                        if (error || !data || data.length === 0) {
                            reject(
                                `حدث خطأ: لم يتم العثور على المكتبة "${fileName}"`
                            );
                        } else {
                            const developer = data[0].حساب_المطور;
                            const repoName = data[0].اسم_المستودع;
                            const pubLibVer = data[0].الاصدار;
                            if (pubLibVer > localVersion) {
                                fs.rmSync(libDir, {
                                    recursive: true,
                                    force: true,
                                });
                                // تحميل المكتبة من الجيت هاب
                                exec(
                                    `npx degit ${developer}/${repoName} ${libDir}`,
                                    (err) => {
                                        if (err) {
                                            if (
                                                String(err).includes(
                                                    "destination directory is not empty"
                                                )
                                            ) {
                                                reject(
                                                    `المكتبة "${fileName}" موجودة بالفعل`
                                                );
                                            } else {
                                                reject(`حدث خطأ: "${err}"`);
                                            }
                                        } else {
                                            console.log(
                                                "تم تحديث المكتبة بنجاح!"
                                            );
                                            resolve();
                                        }
                                    }
                                );
                            } else {
                                console.error("لا يوجد تحديث متوفر");
                            }
                        }
                    });
            });
        } catch (error) {
            console.error(error);
        }
    }

    if (!fileName) {
        console.error("اكتب اسم المكتبة صح");
    } else {
        reinstall(fileName);
    }
}

// تحديث اللغة
export function alifUpdate(isLib = false) {
    const نوع_التطبيق = isLib ? "AlifWeb" : "alif";
    const اسم_التطبيق =
        process.platform === "win32"
            ? `${نوع_التطبيق}.exe`
            : process.platform === "darwin"
            ? `${نوع_التطبيق}-mac`
            : `${نوع_التطبيق}-linux`;

    const المستودع = isLib ? "iskepr/AlifWeb" : "alifcommunity/Alif";
    const التطبيق_المحلي = path.join(alifDir, نوع_التطبيق);

    fetch(`https://api.github.com/repos/${المستودع}/releases/latest`)
        .then((response) => response.json())
        .then((data) => {
            if (!data || !data.tag_name) {
                console.error(`حدث خطأ: لا يوجد إصدار متوفر`);
                return;
            }

            const احدث_الإصدار = data.tag_name;

            // جرب تشغيل الأمر للحصول على الإصدار الحالي
            exec(`${التطبيق_المحلي} -v`, (err, stdout) => {
                const الإصدار_الحالي = err
                    ? "0.0.0"
                    : (stdout.match(/\d+\.\d+\.\d+/) || ["0.0.0"])[0];

                if (الإصدار_الحالي === احدث_الإصدار) {
                    console.log(
                        `${نوع_التطبيق} بالفعل على أحدث إصدار (${احدث_الإصدار})`
                    );
                    return;
                }

                console.log(
                    `جارِ التحديث من ${الإصدار_الحالي} إلى ${احدث_الإصدار}...`
                );

                exec(
                    `curl -L -o ${path.join(
                        alifDir,
                        اسم_التطبيق
                    )} --create-dirs -z ${path.join(
                        alifDir,
                        اسم_التطبيق
                    )} https://github.com/${المستودع}/releases/download/${احدث_الإصدار}/${اسم_التطبيق}`,
                    (error) => {
                        if (error) {
                            console.error(`حدث خطأ أثناء التحديث:`, error);
                            return;
                        }

                        const الاسم_القديم = path.join(alifDir, اسم_التطبيق);
                        const الاسم_الجديد = path.join(alifDir, نوع_التطبيق);

                        // حذف الملف القديم إذا كان موجوداً
                        fs.unlink(الاسم_الجديد, (deleteError) => {
                            if (deleteError && deleteError.code !== "ENOENT") {
                                console.error(
                                    `خطأ أثناء حذف الملف القديم:`,
                                    deleteError
                                );
                                return;
                            }
                            // إعادة التسمية بعد الحذف
                            fs.rename(
                                الاسم_القديم,
                                الاسم_الجديد,
                                (renameError) => {
                                    if (renameError) {
                                        console.error(
                                            `خطأ أثناء إعادة التسمية:`,
                                            renameError
                                        );
                                        return;
                                    }
                                    fs.chmod(
                                        الاسم_الجديد,
                                        0o755,
                                        (chmodError) => {
                                            if (chmodError) {
                                                console.error(
                                                    `خطأ في إضافة الصلاحيات:`,
                                                    chmodError
                                                );
                                                return;
                                            }
                                            console.log(
                                                `تم تحديث ${نوع_التطبيق} إلى الإصدار ${احدث_الإصدار} بنجاح!`
                                            );
                                        }
                                    );
                                }
                            );
                        });
                    }
                );
            });
        })
        .catch((error) => {
            console.error(`فشل جلب الإصدار الأخير من ${المستودع}:`, error);
        });
}

// التحقق من git
export function checkGit() {
    exec("git --version", (error, stdout, stderr) => {
        if (error || stderr) {
            console.log(" Git غير مثبت، جاري تثبيته...");

            let installCommand = "";
            if (process.platform === "win32") {
                installCommand =
                    "winget install --id Git.Git -e --source winget"; // ويندوز
            } else if (process.platform === "darwin") {
                installCommand = "brew install git"; // ماك
            } else if (process.platform === "linux") {
                exec("cat /etc/os-release", (osError, osStdout, osStderr) => {
                    if (osError || osStderr) {
                        console.error(
                            "لم يتم تحديد التوزيعة بشكل صحيح يرجي تثبيت git."
                        );
                        process.exit(1);
                    }

                    if (
                        osStdout.includes("ubuntu") ||
                        osStdout.includes("debian")
                    ) {
                        installCommand = "sudo apt install git";
                    } else if (
                        osStdout.includes("fedora") ||
                        osStdout.includes("centos")
                    ) {
                        installCommand = "sudo dnf install git";
                    }

                    if (installCommand) {
                        console.log(
                            `سيتم تثبيت git باستخدام: ${installCommand}`
                        );
                        exec(
                            installCommand,
                            (installError, installStdout, installStderr) => {
                                if (installError || installStderr) {
                                    console.error(
                                        "حدث خطأ أثناء تثبيت Git:",
                                        installError || installStderr
                                    );
                                    process.exit(1);
                                }
                                console.log("تم تثبيت Git بنجاح!");
                            }
                        );
                    }
                });
            }

            if (installCommand) {
                console.log(`🚀 سيتم تثبيت git باستخدام: ${installCommand}`);
                exec(
                    installCommand,
                    (installError, installStdout, installStderr) => {
                        if (installError || installStderr) {
                            console.error(
                                " حدث خطأ أثناء تثبيت Git:",
                                installError || installStderr
                            );
                            process.exit(1);
                        }
                        console.log(`${installStdout} تم تثبيت Git بنجاح!`);
                    }
                );
            }
        } else {
            // console.log(` Git اصدار: ${stdout}`);
        }
    });
}
