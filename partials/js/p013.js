 /*///////////////////////////////////////////
 // Mettre à jour les éléments 
 ///////////////////////////////////////////*/

 let data = [30, 20, 40, 25, 35]
 const svg = d3.select('svg')
 const circles = svg.selectAll('circle')
 const update = () => {
    circles.data(data)
    circles.transition()
        .attr('r', d => d / 2)    
 }
 setInterval(() => {
    data = data.map(d => Math.round(Math.random() * 50 + 10))
    update()
 }, 500)
