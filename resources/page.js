const vscode = acquireVsCodeApi()

console.log('***')

var testMode = true //false
var swapMode = 0
var userMode = "developer"

var dictionnary
var dictionnaryValues = undefined

var loadedSkeletonSource = ''
var loadedSkeletonName = ''
var generatedCode

var uid = 0

newId = () => `I${++uid}`
lastId = () => `I${uid}`
resetId = () => uid=0

selectSkeletonType = (values=undefined) => {
    const skeletonType = document.querySelector('#skeletonType').value
    if(skeletonType!=='') {
        document.querySelector('#formulaire').innerHTML = ''
        vscode.postMessage({command:'loadSkeleton',skeleton:skeletonType,values:values})
    } else {
        document.querySelector('#skeleton').value = 'Choisir un squlette avant de lancer son chargement !!!'
    }
}

document.querySelector('#bouton').addEventListener('click',e=>selectSkeletonType())

document.querySelector('#swap').addEventListener('click',e=>{
    switch(++swapMode % 3) {
        case 0:
            skeleton.style.display='block'
            expansed.style.display='block'
            break
        case 1:
            skeleton.style.display='block'
            expansed.style.display='none'
            break
        case 2:
            skeleton.style.display='none'
            expansed.style.display='block'
            break
        }
})


document.querySelector('#generateCode').addEventListener('click',e=>{
    let res =[]
    document.querySelectorAll('#formulaire input').forEach( inp => {
        res.push({ var:inp.name, value:inp.value })
    })
    resetVars()
    let data = cleanVars(encodeVars(res))
    document.querySelector('#expansed').value = JSON.stringify(data,null,4)
    vscode.postMessage({
        command:'resolveSkeleton',
        encodedVars:data,
        name:loadedSkeletonName,
        source:loadedSkeletonSource,
        analyzeResult:dictionnary
    })
})

document.querySelector('#getCode').addEventListener('click', e => {
    vscode.postMessage({command:'editGeneratedCodeInNewEditor',generatedCode:generatedCode})
})

window.addEventListener('message', e => {
    const message = e.data
    switch(message.command) {
        case 'message':
            document.querySelector('#expansed').value = message.message
            break
        case 'userMode':
            swapUserMode(message.userMode)
            break
        case 'loadSkeletonOnSuccess':
            loadedSkeletonName = message.name
            loadedSkeletonSource = message.source
            document.querySelector('#skeleton').value = 
            `${message.sourceBrut}\n\n`+
            `+++ =======================================================\n`+
            `+++  Source après résolution des inclusions et des modèles\n`+
            `+++ =======================================================\n`+
            `${numberLines(message.source)}`
            dictionnary = message.dictionnary
            dictionnaryValues = message.values
            generateForm(dictionnary)
            document.querySelector('#expansed').value = JSON.stringify(dictionnary,null,4)
            document.querySelector('#getCode').classList.add('hidden')
            break
        case 'loadSkeletonOnError':
            document.querySelector('#skeleton').value = message.error
            document.querySelector('#expansed').value = message.log
            document.querySelector('#generateCode').classList.add('hidden')
            document.querySelector('#getCode').classList.add('hidden')
            break
        case 'resolveSkeletonOnSuccess':
            generatedCode = message.resolvedSkeleton
            document.querySelector('#expansed').value = message.resolvedSkeleton.join('\n')
            document.querySelector('#getCode').classList.remove('hidden')
            break
        case 'resolveSkeletonOnError':
            document.querySelector('#expansed').value = message.error
            document.querySelector('#getCode').classList.add('hidden')
            break
        case 'bindSkeleton':
            let option = document.createElement('option')
            option.value = message.data.fileName
            option.textContent = message.data.name
            option.title = message.data.description
            document.querySelector('#skeletonType').append(option)
            if(message.values!==undefined) {
                dictionnaryValues = message.values
                option.selected = 'true'
                selectSkeletonType(message.values)
            }
            sortOptions(document.querySelector('#skeletonType'))
            break
        case 'developSkeletonOnSuccess':
            loadedSkeletonSource = message.source
            document.querySelector('#skeleton').value = 
            `${message.sourceBrut}\n\n`+
            `+++ =======================================================\n`+
            `+++  Source après résolution des inclusions et des modèles\n`+
            `+++ =======================================================\n`+
            `${numberLines(message.source)}`
            dictionnary = message.dictionnary
            dictionnaryValues = message.values
            generateForm(dictionnary)
            document.querySelector('#expansed').value = JSON.stringify(dictionnary,null,4)
            document.querySelector('#getCode').classList.add('hidden')
            document.querySelector('#skeletonType').classList.add('hidden')
            document.querySelector('#bouton').classList.add('hidden')
            break
        case 'developSkeletonOnError':
            document.querySelector('#expansed').value = message.error
            document.querySelector('#getCode').classList.add('hidden')
            break
    }
})

