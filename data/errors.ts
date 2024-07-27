type ErrorList = {
    [key: number]: string
}

const ErrorMessage: ErrorList = {
    // Lexing Errors [0-100]
    0: "Unknown TOKEN",
    1: "Expected \" at end of STRING",
    2: "Invalid FLOAT format",
    3: "Invalid CHAR format",

    // Parsing Errors [100-200]
    100: "Expected {EXPECTED}, got {GOT}",
    101: "Bad syntax",

    // Interpreting Errors [200-300]
    200: "Variable {VARIABLE} not declared",
    201: "Variable {VARIABLE} already declared",
    202: "Invalid expression",
    203: "Cannot change constant {VARIABLE}",
    204: "Variable {VARIABLE} has no assigned value",
    205: "Cannot assign type {TYPE1} to variable {VARIABLE} of type {TYPE2}",
    206: "Can only loop using INT_TYPE, found {TYPE}",
    207: "Array size must be an INT_TYPE and greater than 0",
    208: "Index {INDEX} is out of bounds",
    209: "Variable {VARIABLE} is not an ARRAY",
    210: "Variable {VARIABLE} is an ARRAY",
    211: "Index must be an INT_TYPE",
}

export { ErrorMessage };