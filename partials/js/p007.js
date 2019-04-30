 /*//////////////////////////////////////////////
 // On sélctionne tous les paragraphes qui
 // qui se trouvent à l'intérieur du container 
 // .para et on leur associe à chacun une donnée
 // du tableau.
 //////////////////////////////////////////////*/ 

 d3.select('.paras')
    .selectAll('p')
        .style('border-color', 'green')
        .data([4, 8, 15, 16, 23, 42])

        //*.style("font-size", d => d + "px")
        //*.style('border-color', 'maroon')
    

