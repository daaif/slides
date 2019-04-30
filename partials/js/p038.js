const points = [
    [0, 80],
    [50, 50],
    [100, 120],
    [150, 70],
    [200, 35],
    [250, 100]
]

const lineGen = d3.line()

const graph = d3.select('svg g')

graph.append('path')
    .attr('d', lineGen(points))

/* Visualisation des points */
graph.selectAll('circle')
    .data(points)
    .enter().append('circle')
        .attr('r', 6)
        .attr('cx', d => d[0])
        .attr('cy', d => d[1])