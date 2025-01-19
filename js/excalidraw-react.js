const { Excalidraw } = ExcalidrawLib;

    const ExcalidrawWrapper = () => {
      const [excalidrawAPI, setExcalidrawAPI] = React.useState(null);

      return React.createElement(Excalidraw, {
        ref: (api) => setExcalidrawAPI(api),
        initialData: {
          appState: {
            viewBackgroundColor: "#ffffff",
            currentItemFontFamily: 1,
            language: "fr"
          }
        },
        UIOptions: {
          canvasActions: {
            changeViewBackgroundColor: true,
            clearCanvas: true,
            loadScene: true,
            saveToActiveFile: true,
            theme: true,
            export: {
              saveFileToDisk: true,
              exportToBackend: false,
              renderCustomUI: null
            }
          }
        }
          
      });
    };

    ReactDOM.createRoot(document.getElementById('excalidraw-root')).render(
      React.createElement(ExcalidrawWrapper)
    );