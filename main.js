const scrape = require('./VSscraper.js')
const parser = require('./VSdataParser.js')

class VSCardParser{
    constructor(){
    }
    GetCardDataFromURL(url){
        let requiredCategories = ["Characters","Animals","Game Characters","Video Game Characters"]
        return new Promise(async(resolve,reject)=>{
            try{
                let result = await scrape(url)
                let processedData = parser(result,requiredCategories)
                resolve(processedData)
            }catch(e){
                reject(e)
            }
        })
    }
}

module.exports = new VSCardParser