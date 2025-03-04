@echo off
setlocal

:: التحقق من وجود ملف
if "%1"=="" (
    echo ❌ يجب إدخال اسم الملف!
    exit /b
)

:: التحقق مما إذا كان سيتم تشغيل الكود في المتصفح
if "%2"=="web" (
    echo 🚀--------------- تشغيل السيرفر على localhost:3000 ...
    start /B node server.js
    timeout /t 2 >nul
    @REM start "" http://localhost:3000/%1
    exit /b
)

:: تشغيل المترجم مباشرة بدون سيرفر
node translator.js %1
