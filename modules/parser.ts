import { Lexer, Token } from './lexer.ts';
import { NodeType } from '.././data/nodes.ts';
import { TokenType } from '.././data/tokens/types.ts';
import { TokenCode } from '.././data/tokens/codes.ts';
import { ErrorMessage } from '.././data/errors.ts';

// Abstract Syntax Tree (Nodes)
type StatementNode = NullNode | CompoundNode | AssignNode | PrintNode | IfNode | WhileNode | ForNode | RepeatNode | SwitchNode | ResizeNode;
type ExpressionNode = NullNode | BinaryNode | UnaryNode | ValueNode | SymbolNode;
type NodeValue = typeof NodeType[keyof typeof NodeType];

class ASTNode {
    category: NodeValue;
    
    constructor(category: NodeValue) {
        this.category = category;
    }
}

class NullNode extends ASTNode {
    constructor() {
        super(NodeType.NULL);
    }
}

class ProgramNode extends ASTNode {
    declare: DeclareNode;
    compound: CompoundNode;

    constructor(block: DeclareNode, compound: CompoundNode) {
        super(NodeType.PROGRAM);

        this.declare = block;
        this.compound = compound;
    }
}

class DeclareNode extends ASTNode {
    constants: Array<ConstantNode>;
    variables: Array<VariableNode>;

    constructor(constants: Array<ConstantNode>, variables: Array<VariableNode>) {
        super(NodeType.DECLARE);
        
        this.constants = constants;
        this.variables = variables;
    }
}

class ConstantNode extends ASTNode {
    symbol: string;
    value: ExpressionNode;

    constructor(symbol: string, value: ExpressionNode) {
        super(NodeType.CONSTANT);
        
        this.symbol = symbol;
        this.value = value;
    }
}

class VariableNode extends ASTNode {
    symbol: string;
    type: TokenValue;
    array: ExpressionNode;

    constructor(symbol: string, type: TokenValue, array: ExpressionNode) {
        super(NodeType.VARIABLE);
        
        this.symbol = symbol;
        this.type = type;
        this.array = array;
    }
}

class CompoundNode extends ASTNode {
    children: Array<StatementNode>;

    constructor() {
        super(NodeType.COMPOUND);

        this.children = [];
    }
}

class BinaryNode extends ASTNode {
    left: ExpressionNode;
    right: ExpressionNode;
    operator: TokenValue;
    
    constructor(left: ExpressionNode, operator: TokenValue, right: ExpressionNode) {
        super(NodeType.BINARY);

        this.left = left;
        this.operator = operator;
        this.right = right;
    }
}

class UnaryNode extends ASTNode {
    child: ExpressionNode;
    operator: TokenValue;
    
    constructor(child: ExpressionNode, operator: TokenValue) {
        super(NodeType.UNARY);

        this.child = child;
        this.operator = operator;
    }
}

class ValueNode extends ASTNode {
    value: any;
    type: TokenValue;
    
    constructor(value: any, type: TokenValue) {
        super(NodeType.VALUE);

        this.value = value;
        this.type = type;
    }
}

class SymbolNode extends ASTNode {
    symbol: string;
    index: ExpressionNode;
    
    constructor(symbol: string, index: ExpressionNode) {
        super(NodeType.SYMBOL);

        this.symbol = symbol;
        this.index = index;
    }
}

class AssignNode extends ASTNode {
    symbol: string;
    index: ExpressionNode;
    value: ExpressionNode;

    constructor(symbol: string, index: ExpressionNode, value: ExpressionNode) {
        super(NodeType.ASSIGN);
        
        this.symbol = symbol;
        this.index = index;
        this.value = value;
    }
}

class PrintNode extends ASTNode {
    values: Array<ExpressionNode>;
    
    constructor(values: Array<ExpressionNode>) {
        super(NodeType.PRINT);

        this.values = values;
    }
}

