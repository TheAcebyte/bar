import { isDigit, isAlpha } from './helper.ts';
import { TokenType } from '.././data/tokens/types.ts';
import { ErrorMessage } from '.././data/errors.ts';

class Token {
    value: string;
    type: number;

    constructor(value: string, type: number) {
        this.value = value;
        this.type = type;
    }
}

class Lexer {
    source: string;
    curPos: number;
    curChar: string;

    constructor(src: string) {
        this.source = src;
        this.curPos = -1;
        this.curChar = '';

        this.nextChar();
    }

    abort(message: string) {
        throw new Error(`[LEXING ERROR] ${message}.`);
        return new Token('', TokenType.NULL);
    }

    skipWhitespace() {
        while (this.curChar == ' ' || this.curChar == '\t' || this.curChar == '\r') {
            this.nextChar();
        }
    }

    skipComment() {
        if (this.curChar == '#') {
            while (this.curChar != '\n' as string) {
                this.nextChar();
            }
        }
    }

    keywordType(keyword: string) {
        for (const token in TokenType) {
            if (keyword == token && TokenType[token] >= 100) {
                return TokenType[token];
            }
        }
        
        return TokenType.IDENT;
    }
    
    peekChar() {
        if (this.curPos + 1 >= this.source.length) {
            return '\0';
        }

        return this.source[this.curPos + 1];
    }
    
    nextChar() {
        this.curPos++;

        if (this.curPos >= this.source.length) {
            this.curChar = '\0';
        } 
        else {
            this.curChar = this.source[this.curPos];
        }
    }

    nextToken() {
        this.skipWhitespace();
        this.skipComment();

        let token: Token;
        const char = this.curChar;

        // General

        if (char == '\0') {
            token = new Token(char, TokenType.EOF);
        }
        else if (char == '\n') {
            token = new Token(char, TokenType.NEWLINE);
        }
        else if (char == ',') {
            token = new Token(char, TokenType.COMMA);
        }
        else if (char == ':') {
            token = new Token(char, TokenType.COLON);
        }
        else if (char == '(') {
            token = new Token(char, TokenType.PARLEFT);
        }
        else if (char == ')') {
            token = new Token(char, TokenType.PARRIGHT);
        }
        else if (char == '[') {
            token = new Token(char, TokenType.BRALEFT);
        }
        else if (char == ']') {
            token = new Token(char, TokenType.BRARIGHT);
        }

        // Operators

        else if (char == '+') {
            token = new Token(char, TokenType.PLUS);
        }
        else if (char == '-') {
            token = new Token(char, TokenType.MINUS);
        }
        else if (char == '*') {
            token = new Token(char, TokenType.ASTERISK);
        }
        else if (char == '/') {
            token = new Token(char, TokenType.SLASH);
        }
        else if (char == '^') {
            token = new Token(char, TokenType.CARET);
        }
        else if (char == '%') {
            token = new Token(char, TokenType.PERCENT);
        }
        else if (char == '&') {
            token = new Token(char, TokenType.AMPERSAND);
        }
        else if (char == '=') {
            if (this.peekChar() == '=') {
                token = new Token('==', TokenType.EQEQ);
                this.nextChar();
            }
            else {
                token = new Token(char, TokenType.EQ);
            }
        }
        else if (char == '!' && this.peekChar() == '=') {
            token = new Token('!=', TokenType.NOTEQ);
            this.nextChar();
        }
        else if (char == '>') {
            if (this.peekChar() == '=') {
                token = new Token('>=', TokenType.GTEQ);
                this.nextChar();
            }
            else {
                token = new Token(char, TokenType.GT);
            }
        }
        else if (char == '<') {
            if (this.peekChar() == '=') {
                token = new Token('<=', TokenType.LTEQ);
                this.nextChar();
            }
            else {
                token = new Token(char, TokenType.LT);
            }
        }

        // String & Char

        else if (char == '"') {
            const startPos = this.curPos;
            this.nextChar();

            while (this.curChar != '"') {
                this.nextChar();
            }

            const string = this.source.slice(startPos, this.curPos + 1);
            token = new Token(string, TokenType.STR_TYPE);
        }
        else if (char == '\'') {
            const startPos = this.curPos;
            this.nextChar();

            if (this.peekChar() == '\'') {
                this.nextChar();
            }
            else if (this.curChar != '\'') {
                return this.abort(ErrorMessage[3]);
            }

            const char = this.source.slice(startPos, this.curPos + 1);
            token = new Token(char, TokenType.CHAR_TYPE);
        }

        // Integer & Float

        else if (isDigit(char)) {
            const startPos = this.curPos;
            let type = TokenType.INT_TYPE;

            while (isDigit(this.peekChar())) {
                this.nextChar();
            }

            if (this.peekChar() == '.') {
                this.nextChar();
                type = TokenType.FLOAT_TYPE;

                if (isDigit(this.peekChar())) {
                    while (isDigit(this.peekChar())) {
                        this.nextChar();
                    }
                }
                else {
                    return this.abort(ErrorMessage[2]);
                }
            }

            const digit = this.source.slice(startPos, this.curPos + 1);
            token = new Token(digit, type);
        }

        // Keyword & Ident

        else if (isAlpha(char)) {
            const startPos = this.curPos;

            while (isAlpha(this.peekChar()) || isDigit(this.peekChar())) {
                this.nextChar();
            }

            const keyword = this.source.slice(startPos, this.curPos + 1);
            let type = this.keywordType(keyword);

            token = new Token(keyword, type);
        }
        else {
            return this.abort(ErrorMessage[0] + ` (${char})`);
        }

        this.nextChar();
        return token;
    }
}

export { Token, Lexer };