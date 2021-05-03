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
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const path = require("path");
const complement = require("./complement");
const skeleton = require("./skeleton");
let logBuffer = '';
function activate(context) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        let info = (_a = vscode.extensions.getExtension('herve.heritier.skodgee')) === null || _a === void 0 ? void 0 : _a.packageJSON;
        const page = yield vscode.workspace.fs.readFile(vscode.Uri.file(path.join(context.extensionPath, 'resources', 'page.html')));
        const pageJs = yield vscode.workspace.fs.readFile(vscode.Uri.file(path.join(context.extensionPath, 'resources', 'page.js')));
        const pageCss = yield vscode.workspace.fs.readFile(vscode.Uri.file(path.join(context.extensionPath, 'resources', 'page.css')));
        let disposableStart = vscode.commands.registerCommand('skodgee.generation', (values = undefined, developSkeletonText = undefined) => {
            vscode.window.setStatusBarMessage(`${info.displayName} est démarré`, 5000);
            const configuration = vscode.workspace.getConfiguration('skodgee');
            const panel = vscode.window.createWebviewPanel(`${info.name}`, `${info.displayName}`, vscode.ViewColumn.One, {
                enableScripts: true,
                localResourceRoots: [
                    vscode.Uri.file(path.join(context.extensionPath, 'resources')),
                    vscode.Uri.file(configuration.skeletonLocation)
                ],
                retainContextWhenHidden: true
            });
            if (developSkeletonText === undefined) {
                vscode.workspace.fs.readDirectory(vscode.Uri.file(path.join(configuration.skeletonLocation)))
                    .then((rd) => {
                    rd.forEach((e) => {
                        if (e[1] === 1) {
                            vscode.workspace.fs.readFile(vscode.Uri.file(path.join(configuration.skeletonLocation, e[0])))
                                .then((buffer) => {
                                let r = buffer.slice(0, 9).toString();
                                if (r === '# skodgee' || r.slice(0, 8) === '# skodgee') {
                                    let lines = [];
                                    let l = buffer.length;
                                    let bfb = 9;
                                    let bfe = 9;
                                    for (let i = bfb; i < l; i++) {
                                        if (buffer[i] === 0x0D || buffer[i] === 0x0A) {
                                            if (bfb < bfe) {
                                                let line = buffer.slice(bfb, bfe).toString();
                                                if (line[0] === '#')
                                                    break;
                                                lines.push(line);
                                            }
                                            bfb = i + 1;
                                        }
                                        bfe++;
                                    }
                                    let info = JSON.parse(lines.join(''));
                                    info.fileName = e[0];
                                    if (info.hidden === undefined) {
                                        let sn = values !== undefined ? values.sn : undefined;
                                        panel.webview.postMessage({
                                            command: 'bindSkeleton',
                                            data: info,
                                            values: info.fileName === sn ? JSON.parse(values.data) : undefined
                                        });
                                    }
                                }
                            }, (reason) => console.log(reason));
                        }
                    });
                }, (reason) => console.log(reason));
            }
            else {
                try {
                    skeleton.extendDictionnaryWithIncludes(configuration.skeletonLocation, '???', undefined, developSkeletonText)
                        .then((resolvedValue) => {
                        skeleton.resolveModels(resolvedValue.sourceLines.join('\n'))
                            .then((sourceAfterResolvedModels) => {
                            panel.webview.postMessage({
                                command: 'developSkeletonOnSuccess',
                                source: sourceAfterResolvedModels,
                                sourceBrut: resolvedValue.sourceBrut,
                                dictionnary: resolvedValue.dictionnary,
                                values: skeleton.extractValues(resolvedValue.dictionnary, [])
                            });
                        }, (reason) => {
                            throw reason;
                        });
                    }, (reason) => {
                        throw reason;
                    });
                }
                catch (error) {
                    panel.webview.postMessage({
                        command: 'developSkeletonOnError',
                        error: error
                    });
                    return;
                }
            }
            panel.webview.html = page.toString()
                .replace('<h1 id="title"></h1>', `<h1>${info.displayName} <quote>(version ${info.version})</quote></h1><cite>${info.description}</cite><br/><br/>`)
                .replace('<script id="pageJs"></script>', `<script>${pageJs.toString()}</script>`)
                .replace('<style id="pageCss"></style>', `<style>${pageCss.toString()}</style>`);
            panel.webview.onDidReceiveMessage(message => {
                switch (message.command) {
                    case 'loadSkeleton':
                        {
                            try {
                                let value = { name: message.skeleton, location: configuration.skeletonLocation };
                                skeleton.extendDictionnaryWithIncludes(value.location, value.name)
                                    .then((resolvedValue) => {
                                    let source = resolvedValue.sourceLines.join('\n');
                                    skeleton.resolveModels(source)
                                        .then((sourceAfterResolvedModels) => {
                                        panel.webview.postMessage({
                                            command: 'loadSkeletonOnSuccess',
                                            name: value.name,
                                            location: value.location,
                                            source: sourceAfterResolvedModels,
                                            sourceBrut: resolvedValue.sourceBrut,
                                            dictionnary: resolvedValue.dictionnary,
                                            values: skeleton.extractValues(resolvedValue.dictionnary, message.values)
                                        });
                                    }, (reason) => {
                                        panel.webview.postMessage({
                                            command: 'loadSkeletonOnError',
                                            error: reason,
                                            log: dumpLog()
                                        });
                                        return;
                                    });
                                }, (reason) => {
                                    panel.webview.postMessage({
                                        command: 'loadSkeletonOnError',
                                        error: reason,
                                        log: dumpLog()
                                    });
                                    return;
                                });
                            }
                            catch (error) {
                                log(`onDidReceiveMessage - loadSkeleton - anomalie détectée`);
                                log(`==> erreur : ${error}`);
                                panel.webview.postMessage({
                                    command: 'loadSkeletonOnError',
                                    error: `le squelette demandé est invalide, il contient des erreurs`,
                                    log: dumpLog()
                                });
                                return;
                            }
                        }
                        break;
                    case 'resolveSkeleton':
                        {
                            try {
                                panel.webview.postMessage({
                                    command: 'resolveSkeletonOnSuccess',
                                    name: message.skeleton,
                                    resolvedSkeleton: skeleton.resolveSkeleton(message.name, message.source, message.encodedVars, message.analyzeResult)
                                });
                            }
                            catch (error) {
                                vscode.window.showErrorMessage(`La génération a échouée`);
                                panel.webview.postMessage({
                                    command: 'resolveSkeletonOnError',
                                    error: error.toString()
                                });
                            }
                        }
                        break;
                    case 'editGeneratedCodeInNewEditor':
                        {
                            try {
                                vscode.workspace.workspaceFolders !== undefined ? vscode.workspace.workspaceFolders[0].uri.path : '';
                                vscode.workspace.openTextDocument(vscode.Uri.parse('untitled:temp.cbl'))
                                    .then((td) => {
                                    vscode.window.showTextDocument(td, vscode.ViewColumn.Beside, true)
                                        .then((te) => te.edit(ted => {
                                        const doc = te.document;
                                        const startPos = new vscode.Position(0, 0);
                                        const lastLine = doc.lineAt(doc.lineCount - 1);
                                        const endPos = lastLine.range.end;
                                        const entireRage = new vscode.Range(startPos, endPos);
                                        ted.replace(new vscode.Selection(startPos, endPos), message.generatedCode.join('\n'));
                                    }));
                                });
                            }
                            catch (error) {
                                vscode.window.showErrorMessage(error);
                            }
                        }
                        break;
                }
            }, undefined, context.subscriptions);
            panel.onDidDispose(() => {
                vscode.window.setStatusBarMessage(`${info.displayName} a été fermé`, 5000);
            }, null, context.subscriptions);
        });
        context.subscriptions.push(disposableStart);
        let disposableInject = vscode.commands.registerCommand('skodgee.inject', () => {
            var _a;
            let txt = (_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document.getText();
            if (txt !== undefined) {
                let res = skeleton.extractDictionnary(txt);
                if (res !== undefined) {
                    let s = res.join('').trim();
                    let o = s.slice(0, 4) === 'dico' ? JSON.parse(complement.revertBase64(s.slice(4))) : JSON.parse(s);
                    if (Array.isArray(o.data)) {
                        o.data = JSON.stringify(o.data);
                    }
                    if (o.data[0] === "'") {
                        o.data = JSON.stringify(o.data.split(',').map((e) => {
                            let s = e.split(':');
                            return { path: s[0].slice(1, -1), value: s[1].slice(1, -1) };
                        }));
                        vscode.commands.executeCommand('skodgee.generation', o);
                    }
                    else {
                        if (o.data[0] !== '[') {
                            o.data = complement.revertBase64(o.data);
                            vscode.commands.executeCommand('skodgee.generation', o);
                        }
                    }
                }
            }
        });
        context.subscriptions.push(disposableInject);
        let disposableDevelop = vscode.commands.registerCommand('skodgee.develop', () => {
            var _a;
            let txt = (_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document.getText();
            if (txt !== undefined) {
                vscode.commands.executeCommand('skodgee.generation', undefined, txt);
            }
        });
        context.subscriptions.push(disposableDevelop);
    });
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
function log(text) {
    logBuffer += `\n${text}`;
}
function dumpLog() {
    let d = logBuffer;
    logBuffer = '';
    return d;
}
//# sourceMappingURL=extension.js.map