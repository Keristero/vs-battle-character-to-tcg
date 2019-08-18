const scrape = require('./VSscraper.js')
const parser = require('./VSdataParser.js')
const util = require('util')
const fs = require('fs')

console.clear()
//random url "https://vsbattles.fandom.com/wiki/Special:Random"
scrape("https://vsbattles.fandom.com/wiki/Special:Random").then((res)=>{
    processedData = parser(res)
    console.log(`=================${processedData.title}===================`)
    console.log(processedData)
    let json = JSON.stringify(processedData)
    output = "let result = "+json
    fs.writeFileSync('./client/result.js',output)

})

