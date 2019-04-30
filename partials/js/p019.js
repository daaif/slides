let choice = true
let data = [30, 20, 40, 25, 35, 80, 68]
const y = d3.scaleLinear([0, 1000], [400, 0])
const color = d3.scaleLinear([0, 1000], ['green', 'red'])
const color2 = d3.scaleQuantize([0, 1000], ['green', 'orange', 'orangered', 'red'])
const svg = d3.select('svg')
const update = () => {
    const circles = svg.selectAll('line').data(data, d => d) 
    circles.enter().append('line') /* enter() */
        .attr('x1', (d, i) => i * 50 + 50)
        .attr('x2', (d, i) => i * 50 + 50)
        .attr('y1', y(0)).attr('y2', y(0))
    circles.transition()        /* update */
        .attr('x1', (d, i) => i * 50 + 50)
        .attr('x2', (d, i) => i * 50 + 50)
        .attr('y1', y(0)).attr('y2', (d) => y(d))
        .style('stroke', d => color2(d))
    circles.exit().transition()     /* exit() */
        .attr('x1', (d, i) => i * 50  - 60)
        .attr('x2', (d, i) => i * 50 - 60)
        .remove() 
}
setInterval(() => {
    if(choice) data.push(Math.random() * 950 + 50)
    else data.shift()
    choice = !choice
    update()
}, 500)
