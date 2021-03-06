import * as complement from './complement'
import * as path from 'path'

interface keyval {
    key: string,
    val: string
}

interface serviceOpt {
    service: string,
    array?: string,
    opt: string,
    params?: string[]
}

interface serviceKeyval {
    service: string,
    array?: string,
    key: string,
    val: string,
    params?: string[]
}

interface serviceValuate {
    service: string,
    value: string,
    params?: string[]
}

interface variableObject {
    var: string,
    lib?: string,
    ini?: string,
    hidden?: string,
    opt?: string[],
    remoteOpt?: string,
    keyval?: keyval[],
    remoteKeyval?: string,
    serviceOpt?: serviceOpt,
    serviceKeyval?: serviceKeyval,
    serviceValuate?: serviceValuate,
    onchange?: string
}

export interface valorizedVariableObject extends variableObject {
    value?: string|number
}

interface groupObject {
    grp: string,
    lib?: string,
    rpt?: string,
    cmp: dictionnary,
    include?: string
}

type dictionnary = (variableObject|groupObject) []

interface valorizedGroupObject extends groupObject {
    occurrences?: (valorizedGroupObject|valorizedVariableObject)[]
}

export type valorizedDictionnary = (valorizedVariableObject|valorizedGroupObject)[]

type values = (string|values)[]

interface pathAndValueObject {
    path: string,
    value: string|number
}

type polymorphicValuesRepresentation = valorizedVariableObject[] | valorizedGroupObject[] | pathAndValueObject[] | values

interface ifObject {
    state: boolean,
    sourceIndex: number
}

type ifStack = ifObject[]

interface forObject {
    grp: string,
    occurrences?: valorizedVariableObject[],
    occurrenceIndex: number,
    sourceIndex: number
}

type forStack = forObject[]

interface formatObject {
    pos: number,
    len: number, 
    text: string
}

type formatStack = formatObject[]

interface service {
    service: string,
    url: string,
    params: {var:string}[],
    response: any
}

type services = service[]

const prefix = '^\\s*#'
const prefixInDeclare = false

