import * as vscode from 'vscode'
import * as path from 'path'
import * as http from 'http'
import * as https from 'https'

/**
 * Retourne le dernier élément du tableau pour lequel la fonction fournie est vraie
 * @param t tableau à explorer de la fin au début
 * @param f fonction à vérifier
 * @returns élément trouvé ou undefined
 */
export function findReverse(t:any[],f:Function) {
    let l = t.length
    while(--l>=0) {
        if(f(t[l])===true) return t[l]
    }
    return undefined
}

/**
 * Encode une chaine en base 64
 * @param text chaine de caractères à encoder
 * @returns chaine encodée
 */
export function convertBase64(text:string):string {
    let code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
    return text.split('').reduce((acc:string[],cur,ind,arr)=>{
        let v= '00000000'.concat(cur.charCodeAt(0).toString(2)).slice(-8)
        if(ind%3==0) {
            acc.push(v)
        } else {
            let o = acc.pop()
            if(o!==undefined) acc.push(o.concat(v))
        }
        return acc
    },[]).reduce((acc:string[],cur,ind,arr)=>{
        if(cur.length===8) {
            cur+='0000'
            acc.push(code[parseInt(cur.slice(0,6),2)])
            acc.push(code[parseInt(cur.slice(6,12),2)])
            acc.push('==')
        }
        else if(cur.length===16) {
            cur+='00'
            acc.push(code[parseInt(cur.slice(0,6),2)])
            acc.push(code[parseInt(cur.slice(6,12),2)])
            acc.push(code[parseInt(cur.slice(12,18),2)])
            acc.push('=')
        }
        else {
            acc.push(code[parseInt(cur.slice(0,6),2)])
            acc.push(code[parseInt(cur.slice(6,12),2)])
            acc.push(code[parseInt(cur.slice(12,18),2)])
            acc.push(code[parseInt(cur.slice(18,24),2)])
        }
        return acc
    },[]).join('')
}

/**
 * Décode une chaine base 64
 * @param text chaine en base 64
 * @returns chaine décodée
 */
export function revertBase64(text:string):string {
    let code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
    return text.split('').reduce((acc:string[],cur,ind,arr)=>{
        if(cur!=='=') {
            let v = '000000'.concat(code.indexOf(cur).toString(2)).slice(-6)
            if(ind%4==0) {
                acc.push(v)
            } else {
                let o = acc.pop()
                if(o!==undefined) acc.push(o.concat(v))
            }
        }
        return acc
    },[]).reduce((acc:string[],cur,ind,arr)=>{
        if(cur.length===18) cur=cur.slice(0,16)
        else if(cur.length===12) cur=cur.slice(0,8)
        acc.push(String.fromCharCode(parseInt(cur.slice(0,8),2)))
        if(cur.length>8) acc.push(String.fromCharCode(parseInt(cur.slice(8,16),2)))
        if(cur.length>16) acc.push(String.fromCharCode(parseInt(cur.slice(16,24),2)))
        return acc
    },[]).join('')
}

/**
 * Charge un fichier texte
 * @param filePathName path sur le fichier
 * @returns objet name (nom du fichier), location (emplacement du fichier), source:(chaine contenant la totalité du fichier)
 */
export async function loadFile(filePathName:string) {
    const uri = vscode.Uri.file(filePathName)
    const buffer = await vscode.workspace.fs.readFile(uri)
    const fileText = buffer.toString()
    return {
        name: path.basename(filePathName),
        location: path.dirname(filePathName),
        source: fileText
    }
}

/**
 * Recherche la présence d'un fichier dans un liste de répertoires
 * @param locations tableau d'emplacement de fichiers (liste de répertoires...)
 * @param fileName  nom de fichier à retrouver dans les emplacements
 * @returns premier path complet (location/fileName) existant ou undefined
 */
export async function getFirstFileFoundInMultipleLocations(locations:string[],fileName:string) {
    let l = locations.length
    for(let i=0;i<l;i++) {
        let uri = vscode.Uri.file(path.join(locations[i],fileName))
        let found:boolean=true
        try {
            await vscode.workspace.fs.stat(uri)
        } catch(error) {
            found = false
        } finally {
            if(found===true) {
                return locations[i]
            }
        }
    }
    return undefined
}

