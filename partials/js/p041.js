const data = [
    {min: 40, max: 100},
    {min: 10, max: 60},
    {min: 80, max: 90},
    {min: 40, max: 80},
    {min: 20, max: 50},
    {min: 80, max:90},
]    

const xScale = d3.scaleLinear([0, 5], [0, 300])
const yScale = d3.scaleLinear([0, 120], [300, 0])

const fourchette = d3.area()
    .x((d, i) => xScale(i))
    .y0((d, i) => yScale(d.min))
    .y1((d, i) => yScale(d.max))

const graph = d3.select('svg g')

graph.append('path')
    .attr('d', fourchette(data))
    .attr('class', 'curve')

graph.append('g').call(d3.axisLeft(yScale))
graph.append('g')
    .attr('transform', 'translate(0,300)')
    .call(d3.axisBottom(xScale).ticks(6))

graph.append('g').attr('class', 'min').selectAll('circle')
.data(data)
.enter().append('circle')
    .attr('r', 4)
    .attr('cx', (d, i) => xScale(i))
    .attr('cy', d => yScale(d.min))
graph.append('g').attr('class', 'max').selectAll('circle')
.data(data)
.enter().append('circle')
    .attr('r', 4)
    .attr('cx', (d, i) => xScale(i))
    .attr('cy', d => yScale(d.max))
    
        