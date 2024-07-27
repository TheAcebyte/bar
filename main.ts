import { Lexer } from './modules/lexer.ts'
import { Parser } from './modules/parser.ts'
import { Interpreter } from './modules/interpreter.ts'

import { readFileSync } from 'fs';

function main() {
    try {
        const src = readFileSync('./script.algo', 'utf8');

        const appLexer = new Lexer(src);
        const appParser = new Parser(appLexer);
        const appInterpreter = new Interpreter(appParser);

        appInterpreter.interpret();
    }
    catch (error: any) {
        console.error(error.message);
    }
}

let start = new Date().getTime();
main();
let end = new Date().getTime();

console.log(`Compilation Time: ${end - start}ms`)