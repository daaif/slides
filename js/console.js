/**
 * Simple Slides - Enhanced Console
 * Features: Toolbar, Filters, Resize, Clear button
 */

// Console state
const consoleState = {
  filters: { log: true, warn: true, error: true },
  height: 150
};

// Create main console container
const divConsole = document.createElement('div');

// Double-click to clear (legacy behavior)
divConsole.addEventListener('dblclick', (evt) => {
  // Only clear if clicking on console body, not toolbar
  if (!evt.target.closest('.console-toolbar')) {
    clearConsoleLogs();
  }
});

document.addEventListener('DOMContentLoaded', function () {
  divConsole.classList.add('console');
  divConsole.classList.add('hide-console');

  // Create toolbar
  const toolbar = document.createElement('div');
  toolbar.classList.add('console-toolbar');
  toolbar.innerHTML = `
    <div class="console-filters">
      <span class="console-filter log active" data-type="log" title="Afficher/Masquer les logs">
        <i class="console-icon">●</i> Log
      </span>
      <span class="console-filter warn active" data-type="warn" title="Afficher/Masquer les warnings">
        <i class="console-icon">▲</i> Warn
      </span>
      <span class="console-filter error active" data-type="error" title="Afficher/Masquer les erreurs">
        <i class="console-icon">✖</i> Error
      </span>
    </div>
    <div class="console-actions">
      <span class="console-count" title="Nombre de messages">0</span>
      <button class="console-clear" title="Effacer la console (ou double-clic)">
        ✕ Clear
      </button>
    </div>
  `;

  // Create resize handle
  const resizeHandle = document.createElement('div');
  resizeHandle.classList.add('console-resize-handle');
  resizeHandle.title = 'Redimensionner la console';

  // Create logs container
  const logsContainer = document.createElement('div');
  logsContainer.classList.add('console-logs');

  // Assemble console
  divConsole.appendChild(resizeHandle);
  divConsole.appendChild(toolbar);
  divConsole.appendChild(logsContainer);
  document.body.appendChild(divConsole);

  // Attach event listeners
  attachConsoleEvents(toolbar, resizeHandle, logsContainer);
});

/**
 * Attach all console event listeners
 */
function attachConsoleEvents(toolbar, resizeHandle, logsContainer) {
  // Filter click handlers
  toolbar.querySelectorAll('.console-filter').forEach(filter => {
    filter.addEventListener('click', () => {
      const type = filter.dataset.type;
      consoleState.filters[type] = !consoleState.filters[type];
      filter.classList.toggle('active');
      updateVisibleLogs(logsContainer);
    });
  });

  // Clear button handler
  toolbar.querySelector('.console-clear').addEventListener('click', () => {
    clearConsoleLogs();
  });

  // Resize functionality
  let isResizing = false;
  let startY, startHeight;

  resizeHandle.addEventListener('mousedown', (e) => {
    isResizing = true;
    startY = e.clientY;
    startHeight = divConsole.offsetHeight;
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';

    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);
  });

  function resize(e) {
    if (!isResizing) return;
    const delta = startY - e.clientY;
    const newHeight = Math.min(Math.max(80, startHeight + delta), window.innerHeight * 0.8);
    divConsole.style.height = newHeight + 'px';
    consoleState.height = newHeight;
  }

  function stopResize() {
    isResizing = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', stopResize);
  }

  // Touch support for resize
  resizeHandle.addEventListener('touchstart', (e) => {
    isResizing = true;
    startY = e.touches[0].clientY;
    startHeight = divConsole.offsetHeight;

    document.addEventListener('touchmove', touchResize);
    document.addEventListener('touchend', stopTouchResize);
  });

  function touchResize(e) {
    if (!isResizing) return;
    const delta = startY - e.touches[0].clientY;
    const newHeight = Math.min(Math.max(80, startHeight + delta), window.innerHeight * 0.8);
    divConsole.style.height = newHeight + 'px';
  }

  function stopTouchResize() {
    isResizing = false;
    document.removeEventListener('touchmove', touchResize);
    document.removeEventListener('touchend', stopTouchResize);
  }
}

