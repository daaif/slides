document.addEventListener('mermaid-ready', (evt) => {
  (async function () {
    const config = await fetch("config.json").then(resp => resp.json());
    const templates = await fetch("templates.html").then(resp => resp.text());
    document.querySelector("#templates").innerHTML = templates;
    let librariesLoaded = false;
    const progress = document.querySelector("#progress .progress-bar");
    const numSlides = document.querySelector("#numSlides");
    const ytBtn = document.querySelector("#yt");
    const ytIframe = document.querySelector("#ytIframe");
    let videoButtonTimerId;
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
        // console.log(slide);
        const url = "//www.youtube.com/embed/"
          + slide.ytid
          + "?autoplay=1&rel=0&controls=0&start="
          + slide.begin
          + ((slide.end) ? "&end=" + slide.end : "");
        ytIframe.setAttribute("src", url);

        ytBtn.classList.add('yt-close');
        ytBtn.innerHTML = "<i class='far fa-window-close'></i>";
        ytIframe.style.display = "";
        // ytOverlay.style.display = "";
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
          console.log(bodyWidth, imgWidth, ((bodyWidth - imgWidth) / 2) + 'px')
          this.style.left = ((bodyWidth - imgWidth) / 2) + 'px';
        });
      });
    }
    function reformatPage(slide) {
      const blinkItems = slide.querySelectorAll('.blink-item');
      // console.log(blinkItems);
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
          slideObject.htmlEditor.on("change", () => render(slideObject));
          slideObject.cssEditor.on("change", () => render(slideObject));
          slideObject.jsEditor.on("change", () => render(slideObject));
        }
      });
    }

    function attachNavigationEvents() {
      let pageX0 = -1;
      window.addEventListener("keydown", function (evt) {
        //   console.log(evt.keyCode);
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
        }
        function go(hash, direction) {
          const slide = slideObject.slide
          if (slide.blinkItems !== undefined) {
            if (
              direction > 0 &&
              slide.currentBlinkIndex < slide.blinkItems.length - 1) {
              slide.currentBlinkIndex += 1;
              updateClasses(slide, direction)
              // console.log(slide.currentBlinkIndex)
            } else if (
              direction < 0 &&
              slide.currentBlinkIndex > -1) {
              slide.currentBlinkIndex -= 1;
              updateClasses(slide, direction)
              // console.log(slide.currentBlinkIndex)
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
      window.addEventListener("touchstart", function (evt) {
        evt.stopImmediatePropagation();
        pageX0 = evt.touches[0].pageX;
      });

      window.addEventListener("touchend", function (evt) {
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

      navbarCode.addEventListener("click", function (evt) {
        evt.preventDefault();
        if (evt.target !== this) {
          const type = evt.target.innerText.toLowerCase();
          showEditor(slideObject.slide, type);
        }
      });
      navbarRenderer.addEventListener("click", function (evt) {
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
      addLibsButton.addEventListener("click", function () {
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
            setTimeout(_ => win.contentWindow.document.head.appendChild(script), 0)
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
          // scripts.forEach(s => console.log(s));
          // console.log(win.contentWindow.document.body);
          const style = document.createElement("style");
          style.classList.add("added");
          style.innerText = slideObject.cssEditor.getValue();
          const script = document.createElement("script");
          if (config.babel)
            script.setAttribute("type", "text/babel");
          script.classList.add("added");
          script.textContent = slideObject.jsEditor.getValue("\n");
          const link = document.createElement('link');
          link.setAttribute("rel", "stylesheet");
          link.setAttribute("href", "../css/output.css");
          setTimeout(_ => {
            win.contentWindow.document.body.innerHTML = slideObject.htmlEditor.getValue();
            win.contentWindow.document.head.appendChild(style);
            win.contentWindow.document.body.appendChild(script);
            win.contentWindow.document.dispatchEvent(new Event('DOMContentLoaded', {
              bubbles: true,
              cancelable: true
            }));
            win.contentWindow.document.head.appendChild(link);
          }, 0)
          // const attachedConsole = document.createElement('pre');
          // attachedConsole.classList.add('console');
          // doc.body.appendChild(attachedConsole);
          // console.old = console.log;
          // console.log = function () {
          //   var output = "", arg, i;

          //   for (i = 0; i < arguments.length; i++) {
          //     arg = arguments[i];
          //     output += "<span class=\"log-" + (typeof arg) + "\">";

          //     if (
          //       typeof arg === "object" &&
          //       typeof JSON === "object" &&
          //       typeof JSON.stringify === "function"
          //     ) {
          //       output += JSON.stringify(arg);
          //     } else {
          //       output += arg;
          //     }

          //     output += "</span>";
          //   }

          //   attachedConsole.innerHTML += output + "<br>";
          //   console.old.apply(undefined, arguments);
          // };
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
          const { name, url, version, global, crossorigin } = lib;
          slideObject.libraries.push({
            selected: global,
            name,
            url,
            version,
            global,
            crossorigin
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
    // Allez au premier slide.
    navigate()
    /**
     * 
     * @param {string} st ex. 01:23:08
     * @returns number time in seconds
     */
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
  })();
})



