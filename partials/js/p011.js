 /*///////////////////////////////////////////
 // Garder l'EQUILIBRE  Elements / Données 
 ///////////////////////////////////////////*/
 const data = [30, 20, 40, 25, 35, 12]
 const svg = d3.select('svg')
 const update = () => {
    const circles = svg.selectAll('circle').data(data)
    /* ici on ajoute les cercles manquants */
    circles.enter().append('circle')
        .attr('r', d => d / 2)
        .attr('cx', 150).attr('cy', (d, i) => i * 50 + 50)
        .style('fill', 'greenyellow')
    /* ici on supprime les cercles en plus */
    circles.exit().remove()
 }
 setInterval(() => {
    /* Pour chaque interval de 300ms : */
   	/* Avec une proba de 0.5 on joute un élément */
    if(data.length > 0 && Math.random() > 0.5) data.pop()
    /* Avec une proba de 0.5 on supprime un élément */
    if(data.length < 9 && Math.random() > 0.5) 
        data.push(Math.round(Math.random() * 50))
    update()
 }, 300)
