 const g1 = d3.select('.container')
        .append('svg')
        .attr('width', 200)
        .attr('height', 600)
            .append('g')
                .attr('transform', 'translate(10, 10)');
 const circles = g1.selectAll('circle')
    .data([30, 40, 20, 60])
    .enter()
        .append('circle')
            .attr('cy', (d, i) => 50 * i + 50)
            .attr('cx', 90)
            .attr('r', d => d)
            .style('fill', 'orangered');