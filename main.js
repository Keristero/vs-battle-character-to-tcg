const scrape = require('./VSscraper.js')
const parser = require('./VSdataParser.js')
const parseTechnique = require('./VStechniqueParser')
const util = require('util')
const fs = require('fs')
const JsonDB = require('node-json-db').JsonDB
const JsonDBConfig = require('node-json-db/dist/lib/JsonDBConfig').Config

let db = new JsonDB(new JsonDBConfig("VScards", true, true, '/'));

console.clear()
//random url "https://vsbattles.fandom.com/wiki/Special:Random"

scrape("https://vsbattles.fandom.com/wiki/Special:Random").then((res)=>{
    processedData = parser(res)
    console.log(`=================${processedData.title}===================`)
    //console.log(processedData.techniques)
    db.push(`/${processedData.simpleTitle}`,processedData)
    let json = JSON.stringify(processedData)
    output = "let result = "+json
    fs.writeFileSync('./client/result.js',output)



    /*
    var data = db.getData("/");
    console.log("got data")
    console.log(reanalyse_all_techniques(data))
    /**/
})


function reanalyse_all_techniques(data){
    let totals = {}
    //This is just to help see how well the tags work for testing
    for(let cardName in data){
        for(let technique of data[cardName].techniques){
            parseTechnique(technique)
            console.log(technique)
            for(let propertyName in technique){
                for(let item of technique[propertyName]){
                    let tag = `${propertyName}_${item}`
                    if(item.length > 1){
                        if(!totals[tag]){
                            totals[tag] = 0
                        }
                        totals[tag]++
                    }
                }
            }
        }
    }
    arr_results = Object.keys(totals).map(function(key) {
        return [key, totals[key]];
    });
    arr_results.sort((a,b)=>{
        return b[1]-a[1]
    })
    return arr_results
}