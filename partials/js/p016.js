/*/ Graphique à barres simple /*/
let choice = true
let data = [30, 20, 40, 25, 35, 80, 68]
const svg = d3.select('svg')
const update = () => {
    const circles = svg.selectAll('line')
    .data(data, d => d)  /* <--- ??! */
    circles.enter().append('line')      /* enter() */
        .attr('x1', (d, i) => i * 50 + 50)
        .attr('x2', (d, i) => i * 50 + 50)
        .attr('y1', 400).attr('y2', 400)
    circles.transition()                /* update */
        .attr('x1', (d, i) => i * 50 + 50)
        .attr('x2', (d, i) => i * 50 + 50)
        .attr('y1', 400).attr('y2', (d) => 400 - d * 4)
    circles.exit().transition()         /* exit() */
        .attr('x1', (d, i) => i * 50  - 60)
        .attr('x2', (d, i) => i * 50 - 60)
        .remove() 
}
setInterval(() => {
    if(choice) data.push(Math.random() * 90 + 10)
    else data.shift()
    choice = !choice
    update()
}, 500)