/**
 * Découpage d'une chaine en un tableau de chaines de longueur fixe
 * @param s chaine à découper
 * @param l longueur de chaque chaine résultat du découpage
 * @param t tableau à compléter
 * @returns tableau contenant les chaines après découpage
 */
export function decoupe(s:string,l:number,t=[]):Array<string> {
    t.push(s.slice(0,l) as never)
    if(s.length>l) return decoupe(s.slice(l),l,t)
    return t
}

/**
 * Rechercher d'une référence circulaire dans un ensemble de paires liées
 * @param t tableau de paires de chaine liées
 * @returns objet contenant soit found à false, soit un triplet composé de found à true, 
 *          de with une chaine pour laquelle on a trouvée une référence ciculaire
 *          et details qui liste les paires dans lequelles on l'a détectée
 */
export function searchCircularReference(t:Array<any>):any {
    let doItLevel1 = true
    let i = 0
    while(doItLevel1) {
        let doItLevel2 = true
        let j = 1
        while(doItLevel2) {
            let f = t.find(e=>e[0]===t[i][j])
            if(f!==undefined) {
                f.slice(1).forEach((e:any) => {
                    if(!t[i].slice(1).some((ee:any)=>ee==e)) (t[i] as Array<any>).push(e)
                })
                j++
                if(j>=t[i].length) break
            }
            i++
            if(i>=t.length) break
        }
        i = 0
        while(true) {
            if(t[i].slice(1).some((f:any)=>f===t[i][0])) return { found:true, with:t[i][0].toString(), details:t[i].slice(1) }
            if(++i>=t.length) break
        }
        return { found:false }
    }
}

/**
 * Permet l'appel d'un service http
 * @param request url du service
 * @returns promesse retournant la réponse si ok, l'anomalie si ko
 */
export function service(request:any):Promise<any> {
    return new Promise((resolve,reject)=>{
        let data = ''
        if(/^http:/.test(request)) {
            http.get(request,(res)=>{ 
                if(res.statusCode!==200) {
                    reject(res)
                    res.resume()
                }
                res.on('data',c=>data+=c)
                res.on('close',()=>resolve(data))
            }).on('error',(error)=>{
                reject(error)
            })
        }
        else if(/^https:/.test(request)) {
            https.get(request,(res)=>{
                if(res.statusCode!==200) {
                    reject(res)
                    res.resume()
                }
                res.on('data',c=>data+=c)
                res.on('close',()=>resolve(data))
            }).on('error',(error)=>{
                reject(error)
            })
        } else {
            reject('requete invalide')
        }
    })
}

/**
 * Traduit le path fourni en valeur, objet ou tableau extrait de l'objet donné.
 * Le path est un chaine qui reprend la notation standard utilisée pour accèder aux
 * composants d'un objet JSON.
 * Il est aussi possible d'utiliser la notation [] sans inclure d'indice pour récupérer
 * la totalité des occurrences d'un tableau.
 * @param dotPath 
 * @param object 
 * @returns 
 */
export function extractDotPath(dotPath:string,object:any) {
    let inArray = false
    let finalExtract = false
    return dotPath.split('.').reduce((acc,v,i,o)=>{ 
        if(finalExtract===true) return acc
        if(acc===undefined) return undefined
        if(inArray===true) {
            finalExtract = true
            let dp = o.slice(i-o.length).join('.')
            let r = acc.map((e:any) => extractDotPath(dp,e)) 
            return r
        }
        let search
        if((search = /(\w+)\[\]/.exec(v)) !== null ) {
            inArray = true
            return acc[search[1]]
        }
        if((search = /(\w+)\[(\d+)\]/.exec(v)) !== null ) {
            return acc[search[1]][parseInt(search[2])]
        }
        if((search = /\[\]/.exec(v)) !== null ) {
            inArray = true
            return Array.isArray(acc) ? acc : undefined
        }
        if((search = /\[(\d+)\]/.exec(v)) !== null ) {
            return Array.isArray(acc) ? acc[parseInt(search[1])] : undefined
        }
        return acc[v]
    },object)
}