class IfNode extends ASTNode {
    condition: ExpressionNode;
    ifCompound: CompoundNode;
    elseCompound: CompoundNode;
    
    constructor(condition: ExpressionNode, ifCompound: CompoundNode, elseCompound: CompoundNode) {
        super(NodeType.IF);
    
        this.condition = condition;
        this.ifCompound = ifCompound;
        this.elseCompound = elseCompound;
    }
}

class WhileNode extends ASTNode {
    condition: ExpressionNode;
    compound: CompoundNode;

    constructor(condition: ExpressionNode, compound: CompoundNode) {
        super(NodeType.WHILE);
        
        this.condition = condition;
        this.compound = compound;
    }
}

class ForNode extends ASTNode {
    symbol: string;
    from: ExpressionNode;
    to: ExpressionNode;
    step: ExpressionNode | NullNode;
    compound: CompoundNode;

    constructor(symbol: string, from: ExpressionNode, to: ExpressionNode, step: ExpressionNode | NullNode, compound: CompoundNode) {
        super(NodeType.FOR);

        this.symbol = symbol;
        this.from = from;
        this.to = to;
        this.step = step;
        this.compound = compound;
    }
}

class RepeatNode extends ASTNode {
    condition: ExpressionNode;
    compound: CompoundNode;

    constructor(condition: ExpressionNode, compound: CompoundNode) {
        super(NodeType.REPEAT);

        this.condition = condition;
        this.compound = compound;
    }
}

class SwitchNode extends ASTNode {
    expression: ExpressionNode;
    cases: Array<CaseNode>;
    compound: CompoundNode | NullNode;

    constructor(expression: ExpressionNode, cases: Array<CaseNode>, compound: CompoundNode | NullNode) {
        super(NodeType.SWITCH);
        
        this.expression = expression;
        this.cases = cases;
        this.compound = compound;
    }
}

class CaseNode extends ASTNode {
    value: ExpressionNode;
    compound: CompoundNode;

    constructor(value: ExpressionNode, compound: CompoundNode) {
        super(NodeType.CASE);

        this.value = value;
        this.compound = compound;
    }
}

class ResizeNode extends ASTNode {
    symbol: string;
    value: ExpressionNode;

    constructor(symbol: string, value: ExpressionNode) {
        super(NodeType.RESIZE);

        this.symbol = symbol;
        this.value = value;
    }
}

// Parser
type TokenValue = typeof TokenType[keyof typeof TokenType];

class Parser {
    lexer: Lexer;
    token: Token;

    constructor(lexer: Lexer) {
        this.lexer = lexer
        this.token = new Token('', TokenType.NULL);

        this.nextToken();
    }

    abort(message: string) {
        throw new Error(`[PARSING ERROR] ${message}.`);
    }

    nextToken() {
        this.token = this.lexer.nextToken();
    }

    checkToken(type: TokenValue) {
        return this.token.type == type;
    }

    checkTokenList(types: Array<TokenValue>) {
        for (const type of types) {
            if (this.checkToken(type)) {
                return true;
            }
        }

        return false;
    }

    match(type: TokenValue) {
        if (!this.checkToken(type)) {
            let message = ErrorMessage[100];

            message = message.replace('{EXPECTED}', TokenCode[type]);
            message = message.replace('{GOT}', TokenCode[this.token.type]);

            this.abort(message);
        }

        this.nextToken();
    }

    matchList(types: Array<TokenValue>) {
        for (let i = 0; i < types.length; i++) {
            const type = types[i];

            if (this.checkToken(type)) {
                this.match(type);
                return type;
            }
        }
        
        const codeList = types.map((type) => TokenCode[type]);
        let message = ErrorMessage[100];

        message = message.replace('{EXPECTED}', codeList.join(', '));
        message = message.replace('{GOT}', TokenCode[this.token.type]);

        this.abort(message);
    }

    // Parsing

    parse() {
        const node = this.program();

        if (this.checkToken(TokenType.EOF)) {
            return node;
        } 
        else {
            return this.abort(ErrorMessage[101]);
        }
    }

