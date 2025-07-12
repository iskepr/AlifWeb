import { تحليل_الشفرة } from "../src/AlifLexer.js";
import { محلل_الرموز } from "../src/AlifParser.js";
import { إنشاء_الشفرة } from "../src/AlifGenerator.js";

function Alif(شفرة) {
    return إنشاء_الشفرة(محلل_الرموز(تحليل_الشفرة(شفرة)));
}

if (typeof window !== "undefined") {
    window.Alif = Alif;
}

export default Alif;
