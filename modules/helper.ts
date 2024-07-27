enum regexKeys {
    digit = '[0-9]',
    alpha = '[A-Za-z_]'
}

const isDigit = (key: string) => {
    const regex = new RegExp(regexKeys.digit);
    return regex.test(key);
}

const isAlpha = (key: string) => {
    const regex = new RegExp(regexKeys.alpha);
    return regex.test(key);
}

export { isDigit, isAlpha };