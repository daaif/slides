    let data = [50]

    const color = d3.scaleOrdinal(['red', 'green', 'blue'])

    const pieGen = d3.pie().sort(null) 
        .startAngle(-Math.PI )
        .endAngle(Math.PI)
        .padAngle(0.01 * Math.PI)
        
    const arcGen = d3.arc()
        .innerRadius(80)
        .outerRadius(160)

    const graph = d3.select('svg g')
    function update() {
        const tranches = graph.selectAll('path')
            .data( pieGen(data) )
        tranches.enter().append('path')
            .attr('d', arcGen )
            .style('fill', (d, i) => color(i))
        tranches.transition().duration(400).ease(d3.easeBounceIn)
            .attrTween('d', tween)
            .style('fill', (d, i) => color(i))
    }
    function tween(a) {
        const i = d3.interpolate(this._current, a)
        this._current = i(0)
        return function (t) {
            return arcGen(i(t))
        }
    }
    new Array(60).fill().map((d,i) => 6*i).forEach(e => 
        graph.append('line')
            .attr('y1', 162).attr('y2', 170)
            .attr('class', 'grad')
            .attr('transform', `rotate(${e})`)
    )
    setInterval(() => {
        const rnd = data[0] + Math.round(Math.random() * 20 - 10)
        const value  = rnd > 70 ? 70 : rnd < 30 ? 30 : rnd
        data = [ value, 100 - value]
        update()
    }, 500);