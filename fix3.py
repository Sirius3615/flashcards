import glob

files = glob.glob('quiz/**/index.html', recursive=True)

old_script_tag = '<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>'
new_script_tag = '<script id="MathJax-script" src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>'

for f in files:
    with open(f, 'r') as file:
        content = file.read()
    
    content = content.replace(old_script_tag, new_script_tag)
    content = content.replace("button.textContent = option;", "button.innerHTML = option;")
    content = content.replace("questionTextEl.textContent = currentCard.question;", "questionTextEl.innerHTML = currentCard.question;")
    
    with open(f, 'w') as file:
        file.write(content)
