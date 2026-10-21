import random
import ast
import operator


def generate_cards():
    cards = []

    for i in range(4):
        card = random.randint(1, 13)
        cards.append(card)

    return cards


def get_expression_numbers(tree):
    numbers = []

    for node in ast.walk(tree):
        if isinstance(node, ast.Constant):
            if type(node.value) is int:
                numbers.append(node.value)

    return numbers


def uses_correct_cards(numbers, cards):
    return sorted(numbers) == sorted(cards)


def evaluate_node(node):
    if isinstance(node, ast.Constant):
        if type(node.value) is int:
            return node.value
        else:
            raise ValueError("Only whole numbers are allowed.")

    if isinstance(node, ast.BinOp):
        left = evaluate_node(node.left)
        right = evaluate_node(node.right)

        if isinstance(node.op, ast.Add):
            return operator.add(left, right)

        elif isinstance(node.op, ast.Sub):
            return operator.sub(left, right)

        elif isinstance(node.op, ast.Mult):
            return operator.mul(left, right)

        elif isinstance(node.op, ast.Div):
            return operator.truediv(left, right)

        else:
            raise ValueError("Invalid operator.")

    raise ValueError("Invalid expression.")


def check_expression(expression, cards):
    try:
        tree = ast.parse(expression, mode="eval")
    except SyntaxError:
        print("Invalid expression.")
        return

    numbers = get_expression_numbers(tree)

    if not uses_correct_cards(numbers, cards):
        print("You must use each displayed card exactly once.")
        return

    try:
        result = evaluate_node(tree.body)
    except ZeroDivisionError:
        print("Invalid expression: division by zero.")
        return
    except ValueError:
        print("Invalid expression. Use only numbers, +, -, *, /, and parentheses.")
        return

    print("Result:", result)

    if abs(result - 24) < 0.000001:
        print("Correct! Your expression equals 24.")
    else:
        print("Incorrect. Your expression does not equal 24.")


def find_solution(items):
    if len(items) == 1:
        value, expression = items[0]

        if abs(value - 24) < 0.000001:
            return expression
        else:
            return None

    for i in range(len(items)):
        for j in range(i + 1, len(items)):
            value1, expression1 = items[i]
            value2, expression2 = items[j]

            remaining = []

            for k in range(len(items)):
                if k != i and k != j:
                    remaining.append(items[k])

            possibilities = []

            possibilities.append(
                (value1 + value2, "(" + expression1 + " + " + expression2 + ")")
            )

            possibilities.append(
                (value1 - value2, "(" + expression1 + " - " + expression2 + ")")
            )

            possibilities.append(
                (value2 - value1, "(" + expression2 + " - " + expression1 + ")")
            )

            possibilities.append(
                (value1 * value2, "(" + expression1 + " * " + expression2 + ")")
            )

            if value2 != 0:
                possibilities.append(
                    (value1 / value2, "(" + expression1 + " / " + expression2 + ")")
                )

            if value1 != 0:
                possibilities.append(
                    (value2 / value1, "(" + expression2 + " / " + expression1 + ")")
                )

            for new_item in possibilities:
                new_items = remaining.copy()
                new_items.append(new_item)

                solution = find_solution(new_items)

                if solution is not None:
                    return solution

    return None


def solve_cards(cards):
    items = []

    for card in cards:
        items.append((card, str(card)))

    return find_solution(items)


def main():
    cards = generate_cards()

    print("Your cards:")
    print(cards[0], cards[1], cards[2], cards[3])

    expression = input("Enter an expression: ")

    check_expression(expression, cards)

    print()
    print("Checking for a solution...")

    solution = solve_cards(cards)

    if solution is not None:
        print("A solution is:")
        print(solution, "= 24")
    else:
        print("There is no solution for these cards.")


if __name__ == "__main__":
    main()