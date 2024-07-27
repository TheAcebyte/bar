type CodeList = {
    [key: number]: string;
}

const TokenCode: CodeList = {
    // - General [0-100]

    0: 'EOF',
    1: 'NEWLINE',
    2: 'IDENT',

    // Types
    3: 'INT_TYPE',
    4: 'FLOAT_TYPE',
    5: 'CHAR_TYPE',
    6: 'STR_TYPE',
    7: 'BOOL_TYPE',
    8: 'ARR_TYPE',

    // Misc
    9: ',',
    10: ':',
    11: '(',
    12: ')',
    13: '[',
    14: ']',
    
    // - Keywords [100-200]

    100: 'PROGRAM',
    101: 'BEGIN',
    102: 'END',

    // Type Declarations
    103: 'VARIABLES',
    104: 'CONSTANTS',

    105: 'INTEGER',
    106: 'FLOAT',
    107: 'CHARACTER',
    108: 'STRING',
    109: 'BOOLEAN',

    110: 'TRUE',
    111: 'FALSE',

    // Statements
    112: 'LET',
    113: 'PRINT',

    114: 'IF',
    115: 'THEN',
    116: 'ELSE',
    117: 'ENDIF',

    118: 'WHILE',
    119: 'DO',
    120: 'ENDWHILE',

    121: 'FOR',
    122: 'FROM',
    123: 'TO',
    124: 'STEP',
    125: 'ENDFOR',

    126: 'REPEAT',
    127: 'UNTIL',
    128: 'ENDREPEAT',

    129: 'SWITCH',
    130: 'CASE',
    131: 'DEFAULT',
    132: 'ENDSWITCH',
    
    133: 'RESIZE',
    
    // - Operators [200-300]

    200: 'AND',
    201: 'OR',
    202: 'NOT',

    203: '+',
    204: '-',
    205: '*',
    206: '/',
    207: '%',
    208: '^',

    209: "&",

    210: '=',
    211: '==',
    212: '!=',
    213: '>',
    214: '>=',
    215: '<',
    216: '<='
}

export { TokenCode };