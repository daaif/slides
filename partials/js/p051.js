/* Chargement d'un fichier xml  */
d3.xml('/data/catalogue.xml')
    .then(data => data.querySelectorAll('produit'))
    .then(produits => console.log('xml', produits))

/* Chargement d'un fichier csv  */
d3.csv('/data/catalogue.csv')
    .then(produits => console.log('CSV', produits))

/* Chargement d'un fichier JSON  */
d3.json('/data/catalogue.json')
    .then(produits => console.log('JSON', produits))
        
const out = document.querySelector('.container')
fetch('/data/catalogue.xml').then(d => d.text())
        .then(d => log('xml', d))
fetch('/data/catalogue.csv').then(d => d.text())
        .then(d => log('csv', d))
fetch('/data/catalogue.json').then(d => d.text())
        .then(d => log('json', d))

function log(type, data) {
    const div = document.createElement('div')
    const ta = document.createElement('textarea')
    ta.innerHTML = data
    div.innerHTML = 'Type : <b>' + type + '</b> <br>'
    out.appendChild(div)
    out.appendChild(ta)
}