type NodeList = {
    [key: string]: number;
}

const NodeType: NodeList = {
    // Undefined
    NULL: -1,

    // General [0-100]
    PROGRAM: 0,
    DECLARE: 1,
    CONSTANT: 2,
    VARIABLE: 3,
    BINARY: 4,
    UNARY: 5,
    VALUE: 6,
    SYMBOL: 7,

    // Statements [100-200]
    COMPOUND: 100,
    ASSIGN: 101,
    PRINT: 102,
    IF: 103,
    WHILE: 104,
    FOR: 105,
    CONDITION: 106,
    SWITCH: 107,
    CASE: 108,
    RESIZE: 109,
}

export { NodeType };