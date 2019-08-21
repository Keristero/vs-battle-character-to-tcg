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
techniqueParsingKeywords.ailments = {
    defaultType:"none",
    maxTypesSelected:1,
    minimumWords:1,
    types:{
        none:"",
        poison:"poison,pollute,toxic,sick,acid",
        burn:"burn,inferno,incinerate,ignite,combust",
        paralyze:"stun,paralyze,trap,petrify",
        freeze:"freeze,chill,ice,snow,glacial,frozen",
        sleep:"to sleep,asleep,drug"
    }
}
techniqueParsingKeywords.element = {
defaultType:"normal",
maxTypesSelected:2,
minimumWords:1,
types:{
    normal:"",
    fight:`fist,kick,punch,chop,momentum,sweep,lift,slam,roundhouse,sommersault,palm,shove,throw,grab,suplex,
    knee,lariat,judo,wrist,tackle,chop,feet,arm`,
    weapon:`slash,cut,slice,stab,dagger,sword,knife,blade,steel,saber,weapon`,
    fire:`${techniqueParsingKeywords.ailments.types.burn},fire,flame,atomic,flare,explosion,
    sun,flaming,red`,
    earth:"earth,stone,nature,rock,green,leaves,leaf,vine,tree",
    water:`${techniqueParsingKeywords.ailments.types.freeze},water,blue,current`,
    electric:"lightning,bolt,thunder,electric,zap,shock,arc",
    dark:`${techniqueParsingKeywords.ailments.types.poison},void,dark,nether,null
    blood,evil,black,shadow`,
    air:"air,wind,gust,tornado,hurricane,sky,feather,wing,whirlwind,current",
    light:"holy,goddess,heaven,white,light,god,kami,divine,blinding",
    magic:"mana,magic,arcane,sorcery,magical,spell,conjure"
}
}
techniqueParsingKeywords.animationType = {
    defaultType:"generic",
    maxTypesSelected:2,
    minimumWords:2,
    types:{
        generic:"",
        slash:`${techniqueParsingKeywords.element.types.weapon}`,
        physicalHit:`${techniqueParsingKeywords.element.types.fight}`,
        explosion:"explosion,explodes,nuke,atomic,detonate",
        projectile:"homing,projectile,shoot,shot,fire,launch"
    }
 }
techniqueParsingKeywords.targeting = {
    defaultType:"single_target",
    maxTypesSelected:1,
    minimumWords:1,
    types:{
        single_target:"strike,opponent,ally,enemy,target,foe,target",
        all_enemies:`${techniqueParsingKeywords.animationType.types.explosion},engulf,decimate,everyone,everything,surroundings,area`,
        random:`random,unpredictable,anyone`
    }
 }
 techniqueParsingKeywords.defenseType = {
    defaultType:"block",
    maxTypesSelected:1,
    minimumWords:1,
    types:{
        evade:`dodge,avoid,evade,phase,hide,obscure,camouflage,predict,
        afterimage,sense,warp,teleport,blink,dash`,
        block:"deflect,defensive,protection,resistance,reinforce,defend,shield,curl,endure",
        negate:"nullify,negate,barrier,forcefield,ignores",
        return_damage:"deflect,reflect,return,counter,riposte",
        absorb_damage:"absorb,consume"
    }
 }
 techniqueParsingKeywords.hitType = {
    defaultType:"single_hit",
    maxTypesSelected:2,
    minimumWords:1,
    types:{
        single_hit:techniqueParsingKeywords.element.types.fight+",blast,crash,opponent,homing",
        multi_hit:"flurry,stream,combo,two,multiple,times",
        may_not_hit:"innacurate,unreliable,miss,unlucky",
    }
 }
 techniqueParsingKeywords.additionalEffects = {
    defaultType:"none",
    maxTypesSelected:2,
    minimumWords:1,
    types:{
        none:"",
        instant_kill:"instant death,instant kill,instantly kills,instant death",
        can_crit:"critical,crit,lucky",
        lifesteal:"lifesteal,damage dealt",
        flinch_chance:"stun,flinch,cancel",
        faster:"instantaneously,immediately,blink of an eye,instant",
        change_image:"change form,form change,transform into",
        taunt:"taunt,aggro,draw attention"
    }
 }
 techniqueParsingKeywords.buffType = {
        defaultType:"stat_increase",
        maxTypesSelected:1,
        minimumWords:1,
        types:{
            stat_increase:`raise,increase,buff,empower,strengthen,fortify,%,double,enhance,blessing,speed,durability,power,additional,bonus,
            quicken`,
            heal:`heal,restore,HP,healing,regenerate,rejuvenate,replenish,injury`,
            remove_debuffs:"cleanse,purge,cancel,expel",
            clone:"clone"
        }
 }
 techniqueParsingKeywords.debuffType = {
        defaultType:"stat_reduction",
        maxTypesSelected:1,
        minimumWords:1,
        types:{
            stat_reduction:"speed,durability,power,slow",
            inflict_ailment:`${allKeywordsFromProperties(["ailments"])}inflict,disorient`
        }
}
techniqueParsingKeywords.targetStat = {
    defaultType:"random",
    maxTypesSelected:1,
    minimumWords:1,
    types:{
        random:``,
        speed:`speed,slower,faster`,
        attack:`attack,striking strength,lifting strength,power`,
        HP:`HP,endurance,defense,guard,health,hitpoints,durability`,
        all:`all statistics,all attributes,all stats,every stat,every attribute`
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