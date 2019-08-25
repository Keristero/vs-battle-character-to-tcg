module.exports.parseTechnique = function (techniqueData) {
    let defaultValues = 0
    techniqueTextLowerCase = techniqueData.full.toLowerCase().replace(/[^a-zA-Z ]/g, "")
    for (let propertyName in techniqueParsingKeywords) {
        let property = techniqueParsingKeywords[propertyName]
        let result = ParseTechniquePropertyTypes(property, techniqueTextLowerCase)
        if(result.default){
            defaultValues++
        }
        techniqueData[propertyName] = result.types
    }
    techniqueData.defaults = defaultValues
    return CreateFinalTechniqueFromData(techniqueData)
}

function CreateFinalTechniqueFromData(data) {
    let technique = null

    if(data.classification == "offensive"){
        technique = new OffensiveTechnique(data)
    }
    if(data.classification == "defensive"){
        technique = new DefensiveTechnique(data)
    }
    if(data.classification == "buffing"){
        technique = new BuffTechnique(data)
    }
    if(data.classification == "debuffing"){
        technique = new DebuffTechnique(data)
    }

    return technique
}

class Technique{
    constructor(data){
        this.view = {
            title_font_color:"white",
            title_font_shadow:"black",
        }
        this.title = data.title.replace(/[^a-zA-Z ]/g, "")
        this.full = data.full
        this.elements = data.elements
        this.defaults = data.defaults
        this.properties = {
        }
    }
    calculateValues(){
        this.multipliers = {
            power:1.5,
            cost:1,
            speed:1,
            hits:1
        }
        for(let propertyName in this.properties){
            let keyword = this.properties[propertyName]
            let info = getKeywordInfo(keyword)
            if(info.modifiers){
                for(let valueName in this.multipliers){
                    if(info.modifiers[valueName] != undefined){
                        this.multipliers[valueName] *= info.modifiers[valueName]
                    }
                }
            }
        }
        for(let elementName of this.elements){
            let info = getKeywordInfo(elementName)
            if(info.modifiers){
                for(let valueName in this.multipliers){
                    if(info.modifiers[valueName] != undefined){
                        this.multipliers[valueName] *= info.modifiers[valueName]
                    }
                }
            }
        }
        console.log(this)
    }
}

class OffensiveTechnique extends Technique{
    constructor(data){
        super(data)
        this.view.title_font_color  = "rgb(255,230,230)"
        this.view.title_font_shadow = "red"

        this.description = `${placeholder("p")} Damage to`
        this.properties.targeting = data.targeting[0]
        this.description += ` ${targetingDescription(this.properties.targeting)}`
        this.properties.hitType = data.hitType[0]
        if(this.properties.hitType == "multi_hit"){
            this.description += ` ${placeholder("x")} times`
        }else if(this.properties.hitType == "may_not_hit"){
            this.description += ` - if it hits`
        }
        this.properties.additionalOffensiveEffects = data.additionalOffensiveEffects[0]
        if(this.properties.additionalOffensiveEffects == "instant_kill"){
            this.description += `, instant kill`
        }else if(this.properties.additionalOffensiveEffects == "can_crit"){
            this.description += `, may critically hit`
        }else if(this.properties.additionalOffensiveEffects == "lifesteal"){
            this.description += `, restores damage dealt`
        }else if(this.properties.additionalOffensiveEffects == "flinch_chance"){
            this.description += `, may flinch`
        }else if(this.properties.additionalOffensiveEffects == "faster"){
            this.description += `, very fast`
        }else if(this.properties.additionalOffensiveEffects == "taunt"){
            this.description += `, taunts`
        }else if(this.properties.additionalOffensiveEffects == "self_destruct"){
            this.description += `, sacrifices self`
        }

        this.description += "."
        this.calculateValues()
    }
}

class DefensiveTechnique extends Technique{
    constructor(data){
        super(data)
        this.view.title_font_color  = "rgb(230,230,255)"
        this.view.title_font_shadow = "blue"

        this.properties.defenseType = data.defenseType[0]
        if(this.properties.defenseType == "evade"){
            this.description = `Evades attacks.`
        }else if(this.properties.defenseType == "block"){
            this.description = `Blocks attacks.`
        }else if(this.properties.defenseType == "negate"){
            this.description = `Negates attacks.`
        }else if(this.properties.defenseType == "negate"){
            this.description = `Negates attacks and returns the damage.`
        }else if(this.properties.defenseType == "return_damage"){
            this.description = `Negates attacks and returns the damage.`
        }else if(this.properties.defenseType == "absorb_damage"){
            this.description = `Negates attacks restores damage as HP.`
        }
        this.calculateValues()
    }
}