    // Program

    program() {
        this.newline(false);
        this.match(TokenType.PROGRAM);
        this.match(TokenType.IDENT);
        this.newline();
        
        const block = this.declare();

        this.match(TokenType.BEGIN);
        this.newline();

        const compound = this.compound([TokenType.END]);
        
        this.match(TokenType.END);
        this.newline(false);

        return new ProgramNode(block, compound);
    }

    // Declarations

    declare() {
        const constants = this.constant();
        const variables = this.variable();

        return new DeclareNode(constants, variables);
    }

    constant() {
        const constants: Array<ConstantNode> = [];

        if (this.checkToken(TokenType.CONSTANTS)) {
            this.match(TokenType.CONSTANTS);
            this.newline();

            while (!this.checkToken(TokenType.VARIABLES) && !this.checkToken(TokenType.BEGIN)) {
                const symbol = this.token.value;
                this.match(TokenType.IDENT);

                this.match(TokenType.EQ);
                const value = this.expression();

                this.newline();
                constants.push(new ConstantNode(symbol, value));
            }
        }

        return constants;
    }

    variable() {
        const variables: Array<VariableNode> = [];

        if (this.checkToken(TokenType.VARIABLES)) {
            this.match(TokenType.VARIABLES);
            this.newline();

            while (!this.checkToken(TokenType.BEGIN)) {
                const symbols: Array<string> = [];
                symbols.push(this.token.value);
                this.match(TokenType.IDENT);

                while (this.checkToken(TokenType.COMMA)) {
                    this.match(TokenType.COMMA);

                    symbols.push(this.token.value);
                    this.match(TokenType.IDENT);
                }

                this.match(TokenType.COLON);
                const type = this.type();
                let array = new ValueNode(null, TokenType.NULL);
                
                if (this.checkToken(TokenType.BRALEFT)) {
                    this.match(TokenType.BRALEFT);
                    array = this.expression();
                    this.match(TokenType.BRARIGHT);
                }

                for (const ident of symbols) {
                    variables.push(new VariableNode(ident, type, array));
                }

                this.newline();
            }
        }

        return variables;
    }

    type() {
        const listTokens = [
            TokenType.INTEGER, 
            TokenType.FLOAT, 
            TokenType.CHARACTER, 
            TokenType.STRING, 
            TokenType.BOOLEAN
        ];

        const type = this.matchList(listTokens);
        
        switch(type) {
            case TokenType.INTEGER:
                return TokenType.INT_TYPE;
                
            case TokenType.FLOAT:
                return TokenType.FLOAT_TYPE;

            case TokenType.CHARACTER:
                return TokenType.CHAR_TYPE;

            case TokenType.STRING:
                return TokenType.STR_TYPE;

            case TokenType.BOOLEAN:
                return TokenType.BOOL_TYPE;
            
            default:
                return TokenType.NULL;
        }
    }

    // Statements

    compound(end: Array<TokenValue>) {
        const node = new CompoundNode();
        const listTokens = [TokenType.EOF].concat(end);

        while (!this.checkTokenList(listTokens)) {
            node.children.push(this.statement());
            this.newline();
        }

        return node;
    }

    statement() {
        const listTokens = [
            TokenType.LET, 
            TokenType.PRINT,
            TokenType.IF,
            TokenType.WHILE,
            TokenType.FOR,
            TokenType.REPEAT,
            TokenType.SWITCH,
            TokenType.RESIZE,
        ];

        const matchedType = this.matchList(listTokens);
        let node;

        switch(matchedType) {
            case TokenType.LET:
                node = this.assign();
                break;

            case TokenType.PRINT:
                node = this.print();
                break;

            case TokenType.IF:
                node = this.if();
                break;
            
            case TokenType.WHILE:
                node = this.while();
                break;
            
            case TokenType.FOR:
                node = this.for();
                break;

            case TokenType.REPEAT:
                node = this.repeat();
                break;

            case TokenType.SWITCH:
                node = this.switch();
                break;

            case TokenType.RESIZE:
                node = this.resize();
                break;
            
            default:
                node = new NullNode();
        }

        return node;
    }

