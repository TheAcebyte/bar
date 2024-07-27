import { Parser } from './parser.ts'
import { TokenType } from '.././data/tokens/types.ts';
import { TokenCode } from '.././data/tokens/codes.ts';
import { NodeType } from '.././data/nodes.ts';
import { ErrorMessage } from '.././data/errors.ts';

type Value = number | string | boolean | null;
type ArrayValue = Array<Value>;

interface Symbol {
    value: Value | ArrayValue,
    type: number,
    constant: boolean,
    array: boolean
}

class SymbolTable {
    parent: Interpreter;
    table: Map<string, Symbol>;

    constructor(parent: Interpreter) {
        this.parent = parent;
        this.table = new Map();
    }
    
    print() {
        this.table.forEach((object, symbol) => {
            console.log(`- ${symbol}: ${object.type} -> ${object.value}`);
        })
    }

    has(symbol: string) {
        return this.table.has(symbol);
    }

    get(symbol: string) {
        if (!this.table.has(symbol)) {
            const message = ErrorMessage[200].replace('{VARIABLE}', symbol)
            this.parent.abort(message);
        }

        return this.table.get(symbol);
    }

    set(symbol: string, value: Value, type: number, constant: boolean) {
        if (this.table.has(symbol) && this.get(symbol)?.constant) {
            const message = ErrorMessage[203].replace('{VARIABLE}', symbol)
            this.parent.abort(message);
        }

        this.table.set(symbol, {value: value, type: type, constant: constant, array: false});
    }

    initArray(symbol: string, size: number, type: number) {
        const array = [];
        for (let i = 0; i < size; i++) {
            array.push(null);
        }

        this.table.set(symbol, {value: array, type: type, constant: false, array: true});
    }

    getArray(symbol: string, index: number) {
        if (!this.table.has(symbol)) {
            const message = ErrorMessage[200].replace('{VARIABLE}', symbol)
            this.parent.abort(message);
        }

        const symbolArray = this.table.get(symbol);
        if (!symbolArray?.array) {
            const message = ErrorMessage[209].replace('{VARIABLE}', symbol);
            this.parent.abort(message);
        }

        const array = <ArrayValue> symbolArray?.value;
        if (index <= 0 || index > array.length) {
            const message = ErrorMessage[208].replace('{INDEX}', `${index}`);
            this.parent.abort(message);
        }
    
        return [array[index - 1], symbolArray?.type];
    }

    setArray(symbol: string, value: Value, index: number) {
        const symbolArray = this.table.get(symbol);
        const array = <ArrayValue> symbolArray?.value;

        if (!symbolArray?.array) {
            const message = ErrorMessage[209].replace('{VARIABLE}', symbol);
            this.parent.abort(message);
        }

        if (index <= 0 || index > array.length) {
            const message = ErrorMessage[208].replace('{INDEX}', `${index}`);
            this.parent.abort(message);
        }

        array[index - 1] = value;
    }
}

class Interpreter {
    parser: Parser;
    symbols: SymbolTable;

    constructor(parser: Parser) {
        this.parser = parser;
        this.symbols = new SymbolTable(this);
    }

    abort(message: string) {
        throw new Error(`[INTERPRETING ERROR] ${message}.`);
    }

    interpret() {
        const tree = this.parser.parse();
        this.visit(tree);
    }

    typecast(value: number | string, type: number) {
        if (type == TokenType.INT_TYPE || type == TokenType.FLOAT_TYPE) {
            return [value != 0, TokenType.BOOL_TYPE];
        }
        else if (type == TokenType.CHAR_TYPE || type == TokenType.STR_TYPE) {
            return [value != '', TokenType.BOOL_TYPE];
        }
        else {
            return [value, type];
        }
    }

