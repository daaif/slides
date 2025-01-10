
const divConsole = document.createElement('div')
divConsole.addEventListener('dblclick', () => {
    divConsole.innerHTML = ''
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
document.addEventListener('DOMContentLoaded', function () {
    divConsole.classList.add('console')
    document.body.append(divConsole)
})

function addLog(message, type = 'log') {

    const logElement = document.createElement('div');
    logElement.innerHTML = message;
    logElement.style.backgroundColor = type === 'log' ?
        '#000' : type === 'warn' ?
            '#550' : '#500'

    divConsole.append(logElement);
}


// Fonction pour formatter le JSON avec coloration syntaxique
function formatValue(value) {
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
        return formatArray(value);
    }
    if (typeof value === 'object') {
        return formatObject(value);
    }
    return value; // Par défaut, renvoie la valeur
}

function formatArray(array) {
    const formattedItems = array.map(item => formatValue(item)).join(', ');
    return `[${formattedItems}]`;
}

function formatObject(obj) {
    const formattedEntries = Object.entries(obj).map(([key, value]) => {
        return `<span class="json-key">"${key}":</span> ${formatValue(value)}`;
    }).join(', ');
    return `{${formattedEntries}}`;
}


