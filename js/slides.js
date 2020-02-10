(async function() {
    const config = await fetch("config.json").then(resp => resp.json());
    const templates = await fetch("templates.html").then(resp => resp.text());
    document.querySelector("#templates").innerHTML = templates;
    let librariesLoaded = false;
    const progress = document.querySelector("#progress .progress-bar");
    const numSlides = document.querySelector("#numSlides");
    const poppup = document.querySelector(".outer");
    // const tooltip = document.querySelector('#tooltip')
    const librariesContainer = poppup.querySelector(".libraries");
    const initialTemplate = poppup.querySelector(".libraries .library");
    const grads = document.querySelector("#grad");
    const cachedTemplate = initialTemplate.cloneNode(true);
    cachedTemplate.style.display = "";
    initialTemplate.remove();
    const sections = document.querySelectorAll(".slides .slide");
    const slides = [];
    let current = 0,
      previous = 0;
  
    sections.forEach(slide => {
      const type = slide.classList.contains("example") ? "example" : "page";
      const { intro, html, css, js } = slide.dataset;
      slides.push({ slide, type, intro, html, css, js, isLoaded: false });
    });
  
    grads.addEventListener("click", function(evt) {
      const position = parseInt((slides.length * evt.clientX) / this.clientWidth);
      location.hash = position;
    });
    // grads.addEventListener('mouseover', function(evt){
    //     const num = parseInt(evt.target.innerText)
    //     if(num >= 0) {
    //         if (slides[num].tooltip) {
    //             showTooltip(evt.target, slides[num].title)
    //         } else {
    //             const type = slides[0].slide.classList.contains('page') ? 'html' : 'intro'
    //             const url = '/partials/' + type + '/' +
    //             slides[num][type] + '.html'
    //             fetch(url).then(resp => resp.text())
    //             .then(text => {
    //                 const reg = /(<h[^>]+>([^<]+)<\/h)/im
    //                 const matches = reg.exec(text)
    //                 if(matches && matches[2]) {
    //                     showTooltip(evt.target, matches[2])
    //                     slides[num].title = text
    //                 }
    //                 slides[num]['tooltip'] = true
    //             })
    //         }
    //     }
    // })
    // function showTooltip(elm, text) {
    //     tooltip.innerText = text
    //     const bcr = elm.getBoundingClientRect()
    //     tooltip.style.left = bcr.left + 'px'
    //     tooltip.style.top = bcr.height + 'px'
  
    // }
    window.addEventListener("hashchange", function(evt) {
      const hash = parseInt(location.hash.substr(1));
      if (hash >= 0) navigate(hash);
    });
    attachNavigationEvents();
    // Ne pas appeller directement EventHandler
    function navigate(hash = 0) {
      hash = parseInt(hash);
      hash = hash < 0 ? 0 : hash >= slides.length ? slides.length - 1 : hash;
      const direction = current > hash ? "left" : "right";
      previous = current;
      tearDown(previous);
      current = hash;
  
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
      const slide = slides[current];
      if (!slide.isLoaded) {
        loadSlide(slide, hash);
      } else {
        if (slide.type === "example") render(slide);
      }
    }
    function loadSlide(slideObject, hash) {
      if (slideObject.type === "page") {
        const request = new Request(
          config.partials["html"] + slideObject.html + ".html"
        );
        fetch(request)
          .then(response => response.text())
          .then(html => (slideObject.slide.innerHTML = html))
          .then(_ => highlight(slideObject.slide));
        slideObject.isLoaded = true;
      } else {
        const template = document.querySelector("#template div");
  
        slideObject.slide.innerHTML = template.innerHTML;
        attachEvents(slideObject);
        resizeSlide(slideObject);
  
        fetchContent(slideObject);
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
        containerHtml.innerHTML = html;
        slideObject.htmlEditor = CodeMirror.fromTextArea(containerHtml, {
          lineNumbers: true
        });
        containerCss.innerHTML = css;
        slideObject.cssEditor = CodeMirror.fromTextArea(containerCss, {
          lineNumbers: true
        });
        containerJs.innerHTML = js;
        slideObject.jsEditor = CodeMirror.fromTextArea(containerJs, {
          lineNumbers: true
        });
  
        const type = intro ? "intro" : "html";
        render(slideObject);
        showEditor(slideObject.slide, type);
        slideObject.isLoaded = true;
  
        if (config.runOnChange) {
          slideObject.htmlEditor.on("change", () => render(slideObject));
          slideObject.cssEditor.on("change", () => render(slideObject));
          slideObject.jsEditor.on("change", () => render(slideObject));
        }
      });
    }
  
    function attachNavigationEvents() {
      let pageX0 = -1;
      window.addEventListener("keydown", function(evt) {
        //   console.log(evt.keyCode);
        const page = document
          .querySelector(".current")
          .classList.contains("page");
        let keyCode = evt.keyCode,
          isTextarea = evt.target.tagName === "TEXTAREA";
        if (!page && keyCode === 191 && !isTextarea) keyCode = 118;
        evt.stopPropagation();
        switch (keyCode) {
          case 37: // Left
            if (evt.ctrlKey) location.hash = current - 1;
            break;
          case 38: // Up
            if (current > 0 && !isTextarea) location.hash = current - 1;
            break;
          case 39: // Right
            if (evt.ctrlKey) location.hash = current + 1;
            break;
          case 33: // PageUp
            location.hash = current - 1;
            break;
          case 34: // PageDown
            location.hash = current + 1;
            break;
          case 40: // Down
            if (current < slides.length - 1 && !isTextarea)
              location.hash = current + 1;
            break;
          case 13:
            if (evt.ctrlKey) render(getCurrentSlideObject());
            break;
          case 118:
            showNextTab();
        }
      });
      window.addEventListener("touchstart", function(evt) {
        evt.stopImmediatePropagation();
        pageX0 = evt.touches[0].pageX;
      });
  
      window.addEventListener("touchend", function(evt) {
        if (pageX0 === -1) return;
        const delta = evt.changedTouches[0].pageX - pageX0;
        if (delta > 60) location.hash = current - 1;
        else if (delta < -60) location.hash = current + 1;
        pageX0 = -1;
      });
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
  
      navbarCode.addEventListener("click", function(evt) {
        evt.preventDefault();
        if (evt.target !== this) {
          const type = evt.target.innerText.toLowerCase();
          showEditor(slideObject.slide, type);
        }
      });
      navbarRenderer.addEventListener("click", function(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        if (evt.target === this) return;
        switch (evt.target.innerText.toLowerCase()) {
          case "run":
            render(slideObject);
            slideObject.slide.querySelector(".navbar-renderer .run").focus();
            break;
          case "reset":
            loadSlide(slideObject, current);
            break;
          case "libraries":
            showLibraries(slideObject);
            break;
        }
      });
      closeButton.addEventListener("click", closePoppup);
      addLibsButton.addEventListener("click", function() {
        const checkboxes = poppup.querySelectorAll(".library input.sel");
        const globals = poppup.querySelectorAll(".library input.global");
  
        checkboxes.forEach((check, i) => {
          slideObject.libraries[i].selected = check.checked;
          slideObject.libraries[i].global = globals[i].checked;
        });
        render(slideObject);
        closePoppup();
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
      // const initialCodeWidth = code.clientWidth
      // const initialRendererWidth = code.clientWidth
      resizer.addEventListener("mousedown", function downHandler(evt) {
        evt.preventDefault();
        // if(this !== evt.target) return
        resizing = true;
        iframe = slide.querySelector(".container-renderer iframe");
        iframeWindow = iframe.contentWindow;
        window.addEventListener("mousemove", moveHandler);
        //   window.addEventListener("move", moveHandler);
        iframeWindow.addEventListener("mousemove", iframeMoveHandler);
        window.addEventListener("mouseup", upHandler);
        //   iframeWindow.addEventListener("mouseup", upHandler);
      });
      function moveHandler(evt) {
        //if(!down) return
        // const delta = evt.clientX - downX
        //   console.log(evt);
        const bcrCode1 = code.getBoundingClientRect();
        const bcrRenderer = renderer.getBoundingClientRect();
        code.style.width = evt.pageX - bcrCode1.left + "px";
        const bcrCode2 = code.getBoundingClientRect();
        renderer.style.width =
          bcrRenderer.width + bcrCode1.width - bcrCode2.width + "px";
  
        // resize(evt.clientX, slide.clientWidth)
        slide.style.cursor = "ew-resize !important";
      }
      function iframeMoveHandler(evt) {
        const clientRect = iframe.getBoundingClientRect();
        const event = new CustomEvent("mousemove", {
          // view: window,
          bubbles: true,
          cancelable: false
        });
  
        event.clientX = evt.clientX + clientRect.left;
        event.clientY = evt.clientY + clientRect.top;
        event.pageX = evt.pageX + clientRect.left;
        event.pageY = evt.pageY + clientRect.top;
  
        //   console.log(event);
        window.dispatchEvent(event);
      }
      function upHandler(evt) {
        //   console.log("MouseUp Done");
        resizing = false;
        window.removeEventListener("mousemove", moveHandler);
        //   window.removeEventListener("move", moveHandler);
        iframeWindow.removeEventListener("mousemove", iframeMoveHandler);
        window.removeEventListener("mouseup", upHandler);
        //   iframeWindow.removeEventListener("mouseup", upHandler);
      }
      // function resize(x, w) {
      //     const percentCode = 100 * x / w;
      //     const percentRenderer = 100 - percentCode
      //     code.style.width = percentCode + '%';
      //     renderer.style.width = percentRenderer + '%'
      //     // code.style.width =  initialCodeWidth + x + 'px'
      //     // renderer.style.width = initialRendererWidth - x + 'px'
      // }
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
      containerRenderer.innerHTML = "";
      const win = document.createElement("iframe");
      win.setAttribute("frameborder", 0);
      containerRenderer.appendChild(win);
      const doc = win.contentDocument;
  
      attachLibraries(slideObject);
      function attachLibraries(slideObject) {
        if (slideObject.libraries === undefined) refreshLibraries(slideObject);
        const promises = [];
        slideObject.libraries.forEach(lib => {
          if (lib.selected) {
            const script = doc.createElement("script");
            script.setAttribute("src", lib.url);
            doc.head.appendChild(script);
            promises.push(
              new Promise(resolve => {
                script.onload = () => {
                  resolve(true);
                };
              })
            );
          }
        });
        Promise.all(promises).then(function() {
          const style = document.createElement("style");
          style.classList.add("added");
          style.innerText = slideObject.cssEditor.getValue();
          const script = document.createElement("script");
          script.classList.add("added");
          script.textContent = slideObject.jsEditor.getValue("\n");
          doc.head.appendChild(style);
          doc.body.innerHTML = slideObject.htmlEditor.getValue();
          doc.body.appendChild(script);
        });
      }
    }
    function showLibraries(slideObject) {
      refreshLibraries(slideObject);
      const checkboxes = poppup.querySelectorAll(".library input.sel");
      const globals = poppup.querySelectorAll(".library input.global");
      checkboxes.forEach((check, i) => {
        check.checked =
          slideObject.libraries[i].selected || slideObject.libraries[i].global;
        globals[i].checked = slideObject.libraries[i].global;
      });
      poppup.style.display = "";
    }
    function refreshLibraries(slideObject) {
      if (slideObject.libraries === undefined) {
        slideObject.libraries = [];
        config.libraries.forEach(lib => {
          const { name, url, version, global } = lib;
          slideObject.libraries.push({
            selected: global,
            name,
            url,
            version,
            global
          });
        });
        if (!librariesLoaded) {
          config.libraries.forEach(lib => {
            const entree = cachedTemplate.cloneNode(true);
            entree.querySelector(".name").innerText = lib.name;
            entree.querySelector(".url").innerText = lib.url;
            entree.querySelector(".version").innerText = lib.version;
            entree.querySelector(".global").checked = lib.global;
            librariesContainer.appendChild(entree);
          });
          librariesLoaded = true;
        }
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
  
    window.addEventListener("resize", () => setTimeout(resizeGraduations, 30));
    function resizeGraduations(evt) {
      const grads = document.querySelector("#grad");
      grads.innerHTML = "";
      //const bcrWidth = grads.getBoundingClientRect().width
      const width = 100 / slides.length + "%";
      slides.forEach((s, i) => {
        const grad = document.createElement("div");
        grad.style.width = width;
        grad.classList.add("grad");
        grad.innerText = i + 1;
        grads.append(grad);
      });
    }
    setTimeout(resizeGraduations, 30);
    // ALlez au premier slide.
    location.hash = 0;
  })();
  