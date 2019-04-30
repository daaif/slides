const bourse = [
    { label: 'AA', valeur: 300},
    { label: 'BB', valeur: 340},
    { label: 'CC', valeur: 220},
    { label: 'DD', valeur: 180},
    { label: 'EE', valeur: 230}
]
const margin = {left: 40, right: 10, top: 10, bottom: 30}
const width = 360, height = 360
const graph = d3.select('.graph').append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`)
        graph.append('rect')
            .attr('width', width)
            .attr('height', height)
            .attr('class', 'marge')
const xScale = d3.scaleBand()
    .domain(bourse.map(e => e.label))
    .range([0, width])
    .padding(0.2)
graph.append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(xScale))
const yScale = d3.scaleLinear()
    .domain([0, d3.max(bourse, d => d.valeur) + 50])
    .range([height, 0])
graph.append('g')
    .call(d3.axisLeft(yScale))

graph.selectAll()
    .data(bourse)
    .enter().append('rect')
        .attr('x', d => xScale(d.label))
        .attr('y', d => yScale(d.valeur))
        .attr('height', d => height - yScale(d.valeur))
        .attr('width', xScale.bandwidth())
        .attr('class', 'bar')

