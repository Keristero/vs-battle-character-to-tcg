let VSCardParser = require("./main.js")

VSCardParser.GetCardDataFromURL("https://vsbattles.fandom.com/wiki/Special:Random").then((res)=>{
    console.log(res)
})