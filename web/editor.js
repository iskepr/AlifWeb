import { alifSnippets } from "./snippets/alif-snippets.js";

CodeMirror.defineMIME("text/x-alif", "alif");

// تعريف مساعد التلميحات المتقدمة للغة ألف
CodeMirror.registerHelper("hint", "alif", function (editor, options) {
    const cur = editor.getCursor();
    const token = editor.getTokenAt(cur);
    const start = token.start;
    const end = cur.ch;
    const currentWord = token.string.trim();

    // تعريف الكلمات المفتاحية والدوال المدمجة
    const builtInFunctions = [];

    // دمج القوائم
    const allSuggestions = [
        ...Object.entries(alifSnippets).map(([name, snippet]) => ({
            name,
            type: "قالب",
            doc: "قالب برمجي",
            snippet:
                snippet.split("\n")[0].substring(0, 50) +
                (snippet.includes("\n") ? "..." : ""),
        })),
        ...builtInFunctions,
    ];

    // تصفية الاقتراحات بناءً على الكلمة الحالية
    const filtered = currentWord
        ? allSuggestions.filter(
              (item) =>
                  item.name.includes(currentWord) ||
                  item.doc.includes(currentWord)
          )
        : allSuggestions;

    // تنسيق الاقتراحات
    const list = filtered.map((item) => {
        // Get the actual snippet text (without variables)
        const snippetText = item.snippet || item.name;

        // Create a hint object
        const hint = {
            text: snippetText,
            displayText: item.name,
            className: `hint-${item.type.toLowerCase()}`,
            originalSnippet: item.snippet || item.name,
            render: function (element) {
                const container = document.createElement("div");
                container.style.display = "flex";
                container.style.justifyContent = "space-between";
                container.style.width = "100%";
                container.style.alignItems = "center";

                const left = document.createElement("div");
                left.style.display = "flex";
                left.style.alignItems = "center";

                const name = document.createElement("span");
                name.className = "hint-name";
                name.textContent = item.name;

                const type = document.createElement("span");
                type.className = "hint-type";
                type.textContent = item.type;

                const doc = document.createElement("div");
                doc.className = "hint-doc";
                doc.textContent = item.doc;

                left.appendChild(name);
                left.appendChild(type);

                container.appendChild(left);
                container.appendChild(doc);

                element.style.width = "100%";
                element.appendChild(container);
            },
        };

        // Add custom hint handler for cursor positioning
        hint.hint = function (cm, data, completion) {
            const from = data.from;
            const to = data.to;
            const text = this.originalSnippet;

            // Insert the snippet
            cm.replaceRange(text, from, to, "complete");

            // Find the first ${...} to position cursor
            const cursor = cm.getCursor();
            const lineContent = cm.getLine(cursor.line);
            const cursorPos = cm.indexFromPos(cursor);

            // Find all placeholders in the current line
            const placeholderRegex = /\$\{([^}]*)\}/g;
            const matches = [];
            let match;

            while ((match = placeholderRegex.exec(lineContent)) !== null) {
                matches.push({
                    start: match.index,
                    end: match.index + match[0].length,
                    content: match[1],
                });
            }

            if (matches.length > 0) {
                const firstMatch = matches[0];
                const fromPos = cm.posFromIndex(
                    cursorPos - cursor.ch + firstMatch.start
                );
                const toPos = cm.posFromIndex(
                    cursorPos - cursor.ch + firstMatch.end
                );

                // Select the placeholder
                cm.setSelection(fromPos, toPos);

                // Handle different placeholder types
                if (firstMatch.content === "") {
                    // Empty placeholder ${} - remove it and place cursor
                    cm.replaceRange("", fromPos, toPos, "complete");
                    cm.setCursor(fromPos);
                } else if (firstMatch.content.startsWith("cursor")) {
                    // ${cursor} placeholder - remove it and place cursor
                    cm.replaceRange("", fromPos, toPos, "complete");
                    cm.setCursor(fromPos);
                } else {
                    // Remove the ${} and keep only the content, then select it
                    const content = firstMatch.content;
                    const fromPos = cm.posFromIndex(
                        cursorPos - cursor.ch + firstMatch.start
                    );
                    const toPos = cm.posFromIndex(
                        cursorPos - cursor.ch + firstMatch.end
                    );

                    // Split content by newlines to handle multi-line placeholders
                    const lines = content.split("\n");

                    // Replace the entire ${...} with just the content
                    cm.replaceRange(
                        lines.join("\n"),
                        fromPos,
                        toPos,
                        "complete"
                    );

                    // Calculate the end position after replacement
                    const contentFrom = fromPos;
                    const contentTo = {
                        line: fromPos.line + lines.length - 1,
                        ch:
                            lines.length === 1
                                ? fromPos.ch + lines[0].length
                                : lines[lines.length - 1].length,
                    };

                    // Set selection to the inserted content
                    cm.setSelection(contentFrom, contentTo);
                }
            }

            return { from: from, to: to };
        };

        return hint;
    });

    return {
        list: list,
        from: CodeMirror.Pos(cur.line, start),
        to: CodeMirror.Pos(cur.line, end),
    };
});

// Initialize CodeMirror
const editor = CodeMirror(document.getElementById("editor"), {
    lineNumbers: true,
    rtlMoveVisually: true,
    matchBrackets: true,
    indentUnit: 4,
    tabSize: 4,
    lineWrapping: true,
    mode: { name: "alif", json: true },
    theme: "monokai",
    direction: "rtl",
    autofocus: true,
    extraKeys: {
        Enter: function (cm) {
            // Get current line and cursor position
            const cursor = cm.getCursor();
            const line = cm.getLine(cursor.line);

            // Check if current line ends with a colon
            if (line.trim().endsWith(":")) {
                // Get current indentation
                const indent = line.match(/^\s*/)[0];
                // Add extra indentation (4 spaces)
                const extraIndent = "    ";
                cm.replaceSelection("\n" + indent + extraIndent, "end");
                return;
            }

            // Default behavior for Enter
            cm.execCommand("newlineAndIndent");
        },
        "Ctrl-Space": function (cm) {
            cm.showHint({
                hint: CodeMirror.hint.alif,
                completeSingle: false,
                alignWithWord: true,
                closeCharacters: /[\s()\[\]{};:>]/,
                closeOnUnfocus: true,
            });
        },
    },
});

// Set placeholder text
editor.setValue("اكتب كود لغة ألف هنا...");
editor.on("focus", function () {
    if (editor.getValue() === "اكتب كود لغة ألف هنا...") {
        editor.setValue("");
    }
});

// Show autocomplete suggestions while typing
let completionActive = false;
let completionTimeout;

editor.on("inputRead", function (cm, change) {
    // Don't show on backspace or delete
    if (change.origin === "+delete" || change.origin === "paste") {
        return;
    }

    // Clear any existing timeout
    if (completionTimeout) {
        clearTimeout(completionTimeout);
    }

    // Don't show if we're already showing completion
    if (completionActive) {
        return;
    }

    // Get current cursor position and token
    const cursor = cm.getCursor();
    const token = cm.getTokenAt(cursor);

    // Only trigger for words longer than 1 character
    if (token.string.length > 1 || cursor.ch === 0) {
        completionTimeout = setTimeout(() => {
            completionActive = true;
            cm.showHint({
                hint: CodeMirror.hint.alif,
                completeSingle: false,
                alignWithWord: true,
                closeOnUnfocus: true,
                completeOnSingleClick: true,
                closeOnPick: true,
            });
            completionActive = false;
        }, 100); // Small delay to prevent flickering
    }
});

// Make editor instance globally available
window.editor = editor;
