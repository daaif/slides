const data = [25, 50, 25]

const canvas = document.querySelector("canvas"),
context = canvas.getContext("2d");
context.translate(canvas.width / 2, canvas.height / 2)

const color1 = d3.scaleOrdinal(['red', 'green', 'blue'])

const pieGen = d3.pie(). sort(null) 
    .startAngle(-Math.PI)
    .endAngle(Math.PI)
    .padAngle(0.01 * Math.PI)
    
const arcGen = d3.arc()
    .innerRadius(80)
    .outerRadius(180)
    .cornerRadius(20)
    .context(context)  /* choix du context de dessin */

const tranches = pieGen(data)

tranches.forEach( (tranche, i) => {
    context.beginPath()
    arcGen(tranche)
    context.fillStyle = color1(i)
    context.fill()
})

context.fillStyle = 'white'
context.font = '38px Serif'
context.textBaseline = 'middle'
context.textAlign = 'center'
tranches.forEach( tranche => {
    const centroid = arcGen.centroid(tranche)
    context.fillText(tranche.value , centroid[0], centroid[1])
})

context.lineWidth = 1
tranches.forEach(arcGen)
context.stroke()
