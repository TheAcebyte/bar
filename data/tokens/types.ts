type TypeList = {
    [key: string]: number;
}

const TokenType: TypeList = {
    // Undefined
    NULL: -1,

    // - General [0-100]

    EOF: 0,
    NEWLINE: 1,
    IDENT: 2,

    // Types
    INT_TYPE: 3,
    FLOAT_TYPE: 4,
    CHAR_TYPE: 5,
    STR_TYPE: 6,
    BOOL_TYPE: 7,
    ARR_TYPE: 8,
    
    // Misc
    COMMA: 9,
    COLON: 10,
    PARLEFT: 11,
    PARRIGHT: 12,
    BRALEFT: 13,
    BRARIGHT: 14,

    // - Keywords [100-200]

    PROGRAM: 100,
    BEGIN: 101,
    END: 102,

    // Type Declarations
    VARIABLES: 103,
    CONSTANTS: 104,

    INTEGER: 105,
    FLOAT: 106,
    CHARACTER: 107,
    STRING: 108,
    BOOLEAN: 109,

    TRUE: 110,
    FALSE: 111,

    // Statements
    LET: 112,
    PRINT: 113,

    IF: 114,
    THEN: 115,
    ELSE: 116,
    ENDIF: 117,

    WHILE: 118,
    DO: 119,
    ENDWHILE: 120,

    FOR: 121,
    FROM: 122,
    TO: 123,
    STEP: 124,
    ENDFOR: 125,

    REPEAT: 126,
    UNTIL: 127,
    ENDREPEAT: 128,

    SWITCH: 129,
    CASE: 130,
    DEFAULT: 131,
    ENDSWITCH: 132,

    RESIZE: 133,
    
    // - Operators [200-300]

    AND: 200,
    OR: 201,
    NOT: 202,

    PLUS: 203,
    MINUS: 204,
    ASTERISK: 205,
    SLASH: 206,
    CARET: 207,
    PERCENT: 208,

    AMPERSAND: 209,
    
    EQ: 210,
    EQEQ: 211,
    NOTEQ: 212,
    GT: 213,
    GTEQ: 214,
    LT: 215,
    LTEQ: 216
}

export { TokenType };