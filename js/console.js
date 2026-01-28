/**
 * Simple Slides - Enhanced Console
 * Features: Toolbar, Filters, Resize, Clear button
 */

(function() {
  // Prevent multiple initializations in same window
  if (window.consoleInitialized) return;
  window.consoleInitialized = true;

  // Console state
  var consoleState = {
    filters: { log: true, warn: true, error: true },
    height: 150
  };

  // Create main console container
  var divConsole = document.createElement('div');
  divConsole.classList.add('console');
  divConsole.classList.add('hide-console');

  // Create toolbar
  var toolbar = document.createElement('div');
  toolbar.classList.add('console-toolbar');
  toolbar.innerHTML =
    '<div class="console-filters">' +
      '<span class="console-filter log active" data-type="log" title="Afficher/Masquer les logs">' +
        '<i class="console-icon">●</i> Log' +
      '</span>' +
      '<span class="console-filter warn active" data-type="warn" title="Afficher/Masquer les warnings">' +
        '<i class="console-icon">▲</i> Warn' +
      '</span>' +
      '<span class="console-filter error active" data-type="error" title="Afficher/Masquer les erreurs">' +
        '<i class="console-icon">✖</i> Error' +
      '</span>' +
    '</div>' +
    '<div class="console-actions">' +
      '<span class="console-count" title="Nombre de messages">0</span>' +
      '<button class="console-clear" title="Effacer la console (ou double-clic)">' +
        '✕ Clear' +
      '</button>' +
    '</div>';

  // Create resize handle
  var resizeHandle = document.createElement('div');
  resizeHandle.classList.add('console-resize-handle');
  resizeHandle.title = 'Redimensionner la console';

  // Create logs container
  var logsContainer = document.createElement('div');
  logsContainer.classList.add('console-logs');

  // Assemble console
  divConsole.appendChild(resizeHandle);
  divConsole.appendChild(toolbar);
  divConsole.appendChild(logsContainer);

  // Append to body
  document.body.appendChild(divConsole);
  attachConsoleEvents();

  // Double-click to clear (legacy behavior)
  divConsole.addEventListener('dblclick', function(evt) {
    // Only clear if clicking on console body, not toolbar
    if (!evt.target.closest('.console-toolbar')) {
      clearConsoleLogs();
    }
  });

  /**
   * Attach all console event listeners
   */
  function attachConsoleEvents() {
    // Filter click handlers
    toolbar.querySelectorAll('.console-filter').forEach(function(filter) {
      filter.addEventListener('click', function() {
        var type = filter.dataset.type;
        consoleState.filters[type] = !consoleState.filters[type];
        filter.classList.toggle('active');
        updateVisibleLogs(logsContainer);
      });
    });

    // Clear button handler
    toolbar.querySelector('.console-clear').addEventListener('click', function() {
      clearConsoleLogs();
    });

    // Resize functionality
    var isResizing = false;
    var startY, startHeight;

    resizeHandle.addEventListener('mousedown', function(e) {
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
      var delta = startY - e.clientY;
      var newHeight = Math.min(Math.max(80, startHeight + delta), window.innerHeight * 0.8);
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
    resizeHandle.addEventListener('touchstart', function(e) {
      isResizing = true;
      startY = e.touches[0].clientY;
      startHeight = divConsole.offsetHeight;

      document.addEventListener('touchmove', touchResize);
      document.addEventListener('touchend', stopTouchResize);
    });

    function touchResize(e) {
      if (!isResizing) return;
      var delta = startY - e.touches[0].clientY;
      var newHeight = Math.min(Math.max(80, startHeight + delta), window.innerHeight * 0.8);
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
    if (logsContainer) {
      logsContainer.innerHTML = '';
      updateLogCount();
    }
  }

  /**
   * Update visibility of logs based on filters
   */
  function updateVisibleLogs(container) {
    if (!container) container = logsContainer;
    if (!container) return;

    container.querySelectorAll('.log-entry').forEach(function(entry) {
      var type = entry.dataset.type || 'log';
      entry.style.display = consoleState.filters[type] ? '' : 'none';
    });
  }

  /**
   * Update the log count in toolbar
   */
  function updateLogCount() {
    var countEl = divConsole.querySelector('.console-count');
    if (countEl && logsContainer) {
      var count = logsContainer.querySelectorAll('.log-entry').length;
      countEl.textContent = count;
    }
  }

  /**
   * Escape HTML special characters
   */
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Format a value for display
   */
  function formatValue(value, indent) {
    indent = indent || 0;
    if (typeof value === 'string') {
      return '<span class="json-string">"' + escapeHtml(value) + '"</span>';
    }
    if (typeof value === 'number') {
      return '<span class="json-number">' + value + '</span>';
    }
    if (typeof value === 'boolean') {
      return '<span class="json-boolean">' + value + '</span>';
    }
    if (value === null) {
      return '<span class="json-null">null</span>';
    }
    if (value === undefined) {
      return '<span class="json-null">undefined</span>';
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
   * Format an array for display
   */
  function formatArray(array, indent) {
    indent = indent || 5;
    if (array.length === 0) return '[]';

    var spaces = ' '.repeat(indent + 2);
    var formattedItems = array
      .map(function(item) { return spaces + formatValue(item, indent + 2); })
      .join(',\n');

    return '[\n' + formattedItems + '\n' + ' '.repeat(indent) + ']';
  }

  /**
   * Format an object for display
   */
  function formatObject(obj, indent) {
    indent = indent || 5;
    var entries = Object.entries(obj);
    if (entries.length === 0) return '{}';

    var spaces = ' '.repeat(indent + 2);
    var formattedEntries = entries
      .map(function(entry) {
        var key = entry[0];
        var value = entry[1];
        var formattedValue = formatValue(value, indent + 2);
        return spaces + '<span class="json-key">"' + escapeHtml(key) + '":</span> ' + formattedValue;
      })
      .join(',\n');

    return '{\n' + formattedEntries + '\n' + ' '.repeat(indent) + '}';
  }

  /**
   * Add a log entry to the console
   */
  function addLog(message, type) {
    type = type || 'log';
    if (!logsContainer) return;

    var logElement = document.createElement('div');
    logElement.classList.add('log-entry', 'log-' + type);
    logElement.dataset.type = type;

    var icon = type === 'log' ? '●' : type === 'warn' ? '▲' : '✖';
    logElement.innerHTML = '<span class="log-icon">' + icon + '</span><pre>' + message + '</pre>';

    // Hide if filter is off
    if (!consoleState.filters[type]) {
      logElement.style.display = 'none';
    }

    logsContainer.appendChild(logElement);
    logsContainer.scrollTop = logsContainer.scrollHeight;

    updateLogCount();
  }

  // Override console.log
  var originalConsoleLog = console.log;
  console.log = function () {
    originalConsoleLog.apply(console, arguments);
    for (var i = 0; i < arguments.length; i++) {
      var message = formatValue(arguments[i]);
      addLog(message, 'log');
    }
  };

  // Override console.warn
  var originalConsoleWarn = console.warn;
  console.warn = function () {
    originalConsoleWarn.apply(console, arguments);
    for (var i = 0; i < arguments.length; i++) {
      var message = formatValue(arguments[i]);
      addLog(message, 'warn');
    }
  };

  // Override console.error
  var originalConsoleError = console.error;
  console.error = function () {
    originalConsoleError.apply(console, arguments);
    for (var i = 0; i < arguments.length; i++) {
      var message = formatValue(arguments[i]);
      addLog(message, 'error');
    }
  };

})(); // End of IIFE