sortOptions = (select) => {
    // extrait les options du select
    let options = Array.from(select.querySelectorAll('option'))
    // efface le select
    while(select.hasChildNodes()) select.removeChild(select.lastChild)
    // tri inversé
    options.sort((a,b)=>{
        if(a.textContent<b.textContent) return 1
        return -1
    })
    // recharge le select
    while(options.length>0) select.append(options.pop())
}

numberLines = (text) => {
    let ts = text.split('\n')
    let zs = '0'.repeat(ts.length.toFixed(0).length)
    let zl = zs.length
    let f = (n) => zs.concat(n).slice(-zl)
    return text.split('\n').map((v,i)=>`${f(i+1)} : ${v}`).join('\n')
}

appendElements = (destination,elements) => {
    elements.forEach( e=>destination.appendChild(e))
}

generateForm = data => {
    let formulaire = document.querySelector('#formulaire')
    while(formulaire.hasChildNodes()) formulaire.removeChild(formulaire.lastChild)
    resetId()
    data.forEach((e,i)=>{
        if(e.var!==undefined) {
            let elements = generateInput(e,undefined,dictionnaryValues!==undefined ? dictionnaryValues[i] : undefined)
            appendElements(document.querySelector('#formulaire'),elements)
        }
        else if(e.grp!==undefined) {
            let group = generateGroup(e,undefined,dictionnaryValues!==undefined ? dictionnaryValues[i] : undefined)
            if(group!==undefined) {
                appendElements(document.querySelector('#formulaire'),group)
            }
        }
    })
    document.querySelector('#generateCode').classList.remove('hidden')
    document.querySelector('#getCode').classList.remove('hidden')
    refreshCounting()
}

generateInput = (e,parentName=undefined,value=undefined) => {
    let res = []
    if(e.var!==undefined) {
        let spanStatus = document.createElement('span')
        spanStatus.className = 'status'
        spanStatus.textContent = '•'
        res.push(spanStatus)

        let label = document.createElement('label')
        label.className = 'variable'
        label.textContent = e.lib!==undefined ? e.lib : e.var
        label.for = newId()
        res.push(label)

        let input = document.createElement('input')
        input.name = parentName!==undefined ? `${parentName}>${e.var}` : e.var
        input.id = lastId()
        if(e.opt!==undefined) {
            let datalist = document.createElement('datalist')
            datalist.id = newId()
            input.setAttribute('list',lastId())
            e.opt.forEach( dl => {
                let option = document.createElement('option')
                option.value = dl
                datalist.appendChild(option)
            })
            res.push(datalist)
        } else if(e.type!==undefined) {
            if(e.type==='numeric') {
                input.pattern = "^((?:[+-])?\\d+(?:\\.\\d*)?)$"
            } else if(e.pattern!==undefined) {
                input.pattern = e.pattern
            }
        }
        if(e.placeholder!==undefined) {
            input.placeholder = e.placeholder
        }
        /*****************************/
        /***** T E S T - M O D E *****/
        if(testMode) input.value = e.var
        /***** T E S T - M O D E *****/
        /*****************************/
        if(value!==undefined) input.value = value
        else if(e.ini!==undefined) input.value = e.ini
        res.push(input)
    }
    if(res.length>0) {
        let div = document.createElement('div')
        if(e.description!==undefined) { div.title = e.description }
        div.className = 'line'
        appendElements(div,res)
        return [div]
    }
    return res
}

