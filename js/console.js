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
    originalConsoleLog(message); 
    message = formatValue(message);
    addLog(message, 'log');
};

const originalConsoleWarn = console.warn;
console.warn = function (message) {
    originalConsoleWarn(message); 
    message = formatValue(message);
    addLog(message, 'warn');
};

const originalConsoleError = console.error;
console.error = function (message) {
    originalConsoleError(message); 
    message = formatValue(message);
    addLog(message, 'error');
};

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
    divConsole.scrollTop = divConsole.scrollHeight; 
}


