    /* Les données */
    const data = [25, 50, 25]

    /* Le générateur de tranches */
    const pieGen = d3.pie()
        /* . sort(null) */  /* Par défaut les données sont triées */
        .startAngle(-Math.PI)
        .endAngle(Math.PI)
        .padAngle(0.01 * Math.PI)
    /* Le générateur de commandes pour <path> */
        
    const arcGen = d3.arc()
        .innerRadius(80)
        .outerRadius(180)

    const graph = d3.select('svg g')

    graph.selectAll('path')
        /* On passe le tableau de tranches */
        .data( pieGen(data) )
        /* Pour chaque tranche on crée un <path> */
        .enter().append('path')
            .attr('d', arcGen )