    visit(node: any): any {
        switch(node.category) {
            case NodeType.PROGRAM: {
                this.visit(node.declare);
                this.visit(node.compound);
                break;
            }

            case NodeType.DECLARE: {
                for (const constant of node.constants) {
                    this.visit(constant);
                }

                for (const variable of node.variables) {
                    this.visit(variable);
                }
                break;
            }

            case NodeType.CONSTANT: {
                const symbol = node.symbol;
                if (!this.symbols.has(symbol)) {
                    const [value, type] = this.visit(node.value);
                    this.symbols.set(symbol, value, type, true);
                }
                else {
                    const message = ErrorMessage[201].replace('{VARIABLE}', symbol);
                    this.abort(message);
                }
                break;
            }

            case NodeType.VARIABLE: {
                const symbol = node.symbol;
                const type = node.type;
                const [arrayValue, arrayType] = this.visit(node.array);
                
                if (!this.symbols.has(symbol)) {
                    if (arrayValue == null) {
                        this.symbols.set(symbol, null, type, false);
                    }
                    else {
                        if (arrayType == TokenType.INT_TYPE && arrayValue > 0) {
                            this.symbols.initArray(symbol, arrayValue, type);
                        } 
                        else {
                            this.abort(ErrorMessage[207]);
                        }
                    }
                }
                else {
                    const message = ErrorMessage[201].replace('{VARIABLE}', symbol);
                    this.abort(message);
                }
                break;
            }
                
            case NodeType.COMPOUND: {
                for (const child of node.children) {
                    this.visit(child);
                }
                break;
            }
                    
            case NodeType.BINARY: {
                let [leftValue, leftType] = this.visit(node.left);
                let [rightValue, rightType] = this.visit(node.right);

                let value, type;
                switch(node.operator) {
                    case TokenType.AND: {
                        [leftValue, leftType] = this.typecast(leftValue, leftType);
                        [rightValue, rightType] = this.typecast(rightValue, rightType);
    
                        value = leftValue && rightValue;
                        type = TokenType.BOOL_TYPE;
                        break;
                    }
    
                    case TokenType.OR: {
                        [leftValue, leftType] = this.typecast(leftValue, leftType);
                        [rightValue, rightType] = this.typecast(rightValue, rightType);
    
                        value = leftValue || rightValue;
                        type = TokenType.BOOL_TYPE;
                        break;
                    }

                    case TokenType.PLUS: {
                        if (leftType == TokenType.INT_TYPE && rightType == TokenType.INT_TYPE) {
                            type = TokenType.INT_TYPE;
                        } 
                        else if (leftType == TokenType.FLOAT_TYPE || rightType == TokenType.FLOAT_TYPE) {
                            type = TokenType.FLOAT_TYPE;
                        }
                        else {
                            this.abort(ErrorMessage[202]);
                        }

                        value = leftValue + rightValue;
                        break;
                    }
                        
                    case TokenType.MINUS: {
                        if (leftType == TokenType.INT_TYPE && rightType == TokenType.INT_TYPE) {
                            type = TokenType.INT_TYPE;
                        } 
                        else if (leftType == TokenType.FLOAT_TYPE || rightType == TokenType.FLOAT_TYPE) {
                            type = TokenType.FLOAT_TYPE;
                        }
                        else {
                            this.abort(ErrorMessage[202]);
                        }

                        value = leftValue - rightValue;
                        break;
                    }
                        
                    case TokenType.ASTERISK: {
                        if (leftType == TokenType.INT_TYPE && rightType == TokenType.INT_TYPE) {
                            type = TokenType.INT_TYPE;
                        } 
                        else if (leftType == TokenType.FLOAT_TYPE || rightType == TokenType.FLOAT_TYPE) {
                            type = TokenType.FLOAT_TYPE;
                        }
                        else {
                            this.abort(ErrorMessage[202]);
                        }

                        value = leftValue * rightValue;
                        break;
                    }
                        
                    case TokenType.SLASH: {
                        if (leftType == TokenType.INT_TYPE && rightType == TokenType.INT_TYPE) {
                            value = Math.trunc(leftValue / rightValue);
                            type = TokenType.INT_TYPE;
                        } 
                        else if (leftType == TokenType.FLOAT_TYPE || rightType == TokenType.FLOAT_TYPE) {
                            value = leftValue / rightValue;
                            type = TokenType.FLOAT_TYPE;
                        }
                        else {
                            this.abort(ErrorMessage[202]);
                        }

                        break;
                    }

                    case TokenType.CARET: {
                        if (leftType == TokenType.INT_TYPE && rightType == TokenType.INT_TYPE) {
                            type = TokenType.INT_TYPE;
                        } 
                        else if (leftType == TokenType.FLOAT_TYPE || rightType == TokenType.FLOAT_TYPE) {
                            type = TokenType.FLOAT_TYPE;
                        }
                        else {
                            this.abort(ErrorMessage[202]);
                        }

                        value = Math.pow(leftValue, rightValue);
                        break;
                    }

                    case TokenType.PERCENT: {
                        if (leftType != TokenType.INT_TYPE || rightType != TokenType.INT_TYPE) {
                            this.abort(ErrorMessage[202]);
                        }

                        value = leftValue % rightValue;
                        type = TokenType.INT_TYPE;
                        break;
                    }

                    case TokenType.AMPERSAND: {
                        if ((leftType == TokenType.CHAR_TYPE || leftType == TokenType.STR_TYPE) && (rightType == TokenType.CHAR_TYPE || rightType == TokenType.STR_TYPE)) {
                            value = leftValue + rightValue;
                        } 
                        else {
                            this.abort(ErrorMessage[202]);
                        }

                        type = TokenType.STR_TYPE
                        break;
                    }
                    
                    case TokenType.EQEQ: {
                        if ((leftType == TokenType.INT_TYPE || leftType == TokenType.FLOAT_TYPE) && (rightType == TokenType.INT_TYPE || rightType == TokenType.FLOAT_TYPE)) {
                            value = leftValue == rightValue;
                        }
                        else if ((leftType == TokenType.CHAR_TYPE || leftType == TokenType.STR_TYPE) && (rightType == TokenType.CHAR_TYPE || rightType == TokenType.STR_TYPE)) {
                            value = leftValue == rightValue;
                        }
                        else if (leftType == TokenType.BOOL_TYPE && rightType == TokenType.BOOL_TYPE) {
                            value = leftValue == rightValue;
                        }
                        else {
                            value = false;
                        }

                        type = TokenType.BOOL_TYPE;
                        break;
                    }
                    
                    case TokenType.NOTEQ: {
                        if ((leftType == TokenType.INT_TYPE || leftType == TokenType.FLOAT_TYPE) && (rightType == TokenType.INT_TYPE || rightType == TokenType.FLOAT_TYPE)) {
                            value = leftValue != rightValue;
                        }
                        else if ((leftType == TokenType.CHAR_TYPE || leftType == TokenType.STR_TYPE) && (rightType == TokenType.CHAR_TYPE || rightType == TokenType.STR_TYPE)) {
                            value = leftValue != rightValue;
                        }
                        else if (leftType == TokenType.BOOL_TYPE && rightType == TokenType.BOOL_TYPE) {
                            value = leftValue != rightValue;
                        }
                        else {
                            value = true;
                        }

                        type = TokenType.BOOL_TYPE;
                        break;
                    }
                    
                    case TokenType.GT: {
                        if ((leftType == TokenType.INT_TYPE || leftType == TokenType.FLOAT_TYPE) && (rightType == TokenType.INT_TYPE || rightType == TokenType.FLOAT_TYPE)) {
                            value = leftValue > rightValue;
                        }
                        else if ((leftType == TokenType.CHAR_TYPE || leftType == TokenType.STR_TYPE) && (rightType == TokenType.CHAR_TYPE || rightType == TokenType.STR_TYPE)) {
                            const comparison = leftValue.localeCompare(rightValue);
                            value = comparison == 1;
                        }
                        else {
                            this.abort(ErrorMessage[202])
                        }

                        type = TokenType.BOOL_TYPE;
                        break;
                    }

                    case TokenType.GTEQ: {
                        if ((leftType == TokenType.INT_TYPE || leftType == TokenType.FLOAT_TYPE) && (rightType == TokenType.INT_TYPE || rightType == TokenType.FLOAT_TYPE)) {
                            value = leftValue >= rightValue;
                        }
                        else if ((leftType == TokenType.CHAR_TYPE || leftType == TokenType.STR_TYPE) && (rightType == TokenType.CHAR_TYPE || rightType == TokenType.STR_TYPE)) {
                            const comparison = leftValue.localeCompare(rightValue);
                            value = comparison == 1 || comparison == 0;
                        }
                        else {
                            this.abort(ErrorMessage[202])
                        }

                        type = TokenType.BOOL_TYPE;
                        break;
                    }
                    
                    case TokenType.LT: {
                        if ((leftType == TokenType.INT_TYPE || leftType == TokenType.FLOAT_TYPE) && (rightType == TokenType.INT_TYPE || rightType == TokenType.FLOAT_TYPE)) {
                            value = leftValue < rightValue;
                        }
                        else if ((leftType == TokenType.CHAR_TYPE || leftType == TokenType.STR_TYPE) && (rightType == TokenType.CHAR_TYPE || rightType == TokenType.STR_TYPE)) {
                            const comparison = leftValue.localeCompare(rightValue);
                            value = comparison == -1;
                        }
                        else {
                            this.abort(ErrorMessage[202])
                        }

                        type = TokenType.BOOL_TYPE;
                        break;
                    }

                    case TokenType.LTEQ: {
                        if ((leftType == TokenType.INT_TYPE || leftType == TokenType.FLOAT_TYPE) && (rightType == TokenType.INT_TYPE || rightType == TokenType.FLOAT_TYPE)) {
                            value = leftValue <= rightValue;
                        }
                        else if ((leftType == TokenType.CHAR_TYPE || leftType == TokenType.STR_TYPE) && (rightType == TokenType.CHAR_TYPE || rightType == TokenType.STR_TYPE)) {
                            const comparison = leftValue.localeCompare(rightValue);
                            value = comparison == -1 || comparison == 0;
                        }
                        else {
                            this.abort(ErrorMessage[202])
                        }

                        type = TokenType.BOOL_TYPE;
                        break;
                    }
                }

                return [value, type];
            }
            
            case NodeType.UNARY: {
                let [value, type] = this.visit(node.child);
                switch(node.operator) {
                    case TokenType.NOT:
                        [value, type] = this.typecast(value, type);
                        return [!value, type];

                    case TokenType.PLUS:
                        return [value, type];

                    case TokenType.MINUS:
                        return [-1 * value, type];
                }
                break;
            }
            
            case NodeType.VALUE: {
                return [node.value, node.type];
            }
            
            case NodeType.SYMBOL: {
                const [indexValue, indexType] = this.visit(node.index);
                
                if (indexValue == null) {
                    const symbol = this.symbols.get(node.symbol);

                    if (symbol?.value == null) {
                        const message = ErrorMessage[204].replace('{VARIABLE}', node.symbol);
                        this.abort(message);
                    }

                    if (symbol?.array) {
                        const array = <ArrayValue> symbol.value;
                        const values = [];

                        for (const value of array) {
                            if (value != null) values.push(value);
                        }

                        return [`[${values.join(', ')}]`, TokenType.ARR_TYPE];
                    }
                    else {
                        return [symbol?.value, symbol?.type];
                    }
                }
                else {
                    if (indexType != TokenType.INT_TYPE) {
                        this.abort(ErrorMessage[211]);
                    }

                    const [value, type] = this.symbols.getArray(node.symbol, indexValue);
                    if (value == null) {
                        const message = ErrorMessage[204].replace('{VARIABLE}', `${node.symbol}[${indexValue}]`);
                        this.abort(message);
                    }

                    return [value, type];
                }
            }
            
            case NodeType.ASSIGN: {
                const symbol = this.symbols.get(node.symbol);
                let [value, type] = this.visit(node.value);

                if (symbol?.type == TokenType.BOOL_TYPE) {
                    [value, type] = this.typecast(value, type);
                }
                else if (symbol?.type == TokenType.FLOAT_TYPE && type == TokenType.INT_TYPE) {
                    type = TokenType.FLOAT_TYPE;
                }
                else if (symbol?.type != type) {
                    let message = ErrorMessage[205];

                    message = message.replace('{VARIABLE}', node.symbol);
                    message = message.replace('{TYPE1}', TokenCode[type]);
                    message = message.replace('{TYPE2}', TokenCode[symbol?.type ?? 3]);

                    this.abort(message);
                }

                const [indexValue, indexType] = this.visit(node.index);
                if (indexValue == null) {
                    if (symbol?.array) {
                        const message = ErrorMessage[210].replace('{VARIABLE}', node.symbol);
                        this.abort(message);
                    }

                    this.symbols.set(node.symbol, value, type, false);
                }
                else {
                    if (indexType != TokenType.INT_TYPE) {
                        this.abort(ErrorMessage[211]);
                    }

                    this.symbols.setArray(node.symbol, value, indexValue);
                }
                break;
            }
                
            case NodeType.PRINT: {
                const output: Array<number | string | boolean> = [];

                for (const expression of node.values) {
                    const [value, type] = this.visit(expression);
                    output.push(value);
                }

                console.log(output.join(' '));
                break;
            }

            case NodeType.IF: {
                let [value, type] = this.visit(node.condition);
                [value, type] = this.typecast(value, type);

                if (value) {
                    this.visit(node.ifCompound);
                }
                else {
                    this.visit(node.elseCompound);
                }
                break;
            }

            case NodeType.WHILE: {
                let [value, type] = this.visit(node.condition);
                [value, type] = this.typecast(value, type);

                
                while (value) {
                    this.visit(node.compound);

                    [value, type] = this.visit(node.condition);
                    [value, type] = this.typecast(value, type);
                }
                break;
            }

            case NodeType.FOR: {
                const symbol = this.symbols.get(node.symbol);
                if (symbol?.array) {
                    const message = ErrorMessage[210].replace('{VARIABLE}', node.symbol);
                    this.abort(message);
                }
                
                if (symbol?.type != TokenType.INT_TYPE) {
                    const message = ErrorMessage[206].replace('{TYPE}', TokenCode[symbol?.type ?? -1]);
                    this.abort(message);
                }

                const [fromValue, fromType] = this.visit(node.from);
                const [toValue, toType] = this.visit(node.to);
                const [stepValue, stepType] = this.visit(node.step);

                if (fromType != TokenType.INT_TYPE) {
                    const message = ErrorMessage[206].replace('{TYPE}', TokenCode[fromType]);
                    this.abort(message);
                }

                if (toType != TokenType.INT_TYPE) {
                    const message = ErrorMessage[206].replace('{TYPE}', TokenCode[toType]);
                    this.abort(message);
                }

                if (stepType != TokenType.INT_TYPE) {
                    const message = ErrorMessage[206].replace('{TYPE}', TokenCode[stepType]);
                    this.abort(message);
                }

                for (let i = fromValue; i <= toValue; i += stepValue) {
                    this.symbols.set(node.symbol, i, TokenType.INT_TYPE, false);
                    this.visit(node.compound);
                }
                break;
            }

            case NodeType.REPEAT: {
                let value, type;

                do {
                    this.visit(node.compound);

                    [value, type] = this.visit(node.condition);
                    [value, type] = this.typecast(value, type);
                } while (!value)
                break;
            }

            case NodeType.SWITCH: {
                const [switchValue, switchType] = this.visit(node.expression);

                let checked = false;
                for (const nodeCase of node.cases) {
                    const [value, type, compound] = this.visit(nodeCase);

                    if (switchValue == value && switchType == type) {
                        this.visit(compound);
                        checked = true;
                        break;
                    }
                }

                if (!checked) {
                    this.visit(node.compound);
                }
                break;
            }

            case NodeType.CASE: {
                const [value, type] = this.visit(node.value);
                return [value, type, node.compound];
            }

            case NodeType.RESIZE: {
                const symbol = this.symbols.get(node.symbol);
                const [value, type] = this.visit(node.value);
                
                if (!symbol?.array) {
                    const message = ErrorMessage[209].replace('{VARIABLE}', node.symbol);
                    this.abort(message);
                }

                if (value <= 0 || type != TokenType.INT_TYPE) {
                    this.abort(ErrorMessage[207]);
                }
                
                let array = <ArrayValue> symbol?.value;
                const copyArray = [...array];

                this.symbols.initArray(node.symbol, value, symbol?.type ?? 3);
                array = <ArrayValue> this.symbols.get(node.symbol)?.value;

                for (let i = 0; i < value; i++) {
                    array[i] = copyArray[i];
                }
                break; 
            }
        }
    }
}

export { Interpreter };