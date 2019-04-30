 /*///////////////////////////////////////////
 // Mettre l'accent sur le changement 
 ///////////////////////////////////////////*/
 const data = [30, 20, 40, 25, 35, 12]
 const svg = d3.select('svg')
 const update = () => {
    const circles = svg.selectAll('circle').data(data)
    circles.enter().append('circle')
        .attr('r', 0)
        .attr('cx', 0).attr('cy', (d, i) => i * 50 + 50)
        .transition()
        .attr('cx', 150)
        .attr('r', d => d / 2)
        .style('fill', 'greenyellow')
    circles.exit().transition()
        .attr('r', 0)
        .attr('cx', 320)
        .remove()
 }
 setInterval(() => {
    if(data.length > 0 && Math.random() > 0.5) data.pop()
    if(data.length < 9 && Math.random() > 0.5) 
        data.push(Math.round(Math.random() * 50))
    update()
 }, 300)