    assign() {
        const symbol = this.token.value;

        this.match(TokenType.IDENT);
        let index = new ValueNode(null, TokenType.NULL);

        if (this.checkToken(TokenType.BRALEFT)) {
            this.match(TokenType.BRALEFT);
            index = this.expression();
            this.match(TokenType.BRARIGHT);
        }

        this.match(TokenType.EQ);
        const value = this.expression();

        return new AssignNode(symbol, index, value);
    }

    print() {
        const values = [this.expression()];
        while (this.checkToken(TokenType.COMMA)) {
            this.match(TokenType.COMMA)
            values.push(this.expression());
        }

        return new PrintNode(values);
    }

    if() {
        const condition = this.expression();
        this.match(TokenType.THEN);
        this.newline();

        const ifCompound = this.compound([TokenType.ELSE, TokenType.ENDIF]);

        if (this.checkToken(TokenType.ELSE)) {
            this.match(TokenType.ELSE);
            this.newline();
        }

        const elseCompound = this.compound([TokenType.ENDIF]);
        this.match(TokenType.ENDIF);

        return new IfNode(condition, ifCompound, elseCompound);
    }

    while() {
        const condition = this.expression();
        this.match(TokenType.DO);
        this.newline();

        const compound = this.compound([TokenType.ENDWHILE]);
        this.match(TokenType.ENDWHILE);

        return new WhileNode(condition, compound);
    }

    for() {
        const symbol = this.token.value;
        this.match(TokenType.IDENT);

        this.match(TokenType.FROM);
        const from = this.expression();

        this.match(TokenType.TO);
        const to = this.expression();

        let step = new ValueNode(1, TokenType.INT_TYPE);
        if (this.checkToken(TokenType.STEP)) {
            this.match(TokenType.STEP);
            step = this.expression();
        }
        this.newline();

        const compound = this.compound([TokenType.ENDFOR]);
        this.match(TokenType.ENDFOR);

        return new ForNode(symbol, from, to, step, compound);
    }

    repeat() {
        this.match(TokenType.UNTIL);
        const condition = this.expression();
        this.newline();

        const compound = this.compound([TokenType.ENDREPEAT]);
        this.match(TokenType.ENDREPEAT);

        return new RepeatNode(condition, compound);
    }

    switch() {
        const expression = this.expression();
        this.newline();

        const caseList = [];
        const compoundEnd = [TokenType.CASE, TokenType.DEFAULT, TokenType.ENDSWITCH];

        while (this.checkToken(TokenType.CASE)) {
            this.match(TokenType.CASE);
            const value = this.expression();
            this.match(TokenType.COLON);
            this.newline();

            const compound = this.compound(compoundEnd);
            caseList.push(new CaseNode(value, compound));
        }

        let compound = new NullNode();

        if (this.checkToken(TokenType.DEFAULT)) {
            this.match(TokenType.DEFAULT);
            this.match(TokenType.COLON);
            this.newline();

            compound = this.compound([TokenType.ENDSWITCH]);
        }

        this.match(TokenType.ENDSWITCH);
        return new SwitchNode(expression, caseList, compound);
    }

    resize() {
        const symbol = this.token.value;
        this.match(TokenType.IDENT);
        this.match(TokenType.TO);
        const value = this.expression();

        return new ResizeNode(symbol, value);
    }

    // Expression

    expression(): any {
        let node = this.comparison();
        
        while (this.checkToken(TokenType.OR) || this.checkToken(TokenType.AND)) {
            const token = this.token;
            this.match(token.type);
            
            node = new BinaryNode(node, token.type, this.comparison());
        }
        
        return node;
    }
    
