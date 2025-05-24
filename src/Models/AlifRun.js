import fs from "fs";
import http from "http";
import path from "path";
import mime from "mime-types";

import { تحليل_الشفرة } from "../AlifLexer.js";
import { محلل_الرموز } from "../AlifParser.js";
import { إنشاء_الشفرة } from "../AlifGenerator.js";
import { إعادة_تعيين_المؤشر } from "../Core/TokenUtils.js";

let كود_مترجم = "";
let خطا_المتصفح;

export function تشغيل_الف(fileName) {
    const مسار_الملف = path.join(
        process.cwd(),
        fileName ? fileName : "./رئيسي.الف"
    );
    const اسم_المف = fileName
        ? path.basename(fileName, path.extname(fileName))
        : "رئيسي";

    let server;
    let clients = [];

    const buildCode = (خطا_المتصفح) => {
        fs.readFile(مسار_الملف, "utf8", async (خطأ, شفرة) => {
            if (خطأ) {
                console.error(`الملف "${مسار_الملف}" غير موجود`);
                process.exit();
            }

            try {
                إعادة_تعيين_المؤشر();
                const رموز = تحليل_الشفرة(شفرة);
                console.log(" ---------- تم تحليل الشفرة ");

                const ast = محلل_الرموز(رموز);
                // console.log("AST:", JSON.stringify(ast, null, 2));
                console.log(" -------------------- تم تحليل الرموز ");

                كود_مترجم = إنشاء_الشفرة(ast);
                // console.log("كود مترجم", كود_مترجم);

                console.log(
                    " ------------------------------ تم إنشاء شفرة جديدة"
                );
            } catch (e) {
                console.error(
                    "خطأ أثناء التوليد:",
                    e.line
                        ? e.message + " " + e.line
                        : e
                        ? e
                        : خطا_المتصفح.message
                        ? خطا_المتصفح.message
                        : ""
                );
                كود_مترجم = `
                // ------------------------------- خطأ -------------------------------
                document.body.style = "background: linear-gradient(120deg, #111 20%, #d10d0d 42%, #111 80%); height: 98vh;";
                const errorDiv = document.createElement('div');
                errorDiv.innerHTML = \`
                <div class="errorCard" style="
                    width:330px;height:80px;border-radius:8px;box-sizing:border-box;padding:10px 15px;
                    background-color:#111;box-shadow:#00000090 0 0 0 1000px;position:fixed;z-index:1000;
                    top:50%;left:50%;transform:translate(-50%,-50%);overflow:hidden;display:flex;
                    align-items:center;justify-content:space-around;gap:15px">
                    <svg class="wave" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg" style="
                    position:absolute;transform:rotate(90deg);left:-31px;top:32px;width:80px;fill:#fc0c0c3a">
                    <path d="M0,256L11.4,240C22.9,224,46,192,69,192C91.4,192,114,224,137,234.7C160,245,183,235,206,213.3C228.6,192,251,160,274,149.3C297.1,139,320,149,343,181.3C365.7,213,389,267,411,282.7C434.3,299,457,277,480,250.7C502.9,224,526,192,549,181.3C571.4,171,594,181,617,208C640,235,663,277,686,256C708.6,235,731,149,754,122.7C777.1,96,800,128,823,165.3C845.7,203,869,245,891,224C914.3,203,937,117,960,112C982.9,107,1006,181,1029,197.3C1051.4,213,1074,171,1097,144C1120,117,1143,107,1166,133.3C1188.6,160,1211,224,1234,218.7C1257.1,213,1280,139,1303,133.3C1325.7,128,1349,192,1371,192C1394.3,192,1417,128,1429,96L1440,64L1440,320L0,320Z" fill-opacity="1"></path>
                    </svg>
                    <div class="icon-container" style="
                    width:35px;height:35px;display:flex;justify-content:center;align-items:center;
                    background-color:#fc0c0c48;border-radius:50%;margin-left:8px">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" class="icon" style="
                        width:17px;height:17px;color:#d10d0d">
                        <path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c-9.4 9.4-9.4 24.6 0 33.9l47 47-47 47c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l47-47 47 47c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-47-47 47-47c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-47 47-47-47c-9.4-9.4-24.6-9.4-33.9 0z"></path>
                    </svg>
                    </div>
                    <div class="message-text-container" dir="rtl" style="
                    display:flex;flex-direction:column;justify-content:center;align-items:flex-start;flex-grow:1">
                    <p class="message-text" style="
                        margin:0;cursor:default;color:#d10d0d;font-size:17px;font-weight:700">حدث خطأ: ${
                            e.line == undefined ? "" : e.line
                        }</p>
                    <p class="sub-text" style="
                        margin:0;cursor:default;font-size:14px;color:#999">${
                            e.message
                        }</p>
                    </div>
                </div>
                \`;
                document.body.appendChild(errorDiv);
                // ------------------------------- خطأ -------------------------------`;
            }
            clients.forEach((client) => client.write("data: reload\n\n"));
        });
    };

    const createServer = () => {
        server = http.createServer((req, res) => {
            if (req.url === "/events") {
                res.writeHead(200, {
                    "Content-Type": "text/event-stream",
                    "Cache-Control": "no-cache",
                    Connection: "keep-alive",
                });
                res.write("\n");
                clients.push(res);
                req.on("close", () => {
                    clients = clients.filter((client) => client !== res);
                });
                return;
            }

            if (req.method === "POST" && req.url === "/log-error") {
                let body = "";
                req.on("data", (chunk) => {
                    body += chunk;
                });
                req.on("end", () => {
                    try {
                        خطا_المتصفح = JSON.parse(body);
                        console.log("خطأ أثناء التوليد:", خطا_المتصفح.message);
                    } catch (err) {
                        console.error("فشل في قراءة JSON:", err.message);
                    }
                    res.writeHead(204);
                    res.end();
                });
                return;
            }

            let filePath = path.join(
                process.cwd(),
                req.url === "/" ? "index.html" : req.url
            );
            const extname = path.extname(filePath);

            if (!extname) {
                filePath = path.join(filePath, "index.html");
            }

            fs.access(filePath, fs.constants.F_OK, (err) => {
                if (err) {
                    if (req.url === "/") {
                        serveMainHtml(res);
                    } else {
                        res.writeHead(404);
                        res.end("File not found");
                    }
                    return;
                }

                fs.readFile(filePath, (error, content) => {
                    if (error) {
                        res.writeHead(500);
                        res.end("Error loading the file");
                        return;
                    }

                    const contentType =
                        mime.lookup(filePath) || "application/octet-stream";
                    res.writeHead(200, { "Content-Type": contentType });
                    res.end(content, "utf-8");
                });
            });
        });

        const serveMainHtml = (res) => {
            res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            res.end(`
                <!DOCTYPE html>
                <html lang="ar" dir="rtl">
                <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>${اسم_المف}</title>
                    <script defer>            
                        function sendErrorLog(data) {
                            // ------------------------------- خطأ -------------------------------
                            document.body.style = "background: linear-gradient(120deg, #111 20%, #d10d0d 42%, #111 80%); height: 98vh;";
                            const errorDiv = document.createElement('div');
                            errorDiv.innerHTML = \`
                            <div class="errorCard" style="
                                width:330px;height:80px;border-radius:8px;box-sizing:border-box;padding:10px 15px;
                                background-color:#111;box-shadow:#00000090 0 0 0 1000px;position:fixed;z-index:1000;
                                top:50%;left:50%;transform:translate(-50%,-50%);overflow:hidden;display:flex;
                                align-items:center;justify-content:space-around;gap:15px">
                                <svg class="wave" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg" style="
                                position:absolute;transform:rotate(90deg);left:-31px;top:32px;width:80px;fill:#fc0c0c3a">
                                <path d="M0,256L11.4,240C22.9,224,46,192,69,192C91.4,192,114,224,137,234.7C160,245,183,235,206,213.3C228.6,192,251,160,274,149.3C297.1,139,320,149,343,181.3C365.7,213,389,267,411,282.7C434.3,299,457,277,480,250.7C502.9,224,526,192,549,181.3C571.4,171,594,181,617,208C640,235,663,277,686,256C708.6,235,731,149,754,122.7C777.1,96,800,128,823,165.3C845.7,203,869,245,891,224C914.3,203,937,117,960,112C982.9,107,1006,181,1029,197.3C1051.4,213,1074,171,1097,144C1120,117,1143,107,1166,133.3C1188.6,160,1211,224,1234,218.7C1257.1,213,1280,139,1303,133.3C1325.7,128,1349,192,1371,192C1394.3,192,1417,128,1429,96L1440,64L1440,320L0,320Z" fill-opacity="1"></path>
                                </svg>
                                <div class="icon-container" style="
                                width:35px;height:35px;display:flex;justify-content:center;align-items:center;
                                background-color:#fc0c0c48;border-radius:50%;margin-left:8px">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" class="icon" style="
                                    width:17px;height:17px;color:#d10d0d">
                                    <path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c-9.4 9.4-9.4 24.6 0 33.9l47 47-47 47c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l47-47 47 47c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-47-47 47-47c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-47 47-47-47c-9.4-9.4-24.6-9.4-33.9 0z"></path>
                                </svg>
                                </div>
                                <div class="message-text-container" dir="rtl" style="
                                display:flex;flex-direction:column;justify-content:center;align-items:flex-start;flex-grow:1">
                                <p class="message-text" style="
                                    margin:0;cursor:default;color:#d10d0d;font-size:17px;font-weight:700">
                                    حدث خطأ: \${data.line == undefined ? "" : data.line}</p>
                                <p class="sub-text" style="
                                    margin:0;cursor:default;font-size:14px;color:#999">
                                    \${data.message}</p>
                                </div>
                            </div>
                            \`;
                            document.body.appendChild(errorDiv);
                            // ------------------------------- خطأ -------------------------------
                            fetch('/log-error', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(data)
                            }).catch(() => {
                                // ممكن تتجاهل لو فشل الإرسال، مش مهم
                            });
                        }
            
                        // رصد أخطاء الجافاسكريبت العادية
                        window.addEventListener('error', function(event) {
                            console.log('Captured error event:', event.message);
                            sendErrorLog({
                                type: 'error',
                                message: event.message,
                                source: event.filename,
                                lineno: event.lineno,
                                colno: event.colno,
                                stack: event.error ? event.error.stack : null
                            });
                        });
            
                        // رصد أخطاء الوعود الغير معالجة (Promises)
                        window.addEventListener('unhandledrejection', function(event) {
                            console.log('Captured unhandled rejection:', event.reason);
                            sendErrorLog({
                                type: 'unhandledrejection',
                                message: event.reason ? event.reason.message || event.reason.toString() : 'unknown',
                                stack: event.reason ? event.reason.stack || null : null
                            });
                        });
            
                        // رصد console.error
                        const originalConsoleError = console.error;
                        console.error = function(...args) {
                            sendErrorLog({
                                type: 'console.error',
                                message: args.map(String).join(' ')
                            });
                            originalConsoleError.apply(console, args);
                        };
                    </script>
                </head>
                <body>
                    <script>
                        ${كود_مترجم}
                    </script>
                    <script>
                        const evtSource = new EventSource('/events');
                        evtSource.onmessage = () => window.location.reload();
                    </script>
                </body>
                </html>
                `);
        };

        const PORT = 3000;
        server
            .listen(PORT, () => {
                console.log(`السيرفر على http://localhost:${PORT}`);
            })
            .on("error", (err) => {
                if (err.code === "EADDRINUSE") {
                    console.error(
                        `المنفذ ${PORT} قيد الاستخدام. سيتم المحاولة على منفذ آخر.`
                    );
                    server.close(() => {
                        server.listen(PORT + 1, () => {
                            console.log(
                                `السيرفر يعمل الآن على http://localhost:${
                                    PORT + 1
                                }`
                            );
                        });
                    });
                }
            });
    };

    buildCode(خطا_المتصفح);
    createServer();

    // متابعة التغييرات في الملف وإعادة بناء الكود
    fs.watchFile(مسار_الملف, () => {
        console.log(`تم تعديل الملف "${اسم_المف}"`);
        buildCode();
    });

    // لو التطبيق قفل، نقفل السيرفر وننهي كل الـ clients
    process.on("SIGINT", () => {
        console.log("\nجاريٍ إيقاف السيرفر...");

        clients.forEach((client) => client.end()); // نقفل كل الاتصالات
        if (server)
            server.close(() => {
                console.log("تم إيقاف السيرفر بنجاح.");
                process.exit(0); // خروج نظيف
            });
    });
}
