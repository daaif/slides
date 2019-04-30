/*/ enter() update et exit() à la fois /*/
let choice = true
let data = [30, 20, 40, 25, 35]
const svg = d3.select('svg')
const update = () => {
    const circles = svg.selectAll('circle')
    .data(data, d => d)  
    circles.enter().append('circle')    /* ener() */
        .attr('r', 0)
        .attr('cx', 0).attr('cy', (d, i) => i * 70 + 70)
        .transition()
        .attr('cx', 150).attr('r', d => d / 2) 
    circles.transition()                /* update */
        .style('fill', 'orangered')
        .attr('cy', (d, i) => i * 70 + 70) 
        .attr('r', d => d / 2)
    circles.exit().transition()         /* exit() */
        .attr('r', 0).attr('cx', 300)
        .remove() 
}
setInterval(() => {
    if(choice) data.push(Math.random() * 50 + 10)
    else data.shift()
    choice = !choice
    update()
}, 500)