    comparison() {
        const listTokens = [
            TokenType.EQEQ,
            TokenType.NOTEQ,
            TokenType.GT,
            TokenType.GTEQ,
            TokenType.LT,
            TokenType.LTEQ
        ]

        let node = this.addition();
        for (const tokenType of listTokens) {
            if (this.checkToken(tokenType)) {
                this.match(tokenType);
    
                node = new BinaryNode(node, tokenType, this.addition());
            }
        }

        return node;
    }

    addition() {
        const listTokens = [TokenType.PLUS, TokenType.MINUS, TokenType.AMPERSAND];
        let node = this.multiply();

        while (this.checkTokenList(listTokens)) {
            const token = this.token;
            this.matchList(listTokens);
            
            node = new BinaryNode(node, token.type, this.multiply());
        }

        return node;
    }

    multiply() {
        const listTokens = [TokenType.ASTERISK, TokenType.SLASH, TokenType.PERCENT];
        let node = this.exponent();

        while (this.checkTokenList(listTokens)) {
            const token = this.token;
            this.matchList(listTokens);

            node = new BinaryNode(node, token.type, this.exponent());
        }

        return node;
    }

    exponent() {   
        const exponents = [this.primary()];

        while (this.checkToken(TokenType.CARET)) {
            this.match(TokenType.CARET);
            exponents.push(this.primary());
        }

        if (exponents.length <= 1) {
            return exponents[0];
        } 
        else {
            let node = exponents[exponents.length - 1];

            for (let i = exponents.length - 2; i >= 0; i--) {
                node = new BinaryNode(exponents[i], TokenType.CARET, node);
            }

            return node;
        }
    }

    primary(): ExpressionNode {
        const listTokens = [
            TokenType.INT_TYPE,
            TokenType.FLOAT_TYPE,
            TokenType.CHAR_TYPE,
            TokenType.STR_TYPE,
            TokenType.TRUE,
            TokenType.FALSE,
            TokenType.IDENT,
            TokenType.NOT,
            TokenType.PLUS,
            TokenType.MINUS,
            TokenType.PARLEFT
        ]

        const token = this.token;
        const matchedType = this.matchList(listTokens);

        switch(matchedType) {
            case TokenType.INT_TYPE:
                return new ValueNode(Number(token.value), matchedType);

            case TokenType.FLOAT_TYPE:
                return new ValueNode(Number(token.value), matchedType);

            case TokenType.CHAR_TYPE:
                return new ValueNode(token.value.slice(1, -1), matchedType);

            case TokenType.STR_TYPE:
                return new ValueNode(token.value.slice(1, -1), matchedType);
            
            case TokenType.TRUE:
                return new ValueNode(true, TokenType.BOOL_TYPE);

            case TokenType.FALSE:
                return new ValueNode(false, TokenType.BOOL_TYPE);

            case TokenType.IDENT:
                return this.symbol(token.value);

            case TokenType.NOT:
                return new UnaryNode(this.comparison(), TokenType.NOT);
                    
            case TokenType.PLUS:
                return new UnaryNode(this.primary(), TokenType.PLUS);

            case TokenType.MINUS:
                return new UnaryNode(this.primary(), TokenType.MINUS);

            case TokenType.PARLEFT:
                const node = this.expression();
                this.match(TokenType.PARRIGHT);
                return node;

            default:
                return new NullNode();
        }
    }

    symbol(value: string) {
        let index = new ValueNode(null, TokenType.NULL);

        if (this.checkToken(TokenType.BRALEFT)) {
            this.match(TokenType.BRALEFT);
            index = this.expression();
            this.match(TokenType.BRARIGHT);
        }

        return new SymbolNode(value, index);
    }

    // Miscellaneous
    
    newline(force: boolean=true) {
        if (force) this.match(TokenType.NEWLINE);
        
        while (this.checkToken(TokenType.NEWLINE)) {
            this.nextToken();
        }
    }
}

export { Parser };