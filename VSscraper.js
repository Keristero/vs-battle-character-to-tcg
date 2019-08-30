const scrapeIt = require("scrape-it")
//const cheerio = require('cheerio')
const fs = require('fs');
const util = require('util')
const imageDataURI = require('image-data-uri')
const PromiseAllSettled = require('promise.allsettled');
 
function scrape(url){
    return new Promise((resolve,reject)=>{
        scrapeIt(url, {
            simpleTitle:{
                selector:".page-header__title",
                convert: helper_simplifyString
            },
            title: ".page-header__title",
            images:{
                listItem: ".mw-content-text img",
                data:{
                    alt:{
                        attr:"alt"
                    },
                    src:{
                        attr:"src"
                    }
                }
            },
            quotes: {
                listItem: "tr td i"
            },
            categories:{
                listItem:".category"
            },
            paragraphs:{
                listItem: ".mw-content-text p",
                data:{
                    title:{
                        selector: "b:first-of-type",
                        convert: helper_removeColons
                    },
                    tags:{
                        listItem:"b:not(:first-of-type)"
                    },
                    text:{
                        how:"text",
                        convert: helper_removeTitle,
                    },
                }
            },
        }).then(async({data,$,response, body }) => {
            //Get URL
            data.url = response.responseUrl
            //Get equipment, or fall back to splitting the paragraph
            data.equipment = helper_findListByHeader('Standard Equipment:',$)
            if(data.equipment.length == 0){
                data.equipment = helper_getListFromParagraph('Standard Equipment:',data.paragraphs)
                //and double check that it is not placeholder text
                let potentialPlaceholder = data.equipment[0]
                if(potentialPlaceholder && data.equipment.length == 1){
                    //If the potential placeholder exists, and there is only one
                    let placeholderWords = ["none","notable","nothing"]
                    for(let placeholder of placeholderWords){
                        if(potentialPlaceholder.full.toLowerCase().includes(placeholder)){
                            //If it is placeholder text, remove it.
                            data.equipment = []
                        }
                    }
                }
            }
            //Get techniques, or fall back to splitting the paragraph
            data.techniques = helper_findListByHeader('Notable Attacks/Techniques:',$)
            if(data.techniques.length == 0){
                data.techniques = helper_getListFromParagraph('Notable Attacks/Techniques:',data.paragraphs)
            }
            //Get names, or fall back to title
            data.names = helper_getListFromParagraph('Name:',data.paragraphs)
            if(data.names.length == 0){
                data.names = [data.title]
            }
            //Get origin
            let origin = helper_getParagraphByName('Origin:',data.paragraphs)
            if(origin){
                data.origin = origin.text
            }else{
                data.origin = "???"
            }
            //Get classifications
            data.classifications = helper_getListFromParagraph('Classification:',data.paragraphs)

            //Get description
            let name = data.names[0].title

            let description = helper_findDescription(data.names,data.paragraphs)
            if(description){
                data.description = description.text
            }
            
            //Get tiers
            let tiersToFind = ["Tier","Attack Potency","Speed","Lifting Strength","Striking Strength","Durability"]
            data.tiers = {}
            for(let tierName of tiersToFind){
                let tierParagraph = helper_getParagraphByName(tierName,data.paragraphs)
                if(tierParagraph){
                    data.tiers[tierName] = tierParagraph.tags
                }else{
                    data.tiers[tierName] = []
                }
            }


            //Delete any paragraphs with no titles
            data.paragraphs = data.paragraphs.filter((paragraph)=>{
                return helper_simplifyString(paragraph.title) != ""
            })
            //Delete any lists with no titles
            /* lists unused
            data.lists = data.lists.filter((list)=>{
                return helper_simplifyString(list.title) != ""
            })
            */
            //Delete any useless images
            let validUrlRegex = /(((https?:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/
            let filteredImages = data.images.filter((image)=>{
                return (validUrlRegex.test(image.src) && helper_simplifyString(image.alt) != '')
            })
            //if no valid images are found, try again without alt text limitation
            if(filteredImages.length == 0){
                filteredImages = data.images.filter((image)=>{
                    return (validUrlRegex.test(image.src))
                })
            }
            //Try to get an image
            data.image = await downloadFirstGoodImageFromImageList(filteredImages)

            resolve(data)
        })
    })
}

async function downloadFirstGoodImageFromImageList(images){
    console.log(images)
    let res_image_data = null
    let promises = []
    for(let image of images){
        promises.push(imageDataURI.encodeFromURL(image.src))
    }
    let results = await PromiseAllSettled(promises)
    results = results.filter((item)=>{
        return item.status == 'fulfilled' ? true : false
    })
    console.log(results.length,"images gotten successfully")

    if(results[0]){
        res_image_data = results[0].value
    }

    return res_image_data
}

function helper_findListByHeader(header,$){
    let simpleHeader = helper_simplifyString(header)
    var p_equipment = $('p').filter(function() {
        return helper_simplifyString($(this).text()) == simpleHeader;
    })
    let list = []
    let equip = $(p_equipment).nextUntil('.mw-content-text + p','div, ul').each((i,e)=>{
        $(e).children().each((i,child)=>{
            //For each list item, find the title
            let titles = $(child).find("b")
            let fullText = $(child).text().trim()
            if($(titles).length == 1){
                //If there is only one title
                let item = {title:helper_removeColons($(titles).text()),full:fullText}
                list.push(item)
            }else if($(titles).length > 1){
                //If there is more than one title
                let startPos = 0
                let lastTitle = "null"
                $(titles).each((i,el)=>{
                    //For each title
                    let title = $(el).text().trim()
                    let shortText = fullText.substring(startPos,fullText.indexOf(title))
                    if(shortText.length > 0){
                        let item = {title:helper_removeColons(lastTitle),full:shortText}
                        list.push(item)
                    }
                    lastTitle = title
                    startPos = fullText.indexOf(title)
                })
            }
        })
    })
    return list
}

function helper_getListFromParagraph(paragraphName,paragraphs){
    let paragraph = helper_getParagraphByName(paragraphName,paragraphs)
    let list = []
    if(paragraph){
        list = helper_textToList(paragraph.text)
    }
    list = list.map((text,index)=>{
        return {title:text,full:text}
    })
    return list
}

function helper_findDescription(names,paragraphs){
    for(let name of names){
        let simplifiedName = helper_simplifyString(name.title)
        for(let paragraph of paragraphs){
            if(helper_simplifyString(paragraph.text).includes(simplifiedName)){
                return paragraph
            }
        }
    }
}

function helper_getParagraphByName(name,paragraphs){
    let searchName = helper_removeColons(helper_simplifyString(name))
    for(let paragraph of paragraphs){
        if(helper_simplifyString(paragraph.title) == searchName){
            return paragraph
        }
    }
    return null
}

function helper_simplifyString(str = ""){
    //Simplify string for comparison to another
    return str.replace(/\s/g, '').toLowerCase()
}

function helper_clean(text){
    //tidy up \n, \' and trim spaces from start and end of string
    return text.replace(/\\'/g,"'").replace(/\\n/g,"").trim()
}

function helper_removeTitle(content){
    return helper_clean(content.substring(content.indexOf(':')+1,content.length)).trim()
}

function helper_removeColons(content){
    return helper_clean(content.replace(':',"")).trim()
}

function helper_textToList(text){
    while(text.indexOf("and ") > 0){
        text = text.replace("and",",").trim()
    }
    while(text.indexOf("|") > 0){
        text = text.replace("|",",").trim()
    }
    while(text.indexOf("/") > 0){
        text = text.replace("/",",").trim()
    }
    let list = text.split(",");
    let returnList = []
    for(let text of list){
        text = text.trim()
        if(text.length > 0){
            returnList.push(text.charAt(0).toUpperCase() + text.substring(1))
        }
    }
    return returnList
}

function helper_countWords(string,words){
    let arr_words = words.split(',')
    let total = 0
    for(let word of arr_words){
        if(string.toLowerCase().includes(word)){
            total++
        }
    }
    return total
}

function helper_classifyItems(techniques,categories){
    let classifications = {}
    for(let technique of techniques){
        let counts = {}
        for(let category in categories){
            let words = categories[category]
            counts[category] = helper_countWords(technique.full,words)
        }
        let highestCategory = null
        let highestValue = 0
        for(let category in counts){
            let value = counts[category]
            if(value > highestValue){
                highestCategory = category
            }
        }
        if(highestCategory){
            if(!classifications[highestCategory]){
                classifications[highestCategory] = []
            }
            classifications[highestCategory].push(technique)
        }
    }
    return classifications
}

let offensiveWords = `attack,strike,hit,punch,kick,knock,charge,ram,shoot,destroy,bite,shot,meteors,crashing,throws,freeze,burn,slash,explo,deadly,
force,shatter,fire,burst,toss,flurry,kill,slam,cut,damage,spike,missile,assault,blast,unleash,spear,demolish,bomb,powerful,stab,blade,projectile,sink,flood,
scorch,injure`
let buffingWords = "increase,cleansed,boost,purge,enhance,aid,support,clone,buff,charging,charge,channel,double,additional"
let healingWords = "heal,healing,restore,recover,regenerate,rejuvenate,replenish"
let debuffingWords = "stun,poison,paralyze,drain,sleep,lower,trap,debuff,boon"

let techniqueCategories = {
    offensive:offensiveWords,
    buffing:buffingWords,
    healing:healingWords,
    debuff:debuffingWords
}

let offensiveEquipmentWords = `fists,knife,gun,grenade,rifle,pistol,revolver,power,inflicts,critical,damage,staff,hammer,crossbow,
sword,katana,shuriken,book,distort,bow`
let defensiveEquipmentWords = "armour,forcefield,nullify,tough,invulnerable,barrier,talisman"
let bonusEquipmentWords = "INT,STR,DEX,END,VIT,HP,ring,glassess,necklace,belt,potion,enhance"

let equipmentCategories = {
    offensive:offensiveEquipmentWords,
    defensive:defensiveEquipmentWords,
    accessory:bonusEquipmentWords
}

module.exports = scrape