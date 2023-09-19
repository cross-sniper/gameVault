const fs = require('fs');
const path = require('path');
const SRC_DIR = 'src';
const CSS_DIR = 'css';
const UI_DIR = 'ui';

function getFilesRecursively(directory, fileExtension) {
    const files = [];

    function walk(dir) {
        const filesInDir = fs.readdirSync(dir);
        for (const file of filesInDir) {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                walk(fullPath); // Recursively walk through subdirectories
            } else if (file.endsWith(fileExtension)) {
                files.push(fullPath);
            }
        }
    }

    walk(directory);
    return files;
}

function loadContentFromFile(file) {
    return fs.readFileSync(file, 'utf8');
}

function parse(file) {
    const fileContent = loadContentFromFile(file);
    const lines = fileContent.split('\n');
    let content = '';
    let isInComment = false;

    for (var line of lines) {
        if (line.startsWith(':uses ')) {
            const dependencyFile = path.join(SRC_DIR, line.replace(':uses ', ''));
            if (fs.existsSync(dependencyFile)) {
                content += `<locscript>${parse(dependencyFile)}</locscript>`;
            } else {
                console.error(`Dependency file not found: ${dependencyFile}`);
            }
        } else if (line.startsWith('<<') && line.endsWith('>>')) {
            content += `<!--${line.substring(2, line.length - 2)}-->`;
        } else if (line.startsWith('<<')) {
            content += `<!--${line.substring(2)}`;
            isInComment = true;
        } else if (line.endsWith('>>')) {
            content += `${line.substring(0, line.length - 2)}-->`;
            isInComment = false;
        } else {
            line = line.replace(/:call (.*)/, "<locscript>$1()</locscript>");
            line = line.replace(/:exit (.*)\|(.*)/, "<button onclick=\"goto('$2')\">$1</button>");
            content += line + (isInComment ? '' : line.endsWith("</locscript>") ? '' : '<br>\n\n');
        }
    }

    return content;
}

const cssFiles = getFilesRecursively(CSS_DIR, '.css');
const uiFiles = getFilesRecursively(UI_DIR, '.ui');
const locFiles = getFilesRecursively(SRC_DIR, '.loc');

const cssContent = cssFiles.map(loadContentFromFile).join('\n');
const uiContent = uiFiles.map(loadContentFromFile).join('\n');

const locContents = locFiles.map(file => {
    const content = parse(file);
    const id = path.relative(SRC_DIR, file).replace('.loc', '');
    return `<loc style="display:none;" id="${id}">${content}</loc>`;
});

const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>gameVault:nightmare run</title>
    <style>
        ${cssContent}
    </style>
</head>
<body>
    ${uiContent}
    ${locContents.join('\n')}
    <script src="runtime.js"></script>
</body>
</html>
`;

fs.writeFileSync('index.html', html);
