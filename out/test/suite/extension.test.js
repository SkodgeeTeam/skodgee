"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
const vscode = require("vscode");
const skeleton = require("../../skeleton");
suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');
    test('analyzeSkeleton variable', () => {
        let source = `# skodgee\n{\n"name": "Sample",\n"description": "Minimal skeleton",\n"author": "herve.heritier",` +
            `"version": "0.0.0",\n"prefix": "#"\n}\n# end\n# declare\n{ "var": "variable" }\n# end\nSKoDGee sample\nvariable value : {{variable}}`;
        let dico = JSON.stringify(skeleton.analyzeSkeleton(source));
        assert.strictEqual('[{"var":"variable"}]', dico);
    });
    test('resolveSkeleton variable', () => {
        let source = `# skodgee\n{\n"name": "Sample",\n"description": "Minimal skeleton",\n"author": "herve.heritier",` +
            `"version": "0.0.0",\n"prefix": "#"\n}\n# end\n# declare\n{ "var": "variable" }\n# end\nSKoDGee sample\nvariable value : {{variable}}`;
        let dico = skeleton.analyzeSkeleton(source);
        dico[0].value = 'A';
        let result = skeleton.resolveSkeleton('???', source, dico, dico);
        let attempted = ['SKoDGee sample', 'variable value : A'];
        assert(result.length == attempted.length && result.every((e, i) => e === attempted[i]));
    });
    /*test('',async ()=>{
        let res = await skeleton.extendDictionnaryWithIncludes('D:/Users/Herve/Documents/Dev/skodgee/resources/skeleton','group.skl')
        console.log(JSON.stringify(res))
        assert(true)
    })*/
});
//# sourceMappingURL=extension.test.js.map