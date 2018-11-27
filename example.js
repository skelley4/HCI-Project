const rake = require('node-rake')
const keywords = rake.generate("LDA stands for Latent Dirichlet Allocation")
// it'll output: [ 'Latent Dirichlet Allocation', 'LDA stands' ]
console.log(keywords);