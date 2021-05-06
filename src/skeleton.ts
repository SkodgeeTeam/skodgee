import * as complement from './complement'
import * as path from 'path'

interface variableObject {
    var: string,
    lib?: string,
    ini?: string
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
    occurrence?: (valorizedGroupObject|valorizedVariableObject)[]
}

export type valorizedDictionnary = valorizedVariableObject[] | valorizedGroupObject[]

type values = (string|values)[]

interface pathAndValueObject {
    path: string,
    value: string|number
}

type polymorphicValuesRepresentation = valorizedVariableObject[] | valorizedGroupObject[] | pathAndValueObject[]

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

const prefix = '^\\s*#'
const prefixInDeclare = false

const RGXskodgee = /^#\s?skodgee\s*$/
const RGXcomment = new RegExp(prefix)
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
let localVariables:Array<{name:string, value:number|string}>

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
            // début d'un declare ?
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
            `analyzeSkeleton - anomalie détectée dans la déclaration`,
            `\n==> la déclaration des variables trouvées dans le squelette est invalide`,
            `\n==> {skeletonSourceText} = ${skeletonSourceText}`,
            `\n==> {declare} = ${declare}`,
            error.toString()
        ))
    }
    return parsedDeclare
}

export function resolveSkeleton(skeletonName:string,source:any,vars:valorizedDictionnary,dictionnary:dictionnary):string[] {

    if(JSON.stringify(vars)!==JSON.stringify(dictionnary)) {
        throw(''.concat(
            `resolveSkeleton - différence détectées entre {vars} et {dictionnary}`,
            `\n==> Dysfonctionnement probable dans la préparation locale`,
            `\n==> {vars} = ${vars}`,
            `\n==> {dictionnary} = ${dictionnary}`
        ))
    }

    let inSkodgee:boolean = false
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

        // début d'un repeat numérique ?
        let searchRepeatInteger = RGXrepeatInteger.exec(line)
        if(searchRepeatInteger!==null) {
            repeatStack.push({ indice:1, max: processNext===true ? parseInt(searchRepeatInteger[2]) : 0, sourceIndex:sourceIndex })
            sourceIndex++
            continue exploration
        }

        // début d'un repeat variable ?
        let searchRepeat = RGXrepeat.exec(line)
        if(searchRepeat!==null) {
            let max = 0
            // ne pas calculer rsi si on est dans un if ou un for ou un repeat inactif
            // pour 1) ne pas planter et 2) avoir un max à zéro
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

        // début d'un if ?
        let searchif = RGXif.exec(line)
        if(searchif!==null) {
            let ap = activePath.join('')
            let variableWithPath = ap.concat(ap!==''?'_':'',searchif[2])
            // calcul l'état du test (forcé à false si on est déjà dans un if ou un for inactif)
            let state = processNext===true ? ifSolve(variableWithPath,searchif[3],searchif[4],vars,forStack) : false
            // si le test précédent dans la pile est faux alors ce test est aussi considéré comme faux
            state = state===true && ifStack.length>0 ? ifStack.slice(-1)[0].state : state
            ifStack.push({ state:state, sourceIndex:sourceIndex })
            sourceIndex++
            continue exploration
        }

        // début d'un for ?
        let searchfor = RGXfor.exec(line)
        if(searchfor!==null) {
            let ap = activePath.join('_')
            let variableWithPath = ap.concat(ap!==''?'_':'',searchfor[2])
            let fsi = forSolve(variableWithPath,vars,forStack)
            forStack.push({
                grp: variableWithPath,
                // calcul des occurrences traitées par le for (forcé à undefined si on est déjà dans un if ou un for inactif)
                occurrences: processNext===true ? fsi!==undefined ? fsi.occurrences : undefined : undefined,
                occurrenceIndex: 0,
                sourceIndex: sourceIndex
            })
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
        
        // directive path pour résolution include
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
                    `La génération du code a échoué`,
                    `\nla variable locale "${searchDefine[2]}" a été redéfinie à tort, elle existait déjà`,
                    `\nen ligne ${sourceIndex+1} du squelette "${skeletonName}"`,
                    `\n==> ligne          :\n${line}\n`,
                    `\n==> localVariables :\n${JSON.stringify(vars,null,4)}`
                ))
            }
            let rl = resolveLine(searchDefine[3],vars,forStack,activePath,sourceIndex,skeletonName).replace(/ /g,'')
            let num = rl.replace(/[^-()\d/*+.]/g,'')
            if(num!=rl) {
                throw(''.concat(
                    `La génération du code échoué`,
                    `\nla variable locale "${searchDefine[2]}" a été déclarée avec une valeur ${searchDefine[3]} qui n'est pas numérique`,
                    `\nen ligne ${sourceIndex+1} du squelette "${skeletonName}"`,
                    `\n==> ligne          :\n${line}\n`,
                    `\n==> localVariables :\n${JSON.stringify(vars,null,4)}`
                ))
            }
            let value = eval(rl)
            localVariables.push({name:searchDefine[2],value:value})
            sourceIndex++
            continue exploration
        }

        // directive defstr
        let searchDefstr = RGXdefstr.exec(line)
        if(searchDefstr!==null) {
            let lv = localVariables.find(e=>{ return searchDefstr!==null ? e.name===searchDefstr[2] : false })
            if(lv!==undefined) {
                throw(''.concat(
                    `La génération du code a échoué`,
                    `\nla variable locale "${searchDefstr[2]}" a été redéfinie à tort, elle existait déjà`,
                    `\nen ligne ${sourceIndex+1} du squelette "${skeletonName}"`,
                    `\n==> ligne          :\n${line}\n`,
                    `\n==> localVariables :\n${JSON.stringify(vars,null,4)}`
                ))
            }
            let rl = resolveLine(searchDefstr[3],vars,forStack,activePath,sourceIndex,skeletonName)
            let value = rl
            localVariables.push({name:searchDefstr[2],value:value})
            sourceIndex++
            continue exploration
        }

        // directive calc
        let searchSet = RGXcalc.exec(line)
        if(searchSet!==null) {
            let lv = localVariables.find(e=>{ return searchSet!==null ? e.name===searchSet[2] : false })
            if(lv!==undefined) {
                let rl = resolveLine(searchSet[3],vars,forStack,activePath,sourceIndex,skeletonName).replace(/ /g,'')
                let num = rl.replace(/[^-()\d/*+.]/g,'')
                if(num!==rl) {
                    throw(''.concat(
                        `La génération du code a échoué`,
                        `\nla variable locale "${searchSet[2]}" a été déclarée avec une valeur ${searchSet[3]} qui n'est pas numérique`,
                        `\nen ligne ${sourceIndex+1} du squelette "${skeletonName}"`,
                        `\n==> ligne          :\n${line}\n`,
                        `\n==> localVariables :\n${JSON.stringify(vars,null,4)}`
                    ))
                }
                lv.value = eval(num)
            } else {
                throw(''.concat(
                    `la génération du code a échoué`,
                    `\nla variable locale "${searchSet[2]}" n'a pas été résolue`,
                    `\n==> ligne          :\n${line}\n`,
                    `\n==> localVariables :\n${JSON.stringify(vars,null,4)}`
                ))
            }
            sourceIndex++
            continue exploration
        }

        // ligne de commentaire (place avant toutes les détections de directive)
        let searchcmt = RGXcomment.exec(line)
        if(searchcmt!==null) {
            // pas recounduite
            sourceIndex++
            continue exploration
        }

        // variable ?
        let solvedLine = line
        let search
        while((search = RGXgenericVars.exec(solvedLine)) !==null) {
            let variable = search[1]
            let ap = activePath.join('_')
            let variableWithPath = ap.concat(ap!==''?'_':'',search[1])
            let vs = varSolve(variableWithPath,vars,forStack,vars)
            if(vs.type!=='var' && vs.type!=='str' && vs.type!=='number') {
                throw(''.concat(
                    `La génération du code a échoué`,
                    `\nla variable "${variable}" n'a pas été résolue`,
                    `\nen ligne ${sourceIndex+1} du squelette "${skeletonName}"`,
                    `\n==> ligne    :\n${line}\n`,
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

function docWith(skeletonName:string,data:any):string {
    return JSON.stringify({
        sn:skeletonName, dt:new Date().toISOString(), data:data
    })
}

function resolveLine(line:string, vars:valorizedDictionnary, forStack:forStack, path:string[], sourceIndex:number, skeletonName:string) {
    let search:any
    while((search = RGXgenericVars.exec(line)) !==null) {
        let variable = search[1]
        let ap = path.join('_')
        let variableWithPath = ap.concat(ap!==''?'_':'',search[1])
        let vs = varSolve(variableWithPath,vars,forStack,vars)
        if(vs.type!=='var' && vs.type!=='str' && vs.type!=='number') {
            throw(''.concat(
                `La génération du code a échoué`,
                `\nla variable "${variable}" n'a pas été résolue`,
                `\nen ligne ${sourceIndex+1} du squelette "${skeletonName}"`,
                `\n==> ligne    :\n${line}\n`,
                `\n==> vars     :\n${JSON.stringify(vars,null,4)}`,
                `\n==> forStack :\n${JSON.stringify(vars,null,4)}`
            ))
        }
        line = line.replace(`{{${variable}}}`,vs.value)
    }
    return line
}

function varsToValues(vars:valorizedDictionnary):values {
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

function forSolve(variable:any, vars:valorizedDictionnary, forStack:forStack):any {
    return varSolve(variable,vars,forStack,vars)
}

function repeatSolve(variable:any,vars:valorizedDictionnary,forStack:forStack):any {
    return varSolve(variable,vars,forStack,vars)
}

function varSolve(variable:any, vars:valorizedDictionnary, forStack:forStack, globalVars:valorizedDictionnary, prefix:any=undefined):any {

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

    // recherche variable locale
    // uniquement si pas de préfixe parce qu'une variable locale ne peut-être préfixée

    if(prefix===undefined) {
        let search = RGXlocalVariable.exec(variable)
        if(search!==null) {
            let lv = localVariables.find(e=>{ return search!==null ? e.name===search[1] : false })
            if(lv!==undefined) {
                if(RGXnumber.test(lv.value as string)!==true) return { type:"str", value:lv.value }
                else return { type:"number", value:lv.value }
            } else {
                throw(''.concat(
                    `varSolve - erreur détectée`,
                    `\nla variable ${variable} n'existe pas en tant que variable locale`,
                    `\n==> localVariables = ${JSON.stringify(localVariables)}`
                ))
            }
        }
    }

    // décompositin de la variable

    let search = RGXcomposedVar.exec(variable)

    if(search!==null) {

        // variable composée : la 1ère partie est un groupe

        let grp = search[1]

        // détection de l'utilisation d'un groupe indicé
        // cas particulier genre {{groupe[n]_variable}}

        let searchGrpIndex = /(\w+)(?:\[(\w+)\])/.exec(grp)
        let indice = searchGrpIndex!==null ? searchGrpIndex[2] : null
        grp = searchGrpIndex!==null ? searchGrpIndex[1] : grp

        // on recherche le groupe

        let grpDeclaration = (vars as Array<any>).find(v=>v.grp==grp)

        if(grpDeclaration===undefined) {
            throw(''.concat(
                `varSolve - erreur détectée`,
                `\nla variable ${variable} commence par un identifiant de groupe ${grp} qui n'existe pas`,
                `\n==> vars = ${vars}`,
                `\n==> forStack = ${forStack}`
            ))
        }

        // groupe indicé ?

        if(indice!==null) {
            // on recherche la valeur du groupe indicé
            let idx = parseInt(indice) - 1
            if(idx<0) {
                throw(''.concat(
                    `varSolve - erreur détectée`,
                    `\nla variable ${variable} pointe sur un indice de groupe invalide (${indice})`
                ))
            }
            if(idx>=grpDeclaration.occurrences.length) {
                throw(''.concat(
                    `varSolve - erreur détectée`,
                    `\nla variable ${variable} pointe sur un indice de groupe invalide (${indice})`
                ))
            }
            let searchGrp = prefix === undefined ? grp : `${prefix}_${grp}`
            return varSolve(search[2],grpDeclaration.occurrences[idx].values,forStack,globalVars,searchGrp)
        } else {
            // résolution de l'occurrence active du groupe
            let searchGrp = prefix === undefined ? grp : `${prefix}_${grp}`
            let fsi = complement.findReverse(forStack,(f:any)=>{ return f.grp==searchGrp })
            let occurrenceIndex = fsi!=undefined ? fsi.occurrenceIndex : 0
            // cas particulier de la variable nombre d'occurrences d'un groupe
            // alors que l'on est pas dans une boucle for
            if(fsi===undefined && search[2]==='_n') return { type:"str", value:grpDeclaration.occurrences!==undefined ? grpDeclaration.occurrences.length : 0 }
            return varSolve(search[2],grpDeclaration.occurrences[occurrenceIndex].values,forStack,globalVars,searchGrp)
        }
    } else {
        // variable simple, c'est peut-être un groupe
        let grpDeclaration = (vars as Array<any>).find(v=>v.grp==variable)
        if(grpDeclaration!==undefined) {
            // groupe
            return { type:"grp", occurrences:grpDeclaration.occurrences }
        }
        let varDeclaration = (vars as Array<any>).find(v=>v.var==variable)
        if(varDeclaration!==undefined) {
            // variable à résoudre (càd que la variable contient un appel de variable !)
            let search = RGXgenericVars.exec(varDeclaration.value)
            if(search!==null) {
                return varSolve(varDeclaration.value,globalVars,forStack,globalVars)
            }
            // variable élémentaire
            return { type:"var", value:varDeclaration.value }
        }
    }

    return { type:"pasglop", value:"" }

}

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

export function extractPathsAndValues(vars:valorizedDictionnary,currentPath=''):any[] {
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

export function serializePathsAndValues(pathsAndValues:any[]):any[] {
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

export function populateDictionnary(dictionnary:dictionnary,pathsAndValues:pathAndValueObject[],currentPath='') {
    let res:any[] = [];
    (dictionnary as Array<any>).forEach((v:any)=>{
        if(v.var!==undefined) {
            let path = currentPath.concat(currentPath===''?'':'>').concat(v.var)
            let f = pathsAndValues.find((p:any)=>p.path===path)
            if(f!==undefined) {
                res.push({var:v.var, lib:v.lib, value:f.value })
            } else {
                res.push({var:v.var,lib:v.lib,value:'????????' })
            }
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

function makeDensePathsAndValues(pathsAndValues:any[]):string {
    return densePathsAndValues(pathsAndValues).join('').slice(0,-1)
}

export function extractValues(dictionnary:dictionnary,values:polymorphicValuesRepresentation) {
    return Array.isArray(values) ?
        values.length>0 ?
            values[0] instanceof Object ?
                (values[0] as pathAndValueObject).path!==undefined ?
                    varsToValues(populateDictionnary(dictionnary,values as pathAndValueObject[])) :
                varsToValues(populateDictionnary(dictionnary,serializePathsAndValues(extractPathsAndValues(values as valorizedDictionnary)))) :
            values :
        undefined :
    undefined
}

function numberLines(text:string) {
    let ts = text.split('\n')
    let zs = '0'.repeat(ts.length.toFixed(0).length)
    let zl = zs.length
    let f = (n:number) => zs.concat(n as unknown as string).slice(-zl)
    return text.split('\n').map((v,i)=>`${f(i+1)} : ${v}`).join('\n')
}

export async function extendDictionnaryWithIncludes(skeletonLocations:string[],skeletonName:string,liens:any[]=[],developSkeletonText=undefined) {
    // déterminer si l'on est sur le squelette principal ou sur un squelette inclu
    let level0 = liens.length===0 ? true : false
    // lire le squelette
    let skeletonLocation = await complement.getFirstFileFoundInMultipleLocations(skeletonLocations,skeletonName) as string
    let skeletonSourceText = (developSkeletonText===undefined ? (await complement.loadFile(path.join(skeletonLocation,skeletonName as string))).source.toString() : developSkeletonText) as string
    // accumulateur des squelettes pour l'aide à la mise au point
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
                    // vérifier que le nouvel include ne pose pas un lien qui provoque une référence circualire
                    liens.push([skeletonName,fileName])
                    let scr = complement.searchCircularReference(liens)
                    if(scr.found===true) {
                        throw(`référence circualire détectée dans les include sur ${scr.with} dans [${scr?.details.toString()}]`)
                    }
                    // poursuivre l'exploration avec le nouveau squeltte inclu pour enrichir le dictionnaire
                    let edwi = await extendDictionnaryWithIncludes(skeletonLocations,fileName,liens)
                    let dico:dictionnary = edwi.dictionnary
                    ;(definition as groupObject).cmp = [...dico]
                    // remplacer les includes correspondants par le suqlette encadré par les directives # path et # endpath
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
                    // accumulation du squelette récupéré
                    accu += `\n\n${edwi.sourceBrut}`
                }
            }
        }
        d++
    }
    // dernier retour (on est sur le squelette principal)
    if(level0===true) return { dictionnary:dictionnary, sourceLines:[...parts.skodgeeLines, ...parts.declareLines, ...bodyLines], sourceBrut:accu }
    // retour sur un appel récursif (on est sur un squlette appelé par include)
    return { dictionnary:dictionnary, sourceLines:bodyLines, sourceBrut:accu }
}

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
                    `La déclaration du modèle ${search[2]} en ligne ${i} est invalide,`+
                    `un modèle ne peut être inclu dans un autre modèle`
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
            else throw(`le modèle ${search[2]} demandé en ligne ${i} n'est pas référencé`)
        } else {
            resultLines.push(e)
        }
    })
    return resultLines.join('\n')
}