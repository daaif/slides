const points = [ 80, 50, 120, 70, 35, 100]   

const xScale = d3.scaleLinear([0, 6], [0, 300])
const yScale = d3.scaleLinear([0, d3.max(points) + 50], [300, 0])

/* curveLinear, curveCardinal, curveCatmullRom,  /
/  curveMonotone{X|Y}, curveNatural, curveStep       */
const lineGen = d3.line()
    .curve(d3.curveCardinal)
    .x((d, i) => xScale(i))
    .y((d, i) => yScale(d))

const graph = d3.select('svg g')

graph.append('path')
    .attr('d', lineGen(points))

graph.append('g')
    .attr('transform', 'translate(0, 300)')
    .call(d3.axisBottom(xScale).ticks(6))
graph.append('g').call(d3.axisLeft(yScale))
/* Visualisation des points */
graph.selectAll('circle')
    .data(points)
    .enter().append('circle')
        .attr('r', 6)
        .attr('cx', (d, i) => xScale(i))
        .attr('cy', d => yScale(d))