const RGXskodgee = /^#\s?skodgee\s*$/
const RGXcomment = new RegExp(prefix)
const RGXservice = new RegExp(prefix.concat('\\s*(service)\\s*$'))
const RGXdeclare = new RegExp(prefix.concat('\\s*(declare)\\s*$'))
const RGXinDeclare = new RegExp( prefixInDeclare ? prefix.concat('\\s*(.*)') : '\\s*(.*)')
const RGXend = new RegExp(prefix.concat('\\s*(end)\\s*$'))
const RGXdoc = new RegExp(prefix.concat('\\s*(dictionnary)\\s+(standard|base64|compact64|compact|serialize64|serialize|dense64|dense)\\s*(v2)*\\s*$'))
const RGXformat = new RegExp(prefix.concat('\\s*(format)\\s*$'))
const RGXpushformat = new RegExp(prefix.concat('\\s*(pushformat)\\s*$'))
const RGXpopformat = new RegExp(prefix.concat('\\s*(popformat)\\s*$'))
const RGXle = /le|LE|<=/
const RGXge = /ge|GE|>=/
const RGXne = /ne|NE|#|!=|<>/
const RGXeq = /eq|EQ|==|=/
const RGXgt = /gt|GT|>/
const RGXlt = /lt|LT|</
const RGXif = new RegExp(prefix.concat('\\s*(if)\\s+{{(\\w+)}}\\s*(eq|EQ|==|=|le|LE|<=|ge|GE|>=|ne|NE|#|!=|<>|gt|GT|>|lt|LT|<)\\s*(\\S+)'))
const RGXfor = new RegExp(prefix.concat('\\s*(for)\\s+{{(\\w+)}}'))
const RGXrepeat = new RegExp(prefix.concat('\\s*(repeat)\\s+{{(\\w+)}}'))
const RGXrepeatInteger = new RegExp(prefix.concat('\\s*(repeat)\\s+(\\w+)'))
const RGXinclude = new RegExp(prefix.concat('\\s*(include)\\s*{{(\\w+)}}'))
const RGXpath = new RegExp(prefix.concat('\\s*(path)\\s*{{(\\w+)}}'))
const RGXmodel = new RegExp(prefix.concat('\\s*(model)\\s*(\\w+)'))
const RGXendif = new RegExp(prefix.concat('\\s*(endif)\\s*$'))
const RGXendfor = new RegExp(prefix.concat('\\s*(endfor)\\s*$'))
const RGXendrepeat = new RegExp(prefix.concat('\\s*(endrepeat)\\s*$'))
const RGXendpath = new RegExp(prefix.concat('\\s*(endpath)\\s*$'))
const RGXendmodel = new RegExp(prefix.concat('\\s*(endmodel)\\s*$'))
const RGXusemodel = new RegExp(prefix.concat('\\s*(usemodel)\\s+(\\w+)'))
const RGXdefnum = new RegExp(prefix.concat('\\s*(defnum)\\s+(\\w+)\\s+(.+)'))
const RGXdefstr = new RegExp(prefix.concat('\\s*(defstr)\\s+(\\w+)\\s+(.+)'))
const RGXcalc = new RegExp(prefix.concat('\\s*(calc)\\s+(\\w+)\\s+(.+)'))
const RGXapostString = /^'(.*)'$/
const RGXquotedString = /^"(.*)"$/
const RGXnumber = /^((?:[+-])?\d+(?:\.\d*)?)$/
const RGXcomposedVar = /([^_]+)_(.+)/
const RGXgenericVars = /{{((?:_?\w+(?:\[\w+\])?)*)}}/
const RGXlocalVariable = /^__([A-Za-z]+)$/
const RGXindex = /^_i$/
const RGXindexAlpha = /^_x$/
const RGXoccurs = /^_n$/
const RGXdate = /^_date$/
const RGXddSmmSyy = /^_ddSmmSyy$/
const RGXddSmmSyyyy = /^_ddSmmSyyyy$/
const RGXyyyyTmmTdd = /^_yyyyTmmTdd$/
const RGXhhDmmDss = /^_hhDmmDss$/
const RGXrepeatIndex = /^_ri\[(\d{1})\]|_ri$/
const RGXrepeatIndexAlpha = /^_rx\[(\d{1})\]|_rx$/
const RGXrepeatMax = /^_rm\[(\d{1})\]|_rm$/
const RGXdictionnary = /(\d{3})(\d{3})(\d{3})\{"sn":"\w+.skl","dt":"/
const RGXdictionnary64 = /(\d{3})(\d{3})(\d{3})dico/

let repeatStack:Array<{indice:number, max:number, sourceIndex:number}>
enum localVariablesType { number="number",string="string" }
let localVariables:Array<{name:string, value:number|string, type:localVariablesType}>

export let nfoCurrentLine:string
export let nfoCurrentIndex:number

/**
 * extrait le dictionnaire du squelette 
 * @param skeletonSourceText source squelette 
 * @returns dictionnary
 */
export function analyzeSkeleton(skeletonSourceText:string):dictionnary {
    let lines = skeletonSourceText.split('\n')
    let declare:string = ""
    let inDeclare:boolean = false
    let errors = []
    lines.forEach( (e,i) => {
        // dans le declare ?
        if(inDeclare===true) {
            // fin du declare ?
            if(RGXend.exec(e)!==null) {
                inDeclare = false
                declare = `[${declare}]`
            } else {
                // ligne de declare ?
                let search = RGXinDeclare.exec(e)
                if(search!==null) declare += search[1]
            }
        } else {
            // d??but d'un declare ?
            if(RGXdeclare.exec(e)!==null) {
                inDeclare = true
            }
        }
    })
    let parsedDeclare:dictionnary
    try {
        parsedDeclare = JSON.parse(declare)
    } catch(error) {
        throw(''.concat(
            `analyzeSkeleton - anomalie d??tect??e dans la d??claration`,
            `\n==> la d??claration des variables trouv??es dans le squelette est invalide`,
            `\n==> {skeletonSourceText} = ${skeletonSourceText}`,
            `\n==> {declare} = ${declare}`,
            error.toString()
        ))
    }
    return parsedDeclare
}

/**
 * G??n??re le code ?? partir du squelette et du dictionnaire valoris??
 * @param skeletonName nom du squelette
 * @param source source du squelette
 * @param vars dictionnaire valoris??
 * @param dictionnary dictionnaire
 * @returns array du code g??n??r??
 */
export function resolveSkeleton(skeletonName:string,source:any,vars:valorizedDictionnary,dictionnary:dictionnary):string[] {

    if(JSON.stringify(vars)!==JSON.stringify(dictionnary)) {
        throw(''.concat(
            `resolveSkeleton - diff??rence d??tect??es entre {vars} et {dictionnary}`,
            `\n==> Dysfonctionnement probable dans la pr??paration locale`,
            `\n==> {vars} = ${vars}`,
            `\n==> {dictionnary} = ${dictionnary}`
        ))
    }

    let inSkodgee:boolean = false
    let inService:boolean = false
    let inDeclare:boolean = false
    let ifStack:ifStack = []
    let forStack:forStack = []
    let sourceCode:string[] = []

    let lineFormat:formatObject|undefined = undefined
    let formatStack:formatStack = []

    let sourceLines = source.split(/\r\n|\n/)
    let sourceIndex = 0
    let processNext = true

    repeatStack = []
    localVariables = []

    let activePath = []

    exploration: while(sourceIndex<sourceLines.length) {

        let line:string = sourceLines[sourceIndex]

        nfoCurrentLine = line
        nfoCurrentIndex = sourceIndex

        // dans le skodgee ?
        if(inSkodgee===true) {
            // fin di skodgee ?
            if(RGXend.exec(line)!==null) {
                inSkodgee = false
            }
            sourceIndex++
            continue exploration
        }

        // debut d'un skodgee ?
        if(RGXskodgee.exec(line)!==null) {
            inSkodgee = true
            sourceIndex++
            continue exploration
        }

        // dans le service ?
        if(inService===true) {
            // fin di service ?
            if(RGXend.exec(line)!==null) {
                inService = false
            }
            sourceIndex++
            continue exploration
        }

        // debut de service ?
        if(RGXservice.exec(line)!==null) {
            inService = true
            sourceIndex++
            continue exploration
        }

        // dans le declare ?
        if(inDeclare===true) {
            // fin du declare ?
            if(RGXend.exec(line)!==null) {
                inDeclare = false
            }
            sourceIndex++
            continue exploration
        }

        // debut d'un declare ?
        if(RGXdeclare.exec(line)!==null) {
            inDeclare = true
            sourceIndex++
            continue exploration
        }

        // fin d'un repeat ?
        if(RGXendrepeat.exec(line)!==null) {
            let cr = repeatStack.slice(-1)[0]
            cr.indice++
            if(cr.indice>cr.max) {
                repeatStack.pop()
                sourceIndex++
                continue exploration
            } else {
                repeatStack.pop()
                repeatStack.push(cr)
                sourceIndex = cr.sourceIndex+1
                continue exploration
            }
        }

        // fin d'un if ?
        if(RGXendif.exec(line)!==null) {
            ifStack.pop()
        }

        // fin d'un for ?
        if(RGXendfor.exec(line)!==null) {
            let cf = forStack.slice(-1)[0]
            if(cf.occurrences==undefined) {
                forStack.pop()
                sourceIndex++
                continue exploration
            }
            cf.occurrenceIndex++
            if(cf.occurrenceIndex<cf.occurrences.length) {
                sourceIndex = cf.sourceIndex+1
                continue exploration
            } else {
                forStack.pop()
            }
        }

        // d??but d'un repeat num??rique ?
        let searchRepeatInteger = RGXrepeatInteger.exec(line)
        if(searchRepeatInteger!==null) {
            repeatStack.push({ indice:1, max: processNext===true ? parseInt(searchRepeatInteger[2]) : 0, sourceIndex:sourceIndex })
            sourceIndex++
            continue exploration
        }

        // d??but d'un repeat variable ?
        let searchRepeat = RGXrepeat.exec(line)
        if(searchRepeat!==null) {
            let max = 0
            // ne pas calculer rsi si on est dans un if ou un for ou un repeat inactif
            // pour 1) ne pas planter et 2) avoir un max ?? z??ro
            if(processNext===true) {
                let rsi = repeatSolve(searchRepeat[2],vars,forStack)
                if(rsi!==undefined) {
                    if(!isNaN(rsi.value) && rsi.value!='') max = parseInt(rsi.value)
                }
            }
            repeatStack.push({ indice:1, max: max, sourceIndex:sourceIndex })
            sourceIndex++
            continue exploration
        }

        // d??but d'un if ?
        let searchif = RGXif.exec(line)
        if(searchif!==null) {
            let ap = activePath.join('')
            let variableWithPath = ap.concat(ap!==''?'_':'',searchif[2])
            // calcul l'??tat du test (forc?? ?? false si on est d??j?? dans un if ou un for inactif)
            let state = processNext===true ? ifSolve(variableWithPath,searchif[3],searchif[4],vars,forStack) : false
            // si le test pr??c??dent dans la pile est faux alors ce test est aussi consid??r?? comme faux
            state = state===true && ifStack.length>0 ? ifStack.slice(-1)[0].state : state
            ifStack.push({ state:state, sourceIndex:sourceIndex })
            sourceIndex++
            continue exploration
        }

        // d??but d'un for ?
        let searchfor = RGXfor.exec(line)
        if(searchfor!==null) {
            let ap = activePath.join('_')
            let variableWithPath = ap.concat(ap!==''?'_':'',searchfor[2])
            // calcul des occurrences trait??es par le for (forc?? ?? undefined si on est d??j?? dans un if ou un for inactif)
            let fsi = processNext===true ? forSolve(variableWithPath,vars,forStack) : undefined
            forStack.push({
                grp: variableWithPath,
                occurrences: fsi!==undefined ? fsi.occurrences : undefined,
                occurrenceIndex: 0,
                sourceIndex: sourceIndex
            })
            // on force l'??tat inactif parce qu'on vient de rentrer dans un for inactif 
            // (ce qui ne change rien si on est d??j?? dans un if ou un for inactif)
            if(forStack.slice(-1)[0].occurrences===undefined) processNext=false
            sourceIndex++
            continue exploration
        }

        // dans un repeat, un if ou un for actif ?

        let doProcessNext = true

        if(repeatStack.length>0) {
            if(repeatStack.slice(-1)[0].indice>repeatStack.slice(-1)[0].max) {
                doProcessNext = false
            }
        }

        if(forStack.length>0) {
            if(forStack.slice(-1)[0].occurrences===undefined) {
                doProcessNext = false
            } else if(forStack.slice(-1)[0].occurrences?.length===0) {
                doProcessNext = false
            }
        }

        if(ifStack.length>0) {
            if(ifStack.slice(-1)[0].state===false) {
                doProcessNext = false
            }
        }

        processNext = doProcessNext

        if(processNext===false) {
            sourceIndex++
            continue exploration
        }

        // ligne de dictionnaire
        let searchdic = RGXdoc.exec(line)
        if(searchdic!==null) {
            line = sourceLines[sourceIndex+1]
            let format = /_+/.exec(line)
            if(format!==null) {
                let ll = format[0].length
                let ii = format.index
                let res = 
                        (searchdic[2]==='base64') ?
                            'dico'.concat(complement.convertBase64(docWith(skeletonName,vars))) :
                        (searchdic[2]==='compact') ?
                            docWith(skeletonName,varsToValues(vars)) :
                        (searchdic[2]==='compact64') ?
                            'dico'.concat(complement.convertBase64(docWith(skeletonName,varsToValues(vars)))) :
                        (searchdic[2]==='serialize') ?
                            docWith(skeletonName,serializePathsAndValues(extractPathsAndValues(vars))) :
                        (searchdic[2]==='serialize64') ?
                            'dico'.concat(complement.convertBase64(docWith(skeletonName,serializePathsAndValues(extractPathsAndValues(vars))))) :
                        (searchdic[2]==='dense') ?
                            docWith(skeletonName,makeDensePathsAndValues(extractPathsAndValues(vars))) :
                        (searchdic[2]==='dense64') ?
                            'dico'.concat(complement.convertBase64(docWith(skeletonName,makeDensePathsAndValues(extractPathsAndValues(vars))))) :
                            docWith(skeletonName,vars)
                let lg = Math.ceil((res.length + 9)/ll)
                res = ('000'+ii).slice(-3)
                    .concat(('000'+ll).slice(-3))
                    .concat(('000'+lg).slice(-3))
                    .concat(res)
                complement.decoupe(res,ll)
                .forEach((fe:string) => {
                    let ss = fe.concat(' '.repeat(ll)).slice(0,ll)
                    sourceCode.push(line.slice(0,ii).concat(ss).concat(line.slice(ii+ll)))
                })
                sourceIndex++
            }
            sourceIndex++
            continue exploration
        }

        // ligne de format
        let searchfmt = RGXformat.exec(line)
        if(searchfmt!==null) {
            line = sourceLines[sourceIndex+1]
            let format = /_+/.exec(line)
            if(format!==null) {
                lineFormat = { pos: format.index, len:format[0].length, text:line }
                sourceIndex++
            } else {
                lineFormat = undefined
            }
            sourceIndex++
            continue exploration
        }

        // directive pushformat
        let searchPushformat = RGXpushformat.exec(line)
        if(searchPushformat!==null) {
            if(lineFormat!==undefined) {
                formatStack.push(lineFormat)
            }
            sourceIndex++
            continue exploration
        }

        // directive popformat
        let searchPopformat = RGXpopformat.exec(line)
        if(searchPopformat!==null) {
            if(formatStack.length>0) {
                lineFormat = formatStack.pop()
            }
            sourceIndex++
            continue exploration
        }
        
        // directive path pour r??solution include
        let searchPath = RGXpath.exec(line)
        if(searchPath!==null) {
            activePath.push(searchPath[2])
            sourceIndex++
            continue exploration
        }

        // directive endpath
        let searchEndpath = RGXendpath.exec(line)
        if(searchEndpath!==null) {
            activePath.pop()
            sourceIndex++
            continue exploration
        }

        // directive defnum
        let searchDefine = RGXdefnum.exec(line)
        if(searchDefine!==null) {
            let lv = localVariables.find(e=>{ return searchDefine!==null ? e.name===searchDefine[2] : false })
            if(lv!==undefined) {
                throw(''.concat(
                    `La variable locale "${searchDefine[2]}" a ??t?? red??finie ?? tort, elle existait d??j??`,
                    `\n==> localVariables :\n${JSON.stringify(vars,null,4)}`
                ))
            }
            let rl = resolveLine(searchDefine[3],vars,forStack,activePath,sourceIndex,skeletonName).replace(/ /g,'')
            let num = rl.replace(/[^-()\d/*+.]/g,'')
            if(num!=rl) {
                throw(''.concat(
                    `La variable locale "${searchDefine[2]}" a ??t?? d??clar??e avec une valeur ${searchDefine[3]} qui n'est pas num??rique`,
                    `\n==> localVariables :\n${JSON.stringify(vars,null,4)}`
                ))
            }
            //let value = eval(rl)
            let value = Function(`"use strict";return (${num})`)()
            localVariables.push({name:searchDefine[2],value:value,type:localVariablesType.number})
            sourceIndex++
            continue exploration
        }

        // directive defstr
        let searchDefstr = RGXdefstr.exec(line)
        if(searchDefstr!==null) {
            let lv = localVariables.find(e=>{ return searchDefstr!==null ? e.name===searchDefstr[2] : false })
            if(lv!==undefined) {
                throw(''.concat(
                    `La variable locale "${searchDefstr[2]}" a ??t?? red??finie ?? tort, elle existait d??j??`,
                    `\n==> localVariables :\n${JSON.stringify(vars,null,4)}`
                ))
            }
            let rl = resolveLine(searchDefstr[3],vars,forStack,activePath,sourceIndex,skeletonName)
            let value = rl
            localVariables.push({name:searchDefstr[2],value:value,type:localVariablesType.string})
            sourceIndex++
            continue exploration
        }

        // directive calc
        let searchSet = RGXcalc.exec(line)
        if(searchSet!==null) {
            let lv = localVariables.find(e=>{ return searchSet!==null ? e.name===searchSet[2] : false })
            if(lv!==undefined) {
                if(lv.type===localVariablesType.number) {
                    let rl = resolveLine(searchSet[3],vars,forStack,activePath,sourceIndex,skeletonName).replace(/ /g,'')
                    let num = rl.replace(/[^-()\d/*+.]/g,'')
                    if(num!==rl) {
                        throw(''.concat(
                            `La variable locale "${searchSet[2]}" qui a ??t?? d??clar??e num??rique est utilis??e`,
                            `\ndans un calcul avec une valeur ${searchSet[3]} qui n'est pas num??rique`,
                            `\n==> localVariables :\n${JSON.stringify(vars,null,4)}`
                        ))
                    }
                    //lv.value = eval(num)    
                    lv.value = Function(`"use strict";return (${num})`)()
                } else {
                    let rl = resolveLine(searchSet[3],vars,forStack,activePath,sourceIndex,skeletonName)
                    lv.value = Function(`"use strict";return (${rl})`)()  
                }
            } else {
                throw(''.concat(
                    `La variable locale "${searchSet[2]}" n'a pas ??t?? r??solue`,
                    `\n==> localVariables :\n${JSON.stringify(vars,null,4)}`
                ))
            }
            sourceIndex++
            continue exploration
        }

        // ligne de commentaire (place avant toutes les d??tections de directive)
        let searchcmt = RGXcomment.exec(line)
        if(searchcmt!==null) {
            // pas reconduite
            sourceIndex++
            continue exploration
        }

        // variable ?
        let solvedLine = line
        let search
        while((search = RGXgenericVars.exec(solvedLine)) !==null) {
            let variable = search[1]
            let ap = activePath.join('_')
            let variableWithPath = variable.slice(0,2)==='__' ? variable : ap.concat(ap!==''?'_':'',variable)
            let vs = varSolve(variableWithPath,vars,forStack,vars)
            if(vs.type!=='var' && vs.type!=='str' && vs.type!=='number') {
                throw(''.concat(
                    `La variable "${variable}" n'a pas ??t?? r??solue`,
                    `\n==> vars     :\n${JSON.stringify(vars,null,4)}`,
                    `\n==> forStack :\n${JSON.stringify(forStack,null,4)}`
                ))
            }
            solvedLine = solvedLine.replace(`{{${variable}}}`,vs.value)
        }

        // mise en forme de la ligne ?
        if(lineFormat!==undefined) {
            let text = solvedLine.concat(' '.repeat(lineFormat.len)).slice(0,lineFormat.len)
            sourceCode.push(lineFormat.text.slice(0,lineFormat.pos).concat(text).concat(lineFormat.text.slice(lineFormat.pos + lineFormat.len)))
        } else {
            sourceCode.push(solvedLine)
        }
        sourceIndex++
    }
    return sourceCode
}

/**
 * Ajoute aux donn??es fournies le nom du squelette et la date
 * et retourne une chaine json qui les contient
 * (mise en forme utilis??e pour un vidage du dictionnaire dans le document g??n??r??)
 * @param skeletonName 
 * @param data 
 * @returns 
 */
function docWith(skeletonName:string,data:any):string {
    return JSON.stringify({
        sn:skeletonName, dt:new Date().toISOString(), data:data
    })
}

/**
 * R??soud les variables pr??sentent dans un unique ligne de code
 * (les appels de variables {{}} sont remplac??es par leur valeur)
 * @param line 
 * @param vars 
 * @param forStack 
 * @param path 
 * @param sourceIndex 
 * @param skeletonName 
 * @returns 
 */
function resolveLine(line:string, vars:valorizedDictionnary, forStack:forStack, path:string[], sourceIndex:number, skeletonName:string) {
    let search:any
    while((search = RGXgenericVars.exec(line)) !==null) {
        let variable = search[1]
        let ap = path.join('_')
        let variableWithPath = ap.concat(ap!==''?'_':'',search[1])
        let vs = varSolve(variableWithPath,vars,forStack,vars)
        if(vs.type!=='var' && vs.type!=='str' && vs.type!=='number') {
            throw(''.concat(
                `La variable "${variable}" n'a pas ??t?? r??solue`,
                `\n==> vars     :\n${JSON.stringify(vars,null,4)}`,
                `\n==> forStack :\n${JSON.stringify(vars,null,4)}`
            ))
        }
        line = line.replace(`{{${variable}}}`,vs.value)
    }
    return line
}

/**
 * Extrait les valeurs stock??es dans un dictionnaire
 * Le r??sultat obtenu est au format compact
 * @param vars 
 * @returns 
 */
export function varsToValues(vars:valorizedDictionnary):values {
    let res:any[] = []
    vars.forEach((v:any) => {
        if(v.var!==undefined) {
            res.push(v.value)
        } 
        else if(v.grp!==undefined) {
            let ores:any[] = []
            if(v.occurrences!==undefined) {
                v.occurrences.forEach((occ:any) => {
                    ores.push(varsToValues(occ.values))
                })
            }
            res.push(ores)
        }
    })
    return res
}

/**
 * R??soud une condition rattach??e ?? une directive if
 * @param variable 
 * @param relation 
 * @param versus 
 * @param vars 
 * @param forStack 
 * @returns 
 */
function ifSolve(variable:any, relation:string, versus:any, vars:valorizedDictionnary, forStack:forStack):boolean {
    let res = false
    let v = varSolve(variable,vars,forStack,vars)
    if(v===undefined) return false
    let left = v.value
    v = varSolve(versus,vars,forStack,vars)
    if(v===undefined) return false
    let right = v.value
    if(RGXle.test(relation)===true) {
        res = (left <= right)
    } else if(RGXge.test(relation)===true) {
        res = (left >= right)
    } else if(RGXne.test(relation)===true) {
        res = (left != right)
    } else if(RGXeq.test(relation)===true) {
        res = (left == right)
    } else if(RGXlt.test(relation)===true) {
        res = (left < right)
    } else if(RGXgt.test(relation)===true) {
        res= (left > right)
    }
    return res
}

/**
 * R??soud une varianle attach??e ?? une directive for
 * @param variable 
 * @param vars 
 * @param forStack 
 * @returns 
 */
function forSolve(variable:any, vars:valorizedDictionnary, forStack:forStack):any {
    return varSolve(variable,vars,forStack,vars)
}

/**
 * R??soud une variable attach??e ?? une directive repeat
 * @param variable 
 * @param vars 
 * @param forStack 
 * @returns 
 */
function repeatSolve(variable:any,vars:valorizedDictionnary,forStack:forStack):any {
    return varSolve(variable,vars,forStack,vars)
}

/**
 * R??soud un variable
 * @param variable 
 * @param vars 
 * @param forStack 
 * @param globalVars 
 * @param prefix 
 * @param prefixCmp 
 * @returns 
 */
function varSolve(variable:any, vars:valorizedDictionnary, forStack:forStack, globalVars:valorizedDictionnary, prefix:any=undefined,prefixCmp:dictionnary|undefined=undefined):any {

    if(globalVars===undefined) globalVars=vars

    {
        let search = RGXdate.exec(variable)
        if(search!==null) {
            return { type:"str", value:(new Date()).toLocaleDateString() }
        }
    }

    {
        let search = RGXddSmmSyy.exec(variable)
        if(search!==null) {
            let date = new Date()
            return { type:"str", value: [('0'+(date.getDate())).slice(-2),('0'+(date.getMonth()+1)).slice(-2),(''+date.getFullYear()).slice(-2)].join('/') }
        }
    }

    {
        let search = RGXddSmmSyyyy.exec(variable)
        if(search!==null) {
            let date = new Date()
            return { type:"str", value:[('0'+(date.getDate())).slice(-2),('0'+(date.getMonth()+1)).slice(-2),(''+date.getFullYear())].join('/') }
        }
    }

    {
        let search = RGXyyyyTmmTdd.exec(variable)
        if(search!==null) {
            let date = new Date()
            return { type:"str", value:[(''+date.getFullYear()),('0'+(date.getMonth()+1)).slice(-2),('0'+(date.getDate())).slice(-2)].join('-') }
        }
    }

    {
        let search = RGXhhDmmDss.exec(variable)
        if(search!==null) {
            let date = new Date()
            return { type:"str", value:[('0'+date.getHours()).slice(-2),('0'+date.getMinutes()).slice(-2),('0'+date.getSeconds()).slice(-2)].join(':') }
        }
    }

    {
        let search = RGXrepeatIndex.exec(variable)
        if(search!==null) {
            if(prefix===undefined) {
                let p = search[1]===undefined ? -1 : -1-parseInt(search[1])
                return { type:"str", value: repeatStack.length>0 ? repeatStack.slice(p)[0].indice : 0 }
            }
        }
    }

    {
        let search = RGXrepeatIndexAlpha.exec(variable)
        if(search!==null) {
            if(prefix===undefined) {
                let p = search[1]===undefined ? -1 : -1-parseInt(search[1])
                return { type:"str", value: repeatStack.length>0 ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')[(repeatStack.slice(p)[0].indice-1)%26] : '' }
            }
        }
    }

    {
        let search = RGXrepeatMax.exec(variable)
        if(search!==null) {
            if(prefix===undefined) {
                let p = search[1]===undefined ? -1 : -1-parseInt(search[1])
                return { type:"str", value: repeatStack.length>0 ? repeatStack.slice(p)[0].max : '' }
            }
        }
    }

    {
        let search = RGXindex.exec(variable)
        if(search!==null) {
            if(prefix===undefined) {
                if(forStack.length===0) {
                    return { type:"err" }
                }
                return { type:"str", value:forStack.slice(-1)[0].occurrenceIndex+1 }
            }
            let fsi = complement.findReverse(forStack,(f:any) => { return f.grp==prefix })
            let occurrenceIndex = fsi!==undefined ? fsi.occurrenceIndex : 0
            return { type:"str", value:parseInt(occurrenceIndex)+1 }
        }
    }

    {
        let search = RGXindexAlpha.exec(variable)
        if(search!==null) {
            if(prefix===undefined) {
                return { type:"str", value:'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')[forStack.slice(-1)[0].occurrenceIndex % 26] }
            }
            let fsi = complement.findReverse(forStack,(f:any)=>{ return f.grp==prefix })
            let occurrenceIndex = fsi!==undefined ? fsi.occurrenceIndex : 0
            return { type:"str", value:'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')[occurrenceIndex% 26] }
        }
    }

    {
        let search = RGXoccurs.exec(variable)
        if(search!==null) {
            if(prefix===undefined) {
                if(forStack.length===0) {
                    return { type:"err" }
                }
                let res = forStack.slice(-1)[0].occurrences
                if(res===undefined) {
                    return { type:"pasglop", value:"" }
                }
                return { type:"str", value:res.length }
            }
            let fsi = complement.findReverse(forStack,(f:any)=>{ return f.grp==prefix })
            if(fsi!==undefined) {
                let len = fsi!==undefined ? fsi.occurrences.length : 0
                return { type:"str", value:parseInt(len) }
            }
        }
    }

    {
        let search = RGXapostString.exec(variable)
        if(search!==null) {
            return { type:"str", value:search[1] }
        }
    }

    {
        let search = RGXquotedString.exec(variable)
        if(search!==null) {
            return { type:"str", value:search[1] }
        }
    }

    {
        let search = RGXnumber.exec(variable)
        if(search!==null) {
            return { type:"number", value:search[1] }
        }
    }

    {
        let search = RGXgenericVars.exec(variable)
        if(search!==null) {
            return varSolve(search[1],vars,forStack,globalVars)
        }
    }

    {
        // r??cup??ration de la valeur d'une variable ?? partie de la cl?? s??lectionn??e dans une combo
        let search = /^([^_]+)__value$/.exec(variable)
        if(search!==null) {
            if(prefix===undefined) {
                let varDeclaration = (vars as Array<any>).find(v=>v.var===(search as RegExpExecArray)[1])
                if(varDeclaration!==undefined) {    
                    if(varDeclaration.keyval!==undefined) {
                        let keyval = varDeclaration.keyval.find((kv:any)=>kv.key===varDeclaration.value)
                        return { type:"var", value:keyval!==undefined ? keyval.val : '' }
                    }
                }
            } else {
                let varDeclaration = (vars as Array<any>).find(v=>v.var===(search as RegExpExecArray)[1])
                if(varDeclaration!==undefined) {    
                    let cmpDeclaration = (prefixCmp as Array<any>).find(v=>v.var!==undefined ? v.var===(search as RegExpExecArray)[1] : false)
                  if(cmpDeclaration!==undefined) {    
                        if(cmpDeclaration.keyval!==undefined) {
                            let keyval = cmpDeclaration.keyval.find((kv:any)=>kv.key===varDeclaration.value)
                            return { type:"var", value:keyval!==undefined ? keyval.val : '' }
                        }
                    }
                }
            }
        }
        
    }

    // recherche variable locale
    // uniquement si pas de pr??fixe parce qu'une variable locale ne peut-??tre pr??fix??e

    if(prefix===undefined) {
        let search = RGXlocalVariable.exec(variable)
        if(search!==null) {
            let lv = localVariables.find(e=>{ return search!==null ? e.name===search[1] : false })
            if(lv!==undefined) {
                if(RGXnumber.test(lv.value as string)!==true) return { type:"str", value:lv.value }
                else return { type:"number", value:lv.value }
            } else {
                throw(''.concat(
                    `varSolve - erreur d??tect??e`,
                    `\nla variable ${variable} n'existe pas en tant que variable locale`,
                    `\n==> localVariables = ${JSON.stringify(localVariables)}`
                ))
            }
        }
    }

    // d??compositin de la variable

    let search = RGXcomposedVar.exec(variable)

    if(search!==null) {

        // variable compos??e : la 1??re partie est un groupe

        let grp = search[1]

        // d??tection de l'utilisation d'un groupe indic??
        // cas particulier genre {{groupe[n]_variable}}

        let searchGrpIndex = /(\w+)(?:\[(\w+)\])/.exec(grp)
        let indice = searchGrpIndex!==null ? searchGrpIndex[2] : null
        grp = searchGrpIndex!==null ? searchGrpIndex[1] : grp

        // on recherche le groupe

        let grpDeclaration = (vars as Array<any>).find(v=>v.grp==grp)

        if(grpDeclaration===undefined) {
            throw(''.concat(
                `varSolve - erreur d??tect??e`,
                `\nla variable ${variable} commence par un identifiant de groupe ${grp} qui n'existe pas`,
                `\n==> vars = ${vars}`,
                `\n==> forStack = ${forStack}`
            ))
        }

        // groupe indic?? ?

        if(indice!==null) {
            // on recherche la valeur du groupe indic??
            let idx = parseInt(indice) - 1
            if(idx<0) {
                throw(''.concat(
                    `varSolve - erreur d??tect??e`,
                    `\nla variable ${variable} pointe sur un indice de groupe invalide (${indice})`
                ))
            }
            if(idx>=grpDeclaration.occurrences.length) {
                throw(''.concat(
                    `varSolve - erreur d??tect??e`,
                    `\nla variable ${variable} pointe sur un indice de groupe invalide (${indice})`
                ))
            }
            let searchGrp = prefix === undefined ? grp : `${prefix}_${grp}`
            return varSolve(search[2],grpDeclaration.occurrences[idx].values,forStack,globalVars,searchGrp)
        } else {
            // r??solution de l'occurrence active du groupe
            let searchGrp = prefix === undefined ? grp : `${prefix}_${grp}`
            let fsi = complement.findReverse(forStack,(f:any)=>{ return f.grp==searchGrp })
            let occurrenceIndex = fsi!=undefined ? fsi.occurrenceIndex : 0
            // cas particulier de la variable nombre d'occurrences d'un groupe
            // alors que l'on est pas dans une boucle for
            if(fsi===undefined && search[2]==='_n') return { type:"str", value:grpDeclaration.occurrences!==undefined ? grpDeclaration.occurrences.length : 0 }
            return varSolve(search[2],grpDeclaration.occurrences[occurrenceIndex].values,forStack,globalVars,searchGrp,grpDeclaration.cmp)
        }
    } else {
        // variable simple, c'est peut-??tre un groupe
        let grpDeclaration = (vars as Array<any>).find(v=>v.grp==variable)
        if(grpDeclaration!==undefined) {
            // groupe
            return { type:"grp", occurrences:grpDeclaration.occurrences }
        }
        let varDeclaration = (vars as Array<any>).find(v=>v.var==variable)
        if(varDeclaration!==undefined) {
            // variable ?? r??soudre (c??d que la variable contient un appel de variable !)
            let search = RGXgenericVars.exec(varDeclaration.value)
            if(search!==null) {
                return varSolve(varDeclaration.value,globalVars,forStack,globalVars)
            }
            // variable ??l??mentaire
            return { type:"var", value:varDeclaration.value }
        }
    }

    return { type:"pasglop", value:"" }

}

/**
 * Extrait le 1er dictionnaire trouv?? dans un document g??n??r??
 * @param sourcCode 
 * @returns 
 */
export function extractDictionnary(sourcCode:string):string[]|undefined {
    let lines = sourcCode.split(/\r\n|\n/)
    let search:any
    let fi:number
    let fi1 = lines.findIndex(e=>RGXdictionnary.test(e))
    let fi2 = lines.findIndex(e=>RGXdictionnary64.test(e))
    if(fi1<0) {
        if(fi2<0) return undefined
        fi = fi2
        search = RGXdictionnary64.exec(lines[fi])
    } else {
        if(fi2<0) {
            fi = fi1
            search = RGXdictionnary.exec(lines[fi])
        } else {
            if(fi1<fi2) {
                fi = fi1
                search = RGXdictionnary.exec(lines[fi])
            } else {
                fi = fi2
                search = RGXdictionnary64.exec(lines[fi])
            }
        }
    }
    if(search===undefined) return undefined
    if(search===null) return undefined
    if(search[1]===undefined || search[2]===undefined || search[3]===undefined) return undefined
    let pre = parseInt(search[1])
    let der = parseInt(search[2]) + pre
    let res = [ lines[fi].slice(pre+9,der) ]
    let fin = fi + parseInt(search[3])
    let deb = fi + 1
    for(let i=deb;i<fin;i++) {
        res.push(lines[i].slice(pre,der))
    }
    return res
}

/**
 * Extrait les valeurs stock??es dans le dictionnaire en un tableau d'objets { path, value }
 * @param vars 
 * @param currentPath 
 * @returns 
 */
function extractPathsAndValues(vars:valorizedDictionnary,currentPath=''):any[] {
    let res:any[] = [];
    (vars as Array<any>).forEach(v => {
        if(v.var!==undefined) {
            res.push({ path:currentPath.concat(currentPath===''?'':'>').concat(v.var), "value":v.value })
        }
        else if(v.grp!==undefined) {
            let ores:any[] = []
            if(v.occurrences!==undefined) {
                v.occurrences.forEach( (occ:any,i:number) => {
                    let path = currentPath.concat(currentPath===''?'':'>').concat(v.grp).concat(`[${i}]`)
                    ores.push({ path:path, value:extractPathsAndValues(occ.values,path), include:v.include })
                })
            }
            res.push(ores)
        }
    })
    return res
}

/**
 * Transforme un tableau d'objets { path, value } en la repr??sentaion des valeurs en notation serialize
 * @param pathsAndValues 
 * @returns 
 */
function serializePathsAndValues(pathsAndValues:any[]):any[] {
    return pathsAndValues.reduce((acc,val,ind,arr)=>{
        if(!Array.isArray(val)) {
            if(!Array.isArray(val.value)) acc.push({path:val.path,value:val.value})
            else acc = [...acc,...serializePathsAndValues(val.value)]
        } else {
            acc = [...acc,...serializePathsAndValues(val)]
        }
        return acc
    },[])
}

/**
 * Peuple un dictionnaire ?? partir des valeurs pass??es sous la forme d'un tableau d'objets { path, value }
 * @param dictionnary 
 * @param pathsAndValues 
 * @param currentPath 
 * @returns 
 */
function populateDictionnary(dictionnary:dictionnary,pathsAndValues:pathAndValueObject[],currentPath='') {
    let res:any[] = [];
    (dictionnary as Array<any>).forEach((v:any)=>{
        if(v.var!==undefined) {
            let path = currentPath.concat(currentPath===''?'':'>').concat(v.var)
            let f = pathsAndValues.find((p:any)=>p.path===path)
            let vcopy = { ...v }
            if(f!==undefined) {
                vcopy.value = f.value
            } else {
                vcopy.value = '????????'
            }
            res.push(vcopy)
        } else if(v.grp!==undefined) {
            let path = currentPath.concat(currentPath===''?'':'>').concat(v.grp)
            let occurrences = []
            while(pathsAndValues.some((p:any)=>p.path.startsWith(path.concat(`[${occurrences.length}]`)))) {
                occurrences.push({values:populateDictionnary(v.cmp,pathsAndValues,path.concat(`[${occurrences.length}]`))})
            }
            res.push({ grp:v.grp, lib:v.lib, rpt:v.rpt, cmp:v.cmp, occurrences:occurrences })
        }
    })
    return res
}

/**
 * Transforme un tableau d'objets { path, value } en la repr??sentaion des valeurs en notation dense
 * @param pathsAndValues 
 * @returns 
 */
function densePathsAndValues(pathsAndValues:any[]):string[] {
    return pathsAndValues.reduce((acc,val,ind,arr)=>{
        if(!Array.isArray(val)) {
            if(!Array.isArray(val.value)) acc.push(`'${val.path}':'${val.value}',`)
            else acc = [...acc,...densePathsAndValues(val.value)]
        } else {
            acc = [...acc,...densePathsAndValues(val)]
        }
        return acc
    },[])
}

/**
 * Transforme un tableau d'objets { path, value } en la repr??sentaion des valeurs en notation dense
 * et retourne une chaine qui la contient en entier
 * @param pathsAndValues 
 * @returns 
 */
function makeDensePathsAndValues(pathsAndValues:any[]):string {
    return densePathsAndValues(pathsAndValues).join('').slice(0,-1)
}

/**
 * Produit un listing avec num??rotation de ligne
 * @param text
 * @returns 
 */
function numberLines(text:string) {
    let ts = text.split('\n')
    let zs = '0'.repeat(ts.length.toFixed(0).length)
    let zl = zs.length
    let f = (n:number) => zs.concat(n as unknown as string).slice(-zl)
    return text.split('\n').map((v,i)=>`${f(i+1)} : ${v}`).join('\n')
}

/**
 * R??soud les includes
 * - v??rifie l'absence de r??f??rences circulaires entre includes
 * - enrichie le dictionnaire avec les d??clarations pr??sentes dans les includes
 * - rempalce les directives include leur code en l'encadrant par les directives path et endpath 
 * @param skeletonLocations
 * @param skeletonName 
 * @param liens 
 * @param developSkeletonText 
 * @returns 
 */
export async function extendDictionnaryWithIncludes(skeletonLocations:string[],skeletonName:string,liens:any[]=[],developSkeletonText=undefined) {
    // d??terminer si l'on est sur le squelette principal ou sur un squelette inclu
    let level0 = liens.length===0 ? true : false
    // lire le squelette
    let skeletonLocation = await complement.getFirstFileFoundInMultipleLocations(skeletonLocations,skeletonName) as string
    let skeletonSourceText = (developSkeletonText===undefined ? (await complement.loadFile(path.join(skeletonLocation,skeletonName as string))).source.toString() : developSkeletonText) as string
    // accumulateur des squelettes pour l'aide ?? la mise au point
    let accu = `>>> ===========================================================\n`+
               `>>> squelette : ${skeletonName}\n`+
               `>>> ===========================================================\n`+
               `\n`+
               `${numberLines(skeletonSourceText)}`
    // extraire les composantes du squelette
    let parts = extractSkeletonParts(skeletonSourceText)
    let bodyLines = parts.bodyLines
    // extraire le dictionnaire
    let dictionnary:dictionnary = analyzeSkeleton(skeletonSourceText)
    // parcourir le dictionnaire
    let d = 0
    while(true) {
        if(d>=dictionnary.length) break
        const definition = dictionnary[d]
        if(definition.hasOwnProperty('grp')) {
            if(definition.hasOwnProperty('include')) {
                // traiter un include
                let fileName = (definition as groupObject).include
                if(fileName!==undefined) {
                    // v??rifier que le nouvel include ne pose pas un lien qui provoque une r??f??rence circulaire
                    liens.push([skeletonName,fileName])
                    let scr = complement.searchCircularReference(liens)
                    if(scr.found===true) {
                        throw(`r??f??rence circulaire d??tect??e dans les include sur ${scr.with} dans [${scr?.details.toString()}]`)
                    }
                    // poursuivre l'exploration avec le nouveau squeltte inclu pour enrichir le dictionnaire
                    let edwi = await extendDictionnaryWithIncludes(skeletonLocations,fileName,liens)
                    let dico:dictionnary = edwi.dictionnary
                    ;(definition as groupObject).cmp = [...dico]
                    // remplacer les includes correspondants par le squelette encadr?? par les directives # path et # endpath
                    let lines:string[] = []
                    bodyLines.forEach((e:any) => {
                        let search = RGXinclude.exec(e)
                        if(search!==null) {
                            if(search[2]===(definition as groupObject).grp) {
                                lines.push(`# path {{${search[2]}}}`)
                                edwi.sourceLines.forEach((sl:any)=>lines.push(sl))
                                lines.push(`# endpath`)
                            } else {
                                lines.push(e)
                            }
                        } else {
                            lines.push(e)
                        }  
                    })
                    bodyLines = lines
                    // accumulation du squelette r??cup??r??
                    accu += `\n\n${edwi.sourceBrut}`
                }
            }
        }
        d++
    }
    // dernier retour (on est sur le squelette principal)
    if(level0===true) return { dictionnary:dictionnary, sourceLines:[...parts.skodgeeLines, ...parts.declareLines, ...bodyLines], sourceBrut:accu }
    // retour sur un appel r??cursif (on est sur un squelette appel?? par include)
    return { dictionnary:dictionnary, sourceLines:bodyLines, sourceBrut:accu }
}

/**
 * Extrait ent??te, dictionnaire et corps d'un squelette
 * @param skeletonSourceText 
 * @returns 
 */
function extractSkeletonParts(skeletonSourceText:string):any {
    let lines = skeletonSourceText.split('\n')
    let skodgeeLines:string[] = []
    let declareLines:string[] = []
    let bodyLines:string[] = []
    let inSkodgee:boolean = false
    let inDeclare:boolean = false
    lines.forEach( e => {
        if(RGXskodgee.exec(e)!==null) {
            inSkodgee = true
            skodgeeLines.push(e)
        } else if(inSkodgee) {
            if(RGXend.exec(e)!==null) inSkodgee = false
            skodgeeLines.push(e)
        } else if(RGXdeclare.exec(e)!==null) {
            inDeclare = true
            declareLines.push(e)
        } else if(inDeclare) {
            if(RGXend.exec(e)!==null) inDeclare = false
            declareLines.push(e)
        } else {
            bodyLines.push(e)
        }
    })
    return { skodgeeLines:skodgeeLines, declareLines:declareLines, bodyLines:bodyLines }
}

/**
 * R??soud les appels de mod??les en v??rifiant 
 * - l'absence d'imbrication de mod??les
 * - l'existence des mod??les appel??s
 * @param skeletonSourceText
 * @returns 
 */
export async function resolveModels(skeletonSourceText:string) {
    let lines = skeletonSourceText.split('\n')
    let resultLines:string[] = []
    let modelStack:Array<{name:string,lines:string[]}> = []
    let inModel:boolean = false
    lines.forEach( (e,i) => {
        let search:any
        if((search=RGXmodel.exec(e))!==null) {
            if(inModel===true) {
                throw(
                    `La d??claration du mod??le ${search[2]} en ligne ${i} est invalide,`+
                    `un mod??le ne peut ??tre inclu dans un autre mod??le`
                )
            }
            inModel = true
            let model = modelStack.find(f=>f.name===search[2])
            if(model!==undefined) {
                model.lines=[]
            } else {
                modelStack.push({ name:search[2], lines:[] })
            }
        } else if(RGXendmodel.exec(e)!==null) {
            inModel = false
        } else if(inModel) {
            modelStack.slice(-1)[0].lines.push(e)
        } else if((search=RGXusemodel.exec(e))!==null) {
            let model = modelStack.find(f=>f.name===search[2])
            if(model!==undefined) model.lines.forEach(l=>resultLines.push(l))
            else throw(
                `le mod??le ${search[2]} demand?? en ligne ${i} n'est pas r??f??renc??\n`+
                `cause probable : \n`+
                `- absence de directive include du squelette contenant le mod??le`
            )
        } else {
            resultLines.push(e)
        }
    })
    return resultLines.join('\n')
}

/**
 * Extrait les valeurs par d??faut du dictionnaire
 * @param dictionnary 
 * @returns 
 */
export function generateValuesFromDictionnary(dictionnary:dictionnary):any {
    let values:any = []
    dictionnary.forEach((d:variableObject|groupObject)=>{
        if((d as variableObject).var!==undefined) {
            if((d as variableObject).ini!==undefined) {
                values.push((d as variableObject).ini)
            }
            else {
                values.push((d as variableObject).var)
            }
        } else if((d as groupObject).grp!==undefined) {
            let groups:any = []
            let count = (d as groupObject).rpt===undefined ? 1 : parseInt((d as groupObject).rpt?.split(',')[0] as string)
            let group = generateValuesFromDictionnary((d as groupObject).cmp)
            while(count>0) {
                groups.push(Array.from(group))
                count--
            }
            values.push(groups)
        }
    })
    return values
}

/**
 * Appel d'un service (webapi)
 * Pour la r??ponse, format REST suppos?? avec encapsultation dans un array json
 * @param source 
 * @returns 
 */
export function getServices(source:string) {
    let sourceLines = source.split(/\r\n|\n/)
    let sourceIndex = 0
    let inService = false
    let serviceLines = []
    while(true) {
        let line = sourceLines[sourceIndex]
        if(sourceIndex>=sourceLines.length) break
        if(inService===true) {
            if(RGXend.test(line)) break
            serviceLines.push(line)
        }
        if(RGXservice.test(line)) inService=true
        sourceIndex++
    }
    if(serviceLines.length===0) return undefined
    try {
        return JSON.parse(`[${serviceLines.join('')}]`)
    } catch(error) {
        throw(`${error.toString()}\n${serviceLines.join('\n')}`)
    }
}

/**
 * Appel les services (webapi) pour l'alimentation des variables du dictionnaire
 * et propage les valeurs des variables concern??es aux variables 
 * qui en d??pendent (r??soud les chainages)
 * Attention pas de d??tection de cycle, parce qu'ils peuvent ??tre n??cessaires
 * pour l'appel de certains services (exemple?). On laisse javascript g??rer
 * les d??bordements de la pile d'appel de cette fonction r??cursive.
 * @param dictionnary 
 * @param fullDictionnary 
 * @param services 
 * @returns
 */
export async function resolveParametricOptions( dictionnary:valorizedDictionnary,
                                                fullDictionnary:valorizedDictionnary|undefined=undefined,
                                                services:services|undefined=undefined,
                                                variable:string|string[]|undefined=undefined,
                                                value:string|undefined=undefined) {
    variable = variable!==undefined ? Array.isArray(variable) ? variable : [variable] : []
    if(fullDictionnary===undefined) fullDictionnary=dictionnary
    // parcourir le dictionnaire
    let d = 0
    while(true) {
        if(d>=dictionnary.length) break
        const definition = dictionnary[d]
        if((definition as variableObject).var!==undefined) {
            if((definition as variableObject).remoteOpt!==undefined) {
                let rs = resolveSkeleton("",(definition as variableObject).remoteOpt,fullDictionnary,fullDictionnary)
                if(rs!==undefined) {
                    if(rs.length>0) {
                        try {
                            (definition as variableObject).opt = JSON.parse(await complement.service(rs[0]))
                        } catch(error) {
                            (definition as variableObject).opt = undefined
                        }
                    }
                }
            }
            else if((definition as variableObject).remoteKeyval!==undefined) {
                let rs = resolveSkeleton("",(definition as variableObject).remoteKeyval,fullDictionnary,fullDictionnary)
                if(rs!==undefined) {
                    if(rs.length>0) {
                        try {
                            (definition as variableObject).keyval = JSON.parse(await complement.service(rs[0]))
                        } catch(error) {
                            (definition as variableObject).keyval = undefined
                        }
                    }
                }
            }
            else if((definition as variableObject).serviceOpt!==undefined) {
                let skv = (definition as variableObject).serviceOpt as serviceOpt
                if(variable.length>0 ? skv.params?.some(e=>{
                    if(Array.isArray(variable)) {
                        return variable.some(v=>e===`{{${v}}}`)
                    }
                    else {
                        return e===`{{${variable}}}`
                    }
                }) : true) {
                    let sv = services?.find(sv=>sv.service===skv.service) as service
                    if(sv!==undefined) {
                        if(skv.params!==undefined) {
                            skv.params.forEach((param,i)=>{
                                let resolvedParam = resolveSkeleton("",param,fullDictionnary as valorizedDictionnary,fullDictionnary as valorizedDictionnary)
                                sv.url = sv?.url.replace(`{{${sv.params[i].var}}}`,resolvedParam[0])
                            })
                        }
                        try {
                            let response:any = JSON.parse(await complement.service(sv.url))
                            ;(definition as variableObject).opt = complement.extractDotPath(skv.opt,response)
                        } catch(error) {
                            (definition as variableObject).opt = []
                        }
                    }
                }
            }
            else if((definition as variableObject).serviceKeyval!==undefined) {
                let skv = (definition as variableObject).serviceKeyval as serviceKeyval
                if(variable.length>0 ? skv.params?.some(e=>{
                    if(Array.isArray(variable)) {
                        return variable.some(v=>e===`{{${v}}}`)
                    }
                    else {
                        return e===`{{${variable}}}`
                    }
                }) : true) {
                    let sv = services?.find(sv=>sv.service===skv.service) as service
                    if(sv!==undefined) {
                        if(skv.params!==undefined) {
                            skv.params.forEach((param,i)=>{
                                let resolvedParam = resolveSkeleton("",param,fullDictionnary as valorizedDictionnary,fullDictionnary as valorizedDictionnary)
                                sv.url = sv?.url.replace(`{{${sv.params[i].var}}}`,resolvedParam[0])
                            })
                        }
                        try {
                            let response = JSON.parse(await complement.service(sv.url))
                            if(skv.array!==undefined) {
                                response = response.hasOwnProperty(skv.array) !==undefined ? response[skv.array] : response
                            }
                            (definition as variableObject).keyval = response.map( (rs:any) => { 
                                let key = complement.extractDotPath(skv.key,rs)
                                let val = complement.extractDotPath(skv.val,rs)
                                return { key: key , val: val } 
                            })
                        } catch(error) {
                            (definition as variableObject).keyval = undefined
                        }
                    }
                }
            }
            else if((definition as variableObject).serviceValuate!==undefined) {
                let skv = (definition as variableObject).serviceValuate as serviceValuate
                if(variable.length>0 ? skv.params?.some(e=>{
                    if(Array.isArray(variable)) {
                        return variable.some(v=>e===`{{${v}}}`)
                    }
                    else {
                        return e===`{{${variable}}}`
                    }
                }) : true) {
                    let sv = services?.find(sv=>sv.service===skv.service) as service
                    if(sv!==undefined) {
                        if(skv.params!==undefined) {
                            skv.params.forEach((param,i)=>{
                                let resolvedParam = resolveSkeleton("",param,fullDictionnary as valorizedDictionnary,fullDictionnary as valorizedDictionnary)
                                sv.url = sv?.url.replace(`{{${sv.params[i].var}}}`,resolvedParam[0])
                            })
                        }
                        try {
                            let response = JSON.parse(await complement.service(sv.url)) as any
                            (definition as valorizedVariableObject).value = complement.extractDotPath(skv.value,response)
                            if((definition as variableObject).onchange==="propagate") {
                                variable.push((definition as variableObject).var)
                            }
                        } catch(error) {
                            // ne rien faire
                        }
                    }
                }
            }
        } 
        else if((definition as groupObject).grp!==undefined) {
            (definition as groupObject).cmp = await resolveParametricOptions((definition as groupObject).cmp,fullDictionnary,services,variable,value)
        }
        d++
    }
    return dictionnary
}

/**
 * Passe les valeurs fournies du format compact au format serialize
 * ( recalcul le path pour chaque variable d??clar??e
 *   pour refaire le lien avec le dictionnaire
 *   au risque de ne pas pointer vers la bonne variable
 *   si le dictionnaire a ??volu?? )
 * @param values 
 * @param dictionnary 
 * @param path 
 * @returns tableau d'objets { path, value }
 */
function pathFromCompact(values:Array<any>,dictionnary:dictionnary,path:string=""):pathAndValueObject[] {
    let result:pathAndValueObject[] = []
    values.forEach((v,i)=>{
        let d = dictionnary[i]
        if(Array.isArray(v)) {
            if((d as groupObject).grp===undefined) throw `valeur ${JSON.stringify(v)} non compatible avec dico ${JSON.stringify(d)}`
            v.forEach((vu,index)=>{
                result = [...result,...pathFromCompact(vu,(d as groupObject).cmp,`${path}${path!==''?'>':''}${(d as groupObject).grp}[${index}]`)]
            })
        }
        else {
            if((d as variableObject).var===undefined) throw `valeur ${JSON.stringify(v)} non compatible avec dico ${JSON.stringify(d)}`
            result.push({
                path: `${path}${path!==''?'>':''}${(d as variableObject).var}`,
                value: v
            })
        }
    })
    return result
}

/**
 * Passe les valeurs fournies du format compact, dense/serialize ou complet ?? un format compact
 * @param dictionnary 
 * @param values 
 * @returns 
 */
export function extractValues(dictionnary:dictionnary,values:polymorphicValuesRepresentation):values {
    if(Array.isArray(values)) {
        if((values as values).every(e=>Array.isArray(e)||(typeof e==='string'))) {
            // compact
            return values as values
        }
        if((values as valorizedDictionnary).every((e:variableObject|groupObject)=>(e as variableObject).var!==undefined||(e as groupObject).grp!==undefined)) {
            // complet
            return varsToValues(populateDictionnary(dictionnary,serializePathsAndValues(extractPathsAndValues(values as valorizedDictionnary))))
        }
        if((values as pathAndValueObject[]).every((e:pathAndValueObject)=>(e.path!==undefined&&e.value!==undefined))) {
            // dense/serialize
            return varsToValues(populateDictionnary(dictionnary,values as pathAndValueObject[]))
        }
    }
    return values as values
}

/**
 * Peuple le dictionnaire avec les valeurs fournies au format compact, dense/serialize ou complet
 * @param dictionnary 
 * @param values 
 * @returns 
 */
export function populateDictionnaryWithValues(dictionnary:dictionnary,values:polymorphicValuesRepresentation):dictionnary {
    if(Array.isArray(values)) {
        if((values as values).every(e=>Array.isArray(e)||(typeof e==='string'))) {
            // compact
            return populateDictionnary(dictionnary,pathFromCompact(values,dictionnary))
        }
        if((values as valorizedDictionnary).every((e:variableObject|groupObject)=>(e as variableObject).var!==undefined||(e as groupObject).grp!==undefined)) {
            // complet
            return values as valorizedDictionnary
        }
        if((values as pathAndValueObject[]).every((e:pathAndValueObject)=>(e.path!==undefined&&e.value!==undefined))) {
            // dense/serialize
            return populateDictionnary(dictionnary,values as pathAndValueObject[])
        }
    }
    return dictionnary
}

