const expressionDisplay = document.getElementById("expression");
const resultDisplay = document.getElementById("result");
const buttons = document.querySelectorAll("button");

let expression = "";
let justCalculated = false;

buttons.forEach(button => {
    button.addEventListener("click", () => {

        const value = button.dataset.value;
        const action = button.dataset.action;

        if (action === "clear") {
            clearCalculator();
            return;
        }

        if (action === "delete") {
            deleteLast();
            return;
        }

        if (action === "equals") {
            calculateResult();
            return;
        }

        if (value !== undefined) {
            addValue(value);
        }
    });
});

function addValue(value) {

    if (justCalculated && /[0-9.]/.test(value)) {
        expression = "";
        resultDisplay.textContent = "";
        justCalculated = false;
    }

    if (isOperator(value)) {

        if (expression === "") {
            return;
        }

        const lastCharacter = expression[expression.length - 1];

        if (isOperator(lastCharacter)) {
            expression = expression.slice(0, -1) + value;
        } else {
            expression += value;
        }

        justCalculated = false;
        updateDisplay();
        return;
    }

    if (value === ".") {

        const currentNumber = getCurrentNumber();

        if (currentNumber.includes(".")) {
            return;
        }

        if (currentNumber === "") {
            expression += "0.";
        } else {
            expression += ".";
        }

    } else {
        expression += value;
    }

    justCalculated = false;
    updateDisplay();
}

function isOperator(value) {
    return ["+", "-", "*", "/"].includes(value);
}

function getCurrentNumber() {
    const parts = expression.split(/[+\-*/]/);
    return parts[parts.length - 1];
}

function deleteLast() {
    expression = expression.slice(0, -1);
    resultDisplay.textContent = "";
    justCalculated = false;
    updateDisplay();
}

function clearCalculator() {
    expression = "";
    resultDisplay.textContent = "";
    justCalculated = false;
    updateDisplay();
}

function updateDisplay() {

    if (expression === "") {
        expressionDisplay.textContent = "0";
        return;
    }

    expressionDisplay.textContent = expression
        .replace(/\*/g, "×")
        .replace(/\//g, "÷")
        .replace(/-/g, "−");
}

function calculateResult() {

    if (expression === "") {
        return;
    }

    const lastCharacter = expression[expression.length - 1];

    if (isOperator(lastCharacter)) {
        return;
    }

    try {

        const answer = evaluateExpression(expression);

        if (!Number.isFinite(answer)) {
            throw new Error("Invalid calculation");
        }

        resultDisplay.textContent = Number.isInteger(answer)
            ? answer
            : Number(answer.toFixed(10));

        justCalculated = true;

    } catch (error) {

        resultDisplay.textContent = error.message;
        justCalculated = true;
    }
}

/*
    Custom calculator logic.
    No eval() is used.
*/

function evaluateExpression(input) {

    const tokens = tokenize(input);

    let position = 0;

    function parseExpression() {

        let value = parseTerm();

        while (
            position < tokens.length &&
            (tokens[position] === "+" || tokens[position] === "-")
        ) {

            const operator = tokens[position++];
            const nextValue = parseTerm();

            if (operator === "+") {
                value += nextValue;
            } else {
                value -= nextValue;
            }
        }

        return value;
    }

    function parseTerm() {

        let value = parseNumber();

        while (
            position < tokens.length &&
            (tokens[position] === "*" || tokens[position] === "/")
        ) {

            const operator = tokens[position++];
            const nextValue = parseNumber();

            if (operator === "*") {
                value *= nextValue;
            } else {

                if (nextValue === 0) {
                    throw new Error("Cannot divide by zero");
                }

                value /= nextValue;
            }
        }

        return value;
    }

    function parseNumber() {

        let sign = 1;

        if (tokens[position] === "-") {
            sign = -1;
            position++;
        }

        const number = Number(tokens[position]);

        if (Number.isNaN(number)) {
            throw new Error("Invalid expression");
        }

        position++;

        return sign * number;
    }

    const answer = parseExpression();

    if (position !== tokens.length) {
        throw new Error("Invalid expression");
    }

    return answer;
}

function tokenize(input) {

    const tokens = [];
    let number = "";

    for (let i = 0; i < input.length; i++) {

        const character = input[i];

        if (
            (character >= "0" && character <= "9") ||
            character === "."
        ) {
            number += character;
        } else if (isOperator(character)) {

            if (number !== "") {
                tokens.push(number);
                number = "";
            }

            tokens.push(character);
        }
    }

    if (number !== "") {
        tokens.push(number);
    }

    return tokens;
}