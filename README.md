# لغة برمجة ألف للويب

![الصورة](https://raw.githubusercontent.com/iskepr/AlifWeb/refs/heads/main/assets/alifweb.ico)

**لغة ألف للويب** هي لغة برمجة عربية تُترجم إلى JavaScript، مصممة لتسهّل كتابة الشيفرة بلغة عربية مفهومة.  
اللغة جزء من [مشروع ألف](https://github.com/alifcommunity/Alif) وهدفها تشغيل لغة ألف على الويب مباشرة.

## مميزات اللغة

-   كتابة الشيفرة بكلمات عربية بالكامل
-   إطار عمل كامل باللغة العربية
-   التحويل الى html, css, js I

## التشغيل

### محليا

#### المتطلبات

-   Node.js 18 أو أحدث

#### التثبيت والتشغيل

```bash
git clone https://github.com/iskepr/AlifWeb.git
cd AlifWeb
npm install
node alifweb اسم_الملف.الف
```

#### البناء

```bash
npm run build
```

### في الموقع cdn

```html
<script src="https://cdn.jsdelivr.net/gh/iskepr/AlifWeb/Lib/AlifWeb.js"></script>
<script>
    eval(Alif("شفرة الف"));
    !! ملحوظة: الطباعة موجودة في الكونسول
</script>
```

## المساهمة

المشروع مفتوح المصدر بالكامل يمكنك المساهمة في تطويره
