    const data = [25, 50, 25]

    const color1 = d3.scaleOrdinal(['red', 'green', 'blue'])
    const color2 = d3.scaleSequential()
        .domain([0, 2 * Math.PI])
        .interpolator(d3.interpolateRainbow)

    const pieGen = d3.pie()
        . sort(null) 
        .startAngle(-Math.PI)
        .endAngle(Math.PI)
        .padAngle(0.01 * Math.PI)
        
    const arcGen = d3.arc()
        .innerRadius(80)
        .outerRadius(180)

    const graph = d3.select('svg g')
    graph.selectAll('path')
        .data( pieGen(data) )
        .enter().append('path')
            .attr('d', arcGen )
            .style('fill', (d, i) => color1(i))