/**
 * Clear all console logs
 */
function clearConsoleLogs() {
  const logsContainer = divConsole.querySelector('.console-logs');
  if (logsContainer) {
    logsContainer.innerHTML = '';
    updateLogCount();
  }
}

/**
 * Update visibility of logs based on filters
 */
function updateVisibleLogs(logsContainer) {
  if (!logsContainer) {
    logsContainer = divConsole.querySelector('.console-logs');
  }
  if (!logsContainer) return;

  logsContainer.querySelectorAll('.log-entry').forEach(entry => {
    const type = entry.dataset.type || 'log';
    entry.style.display = consoleState.filters[type] ? '' : 'none';
  });
}

/**
 * Update the log count in toolbar
 */
function updateLogCount() {
  const countEl = divConsole.querySelector('.console-count');
  const logsContainer = divConsole.querySelector('.console-logs');
  if (countEl && logsContainer) {
    const count = logsContainer.querySelectorAll('.log-entry').length;
    countEl.textContent = count;
  }
}

// Override console.log
const originalConsoleLog = console.log;
console.log = function (...args) {
  originalConsoleLog.apply(console, args);
  args.forEach(arg => {
    const message = formatValue(arg);
    addLog(message, 'log');
  });
};

// Override console.warn
const originalConsoleWarn = console.warn;
console.warn = function (...args) {
  originalConsoleWarn.apply(console, args);
  args.forEach(arg => {
    const message = formatValue(arg);
    addLog(message, 'warn');
  });
};

// Override console.error
const originalConsoleError = console.error;
console.error = function (...args) {
  originalConsoleError.apply(console, args);
  args.forEach(arg => {
    const message = formatValue(arg);
    addLog(message, 'error');
  });
};

/**
 * Format a value for display
 */
function formatValue(value, indent = 0) {
  if (typeof value === 'string') {
    return `<span class="json-string">"${escapeHtml(value)}"</span>`;
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
  if (value === undefined) {
    return `<span class="json-null">undefined</span>`;
  }
  if (Array.isArray(value)) {
    return formatArray(value, indent);
  }
  if (typeof value === 'object') {
    return formatObject(value, indent);
  }
  return escapeHtml(String(value));
}

/**
 * Escape HTML special characters
 */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Format an array for display
 */
function formatArray(array, indent = 5) {
  if (array.length === 0) return '[]';

  const spaces = ' '.repeat(indent + 2);
  const formattedItems = array
    .map(item => spaces + formatValue(item, indent + 2))
    .join(',\n');

  return `[\n${formattedItems}\n${' '.repeat(indent)}]`;
}

/**
 * Format an object for display
 */
function formatObject(obj, indent = 5) {
  const entries = Object.entries(obj);
  if (entries.length === 0) return '{}';

  const spaces = ' '.repeat(indent + 2);
  const formattedEntries = entries
    .map(([key, value]) => {
      const formattedValue = formatValue(value, indent + 2);
      return `${spaces}<span class="json-key">"${escapeHtml(key)}":</span> ${formattedValue}`;
    })
    .join(',\n');

  return `{\n${formattedEntries}\n${' '.repeat(indent)}}`;
}

/**
 * Add a log entry to the console
 */
function addLog(message, type = 'log') {
  const logsContainer = divConsole.querySelector('.console-logs');
  if (!logsContainer) return;

  const logElement = document.createElement('div');
  logElement.classList.add('log-entry', `log-${type}`);
  logElement.dataset.type = type;

  const icon = type === 'log' ? '●' : type === 'warn' ? '▲' : '✖';
  logElement.innerHTML = `<span class="log-icon">${icon}</span><pre>${message}</pre>`;

  // Hide if filter is off
  if (!consoleState.filters[type]) {
    logElement.style.display = 'none';
  }

  logsContainer.appendChild(logElement);
  logsContainer.scrollTop = logsContainer.scrollHeight;

  updateLogCount();
}
