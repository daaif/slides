// Initialize console in iframe context
function initConsoleInIframe(iframeWindow, iframeDoc) {
  if (iframeWindow.consoleInitialized) return;
  iframeWindow.consoleInitialized = true;

  var consoleState = { filters: { log: true, warn: true, error: true }, height: 150 };

  // Create console elements
  var divConsole = iframeDoc.createElement('div');
  divConsole.className = 'console hide-console';

  var toolbar = iframeDoc.createElement('div');
  toolbar.className = 'console-toolbar';
  toolbar.innerHTML =
    '<div class="console-filters">' +
      '<span class="console-filter log active" data-type="log" title="Afficher/Masquer les logs"><i class="console-icon">●</i> Log</span>' +
      '<span class="console-filter warn active" data-type="warn" title="Afficher/Masquer les warnings"><i class="console-icon">▲</i> Warn</span>' +
      '<span class="console-filter error active" data-type="error" title="Afficher/Masquer les erreurs"><i class="console-icon">✖</i> Error</span>' +
    '</div>' +
    '<div class="console-actions">' +
      '<span class="console-count" title="Nombre de messages">0</span>' +
      '<button class="console-clear" title="Effacer la console">✕ Clear</button>' +
    '</div>';

  var resizeHandle = iframeDoc.createElement('div');
  resizeHandle.className = 'console-resize-handle';

  var logsContainer = iframeDoc.createElement('div');
  logsContainer.className = 'console-logs';

  divConsole.appendChild(resizeHandle);
  divConsole.appendChild(toolbar);
  divConsole.appendChild(logsContainer);
  iframeDoc.body.appendChild(divConsole);

  // Event handlers
  toolbar.querySelectorAll('.console-filter').forEach(function(filter) {
    filter.addEventListener('click', function() {
      var type = filter.dataset.type;
      consoleState.filters[type] = !consoleState.filters[type];
      filter.classList.toggle('active');
      logsContainer.querySelectorAll('.log-entry').forEach(function(entry) {
        entry.style.display = consoleState.filters[entry.dataset.type] ? '' : 'none';
      });
    });
  });

  toolbar.querySelector('.console-clear').addEventListener('click', function() {
    logsContainer.innerHTML = '';
    divConsole.querySelector('.console-count').textContent = '0';
  });

  // Resize
  var isResizing = false, startY, startHeight;
  resizeHandle.addEventListener('mousedown', function(e) {
    isResizing = true; startY = e.clientY; startHeight = divConsole.offsetHeight;
    iframeDoc.addEventListener('mousemove', resize);
    iframeDoc.addEventListener('mouseup', stopResize);
  });
  function resize(e) {
    if (!isResizing) return;
    var newHeight = Math.min(Math.max(80, startHeight + (startY - e.clientY)), iframeWindow.innerHeight * 0.8);
    divConsole.style.height = newHeight + 'px';
  }
  function stopResize() {
    isResizing = false;
    iframeDoc.removeEventListener('mousemove', resize);
    iframeDoc.removeEventListener('mouseup', stopResize);
  }

  // Helper functions
  function escapeHtml(str) {
    var div = iframeDoc.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function formatValue(value, indent) {
    indent = indent || 0;
    if (typeof value === 'string') return '<span class="json-string">"' + escapeHtml(value) + '"</span>';
    if (typeof value === 'number') return '<span class="json-number">' + value + '</span>';
    if (typeof value === 'boolean') return '<span class="json-boolean">' + value + '</span>';
    if (value === null) return '<span class="json-null">null</span>';
    if (value === undefined) return '<span class="json-null">undefined</span>';
    if (Array.isArray(value)) {
      if (value.length === 0) return '[]';
      var spaces = ' '.repeat(indent + 2);
      return '[\n' + value.map(function(item) { return spaces + formatValue(item, indent + 2); }).join(',\n') + '\n' + ' '.repeat(indent) + ']';
    }
    if (typeof value === 'object') {
      var entries = Object.entries(value);
      if (entries.length === 0) return '{}';
      var spaces = ' '.repeat(indent + 2);
      return '{\n' + entries.map(function(e) {
        return spaces + '<span class="json-key">"' + escapeHtml(e[0]) + '":</span> ' + formatValue(e[1], indent + 2);
      }).join(',\n') + '\n' + ' '.repeat(indent) + '}';
    }
    return escapeHtml(String(value));
  }

  function addLog(message, type) {
    var logElement = iframeDoc.createElement('div');
    logElement.className = 'log-entry log-' + type;
    logElement.dataset.type = type;
    var icon = type === 'log' ? '●' : type === 'warn' ? '▲' : '✖';
    logElement.innerHTML = '<span class="log-icon">' + icon + '</span><pre>' + message + '</pre>';
    if (!consoleState.filters[type]) logElement.style.display = 'none';
    logsContainer.appendChild(logElement);
    logsContainer.scrollTop = logsContainer.scrollHeight;
    divConsole.querySelector('.console-count').textContent = logsContainer.querySelectorAll('.log-entry').length;
  }

  // Override console methods
  var origLog = iframeWindow.console.log;
  var origWarn = iframeWindow.console.warn;
  var origError = iframeWindow.console.error;

  iframeWindow.console.log = function() {
    origLog.apply(iframeWindow.console, arguments);
    for (var i = 0; i < arguments.length; i++) addLog(formatValue(arguments[i]), 'log');
  };
  iframeWindow.console.warn = function() {
    origWarn.apply(iframeWindow.console, arguments);
    for (var i = 0; i < arguments.length; i++) addLog(formatValue(arguments[i]), 'warn');
  };
  iframeWindow.console.error = function() {
    origError.apply(iframeWindow.console, arguments);
    for (var i = 0; i < arguments.length; i++) addLog(formatValue(arguments[i]), 'error');
  };
}

document.addEventListener('mermaid-ready', (evt) => {
  (async function () {
    const config = await fetch("config.json").then(resp => resp.json());
    const templates = await fetch("templates.html").then(resp => resp.text());
    document.querySelector("#templates").innerHTML = templates;

    // Initialize theme manager
    ThemeManager.init();
    let librariesLoaded = false;
    const progress = document.querySelector("#progress .progress-bar");
    const numSlides = document.querySelector("#numSlides");
    const ytBtn = document.querySelector("#yt");
    const ytIframe = document.querySelector("#ytIframe");
    let videoButtonTimerId;
    let consoleIsEnabled = false
    ytBtn.addEventListener("click", function (evt) {
      evt.preventDefault();
      if (this.classList.contains('yt-close')) {
        ytIframe.style.display = "none";
        ytBtn.innerHTML = "<i class='fab fa-youtube'></i>";
        ytIframe.setAttribute("src", "");
        ytBtn.classList.remove('yt-close');
        ytOverlay.style.display = "none";
      } else {
        const slide = slides[current];
        const url = "//www.youtube.com/embed/"
          + slide.ytid
          + "?autoplay=1&rel=0&controls=0&start="
          + slide.begin
          + ((slide.end) ? "&end=" + slide.end : "");
        ytIframe.setAttribute("src", url);

        ytBtn.classList.add('yt-close');
        ytBtn.innerHTML = "<i class='far fa-window-close'></i>";
        ytIframe.style.display = "";
        if (slide.begin !== undefined && slide.end != undefined) {
          setTimeout(() => {
            this.click();
          }, (slide.end - slide.begin) * 1000)
        }

      }
    })
    const poppup = document.querySelector(".outer");
    const librariesContainer = poppup.querySelector(".libraries");
    const initialTemplate = poppup.querySelector(".libraries .library");
    const grads = document.querySelector("#grad");
    const cachedTemplate = initialTemplate.cloneNode(true);
    cachedTemplate.style.display = "";
    initialTemplate.remove();
    const sections = document.querySelectorAll(".slides > .slide");
    const slides = [];
    let current = 0,
      previous = 0;
    let ytidDefault;
    sections.forEach((slide, index) => {
      const type = slide.classList.contains("example") ? "example" : "page";
      const { page, intro, html, css, js, ytid, begin, end } = slide.dataset;
      ytidDefault = ytid || ytidDefault;
      slides.push({
        slide,
        type,
        page,
        intro,
        html,
        css,
        js,
        ytid: ytidDefault,
        begin: begin !== undefined ? timeInSeconds(begin) : begin,
        end: end !== undefined ? timeInSeconds(end) : end,
        isLoaded: false
      });
    });

    grads.addEventListener("click", function (evt) {
      const position = parseInt((slides.length * evt.clientX) / this.clientWidth);
      location.hash = position;
    });

    window.addEventListener("hashchange", function (evt) {
      const hash = parseInt(location.hash.substr(1));
      if (hash >= 0) navigate(hash);
    });
    attachNavigationEvents();

    function navigate(hash = 0) {
      if (ytBtn.classList.contains('yt-close'))
        ytBtn.click();
      hash = parseInt(hash);
      hash = hash < 0 ? 0 : hash >= slides.length ? slides.length - 1 : hash;
      const direction = current > hash ? "left" : "right";
      previous = current;
      tearDown(previous);
      current = hash;
      const slide = slides[current];
      const position = ((hash + 1) / slides.length) * 100 + "%";
      progress.style.width = position;

      if (config.showNumSlides) {
        const num = current + 1 + " / " + slides.length;
        numSlides.innerText = num;
      }
      slides.forEach((s, i) => {
        s.slide.classList.remove("left");
        s.slide.classList.remove("right");
        if (i === hash) {
          s.slide.classList.add("current");
          s.slide.classList.add(direction);
          s.slide.classList.remove("hide");
        } else {
          s.slide.classList.add("hide");
          s.slide.classList.remove("current");
        }
      });
      if (!slide.isLoaded) {
        loadSlide(slide, hash);
      } else {
        if (slide.type === "example") render(slide);
      }
      slide.begin ?
        ytBtn.classList.remove('d-none') :
        ytBtn.classList.add('d-none');
      ytIframe.style.display = "none";
      
    }
    function loadSlide(slideObject, hash) {
      if (slideObject.type === "page") {
        const request = new Request(
          config.partials["page"] + slideObject.page + ".html"
        );
        fetch(request)
          .then(response => response.text())
          .then(html => slideObject.slide.innerHTML = html)
          .then(_ => slideObject.isLoaded = true)
          .then(_ => attachImagesEvent(slideObject.slide))
          .then(_ => reformatPage(slideObject.slide))
          .then(_ => highlight(slideObject.slide))
          .then(_ => mermaid.run());

      } else {
        const template = document.querySelector("#template div");

        slideObject.slide.innerHTML = template.innerHTML;
        attachEvents(slideObject);
        resizeSlide(slideObject);
        fetchContent(slideObject);
      }
    }

    function attachImagesEvent(slide) {
      const inlineImages = slide.querySelectorAll('.img-inline');
      inlineImages.forEach(img => {
        img.addEventListener('click', function (evt) {
          this.classList.toggle('img-inline-hover');
          const imgWidth = parseInt(getComputedStyle(this).width)
          const bodyWidth = parseInt(getComputedStyle(document.body).width)
          this.style.left = ((bodyWidth - imgWidth) / 2) + 'px';
        });
      });
    }
    function reformatPage(slide) {
      const blinkItems = slide.querySelectorAll('.blink-item');
      if (blinkItems.length > 0) {
        slide.blinkItems = blinkItems;
        slide.currentBlinkIndex = -1;
      }
    }

    function fetchContent(slideObject) {
      const container = slideObject.slide;
      const containerIntro = container.querySelector(".intro");
      const containerHtml = container.querySelector(".html textarea");
      const containerCss = container.querySelector(".css  textarea");
      const containerJs = container.querySelector(".js  textarea");
      const introPath = config.partials.intro;
      const htmlPath = config.partials.html;
      const cssPath = config.partials.css;
      const jsPath = config.partials.js;

      const reqINTRO = new Request(introPath + slideObject.intro + ".html");
      const reqHTML = new Request(htmlPath + slideObject.html + ".html");
      const reqCSS = new Request(cssPath + slideObject.css + ".css");
      const reqJS = new Request(jsPath + slideObject.js + ".js");
      const f0 = slideObject.intro
        ? fetch(reqINTRO).then(response => response.text())
        : Promise.resolve("");

      const f1 = slideObject.html
        ? fetch(reqHTML).then(response => response.text())
        : Promise.resolve("");

      const f2 = slideObject.css
        ? fetch(reqCSS).then(response => response.text())
        : Promise.resolve("");

      const f3 = slideObject.js
        ? fetch(reqJS).then(response => response.text())
        : Promise.resolve("");

      Promise.all([f0, f1, f2, f3]).then(([intro, html, css, js]) => {
        containerIntro.innerHTML = intro;
        highlight(containerIntro);
        mermaid.run()

        containerHtml.innerHTML = html;
        slideObject.htmlEditor = CodeMirror.fromTextArea(containerHtml, {
          lineNumbers: true,
        });
        containerCss.innerHTML = css;
        slideObject.cssEditor = CodeMirror.fromTextArea(containerCss, {
          lineNumbers: true,
        });
        containerJs.innerHTML = js;
        slideObject.jsEditor = CodeMirror.fromTextArea(containerJs, {
          lineNumbers: true,
        });

        const type = intro ? "intro" : "html";
        render(slideObject);
        showEditor(slideObject.slide, type);
        slideObject.isLoaded = true;

        if (config.runOnChange) {

          console.log('runOnChange')
          slideObject.htmlEditor.on("change", () => render(slideObject));
          slideObject.cssEditor.on("change", () => render(slideObject));
          slideObject.jsEditor.on("change", () => render(slideObject));
        }
        if (config.runOnEnter) {
          console.log('RunOnEnter')
          slideObject.htmlEditor.on("keydown",
            (cm, evt) => {
              if (evt.key === 'Enter')
                render(slideObject)
            });
          slideObject.cssEditor.on("keydown",
            (cm, evt) => {
              if (evt.key === 'Enter')
                render(slideObject)
            });
          slideObject.jsEditor.on("keydown",
            (cm, evt) => {
              if (evt.key === 'Enter')
                render(slideObject)
              console.log(evt)
            });
        }
      });
    }

    function attachNavigationEvents() {
      let pageX0 = -1;
      window.addEventListener("keydown", function (evt) {
        const page = document
          .querySelector(".current")
          .classList.contains("page");
        const slideObject = getCurrentSlideObject();
        let keyCode = evt.keyCode,
          isTextarea = evt.target.tagName === "TEXTAREA";
        if (!page && keyCode === 191 && !isTextarea) keyCode = 118;
        evt.stopPropagation();
        switch (keyCode) {
          case 37: // Left
            if (evt.ctrlKey) go(current - 1, -1);
            break;
          case 38: // Up
            if (current > 0 && !isTextarea)
              go(current - 1, -1);
            break;
          case 39: // Right
            if (evt.ctrlKey)
              go(current + 1, 1);
            break;
          case 33: // PageUp
            go(current - 1, -1);
            break;
          case 34: // PageDown
            go(current + 1, 1);
            break;
          case 40: // Down
            if (current < slides.length - 1 && !isTextarea)
              go(current + 1, 1);
            break;
          case 13:
            if (evt.ctrlKey) render(slideObject);
            break;
          case 118:
            showNextTab();
            break;
          case 84: // 'T' key - toggle theme
            if (!isTextarea) ThemeManager.toggle();
            break;
          case 79: // 'O' key - toggle overview mode
            if (!isTextarea) toggleOverviewMode();
            break;
          case 27: // Escape - exit overview mode or close modals
            if (document.body.classList.contains('overview-mode')) {
              exitOverviewMode();
            } else if (isShortcutsModalOpen()) {
              closeShortcutsModal();
            }
            break;
          case 191: // '?' key - show shortcuts (shift + /)
            if (evt.shiftKey && !isTextarea) {
              evt.preventDefault();
              toggleShortcutsModal();
            }
        }
        function go(hash, direction) {
          const slide = slideObject.slide
          if (slide.blinkItems !== undefined) {
            if (
              direction > 0 &&
              slide.currentBlinkIndex < slide.blinkItems.length - 1) {
              slide.currentBlinkIndex += 1;
              updateClasses(slide, direction)
            } else if (
              direction < 0 &&
              slide.currentBlinkIndex > -1) {
              slide.currentBlinkIndex -= 1;
              updateClasses(slide, direction)
            } else {
              location.hash = hash;
            }
          } else {
            location.hash = hash;
          }

          function updateClasses(slide, direction) {
            const currentIndex = slide.currentBlinkIndex;
            for (let i = 0; i < slide.blinkItems.length; i++) {
              slide.blinkItems[i].classList.remove(
                "blink-item-current",
                "blink-item-down",
                "blink-item-up"
              )
              if (i <= currentIndex) {
                slide.blinkItems[i].classList.add("blink-item-active")
              } else {
                slide.blinkItems[i].classList.remove("blink-item-active")
              }
            }
            if (currentIndex > -1) {
              const cls = direction === 1 ? "blink-item-down" : "blink-item-up";
              slide.blinkItems[currentIndex].classList.add("blink-item-current", cls);
            }
          }
        }
      });
      // Improved touch/swipe handling
      let touchStartX = 0;
      let touchStartY = 0;
      let touchStartTime = 0;

      window.addEventListener("touchstart", function (evt) {
        // Don't handle if in overview mode or on interactive elements
        if (document.body.classList.contains('overview-mode')) return;
        if (evt.target.closest('.CodeMirror, .console, .navbar-code, .navbar-renderer, #help')) return;

        touchStartX = evt.touches[0].pageX;
        touchStartY = evt.touches[0].pageY;
        touchStartTime = Date.now();
      }, { passive: true });

      window.addEventListener("touchend", function (evt) {
        if (touchStartX === 0) return;

        const touchEndX = evt.changedTouches[0].pageX;
        const touchEndY = evt.changedTouches[0].pageY;
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        const elapsed = Date.now() - touchStartTime;

        // Calculate velocity for responsive swipe
        const velocity = Math.abs(deltaX) / elapsed;

        // Only trigger if horizontal swipe is dominant
        if (Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
          // Adaptive threshold based on velocity
          const threshold = velocity > 0.5 ? 30 : 60;

          if (deltaX > threshold) {
            location.hash = current - 1; // Swipe right = previous
          } else if (deltaX < -threshold) {
            location.hash = current + 1; // Swipe left = next
          }
        }

        // Reset
        touchStartX = 0;
        touchStartY = 0;
        touchStartTime = 0;
      }, { passive: true });
    }
    function getCurrentSlideObject() {
      const currentSlide = document.querySelector(".slide.current");
      return slides.find(so => so.slide === currentSlide);
    }
    function showNextTab() {
      const slideObject = getCurrentSlideObject();
      const containers = slideObject.slide.querySelectorAll(
        ".container-code>div"
      );
      let lastIntex = 0;
      containers.forEach((c, i) => {
        if (!c.classList.contains("hide")) lastIndex = i;
        c.classList.add("hide");
      });
      const currentIndex = lastIndex >= containers.length - 1 ? 0 : lastIndex + 1;
      containers[currentIndex].classList.remove("hide");
      const lis = slide.querySelectorAll(".current .navbar-code li");
      lis.forEach(li => {
        li.classList.remove("active");
      });
      const type = lis[currentIndex].querySelector("a").innerText.toLowerCase();
      setActive(slideObject.slide, type);
    }
    function showEditor(slide, type) {
      const containers = slide.querySelectorAll(".container-code>div");
      containers.forEach(c => {
        if (c.classList.contains(type)) {
          c.classList.remove("hide");
        } else {
          c.classList.add("hide");
        }
      });
      setActive(slide, type);
    }

    function setActive(slide, type) {
      const lis = slide.querySelectorAll(".current .navbar-code li");
      lis.forEach(li => {
        if (li.innerText.toLowerCase() === type) {
          li.classList.add("active");
          li.querySelector("a").focus();
        } else {
          li.classList.remove("active");
        }
      });
    }

    function attachEvents(slideObject) {
      const navbarCode = slideObject.slide.querySelector(".navbar-code");
      const navbarRenderer = slideObject.slide.querySelector(".navbar-renderer");
      const closeButton = poppup.querySelector(".close");
      const addLibsButton = poppup.querySelector(".addlibs");
      navbarCode.addEventListener("click", function (evt) {
        evt.preventDefault();
        if (evt.target === this) return;

        // Use closest() to handle clicks on icons or text inside buttons
        const btn = evt.target.closest('a');
        if (!btn) return;

        // Get href to determine type (e.g., #html -> html)
        const href = btn.getAttribute('href');
        if (href) {
          const type = href.replace('#', '').toLowerCase();
          showEditor(slideObject.slide, type);
        }
      });
      navbarRenderer.addEventListener("click", function (evt) {
        evt.preventDefault();
        evt.stopPropagation();
        if (evt.target === this) return;

        // Use closest() to handle clicks on icons or text inside buttons
        const btn = evt.target.closest('a');
        if (!btn) return;

        if (btn.classList.contains('run')) {
          render(slideObject);
          btn.focus();
        } else if (btn.classList.contains('reset')) {
          loadSlide(slideObject, current);
        } else if (btn.classList.contains('libs')) {
          showLibraries(slideObject);
        } else if (btn.classList.contains('btn-console')) {
          showHideConsole(btn);
        }
      });
      closeButton.addEventListener("click", closePoppup);

      // Apply button - save selections and close
      addLibsButton.addEventListener("click", function () {
        applyLibraryChanges(slideObject);
        render(slideObject);
        closePoppup();
      });

      // Add new library button
      const addNewLibBtn = poppup.querySelector(".add-new-lib");
      if (addNewLibBtn) {
        addNewLibBtn.addEventListener("click", function () {
          addNewLibrary(slideObject);
        });
      }

      // Enter key in form fields triggers add
      const formInputs = poppup.querySelectorAll(".add-library-form input");
      formInputs.forEach(input => {
        input.addEventListener("keypress", function (evt) {
          if (evt.key === "Enter") {
            evt.preventDefault();
            addNewLibrary(slideObject);
          }
        });
      });

      // Remove library buttons (delegated)
      librariesContainer.addEventListener("click", function (evt) {
        const removeBtn = evt.target.closest(".remove-lib");
        if (removeBtn) {
          const libraryRow = removeBtn.closest(".library");
          const index = Array.from(librariesContainer.querySelectorAll(".library")).indexOf(libraryRow);
          if (index >= 0) {
            removeLibrary(slideObject, index);
          }
        }
      });
    }

    // Apply library checkbox changes
    function applyLibraryChanges(slideObject) {
      const checkboxes = poppup.querySelectorAll(".library input.sel");
      const globals = poppup.querySelectorAll(".library input.global");

      checkboxes.forEach((check, i) => {
        if (slideObject.libraries[i]) {
          slideObject.libraries[i].selected = check.checked;
          slideObject.libraries[i].global = globals[i].checked;
        }
      });
    }

    // Add a new library
    function addNewLibrary(slideObject) {
      const nameInput = poppup.querySelector(".lib-name");
      const urlInput = poppup.querySelector(".lib-url");
      const versionInput = poppup.querySelector(".lib-version");

      const name = nameInput.value.trim();
      const url = urlInput.value.trim();
      const version = versionInput.value.trim() || "custom";

      if (!name || !url) {
        alert("Please enter at least a name and URL for the library.");
        return;
      }

      // Validate URL
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        alert("Please enter a valid URL starting with http:// or https://");
        return;
      }

      // Add to slide libraries
      const newLib = {
        name: name,
        url: url,
        version: version,
        selected: true,
        global: false,
        custom: true
      };

      slideObject.libraries.push(newLib);

      // Also add to config for persistence in session
      config.libraries.push({
        name: name,
        url: url,
        version: version,
        global: false,
        custom: true
      });

      // Add to UI
      addLibraryToUI(newLib, true);

      // Clear form
      nameInput.value = "";
      urlInput.value = "";
      versionInput.value = "";
      nameInput.focus();
    }

    // Add library entry to UI
    function addLibraryToUI(lib, isCustom = false) {
      const entree = cachedTemplate.cloneNode(true);
      entree.querySelector(".name").innerText = lib.name;
      entree.querySelector(".url").innerText = lib.url;
      entree.querySelector(".version").innerText = lib.version;
      entree.querySelector(".sel").checked = lib.selected;
      entree.querySelector(".global").checked = lib.global;
      if (isCustom || lib.custom) {
        entree.classList.add("custom-lib");
      }
      librariesContainer.appendChild(entree);
    }

    // Remove a library
    function removeLibrary(slideObject, index) {
      if (index < 0 || index >= slideObject.libraries.length) return;

      const lib = slideObject.libraries[index];

      // Confirm for non-custom libraries
      if (!lib.custom) {
        if (!confirm(`Remove "${lib.name}" from the library list?`)) {
          return;
        }
      }

      // Remove from slideObject
      slideObject.libraries.splice(index, 1);

      // Remove from config
      const configIndex = config.libraries.findIndex(l => l.url === lib.url);
      if (configIndex >= 0) {
        config.libraries.splice(configIndex, 1);
      }

      // Refresh UI
      refreshLibrariesUI(slideObject);
    }

    // Refresh libraries UI
    function refreshLibrariesUI(slideObject) {
      // Clear current list
      librariesContainer.innerHTML = "";

      // Re-add all libraries
      slideObject.libraries.forEach(lib => {
        addLibraryToUI(lib, lib.custom);
      });
    }

    function resizeSlide(slideObject) {
      if (slideObject.isLoaded) return;
      slide = slideObject.slide;

      let resizing = false;
      let iframe = null,
        iframeWindow = null;

      const code = document.querySelector(".slide.example.current .code");
      const renderer = document.querySelector(".slide.example.current .renderer");
      const resizer = document.querySelector(".slide.example.current .resizer");
      resizer.addEventListener("mousedown", function downHandler(evt) {
        evt.preventDefault();
        resizing = true;
        iframe = slide.querySelector(".container-renderer iframe");
        iframeWindow = iframe.contentWindow;
        window.addEventListener("mousemove", moveHandler);
        iframeWindow.addEventListener("mousemove", iframeMoveHandler);
        window.addEventListener("mouseup", upHandler);
      });
      function moveHandler(evt) {

        const bcrCode1 = code.getBoundingClientRect();
        const bcrRenderer = renderer.getBoundingClientRect();
        code.style.width = evt.pageX - bcrCode1.left + "px";
        const bcrCode2 = code.getBoundingClientRect();
        renderer.style.width =
          bcrRenderer.width + bcrCode1.width - bcrCode2.width + "px";

        slide.style.cursor = "ew-resize !important";
      }
      function iframeMoveHandler(evt) {
        const clientRect = iframe.getBoundingClientRect();
        const event = new CustomEvent("mousemove", {
          bubbles: true,
          cancelable: false
        });

        event.clientX = evt.clientX + clientRect.left;
        event.clientY = evt.clientY + clientRect.top;
        event.pageX = evt.pageX + clientRect.left;
        event.pageY = evt.pageY + clientRect.top;

        window.dispatchEvent(event);
      }
      function upHandler(evt) {
        resizing = false;
        window.removeEventListener("mousemove", moveHandler);
        iframeWindow.removeEventListener("mousemove", iframeMoveHandler);
        window.removeEventListener("mouseup", upHandler);
      }

    }
    function tearDown(index) {
      const slideObject = slides[index];
      const containerRenderer = slideObject.slide.querySelector(
        ".container-renderer"
      );
      if (containerRenderer) containerRenderer.innerHTML = "";
    }
    function render(slideObject) {
      const containerRenderer = slideObject.slide.querySelector(
        ".container-renderer"
      );
      const btnConsole = document.querySelector('.btn-console')
      containerRenderer.innerHTML = "";
      const win = document.createElement("iframe");
      win.setAttribute("frameborder", 0);
      containerRenderer.appendChild(win);
      rendererWindow = win.contentWindow

      attachLibraries(slideObject);
      function attachLibraries(slideObject) {
        if (slideObject.libraries === undefined) refreshLibraries(slideObject);
        const promises = [];
        slideObject.libraries.forEach(lib => {
          if (lib.selected) {
            const script = document.createElement("script");
            script.setAttribute("src", lib.url);
            if (lib.crossorigin)
              script.setAttribute('crossorigin', '')
            win.contentWindow.document.head.appendChild(script)
            // setTimeout(_ => win.contentWindow.document.head.appendChild(script), 0)
            promises.push(
              new Promise(resolve => {
                script.onload = () => {
                  resolve(lib.name);
                };
              })
            );
          }
        });
        Promise.all(promises).then(function (scripts) {
          const iframeDoc = win.contentWindow.document;

          const style = iframeDoc.createElement("style");
          style.classList.add("added");
          style.innerText = slideObject.cssEditor.getValue();

          const link = iframeDoc.createElement('link');
          link.setAttribute("rel", "stylesheet");
          link.setAttribute("href", "../css/output.css");

          // Set HTML content first
          iframeDoc.body.innerHTML = slideObject.htmlEditor.getValue();
          iframeDoc.head.appendChild(style);
          iframeDoc.head.appendChild(link);

          // Initialize console directly in iframe context
          initConsoleInIframe(win.contentWindow, iframeDoc);

          // Create user script IN THE IFRAME CONTEXT
          const script = iframeDoc.createElement("script");
          if (config.babel)
            script.setAttribute("type", "text/babel");
          script.classList.add("added");
          let scriptContent = slideObject.jsEditor.getValue();
          scriptContent = `
          try {
            ${scriptContent}
          } catch(err) {
            console.error('*** ' + err.message + ' ***')
          }
          `
          script.textContent = scriptContent;
          iframeDoc.body.appendChild(script);

          iframeDoc.dispatchEvent(new Event('DOMContentLoaded', {
            bubbles: true,
            cancelable: true
          }));

          divConsole = iframeDoc.querySelector('.console')

          if (divConsole) {
            if (consoleIsEnabled) {
              divConsole.style.display = 'flex'
              divConsole.classList.remove('hide-console')
            } else {
              divConsole.style.display = 'none'
              divConsole.classList.add('hide-console')
            }
            setTimeout(() => {
              divConsole.scrollTop = divConsole.scrollHeight
            }, 10)
          }
        })

      }
    }
    function showLibraries(slideObject) {
      refreshLibraries(slideObject);
      // Clear and rebuild UI to reflect current state
      librariesContainer.innerHTML = "";
      slideObject.libraries.forEach(lib => {
        addLibraryToUI(lib, lib.custom);
      });
      poppup.style.display = "";
    }

    function refreshLibraries(slideObject) {
      if (slideObject.libraries === undefined) {
        slideObject.libraries = [];
        config.libraries.forEach(lib => {
          const { name, url, version, global, crossorigin, custom } = lib;
          slideObject.libraries.push({
            selected: global,
            name,
            url,
            version,
            global,
            crossorigin,
            custom: custom || false
          });
        });
      }
    }
    function closePoppup() {
      poppup.style.display = "none";
    }
    function highlight(elm) {
      const codes = elm.querySelectorAll(".myCode");
      codes.forEach(code => {
        const lines = !code.classList.contains("no-lines");
        CodeMirror.fromTextArea(code, {
          lineNumbers: lines,
          readOnly: true
        });
      });
    }

    window.addEventListener("resize", () => setTimeout(resizeGraduationsWithPreviews, 30));

    setTimeout(resizeGraduationsWithPreviews, 30);
    // Allez au premier slide.
    navigate()

    function timeInSeconds(st) {
      const parts = st.split(':').reverse()
      let t = 0;
      for (let i = 0; i < parts.length; i++) {
        t += parts[i] * 60 ** i;
      }
      return t;
    }
    addEventListener("load", _ => {
      go(1)
      setTimeout(() => go(0), 100)
    })

    function showHideConsole(btn) {
      if (!rendererWindow || !rendererWindow.document) {
        console.warn('Renderer not yet initialized')
        return
      }
      const divConsole = rendererWindow.document.querySelector('.console')
      if (!divConsole) {
        console.warn('Console not yet initialized - try clicking RUN first')
        return
      }
      divConsole.classList.toggle('hide-console')
      const state = divConsole.classList.contains('hide-console')
      if (state) {
        divConsole.style.display = "none"
        consoleIsEnabled = false
        btn.querySelector('.console-label').innerText = 'Console'
      } else {
        divConsole.style.display = "flex"
        divConsole.scrollTop = divConsole.scrollHeight;
        consoleIsEnabled = true
        btn.querySelector('.console-label').innerText = 'Console'
      }
    }

    // =========================================
    // Overview Mode Functions
    // =========================================

    function toggleOverviewMode() {
      if (document.body.classList.contains('overview-mode')) {
        exitOverviewMode();
      } else {
        enterOverviewMode();
      }
    }

    function enterOverviewMode() {
      document.body.classList.add('overview-mode');

      // Add slide numbers and click handlers
      slides.forEach((s, i) => {
        s.slide.setAttribute('data-slide-num', i + 1);
        s.slide.classList.remove('hide');
        s.slide.addEventListener('click', overviewSlideClickHandler);
      });
    }

    function exitOverviewMode() {
      document.body.classList.remove('overview-mode');

      // Remove click handlers and restore normal view
      slides.forEach((s, i) => {
        s.slide.removeEventListener('click', overviewSlideClickHandler);
      });

      // Navigate to current slide
      navigate(current);
    }

    function overviewSlideClickHandler(evt) {
      const clickedSlide = evt.currentTarget;
      const index = slides.findIndex(s => s.slide === clickedSlide);
      if (index !== -1) {
        exitOverviewMode();
        location.hash = index;
      }
    }

    // =========================================
    // Slide Previews on Progress Bar
    // =========================================

    function resizeGraduationsWithPreviews() {
      const gradsContainer = document.querySelector("#grad");
      gradsContainer.innerHTML = "";
      const width = 100 / slides.length + "%";

      slides.forEach((s, i) => {
        const grad = document.createElement("div");
        grad.style.width = width;
        grad.classList.add("grad");
        grad.innerText = i + 1;

        // Add preview container
        const preview = document.createElement("div");
        preview.classList.add("slide-preview");
        preview.setAttribute("data-preview-num", `Slide ${i + 1}`);

        const previewContent = document.createElement("div");
        previewContent.classList.add("slide-preview-content");
        previewContent.innerText = s.type === 'page' ? `Page: ${s.page}` : `Example: ${s.html || s.intro}`;

        preview.appendChild(previewContent);
        grad.appendChild(preview);
        gradsContainer.append(grad);
      });
    }

    // =========================================
    // Keyboard Shortcuts Modal
    // =========================================

    function isShortcutsModalOpen() {
      const modal = document.querySelector('#shortcuts-modal');
      return modal && modal.style.display !== 'none';
    }

    function toggleShortcutsModal() {
      if (isShortcutsModalOpen()) {
        closeShortcutsModal();
      } else {
        openShortcutsModal();
      }
    }

    function openShortcutsModal() {
      const modal = document.querySelector('#shortcuts-modal');
      if (modal) {
        modal.style.display = 'flex';
        // Focus the close button for accessibility
        const closeBtn = modal.querySelector('.shortcuts-close');
        if (closeBtn) closeBtn.focus();
      }
    }

    function closeShortcutsModal() {
      const modal = document.querySelector('#shortcuts-modal');
      if (modal) {
        modal.style.display = 'none';
      }
    }

    // Attach shortcuts modal events
    function attachShortcutsModalEvents() {
      const modal = document.querySelector('#shortcuts-modal');
      const shortcutsBtn = document.querySelector('#shortcuts-btn');
      const closeBtn = modal?.querySelector('.shortcuts-close');

      // Open modal on button click
      if (shortcutsBtn) {
        shortcutsBtn.addEventListener('click', (e) => {
          e.preventDefault();
          openShortcutsModal();
        });
      }

      // Close on X button click
      if (closeBtn) {
        closeBtn.addEventListener('click', closeShortcutsModal);
      }

      // Close on backdrop click
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            closeShortcutsModal();
          }
        });
      }
    }

    // Initialize shortcuts modal events after templates are loaded
    setTimeout(attachShortcutsModalEvents, 100);

  })();
})



