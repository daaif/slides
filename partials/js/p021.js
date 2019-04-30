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
/* Juste pour visualiser la zone du graphique */
/* on trace ici un rectangle en pointillés */
        graph.append('rect')
            .attr('width', width)
            .attr('height', height)
            .attr('class', 'marge')