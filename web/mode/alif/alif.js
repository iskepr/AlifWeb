// Define Alif language mode for CodeMirror
CodeMirror.defineMode("alif", function () {
    // Define keywords
    const keywords = [
        "دالة",
        "اذا",
        "إذا",
        "استورد",
        "حاول",
        "خلل",
        "نهاية",
        "عام",
        "ارجع",
        "بينما",
        "لأجل",
        "لاجل",
        "استمر",
        "توقف",
        "احذف",
        "اوإذا",
        "اواذا",
        "والا",
        "وإلا",
        "صنف",
        "الرياضيات",
        "نوع",
        "اطبع",
    ];

    // Define boolean values
    const booleans = ["صح", "خطأ", "خطا"];

    // Define built-in functions/objects
    const builtins = ["_تهيئة_", "عدم", "هذا"];

    // Define operators
    const operators = [
        "+",
        "-",
        "*",
        "/",
        "^",
        "=",
        "+=",
        "-=",
        "*=",
        "/=",
        "^=",
        "==",
        "!=",
        "<",
        ">",
        "<=",
        ">=",
        "و",
        "او",
        "ليس",
    ];

    // Token types
    function tokenBase(stream, state) {
        // Handle comments
        if (stream.match(/^#.*/)) {
            stream.skipToEnd();
            return "comment";
        }

        // Handle double quoted strings
        if (stream.match(/^"/)) {
            state.tokenize = tokenString('"', "string");
            return state.tokenize(stream, state);
        }

        // Handle single quoted strings
        if (stream.match(/^'/)) {
            state.tokenize = tokenString("'", "string");
            return state.tokenize(stream, state);
        }

        // Handle numbers
        if (stream.match(/^\d+\.?\d*/)) {
            return "number";
        }

        // Handle operators
        for (const op of operators) {
            // Special handling for single-character operators without word boundaries
            if (op.length === 1 && /[+!\-*/^=<>]/.test(op)) {
                if (stream.match(new RegExp(`^\\${op}`))) {
                    return "operator";
                }
            }
            // Handle multi-character operators with word boundaries
            else if (
                stream.match(
                    new RegExp(
                        `^${op.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`
                    )
                )
            ) {
                return "operator";
            }
        }

        // Handle keywords and identifiers
        if (stream.match(/^[\u0600-\u06FFa-zA-Z_][\u0600-\u06FFa-zA-Z0-9_]*/)) {
            const word = stream.current();

            if (keywords.includes(word)) {
                return "keyword";
            }

            if (booleans.includes(word)) {
                return "boolean";
            }

            if (builtins.includes(word)) {
                return "builtin";
            }

            // Check if it's a function call
            if (stream.peek() === "(") {
                return "def";
            }

            return "variable";
        }

        // Skip whitespace
        stream.next();
        return null;
    }

    // Handle string literals
    function tokenString(quote, style) {
        return function (stream, state) {
            let escaped = false,
                next;
            while ((next = stream.next()) != null) {
                if (next === quote && !escaped) {
                    state.tokenize = tokenBase;
                    break;
                }
                escaped = !escaped && next === "\\";
            }
            return style;
        };
    }

    return {
        startState: function () {
            return { tokenize: tokenBase };
        },
        token: function (stream, state) {
            if (stream.eatSpace()) return null;
            const style = state.tokenize(stream, state);
            return style;
        },
        lineComment: "#",
        rtl: true,
        wordChars: "\u0600-\u06FF", // Allow Arabic characters in words
    };
});

// Register the mode with CodeMirror
CodeMirror.defineMIME("text/x-alif", "alif");
