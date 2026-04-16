import re
import os

def pt():
    with open('index.html', 'r', encoding='utf-8') as f:
        html = f.read()

    if "katex.min.css" not in html:
        head = '    <link rel="stylesheet" href="quiz/assets/katex/katex.min.css">\n    <script defer src="quiz/assets/katex/katex.min.js"></script>\n    <script defer src="quiz/assets/katex/contrib/auto-render.min.js"></script>\n</head>'
        html = html.replace('</head>', head)

    func = """<script>
        function queueMathTypeset(elements, attempts = 0) {
            if (window.renderMathInElement) {
                elements.forEach(function (el) {
                    if (el) {
                        try {
                            window.renderMathInElement(el, {
                                delimiters: [
                                    { left: '$$', right: '$$', display: true },
                                    { left: '$', right: '$', display: false },
                                    { left: '\\\\(', right: '\\\\)', display: false },
                                    { left: '\\\\[', right: '\\\\]', display: true }
                                ],
                                throwOnError: false
                            });
                        } catch(e) {}
                    }
                });
                return;
            }

            if (attempts < 120) {
                setTimeout(function () {
                    queueMathTypeset(elements, attempts + 1);
                }, 50);
            }
        }
"""
    if "function queueMathTypeset" not in html:
        html = html.replace('<script>', func, 1)

    html = html.replace('btn.textContent = opt;\n                    btn.onclick = () => handleAnswer(btn, opt, correctText, true);', 'btn.textContent = opt;\n                    btn.dataset.rawOption = opt;\n                    btn.onclick = () => handleAnswer(btn, btn.dataset.rawOption, correctText, true);')

    # Add queueMathTypeset at the end of renderQuestion()
    # It ends with:
    #             // Focus input automatically
    #             setTimeout(() => input.focus(), 50);
    #         }
    #     }

    html = html.replace('            setTimeout(() => input.focus(), 50);\n            }\n        }', '            setTimeout(() => input.focus(), 50);\n            }\n            queueMathTypeset([document.getElementById("q-text"), document.getElementById("q-options")]);\n        }')

    # In case it didn't replace, print a warning
    if 'queueMathTypeset([document.getElementById("q-text")' not in html:
        print("Warning: renderQuestion queueMath typeset patch failed in index")


    html = html.replace('if (b.textContent === correct) {', 'if (b.dataset.rawOption === correct || b.textContent === correct) {')

    html = html.replace('container.appendChild(frag);\n            }\n        }', 'container.appendChild(frag);\n            }\n            queueMathTypeset([container]);\n        }')
    html = html.replace('document.getElementById(\'q-results\').appendChild(frag);\n        }', 'document.getElementById(\'q-results\').appendChild(frag);\n            queueMathTypeset([document.getElementById(\'q-results\')]);\n        }')

    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("Patched index.html")

    with open('digel_ispiti.html', 'r', encoding='utf-8') as f:
        dgl = f.read()

    if "katex.min.css" not in dgl:
        head = '    <link rel="stylesheet" href="quiz/assets/katex/katex.min.css">\n    <script defer src="quiz/assets/katex/katex.min.js"></script>\n    <script defer src="quiz/assets/katex/contrib/auto-render.min.js"></script>\n</head>'
        dgl = dgl.replace('</head>', head)

    if "function queueMathTypeset" not in dgl:
        dgl = dgl.replace('<script>', func, 1)
    
    # In digel, we have renderCards()
    dgl = dgl.replace('            document.getElementById(\'total-loaded\').textContent = currentMax;\n        }', '            document.getElementById(\'total-loaded\').textContent = currentMax;\n            queueMathTypeset([document.getElementById(\'questions-grid\')]);\n        }')

    with open('digel_ispiti.html', 'w', encoding='utf-8') as f:
        f.write(dgl)
    print("Patched digel_ispiti.html")

    with open('course.html', 'r', encoding='utf-8') as f:
        crs = f.read()
    if "katex.min.css" not in crs:
        head = '    <link rel="stylesheet" href="quiz/assets/katex/katex.min.css">\n    <script defer src="quiz/assets/katex/katex.min.js"></script>\n    <script defer src="quiz/assets/katex/contrib/auto-render.min.js"></script>\n</head>'
        crs = crs.replace('</head>', head)
    if "function queueMathTypeset" not in crs:
        crs = crs.replace('<script>', func, 1)

    # In course, loadLesson()
    crs = crs.replace('            txtCol.innerHTML = html;\n\n            imgCol.innerHTML = \'\';', '            txtCol.innerHTML = html;\n\n            imgCol.innerHTML = \'\';\n            queueMathTypeset([txtCol]);')
    with open('course.html', 'w', encoding='utf-8') as f:
        f.write(crs)
    print("Patched course.html")

pt()
