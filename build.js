const fs = require('fs');
const path = require("path");
SRC_DIR = "src/";
files = [];
contents = [];

for (file of fs.readdirSync(SRC_DIR))
    if (file.endsWith(".loc")) files.push(path.join(SRC_DIR, file));

function parse(file) {
    const fileContent = fs.readFileSync(file, 'utf8');
    const lines = fileContent.split('\n');
    let content = ''; // Initialize content as an empty string
    let isInComment = false; // Flag to track if currently inside a comment

    for (var line of lines) {
        if (line.startsWith(':uses ')) {
            // You may need to adjust this logic based on your specific requirements
            const dependencyFile = path.join(SRC_DIR, line.replace(':uses ', ''));

            if (fs.existsSync(dependencyFile)) {
                // Read and append the content of the dependency file
                content += `<locscript>${parse(dependencyFile)}</locscript>`;
            } else {
                console.error(`Dependency file not found: ${dependencyFile}`);
            }
        } else if (line.startsWith('<<') && line.endsWith('>>')) {
            // Handle comments enclosed in << and >>
            content += `<!--${line.substring(2, line.length - 2)}-->`;
        } else if (line.startsWith('<<')) {
            // Start of a comment
            content += `<!--${line.substring(2)}`;
            isInComment = true;
        } else if (line.endsWith('>>')) {
            // End of a comment
            content += `${line.substring(0, line.length - 2)}-->`;
            isInComment = false;
        } else {
            line = line.replace(/:call (.*)/, "<locscript>$1()</locscript>");
            line = line.replace(/:exit (.*)\|(.*)/, "<button onclick=\"goto('$2')\">$1</button>");
            // Add <br> tags after each line, but not inside comments
            content += line + (isInComment ? '' : line.endsWith("</locscript>") ? "" : '<br>\n\n');
        }
    }

    return content;
}

for (const file of files) {
    // Wrap the parsed content inside <loc> elements with IDs
    // The runtime code can set them to visible whenever needed
    // The runtime sets the location "void" as visible first, by default
    contents.push(`<loc style='display:none;' id="${file.replace(SRC_DIR, '').replace('.loc','')}">${parse(file)}</loc>`);
}

html = `
<!DOCTYPE html>
<html>
<head>

    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>gameVault:nightmare run</title>
</head>
<body>
    <style>
        locscript{
            display:none;
        }
    </style>
    ${contents.join('\n')}
    <script src="runtime.js"></script>
</body>
</html>
`

fs.writeFileSync("index.html", html);