generateGroup = (e,parentName=undefined,values=undefined) => {
    if(e.grp===undefined) return []

    let divGroup = document.createElement('div')
    divGroup.className = 'group'

    let divGroupHead = document.createElement('div')
    divGroupHead.className = 'groupHead'
    divGroup.append(divGroupHead)

    let spanStatus = document.createElement('span')
    spanStatus.className = 'status'
    spanStatus.textContent = '🡇'
    spanStatus.onclick = e => {
        divGroup.classList.toggle('groupClose')
        spanStatus.textContent = divGroup.classList.contains('groupClose') ? '🡆' : '🡇'
        refreshCounting()
    }
    divGroupHead.appendChild(spanStatus)

    let span = document.createElement('span')
    span.textContent = e.lib!==undefined ? e.lib : e.grp
    span.className = 'title'
    span.onclick = e => {
        divGroup.classList.toggle('groupClose')
        spanStatus.textContent = divGroup.classList.contains('groupClose') ? '🡆' : '🡇'
        refreshCounting()
    }
    divGroupHead.appendChild(span)

    let spanNumber = document.createElement('span')
    spanNumber.className = 'number'
    divGroupHead.appendChild(spanNumber)

    let { min, max } = getGroupRepetition(e)
    let name = parentName!==undefined ? `${parentName}>${e.grp}` : `${e.grp}`

    if(min!==max) {
        let rpt = document.createElement('span')
        rpt.className = 'repetition'
        rpt.textContent = `(de ${min} à ${max})`
        divGroupHead.appendChild(rpt)
        let plus = document.createElement('button')
        plus.textContent = '+'
        plus.title = `ajouter une occurrence de "${e.lib}" en début de liste`
        plus.className = 'plus'
        plus.addEventListener('click',event => {
            if([...divGroup.children].filter(e=>e.classList.contains('occurrenceContainer')).length<max) {
                let occ = generateOccurrenceIntoAfter(e,divGroup,undefined,name).lastCreated
                /*let maxHeight = occ.getBoundingClientRect().height
                occ.style.setProperty('height','0px')
                let currentHeight = 0
                let iv = setInterval(()=>{
                    occ.style.setProperty('height',`${currentHeight}px`)
                    if(currentHeight<maxHeight) currentHeight+=3.5
                },10)
                setTimeout(()=>{
                    refreshCounting()
                    clearInterval(iv)
                },300)*/
                refreshCounting()
            }
        })
        divGroupHead.appendChild(plus)
    }

    let group = generateOccurrenceIntoAfter(e,divGroup,undefined,name,values).group
    return group

}

getGroupRepetition = e => {
    let min = 1
    let max = 1
    if(e.rpt!==undefined) {
        let sp = e.rpt.split(',')
        if(sp.length===1) {
            min = parseInt(sp[0])
            max = min
        } else if(sp.length==2) {
            min = parseInt(sp[0])
            max = parseInt(sp[1])
        } else {
            console.log(`rpt invalide détectée :: valuer = ${e.rpt}`)
        }
    }
    return { min:min, max:max }
}

