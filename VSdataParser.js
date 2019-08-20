const parseTechnique = require('./VStechniqueParser')

let validTiers = {
    "Tier":["0","1-A","1-B","1-C","2-A","2-B","2-C","3-A","3-B","3-C","4-A","4-B","4-C","5-A","5-B","5-C","6-A","6-B","6-C","7-A","7-B","7-C","8-A","8-B","8-C","9-A","9-B","9-C","10-A","10-B","10-C","11-A","11-B","11-C"],
    "Attack Potency":["Below Average","Human","Athlete","Street","Wall","Small Building","Building","Large Building","City Block","Multi-City Block","Small Town","Town","Large Town","Small City","City","Mountain","Large Mountain","Island","Large Island","Small Country","Country","Large Country","Continent","Multi-Continent","Moon","Small Planet","Planet","Large Planet","Dwarf Star","Small Star","Star","Large Star","Solar System","Multi-Solar System","Galaxy","Multi-Galaxy","Universe"].reverse(),
    "Speed":["Below Average Human","Normal Human","Athletic Human","Peak Human","Superhuman","Subsonic","Subsonic+","Transonic","Supersonic","Supersonic+","Hypersonic","Hypersonic+","High Hypersonic","High Hypersonic+","Massively Hypersonic","Massively Hypersonic+","Sub-Relativistic","Sub-Relativistic+","Relativistic","Relativistic+","Speed of Light","FTL","FTL+","Massively FTL","Massively FTL+","Infinite Speed","Immeasurable","Irrelevant","Omnipresent"].reverse(),
    "Lifting Strength":["Below Average Human","Normal Human","Athletic Human","Peak Human","Superhuman","Class 1","Class 5","Class 10","Class 25","Class 50","Class 100","Class K","Class M","Class G","Class T","Class P","Class E","Class Z","Class Y","Pre-Stellar","Stellar","Multi-Stellar","Galactic","Multi-Galactic","Universal","Infinite","Immeasurable","Irrelevant"].reverse(),
    "Striking Strength":["Below Average","Human","Athlete","Street","Wall","Small Building","Building","Large Building","City Block","Multi-City Block","Small Town","Town","Large Town","Small City","City","Mountain","Large Mountain","Island","Large Island","Small Country","Country","Large Country","Continent","Multi-Continent","Moon","Small Planet","Planet","Large Planet","Dwarf Star","Small Star","Star","Large Star","Solar System","Multi-Solar System","Galactic","Multi-Galactic","Universal","High Universal","Universal+","Low Multiversal","Multiversal","Multiversal+","High Multiversal+","Low Complex Multiversal","Complex Multiversal","High Complex Multiversal","Low Hyperversal","Hyperversal","High Hyperversal","Outerversal","High Outerversal","Absolute Infinity"].reverse(),
    "Durability":["Point level","Line level","Plane level","Below Average","Human","Athlete","Street","Wall","Small Building","Building","Large Building","City Block","Multi-City Block","Small Town","Town","Large Town","Small City","City","Mountain","Large Mountain","Island","Large Island","Small Country","Country","Large Country","Continent","Multi-Continent","Moon","Small Planet","Planet","Large Planet","Dwarf Star","Small Star","Star","Large Star","Solar System","Multi-Solar System","Galaxy","Multi-Galaxy","Universe","Universe","High Universe level","Universe level+","Low Multiverse level","Multiverse level","Multiverse level+","High Multiverse level+","Complex Multiverse level","Hyperverse level","High Hyperverse level","Outerverse level","High Outerverse level","Absolute Infinity"].reverse(),
}

let statMapping = {
    "Tier":{
        name:"Cost",
        t:(val)=>{return Math.round(val/4)}// Max 10
    },
    "Attack Potency":{
        name:"TechniquePower",
        t:(val)=>{return Math.round(val/4)}// Max 20
    },
    "Speed":{
        name:"Speed",
        t:(val)=>{return Math.round(val/4)}// Max 10
    },
    "Lifting Strength":{
        name:"AttackPower",
        t:(val)=>{return Math.round(val/4)}// Max 10
    },
    "Striking Strength":{
        name:"EquipmentPower",
        t:(val)=>{return Math.round(val/4)}// Max 20
    },
    "Durability":{
        name:"HP",
        t:(val)=>{return Math.round(val/4)}// Max 40
    }
}

let roundToXManyTiers = 40

module.exports = function(data){
    //Find stats
    let parsedTiers = {}
    let tiersFound = 0
    let tierTotal = 0
    for(let className in validTiers){
        let tierValue = GetHighestTierFromData(className,data,validTiers,roundToXManyTiers)
        parsedTiers[className] = tierValue
        if(tierValue != undefined){
            tierTotal+= tierValue;
            tiersFound++;
        }
    }

    //Fill any stats that were not found with averages
    let averageTierValue = Math.round(tierTotal/tiersFound)
    for(let parsedTier in parsedTiers){
        let value = parsedTiers[parsedTier]
        if(value == undefined){
            parsedTiers[parsedTier] = averageTierValue
        }
    }

    //Translate stats into their appropriate values from 0-20 to x
    data.stats = {}
    for(let parsedTier in parsedTiers){
        let value = parsedTiers[parsedTier]
        let stat = statMapping[parsedTier]
        data.stats[stat.name] = stat.t(value)
    }
    //Parse Techniques
    for(let technique of data.techniques){
        parseTechnique(technique)
    }

    //Remove all paragraphs
    delete data.paragraphs

    return data
}

function GetHighestTierFromData(type,data,validTiers,roundToXManyTiers){
    let tiersToMatch = validTiers[type]
    let taggedTiers = data.tiers[type]
    let i = 0
    for(let tier of tiersToMatch){
        for(let taggedTier of taggedTiers){
            if(taggedTier.toUpperCase().includes(tier.toUpperCase())){
                return Math.round((1-(i / tiersToMatch.length))*roundToXManyTiers)
            }
        }
        i++
    }
    return undefined
}