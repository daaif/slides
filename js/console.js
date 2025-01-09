
const divConsole = document.createElement('div')
divConsole.addEventListener('dblclick',() => {
    divConsole.innerHTML = ''
})
const originalConsoleLog = console.log;
console.log = function (...args) {
    originalConsoleLog(...args); // Conserver le comportement original
    const message = args.map(arg => JSON.stringify(arg, null, 2)).join(' ');
    addLog(message, 'log');
};

const originalConsoleWarn = console.warn;
console.warn = function (...args) {
    originalConsoleWarn(...args); // Conserver le comportement original
    const message = args.map(arg => JSON.stringify(arg, null, 2)).join(' ');
    addLog(message, 'warn');
};

const originalConsoleError = console.error;
console.error = function (...args) {
    originalConsoleError(...args); // Conserver le comportement original
    const message = args.map(arg => JSON.stringify(arg, null, 2)).join(' ');
    addLog(message, 'error');
};
document.addEventListener('DOMContentLoaded', function () {
    divConsole.classList.add('console')
    document.body.append(divConsole)
})

function addLog(message, type = 'log') {
  
        const logElement = document.createElement('div');
        logElement.innerHTML =   message;
        logElement.style.color = type === 'log' ? 
                    '#FFF' : type === 'warn' ? 
                    '#FF7' :  '#F77'

        divConsole.append(logElement);
}


