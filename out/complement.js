"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchCircularReference = exports.decoupe = exports.loadFile = exports.revertBase64 = exports.convertBase64 = exports.findReverse = void 0;
const vscode = require("vscode");
const path = require("path");
/**
 * Retourne le dernier élément du tableau pour lequel la fonction fournie est vraie
 * @param t tableau à explorer de la fin au début
 * @param f fonction à vérifier
 * @returns élément trouvé ou undefined
 */
function findReverse(t, f) {
    let l = t.length;
    while (--l >= 0) {
        if (f(t[l]) === true)
            return t[l];
    }
    return undefined;
}
exports.findReverse = findReverse;
/**
 * Encode une chaine en base 64
 * @param text chaine de caractères à encoder
 * @returns chaine encodée
 */
function convertBase64(text) {
    let code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    return text.split('').reduce((acc, cur, ind, arr) => {
        let v = '00000000'.concat(cur.charCodeAt(0).toString(2)).slice(-8);
        if (ind % 3 == 0) {
            acc.push(v);
        }
        else {
            let o = acc.pop();
            if (o !== undefined)
                acc.push(o.concat(v));
        }
        return acc;
    }, []).reduce((acc, cur, ind, arr) => {
        if (cur.length === 8) {
            cur += '0000';
            acc.push(code[parseInt(cur.slice(0, 6), 2)]);
            acc.push(code[parseInt(cur.slice(6, 12), 2)]);
            acc.push('==');
        }
        else if (cur.length === 16) {
            cur += '00';
            acc.push(code[parseInt(cur.slice(0, 6), 2)]);
            acc.push(code[parseInt(cur.slice(6, 12), 2)]);
            acc.push(code[parseInt(cur.slice(12, 18), 2)]);
            acc.push('=');
        }
        else {
            acc.push(code[parseInt(cur.slice(0, 6), 2)]);
            acc.push(code[parseInt(cur.slice(6, 12), 2)]);
            acc.push(code[parseInt(cur.slice(12, 18), 2)]);
            acc.push(code[parseInt(cur.slice(18, 24), 2)]);
        }
        return acc;
    }, []).join('');
}
exports.convertBase64 = convertBase64;
/**
 * Décode une chaine base 64
 * @param text chaine en base 64
 * @returns chaine décodée
 */
function revertBase64(text) {
    let code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    return text.split('').reduce((acc, cur, ind, arr) => {
        if (cur !== '=') {
            let v = '000000'.concat(code.indexOf(cur).toString(2)).slice(-6);
            if (ind % 4 == 0) {
                acc.push(v);
            }
            else {
                let o = acc.pop();
                if (o !== undefined)
                    acc.push(o.concat(v));
            }
        }
        return acc;
    }, []).reduce((acc, cur, ind, arr) => {
        if (cur.length === 18)
            cur = cur.slice(0, 16);
        else if (cur.length === 12)
            cur = cur.slice(0, 8);
        acc.push(String.fromCharCode(parseInt(cur.slice(0, 8), 2)));
        if (cur.length > 8)
            acc.push(String.fromCharCode(parseInt(cur.slice(8, 16), 2)));
        if (cur.length > 16)
            acc.push(String.fromCharCode(parseInt(cur.slice(16, 24), 2)));
        return acc;
    }, []).join('');
}
exports.revertBase64 = revertBase64;
/**
 * Charge un fichier texte
 * @param filePathName path sur le fichier
 * @returns objet name (nom du fichier), location (emplacement du fichier), source:(chaine contenant la totalité du fichier)
 */
function loadFile(filePathName) {
    return __awaiter(this, void 0, void 0, function* () {
        const uri = vscode.Uri.file(filePathName);
        const buffer = yield vscode.workspace.fs.readFile(uri);
        const fileText = buffer.toString();
        return {
            name: path.basename(filePathName),
            location: path.dirname(filePathName),
            source: fileText
        };
    });
}
exports.loadFile = loadFile;
/**
 * Découpage d'une chaine en un tableau de chaines de longueur fixe
 * @param s chaine à découper
 * @param l longueur de chaque chaine résultat du découpage
 * @param t tableau à compléter
 * @returns tableau contenant les chaines après découpage
 */
function decoupe(s, l, t = []) {
    t.push(s.slice(0, l));
    if (s.length > l)
        return decoupe(s.slice(l), l, t);
    return t;
}
exports.decoupe = decoupe;
/**
 * Rechercher d'une référence circulaire dans un ensemble de paires liées
 * @param t tableau de paires de chaine liées
 * @returns objet contenant soit found à false, soit un triplet composé de found à true,
 *          de with une chaine pour laquelle on a trouvée une référence ciculaire
 *          et details qui liste les paires dans lequelles on l'a détectée
 */
function searchCircularReference(t) {
    let doItLevel1 = true;
    let i = 0;
    while (doItLevel1) {
        let doItLevel2 = true;
        let j = 1;
        while (doItLevel2) {
            let f = t.find(e => e[0] === t[i][j]);
            if (f !== undefined) {
                f.slice(1).forEach((e) => {
                    if (!t[i].slice(1).some((ee) => ee == e))
                        t[i].push(e);
                });
                j++;
                if (j >= t[i].length)
                    break;
            }
            i++;
            if (i >= t.length)
                break;
        }
        i = 0;
        while (true) {
            if (t[i].slice(1).some((f) => f === t[i][0]))
                return { found: true, with: t[i][0].toString(), details: t[i].slice(1) };
            if (++i >= t.length)
                break;
        }
        return { found: false };
    }
}
exports.searchCircularReference = searchCircularReference;
//# sourceMappingURL=complement.js.map