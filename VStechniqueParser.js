module.exports = function(technique){
    techniqueTextLowerCase = technique.full.toLowerCase()
    for(let propertyName in techniqueParsingKeywords){
        technique[propertyName] = ParseTechniquePropertyTypes(techniqueParsingKeywords[propertyName],techniqueTextLowerCase)
    }
}

class Technique{

}

function ParseTechniquePropertyTypes(property,techniqueText){
    let wordsFoundForEachType = []
    for(let typeName in property.types){
        let keywords = property.types[typeName];
        keywords = keywords.split(",")
        let wordsFound = 0
        for(let keyword of keywords){
            if(techniqueText.includes(keyword)){
                wordsFound++
            }
        }
        wordsFoundForEachType.push({type:typeName,words:wordsFound})
    }
    //Remove types that dont meet minimum word count
    wordsFoundForEachType = wordsFoundForEachType.filter((i)=>{
        return i.words >= property.minimumWords
    })
    //Sort remaining types by the amount of words found
    wordsFoundForEachType.sort((a,b)=>{
        return b.words-a.words
    })
    //return first x in array
    let result = []
    for(let i = 0; i < Math.min(property.maxTypesSelected,wordsFoundForEachType.length); i++){
        result.push(wordsFoundForEachType[i].type)
    }
    return result
}

function allKeywordsFromProperties(propertyNames){
    let keywords = ""
    for(let propertyName of propertyNames){
        let property = techniqueParsingKeywords[propertyName]
        for(let typeName in property.types){
            if(keywords.length > 0){
                keywords+=","
            }
            keywords+=property.types[typeName]
        }
    }
    return keywords
}

let techniqueParsingKeywords = {}
techniqueParsingKeywords.targeting = {
    defaultType:"single_target",
    maxTypesSelected:1,
    minimumWords:1,
    types:{
        single_target:"strike,opponent,ally",
        all_enemies:"engulf,annihilate,decimate",
    }
 }
 techniqueParsingKeywords.defenseType = {
    defaultType:"block",
    maxTypesSelected:1,
    minimumWords:1,
    types:{
        evade:"dodge,avoid,evade,phase,hide,obscure,camouflage,predict,afterimage,sense,warp",
        block:"deflect,defensive,protection,resistance,reinforce,defend,shield,curl,endure",
        negate:"nullify,negate,barrier,forcefield",
        return_damage:"deflect,reflect,return,counter",
        absorb_damage:"absorb"
    }
 }
 techniqueParsingKeywords.hitType = {
    defaultType:"single_hit",
    maxTypesSelected:1,
    minimumWords:1,
    types:{
        single_hit:"blast,crash,opponent,homing,strike",
        multi_hit:"flurry,stream,combo",
        instant_kill:"instant death,instant kill,instantly kills,instant death"
    }
 }
 techniqueParsingKeywords.buffType = {
        defaultType:"stat_increase",
        maxTypesSelected:1,
        minimumWords:1,
        types:{
            stat_increase:"raise,increase,buff,empower,strengthen,fortify,%,double,enhance,blessing,speed,durability,power",
            heal:"heal,restore,HP,healing,regenerate,rejuvenate,replenish",
            remove_debuffs:"cleanse,purge,cancel,expel"
        }
 }
 techniqueParsingKeywords.debuffType = {
        defaultType:"stat_reduction",
        maxTypesSelected:1,
        minimumWords:1,
        types:{
            stat_reduction:"speed,durability,power",
            inflict_ailment:"inflict"//a
        }
 }
 techniqueParsingKeywords.ailments = {
        defaultType:"none",
        maxTypesSelected:1,
        minimumWords:1,
        types:{
            none:"",
            poison:"poison,pollute,toxic",
            burn:"burn,inferno,incinerate",
            paralyze:"stun,paralyze,trap,petrify",
            freeze:"freeze,makeverycold"
        }
 }
 techniqueParsingKeywords.element = {
    defaultType:"normal",
    maxTypesSelected:2,
    minimumWords:1,
    types:{
        normal:"",
        fight:"fist,kick,punch,chop,sweep",
        fire:techniqueParsingKeywords.ailments.types.burn+",flame,atomic,flare,explosion",
        earth:"earth",
        water:"water",
        electric:"lightning,bolt,thunder,electric",
        dark:techniqueParsingKeywords.ailments.types.poison,
        air:"air,wind",
        light:"holy",
        magic:"mana,magic,arcane,sorcery,magical"
    }
 }
 techniqueParsingKeywords.animationType = {
    defaultType:"generic",
    maxTypesSelected:2,
    minimumWords:2,
    types:{
        generic:"",
        slash:"slash,cut,chop,slice,stab",
        physicalHit:"punch,kick,slam,",
        explosion:"explosion,explodes,nuke,atomic,detonate,",
        projectile:"homing,projectile,shoot,shot,fire"
    }
 }
 
techniqueParsingKeywords.classification = {
    defaultType:"offensive",
    maxTypesSelected:1,
    minimumWords:1,
    types:{
        offensive:allKeywordsFromProperties(["targeting","hitType"]),
        defensive:allKeywordsFromProperties(["defenseType"]),
        buffing:allKeywordsFromProperties(["buffType"]),
        debuffing:allKeywordsFromProperties(["debuffType","ailments"])
    }
}