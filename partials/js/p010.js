 /*///////////////////////////////////////////
 //  Les données sont plus nombreuses
 //  que les éléments, ici les cercles.
 ///////////////////////////////////////////*/

 const data = [30, 20]

 const svg = d3.select('svg')

 svg.selectAll('circle')
    .data(data)
    .exit()
        .style('fill', 'black')
        