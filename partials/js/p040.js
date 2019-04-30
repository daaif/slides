const points = [ 100, 90, 100, 90, 100, 90, 100]   

const alphaScale = d3.scaleLinear([0, 6], [0, 2 * Math.PI])
const rScale = d3.scaleLinear([0, 140], [0, 180])

const lineGen = d3.radialLine()
    .angle((d, i) => alphaScale(i))
    .radius((d, i) => rScale(d))

const graph = d3.select('svg g')

graph.append('path')
    .attr('d', lineGen(points))


/* Visualisation des points */
graph.selectAll('circle')
    .data(points)
    .enter().append('circle')
        .attr('r', 6)
        .attr('transform', (d, i) => 
            `rotate(${ (alphaScale(i) - Math.PI) * 180 / Math.PI }) 
            translate(0, ${rScale(d)}) `
        )
        