generateOccurrenceIntoAfter = (e,div,beforeNode=undefined,parentName,values=undefined) => {
    let value = undefined
    if(values!==undefined) {
        if(Array.isArray(values)) {
            if(values.length===0) return { group:[div], lastCreated:undefined }
            value = values.shift()
        }
    }

    let occContainer = document.createElement('div')
    occContainer.className = 'occurrenceContainer'

    let occ = document.createElement('div')
    occ.className = 'occurrence'
    if(beforeNode!==undefined) {
        beforeNode.parentNode.insertBefore(occContainer,beforeNode.nextSibling)
    } else {
        div.insertBefore(occContainer,div.querySelector('.occurrenceContainer'))
    }

    let spanStatus = document.createElement('span')
    spanStatus.className = 'status'
    spanStatus.textContent = '≡'
    spanStatus.onclick = e => {
        occContainer.classList.toggle('occurrenceContainerClose')
        spanStatus.textContent = occContainer.classList.contains('occurrenceContainerClose') ? '⦀' : '≡'
        refreshCounting()
    }
    occContainer.appendChild(spanStatus)

    let spanTitle = document.createElement('span')
    spanTitle.className = 'title'
    spanTitle.textContent = occContainer.parentElement.querySelector('.title').textContent
    spanTitle.onclick = e => {
        occContainer.classList.toggle('occurrenceContainerClose')
        spanStatus.textContent= occContainer.classList.contains('occurrenceContainerClose') ? '⦀' : '≡'
        refreshCounting()
    }
    occContainer.append(spanTitle)

    let spanNumber = document.createElement('span')
    spanNumber.className = 'number'
    occContainer.appendChild(spanNumber)

    let lines = document.createElement('div')
    lines.className = 'lines'
    occ.appendChild(lines)

    let name = `${parentName}[${newId()}]`
    e.cmp.forEach((cmpElement,i)=>{
        if(cmpElement.var!==undefined) {
            let gi = generateInput(cmpElement,name,value!==undefined?value[i]:undefined)
            appendElements(lines,gi)
        } else if(cmpElement.grp!==undefined) {
            appendElements(lines,generateGroup(cmpElement,name,value!==undefined?value[i]:undefined))
        }
    })

    if(e.rpt!==undefined) {
        let { min,max } = getGroupRepetition(e)
        let buttons = document.createElement('div')
        buttons.className = 'buttons'
        occContainer.appendChild(buttons)
        let plus = document.createElement('button')
        plus.textContent = '+'
        plus.title = `ajouter une occurrence de "${spanTitle.textContent}" après celle-ci`
        plus.className = 'plus'
        plus.addEventListener('click',event=>{
            if([...div.children].filter(e=>e.classList.contains('occurrenceContainer')).length<max) {
                let occ = generateOccurrenceIntoAfter(e,div,occContainer,parentName).lastCreated
                /*let maxHeight = occ.getBoundingClientRect().height
                occ.style.setProperty('height','0px')
                let currentHeight = 0
                let iv = setInterval(()=>{
                    occ.style.setProperty('height',`${currentHeight}px`)
                    if(currentHeight<maxHeight) currentHeight+=3.5
                },10)
                setTimeout(()=>{
                    refreshCounting()
                    clearInterval(iv)
                },300)*/
                refreshCounting()
            }
        })
        let moins = document.createElement('button')
        moins.textContent = '-'
        moins.title = `supprimer catte occurrence de "${spanTitle.textContent}" et tout ce qu'elle contient définitivement`
        moins.className = 'moins'
        moins.addEventListener('click',event=>{
            if(div.querySelectorAll('.occurrenceContainer').length>min) {
                occContainer.classList.add('suppress')
                let currentHeight = occContainer.getBoundingClientRect().height
                let iv = setInterval(()=>{
                    currentHeight-=3.5
                    occContainer.style.setProperty('height',`${currentHeight}px`)
                },10)
                setTimeout(()=>{
                    div.removeChild(occContainer)
                    refreshCounting()
                    clearInterval(iv)
                },300)
            }
        })
        appendElements(buttons,[plus,moins])
    }

    occContainer.appendChild(occ)
    if(values!==undefined) {
        if(Array.isArray(values)) {
            if(values.length>0) {
                return { group:[div,...generateOccurrenceIntoAfter(e,div,occContainer,parentName,values).group], lastCreated:occContainer }
            }
        }
    }

    return { group:[div], lastCreated:occContainer }
}

