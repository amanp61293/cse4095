def precedence(operator):
    if operator == "u+" or operator == "u-":
        return 3
    elif operator == "*" or operator == "/":
        return 2
    elif operator == "+" or operator == "-":
        return 1
    return 0


def apply_operator(numbers, operators):
    if not operators:
        raise ValueError("Missing operator")

    operator = operators.pop()

    # Unary operators use only one operand
    if operator == "u+" or operator == "u-":
        if len(numbers) < 1:
            raise ValueError("Missing operand")

        value = numbers.pop()

        if operator == "u-":
            value = -value

        numbers.append(value)
        return

    # Binary operators use two operands
    if len(numbers) < 2:
        raise ValueError("Missing operand")

    right = numbers.pop()
    left = numbers.pop()

    if operator == "+":
        result = left + right

    elif operator == "-":
        result = left - right

    elif operator == "*":
        result = left * right

    elif operator == "/":
        if right == 0:
            raise ValueError("Division by zero")

        result = left / right

    else:
        raise ValueError("Unknown operator")

    numbers.append(result)


def evaluate(expression):
    numbers = []
    operators = []

    # Ignore all whitespace
    expression = "".join(expression.split())

    if expression == "":
        raise ValueError("Expression is empty")

    i = 0
    expecting_operand = True

    while i < len(expression):
        current = expression[i]

        # Number
        if current.isdigit() or current == ".":
            if not expecting_operand:
                raise ValueError("Missing operator before number")

            start = i
            decimal_count = 0

            while i < len(expression) and (
                expression[i].isdigit() or expression[i] == "."
            ):
                if expression[i] == ".":
                    decimal_count += 1

                    if decimal_count > 1:
                        raise ValueError("Invalid number")

                i += 1

            number_text = expression[start:i]

            if number_text == ".":
                raise ValueError("Invalid number")

            numbers.append(float(number_text))
            expecting_operand = False
            continue

        # Left parenthesis
        elif current == "(":
            if not expecting_operand:
                raise ValueError("Missing operator before '('")

            operators.append("(")
            expecting_operand = True

        # Right parenthesis
        elif current == ")":
            if expecting_operand:
                raise ValueError("Missing operand before ')'")

            while operators and operators[-1] != "(":
                apply_operator(numbers, operators)

            if not operators:
                raise ValueError("Missing left parenthesis")

            # Remove matching left parenthesis
            operators.pop()

            # Apply unary operator to the whole parenthesized expression
            # Example: -(2 + 3)
            while operators and (
                operators[-1] == "u+" or operators[-1] == "u-"
            ):
                apply_operator(numbers, operators)

            expecting_operand = False

        # Operators
        elif current in "+-*/":

            # Unary + or unary -
            if expecting_operand:
                if current == "+":
                    operators.append("u+")

                elif current == "-":
                    operators.append("u-")

                else:
                    raise ValueError("Operator in invalid position")

            # Binary operator
            else:
                while (
                    operators
                    and operators[-1] != "("
                    and precedence(operators[-1]) >= precedence(current)
                ):
                    apply_operator(numbers, operators)

                operators.append(current)
                expecting_operand = True

        # Unsupported character
        else:
            raise ValueError("Unsupported character: " + current)

        i += 1

    if expecting_operand:
        raise ValueError("Expression cannot end with an operator")

    # Apply all remaining operators
    while operators:
        if operators[-1] == "(":
            raise ValueError("Missing right parenthesis")

        apply_operator(numbers, operators)

    # A valid expression should leave exactly one final value
    if len(numbers) != 1:
        raise ValueError("Invalid expression")

    return numbers[0]


def main():
    expression = input("Enter an arithmetic expression: ")

    try:
        result = evaluate(expression)
        print("Result:", result)

    except ValueError as error:
        print("Error:", error)


main()