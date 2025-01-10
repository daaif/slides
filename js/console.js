const divConsole = document.createElement('div')
divConsole.addEventListener('dblclick', () => {
    divConsole.innerHTML = ''
})
document.addEventListener('DOMContentLoaded', function () {
    divConsole.classList.add('console')
    document.body.append(divConsole)
})
const originalConsoleLog = console.log;
console.log = function (message) {
    originalConsoleLog(message); // Conserver le comportement original
    // const message = args.map(arg => JSON.stringify(arg, null, 2)).join(' ');
    //if (typeof message === 'object') {
    message = formatValue(message);
    //}
    addLog(message, 'log');
};

const originalConsoleWarn = console.warn;
console.warn = function (message) {
    originalConsoleWarn(message); // Conserver le comportement original
    // const message = args.map(arg => JSON.stringify(arg, null, 2)).join(' ');
    //if (typeof message === 'object') {
    message = formatValue(message);
    //}
    addLog(message, 'warn');
};

const originalConsoleError = console.error;
console.error = function (message) {
    originalConsoleError(message); // Conserver le comportement original
    // const message = args.map(arg => JSON.stringify(arg, null, 2)).join(' ');
    //if (typeof message === 'object') {
    message = formatValue(message);
    //}
    addLog(message, 'error');
};

// Fonction pour formatter la valeur avec indentation et retour à la ligne
function formatValue(value, indent = 0) {
    const indentation = ' '.repeat(indent);
    if (typeof value === 'string') {
        return `<span class="json-string">"${value}"</span>`;
    }
    if (typeof value === 'number') {
        return `<span class="json-number">${value}</span>`;
    }
    if (typeof value === 'boolean') {
        return `<span class="json-boolean">${value}</span>`;
    }
    if (value === null) {
        return `<span class="json-null">null</span>`;
    }
    if (Array.isArray(value)) {
        return formatArray(value, indent);
    }
    if (typeof value === 'object') {
        return formatObject(value, indent);
    }
    return value; // Par défaut, renvoie la valeur
}

function formatArray(array, indent = 5) {
    if (array.length === 0) return '[]';
    
    const spaces = ' '.repeat(indent + 2);
    const formattedItems = array
        .map(item => spaces + formatValue(item, indent + 2))
        .join(',\n');
    
    return `[\n${formattedItems}\n${' '.repeat(indent)}]`;
}

function formatObject(obj, indent = 5) {
    const entries = Object.entries(obj);
    if (entries.length === 0) return '{}';
    
    const spaces = ' '.repeat(indent + 2);
    const formattedEntries = entries
        .map(([key, value]) => {
            const formattedValue = formatValue(value, indent + 2);
            return `${spaces}<span class="json-key">"${key}":</span> ${formattedValue}`;
        })
        .join(',\n');
    
    return `{\n${formattedEntries}\n${' '.repeat(indent)}}`;
}


function addLog(message, type = 'log') {
    const logElement = document.createElement('div');
    logElement.innerHTML = `<span class="log-symbol">>&nbsp;</span><pre>${message}</pre>`;
    logElement.style.backgroundColor = type === 'log' ?
        '#000' : type === 'warn' ?
            '#550' : '#500';
    
    logElement.style.margin = '5px';
    logElement.style.padding = '10px';
    logElement.style.borderRadius = '4px';
    logElement.style.fontFamily = 'monospace';
    logElement.style.whiteSpace = 'pre-wrap';
    
    divConsole.append(logElement);
}

// Styles CSS à ajouter
const styles = `
.console {
    background-color: #1e1e1e;
    color: #ffffff;
    padding: 10px;
    font-family: monospace;
    overflow-y: auto;
    max-height: 500px;
}
.json-string { color: #ce9178; }
.json-number { color: #b5cea8; }
.json-boolean { color: #569cd6; }
.json-null { color: #569cd6; }
.json-key { color: #9cdcfe; }
pre {
    margin: 0;
    white-space: pre-wrap;
}
`;

// Ajout des styles
// const styleSheet = document.createElement('style');
// styleSheet.textContent = styles;
// document.head.appendChild(styleSheet);
