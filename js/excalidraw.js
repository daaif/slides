function toggleExcalidraw(evt) {
    evt.preventDefault()
    const link =  evt.target.closest('a')
    const container = document.getElementById('excalidraw-container');
    const currentDisplay = container.style.display;
    container.style.display = currentDisplay === 'none' ? 'block' : 'none';
    if(currentDisplay === 'none') {
      link.classList.remove('btn-outline-primary')
      link.classList.add('btn-outline-danger')
    } else {
      link.classList.add('btn-outline-primary')
      link.classList.remove('btn-outline-danger')
    }
  }