refreshCounting = () => {

    // reset les boutons à leur position initiale

    document.querySelectorAll('.groupHead').forEach(gh=>{
        gh.querySelectorAll('.plus').forEach(pl=>pl.style.setProperty('margin-left',''))
    })
    document.querySelectorAll('.occurrenceContainer').forEach(gh=>{
        gh.querySelectorAll('.plus').forEach(pl=>pl.style.setProperty('margin-left',''))
    })

    // met à jour les compteurs associés à chaque groupe groupe et à chauqe occurrence

    document.querySelector('#formulaire').querySelectorAll('.group').forEach(group=>{
        let ocl = group.querySelectorAll('.occurrenceContainer')
        if(ocl.length===0) {
            group.querySelector('.number').textContent = 0
        } else {
            ocl.forEach(occurrenceContainer=>{
                let qty = [...occurrenceContainer.parentElement.children].filter(oc=>oc.classList.contains('occurrenceContainer')).length
                occurrenceContainer.parentElement.querySelector('.number').textContent = qty
                let pos = [...occurrenceContainer.parentElement.querySelectorAll('.occurrenceContainer')]
                    .filter(e=>e.parentElement===occurrenceContainer.parentElement)
                    .findIndex(e=>e===occurrenceContainer)
                occurrenceContainer.querySelector('.number').textContent = `${pos+1} / ${qty}`
            })
        }
    })

    // repositionne le bouton plus de chaque groupe et de chaque occurrence à gauche

    document.querySelectorAll('.groupHead, .occurrenceContainer').forEach(gh=>{
        gh.querySelectorAll('.plus').forEach(bp=>{
            if(bp!==null) {
                let bpbr = bp.getBoundingClientRect()
                if(bpbr.left>0) bp.style.setProperty('margin-left',`-${bpbr.left - bpbr.width - 5}px`)
            }
        })
    })
}

encodeVars = (vars,declareSet=dictionnary) => {
    vars.forEach( v => {
        let dd = declareSet.find(e=>e.var==v.var)
        if(dd!==undefined) {
            dd.value = v.value
        } else {
            let sp = v.var.split('>')
            let rg = /(\w+)(?:\[(I\d+)\])*/.exec(sp[0])
            if(rg[1]!==undefined) {
                let dd = declareSet.find(e=>e.grp==rg[1])
                if(dd!=undefined) {
                    let idx = rg[2]!==undefined ? rg[2] : 'U'
                    if(dd.occurrences===undefined) dd.occurrences = []
                    let occurrence = dd.occurrences.find(oc=>oc.idx==idx)
                    if(occurrence==undefined) {
                        let values = dd.cmp.map(c=>{
                            return { var:c.var, grp:c.grp, cmp:c.cmp, lib:c.lib!==undefined?c.lib:c.var, value:"" }
                        })
                        occurrence = { idx:idx, values:values }
                        dd.occurrences.push(occurrence)
                    }
                    occurrence = encodeVars([{ var:sp.slice(1).join('>'), value:v.value }],occurrence.values)
                } else {
                    console.log(`des valeurs sont perdues : ${JSON.stringify(v)}`)
                }
            }
        }
    })
    return declareSet
}

cleanVars = (encodeVarsSet) => {
    encodeVarsSet.forEach( ev => {
        if(ev.occurrences!==undefined) {
            ev.occurrences.forEach( oc => {
                oc.idx = undefined
                oc.values.forEach( va => {
                    va.cmp = undefined
                    va.lib = undefined
                    if(va.grp!==undefined) va.value = undefined
                    if(va.occurrence!==undefined) va = cleanVars([va])[0]
                })
            })
        }
    })
    return encodeVarsSet
}

resetVars = (encodeVarsSet=dictionnary) => {
    encodeVarsSet.forEach( ev => {
        ev.value = undefined
        ev.occurrences = undefined
    })
    return encodeVarsSet
}

swapUserMode = (askUserMode) => {
    userMode = askUserMode
    switch(userMode) {
        case 'developer':
            document.querySelector('#swap').style.setProperty('display','none')
            document.querySelector('#skeleton').style.setProperty('display','none')
            break
        case 'skeletonEditor':
            document.querySelector('#swap').style.removeProperty('display')
            document.querySelector('#skeleton').style.removeProperty('display')
            break
    }
}

swapUserMode(userMode)