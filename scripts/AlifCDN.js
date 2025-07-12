import { تحليل_الشفرة } from "../src/AlifLexer.js";
import { محلل_الرموز } from "../src/AlifParser.js";
import { إنشاء_الشفرة } from "../src/AlifGenerator.js";

export default Alif = (شفرة) => إنشاء_الشفرة(محلل_الرموز(تحليل_الشفرة(شفرة)));
