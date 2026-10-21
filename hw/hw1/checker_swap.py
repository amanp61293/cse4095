def checker_swap(checkers, target_index=1, swaps=None):
    """
    Recursively rearranges checkers into:
    [0, 1, 0, 1, ..., 0, 1]

    0 = red
    1 = black

    Only adjacent swaps are used.
    """

    if swaps is None:
        swaps = []

    # Base case:
    # If target_index is outside the list, we are finished.
    if target_index >= len(checkers):
        return swaps

    # Find the first black checker at or to the right
    # of the position where a black checker belongs.
    black_index = target_index

    while black_index < len(checkers) and checkers[black_index] != 1:
        black_index += 1

    # Move that black checker left using ONLY adjacent swaps.
    while black_index > target_index:
        checkers[black_index], checkers[black_index - 1] = (
            checkers[black_index - 1],
            checkers[black_index],
        )

        swaps.append((black_index - 1, black_index))
        black_index -= 1

    # Recursive call:
    # The next black checker belongs two positions later.
    return checker_swap(checkers, target_index + 2, swaps)


def main():
    n = int(input("Enter n: "))

    # Initial arrangement:
    # n red checkers followed by n black checkers.
    checkers = [0] * n + [1] * n

    print("\nInitial arrangement:")
    print(checkers)

    swaps = checker_swap(checkers)

    print("\nGenerated adjacent swaps:")
    for number, swap in enumerate(swaps, start=1):
        print(f"{number}. swap({swap[0]}, {swap[1]})")

    print("\nFinal arrangement:")
    print(checkers)

    print("\nTotal swaps:", len(swaps))


if __name__ == "__main__":
    main()