class BuffTechnique extends Technique{
    constructor(data){
        super(data)
        this.view.title_font_color  = "rgb(230,255,230)"
        this.view.title_font_shadow = "green"

        this.properties.buffType = data.buffType[0]
        this.properties.targeting = data.targeting[0]
        if(this.properties.buffType == "stat_increase"){
            this.properties.targetStat = data.targetStat[0]
            this.description = `Increase ${this.properties.targetStat} stat of ${targetingDescription(this.properties.targeting)} by ${placeholder("p")}.`
        }else if(this.properties.buffType == "heal"){
            this.description = `Restore ${placeholder("p")} HP to ${targetingDescription(this.properties.targeting)}.`
        }else if(this.properties.buffType == "remove_debuffs"){
            this.description = `Remove negative effects from ${targetingDescription(this.properties.targeting)}.`
        }else if(this.properties.buffType == "clone"){
            this.description = `Make a weaker copy of self.`
        }
        this.calculateValues()
    }
}

class DebuffTechnique extends Technique{
    constructor(data){
        super(data)
        this.view.title_font_color  = "rgb(255,230,255)"
        this.view.title_font_shadow = "purple"

        this.properties.targeting = data.targeting[0]
        this.properties.debuffType = data.debuffType[0]
        if(this.properties.debuffType == "stat_reduction"){
            this.properties.targetStat = data.targetStat[0]
            this.description = `Reduce ${this.properties.targetStat} stat of ${targetingDescription(this.properties.targeting)} by ${placeholder("p")}.`
        }else if(this.properties.debuffType == "inflict_ailment"){
            this.properties.ailment = data.ailment[0]
            this.description = `Inflict ${targetingDescription(this.properties.targeting)} with [${this.properties.ailment}].`
        }
        this.calculateValues()
    }
}


function getKeywordInfo(keyword){
    for(let key in techniqueParsingKeywords){
        let category = techniqueParsingKeywords[key]
        for(let type in category.types){
            if(type == keyword){
                let value = category.types[type]
                return value
            }
        }
    }
}

function targetingDescription(targeting){
    if(targeting == "single_target"){
        return `target`
    }else if(targeting == "all_enemies"){
        return `all enemies`
    }else if(targeting == "random"){
        return `a random target`
    }
}

function keyword(word) {
    //turn a string into a keyword
    return `[${word}]`
}

function placeholder(type){
    return `{${type}}`
}

function list_arr(array) {
    return array.join(" and ")
}


function ParseTechniquePropertyTypes(property, techniqueText) {
    let wordsFoundForEachType = []
    let use_default = false
    for (let typeName in property.types) {
        let keywords = property.types[typeName].keywords;
        keywords = keywords.split(",")
        let wordsFound = 0
        if(keywords[0] != ""){
            for (let keyword of keywords) {
                if (techniqueText.includes(keyword)) {
                    wordsFound++
                }
            }
        }
        wordsFoundForEachType.push({
            type: typeName,
            words: wordsFound
        })
    }
    //Remove types that dont meet minimum word count
    wordsFoundForEachType = wordsFoundForEachType.filter((i) => {
        return i.words >= property.minimumWords
    })
    //Sort remaining types by the amount of words found
    wordsFoundForEachType.sort((a, b) => {
        return b.words - a.words
    })
    //return first x in array
    let result = []
    for (let i = 0; i < Math.min(property.maxTypesSelected, wordsFoundForEachType.length); i++) {
        result.push(wordsFoundForEachType[i].type)
    }
    if(result.length == 0){
        result = [property.defaultType]
        use_default = true
    }
    return {types:result,default:use_default}
}

function allKeywordsFromProperties(propertyNames) {
    let keywords = ""
    for (let propertyName of propertyNames) {
        let property = techniqueParsingKeywords[propertyName]
        for (let typeName in property.types) {
            if (keywords.length > 0) {
                keywords += ","
            }
            keywords += property.types[typeName].keywords
        }
    }
    return keywords
}

/*possible modifiers
power= effects damage of attacks, or buff / debuff strength
hits= effects number of hits
cost= effects cost of use
speed= effects speed multiplier
*/

