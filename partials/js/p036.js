let data = [25, 50, 25]

const color = d3.scaleOrdinal(['red', 'green', 'blue'])

const pieGen = d3.pie()
    . sort(null) 
    .startAngle(-Math.PI)
    .endAngle(Math.PI)
    .padAngle(0.01 * Math.PI)
    
const arcGen = d3.arc()
    .innerRadius(80)
    .outerRadius(180)

const graph = d3.select('svg g')

const update = () => {
    const tranches = graph.selectAll('path')
                        .data( pieGen(data) )
    tranches.enter().append('path')
        .transition()
        .attr('d', arcGen )
        .style('fill', (d, i) => color(i))
    tranches.transition()
        .attr('d', arcGen )
        .style('fill', (d, i) => color(i))
}
setInterval(() => {
    data = data.map(e => Math.round(Math.random() * 50 + 10))
    update()
}, 500);
