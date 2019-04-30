 /*///////////////////////////////////////////
 //  Les données sont plus nombreuses
 //  que les éléments, ici les cercles.
 ///////////////////////////////////////////*/

 const data = [30, 20, 26, 50, 16]

 const svg = d3.select('svg')

 svg.selectAll('circle')
    .data(data)
    .enter().append('circle')
        .attr('cx', 150)
        .attr('cy', (d,i) => 60 * i + 60)
        .attr('r', d => d / 2)
        .style('fill', 'greenyellow')
        