module.exports.keywords = techniqueParsingKeywords = {}
techniqueParsingKeywords.ailment = {
    defaultType: "none",
    maxTypesSelected: 1,
    minimumWords: 1,
    types: {
        none: {
            keywords: ""
        },
        poison: {
            keywords: "poison,pollute,toxic,sick,acid",
        },
        burn: {
            keywords: "burn,inferno,incinerate,ignite,combust",
        },
        paralyze: {
            keywords: "stun,paralyze,trap,petrify",
        },
        freeze: {
            keywords: "freeze,chill,snow,glacial,frozen,winter,icy,blizzard,absolute zero",
        },
        sleep: {
            keywords: "to sleep,asleep,drug",
        }
    }
}
techniqueParsingKeywords.elements = {
    defaultType: "normal",
    maxTypesSelected: 2,
    minimumWords: 1,
    types: {
        normal: {
            keywords: "",
        },
        fight: {
            keywords: `fist,kick,punch,chop,momentum,sweep,lift,slam,roundhouse,sommersault,palm,shove,throw,grab,suplex,
    knee,lariat,judo,wrist,tackle,chop,feet,arm`,
            modifiers:{speed:1.1,power:1.1},
        },
        weapon: {
            keywords: `slash,cut,slice,stab,dagger,sword,knife,blade,steel,weapon,spear,club,cannon,mortar,boomerang,arrow,
            longbow,crossbow,sling,lance,pike,sabre,tomahawk,axe,rifle,musket,pistol,shotgun,handgun,revolver`,
        },
        fire: {
            keywords: `${techniqueParsingKeywords.ailment.types.burn},fire,flame,atomic,flare,explosion,volcano,
    sun,flaming,red,lava`,
        },
        earth: {
            keywords: "earth,stone,nature,rock,green,leaves,leaf,vine,tree,mud,volcano,lava",
            modifiers:{speed:0.9,cost:0.8},
        },
        water: {
            keywords: `${techniqueParsingKeywords.ailment.types.freeze},water,blue,current,aqua,umi,ocean,sea,river,torrent,flood,
            tsunami,hydro,whirlpool,hurricane,mud,rapids,underwater,drown,bubble,wet`,
        },
        electric: {
            keywords: "lightning,bolt,thunder,electric,zap,shock,arc,discharge",
            modifiers:{speed:1.2,cost:1.5},
        },
        dark: {
            keywords: `${techniqueParsingKeywords.ailment.types.poison},void,dark,nether,null
    blood,evil,black,shadow,night,kill,death,nasty,rude,mean,curse`,
        },
        air: {
            keywords: "air,wind,gust,tornado,hurricane,sky,feather,wing,whirlwind,blow,howling",
        },
        light: {
            keywords: "holy,goddess,heaven,white,light,god,kami,divine,blinding,sun,laser,royal,righteous,justice,heal",
            modifiers:{cost:1.5,power:1.2},
        },
        magic: {
            keywords: "mana,magic,arcane,sorcery,magical,spell,conjure,mystic",
        },
        degenerate:{
            keywords: `naked,nude,clothes,clothing,breasts,panty,skimpy,sex,underwear,ecchi,hentai,lust,aroused,erotic,female,
            climax,kiss,succubus,orgasmic,ectasy,prostitute,groin,tentacle`,
            modifiers:{cost:2,power:2},
        }
    }
}
techniqueParsingKeywords.animationType = {
    defaultType: "generic",
    maxTypesSelected: 2,
    minimumWords: 2,
    types: {
        generic: {
            keywords: ""
        },
        slash: {
            keywords: `${techniqueParsingKeywords.elements.types.weapon}`
        },
        physicalHit: {
            keywords: `${techniqueParsingKeywords.elements.types.fight}`
        },
        explosion: {
            keywords: "explosion,explodes,nuke,atomic,detonate"
        },
        projectile: {
            keywords: "homing,projectile,shoot,shot,fire,launch"
        }
    }
}
techniqueParsingKeywords.targeting = {
    defaultType: "single_target",
    maxTypesSelected: 1,
    minimumWords: 1,
    types: {
        single_target: {
            keywords: "strike,opponent,ally,enemy,target,foe,target",
        },
        all_enemies: {
            keywords: `${techniqueParsingKeywords.animationType.types.explosion},engulf,decimate,everyone,everything,surroundings,area,multitarget`,
            modifiers:{power:0.5}
        },
        random: {
            keywords: `random,unpredictable,anyone,uncontrollable`,
            modifiers:{power:2}
        }
    }
}
techniqueParsingKeywords.defenseType = {
    defaultType: "block",
    maxTypesSelected: 1,
    minimumWords: 1,
    types: {
        evade: {
            keywords: `dodge,avoid,evade,phase,hide,obscure,camouflage,predict,
        afterimage,sense,warp,teleport,blink,dash`
        },
        block: {
            keywords: "deflect,defensive,protection,resistance,reinforce,defend,shield,curl,endure,parry"
        },
        negate: {
            keywords: "nullify,negate,barrier,forcefield,ignores"
        },
        return_damage: {
            keywords: "deflect,reflect,return,counter,riposte",
            modifiers:{cost:2}
        },
        absorb_damage: {
            keywords: "absorb,consume",
            modifiers:{cost:2}
        }
    }
}
techniqueParsingKeywords.hitType = {
    defaultType: "single_hit",
    maxTypesSelected: 2,
    minimumWords: 1,
    types: {
        single_hit: {
            keywords: techniqueParsingKeywords.elements.types.fight + ",blast,crash,opponent,homing"
        },
        multi_hit: {
            keywords: "flurry,stream,combo,two,multiple,times",
            modifiers:{power:0.5,hits:3}
        },
        may_not_hit: {
            keywords: "innacurate,unreliable,miss,unlucky",
            modifiers:{cost:0.5,power:1.5}
        },
    }
}
techniqueParsingKeywords.additionalOffensiveEffects = {
    defaultType: "none",
    maxTypesSelected: 2,
    minimumWords: 1,
    types: {
        none: {
            keywords: ""
        },
        instant_kill: {
            keywords: "instakill,instant death,instant kill,instantly kills,instant death,OHKO,Avada Kedavra,drop dead",
            modifiers:{cost:4}
        },
        can_crit: {
            keywords: "critical,crit,lucky",
            modifiers:{cost:1.25}
        },
        lifesteal: {
            keywords: "lifesteal,damage dealt",
            modifiers:{cost:1.5}
        },
        flinch_chance: {
            keywords: "stun,flinch,cancel",
            modifiers:{cost:2}
        },
        faster: {
            keywords: "instantaneously,immediately,blink of an eye,instant",
            modifiers:{cost:2,speed:1.5}
        },
        self_destruct: {
            keywords: "martyr,sacrifice himself,sacrifice herself,sacrifice themself,kamikaze,suicide",
            modifiers:{power:2}
        },
        taunt: {
            keywords: "taunt,aggro,draw attention",
            modifiers:{cost:2}
        }
    }
}
techniqueParsingKeywords.buffType = {
    defaultType: "stat_increase",
    maxTypesSelected: 1,
    minimumWords: 1,
    types: {
        stat_increase: {
            keywords: `raise,increase,buff,empower,strengthen,fortify,%,double,enhance,blessing,speed,durability,power,additional,bonus,
            quicken,channel`,
            modifiers:{cost:2,power:0.1}
        },
        heal: {
            keywords: `heal,restore,HP,healing,regenerate,rejuvenate,replenish,injury,regeneration,recover,cured`,
            modifiers:{cost:1.5}
        },
        remove_debuffs: {
            keywords: "cleanse,purge,cancel,expel",
            modifiers:{cost:2}
        },
        clone: {
            keywords: "clone",
            modifiers:{cost:4}
        }
    }
}
techniqueParsingKeywords.debuffType = {
    defaultType: "stat_reduction",
    maxTypesSelected: 1,
    minimumWords: 1,
    types: {
        stat_reduction: {
            keywords: "reduce,decrease,impair,lower,incapacitate,slow,weaken,subtract,minus,halve,quater",
            modifiers:{cost:2,power:0.1}
        },
        inflict_ailment: {
            keywords: `${allKeywordsFromProperties(["ailment"])},inflict,disorient`,
            modifiers:{cost:2}
        }
    }
}
techniqueParsingKeywords.targetStat = {
    defaultType: "random",
    maxTypesSelected: 1,
    minimumWords: 1,
    types: {
        random: {
            keywords: ``,
            modifiers:{power:1.5}
        },
        speed: {
            keywords: `speed,slower,faster,slowed,sped`
        },
        attack: {
            keywords: `attack,striking strength,lifting strength,power`
        },
        HP: {
            keywords: `HP,endurance,defense,guard,health,hitpoints,durability`
        },
    }
}
techniqueParsingKeywords.classification = {
    defaultType: "offensive",
    maxTypesSelected: 1,
    minimumWords: 1,
    types: {
        offensive: {
            keywords: `${allKeywordsFromProperties(["targeting","hitType"])},deals,damage`
        },
        defensive: {
            keywords: allKeywordsFromProperties(["defenseType"])
        },
        buffing: {
            keywords: allKeywordsFromProperties(["buffType"])
        },
        debuffing: {
            keywords: allKeywordsFromProperties(["debuffType", "ailment"])
        }
    }
}