import sys
import math


def first_digit_from_log(log_x):
    fractional = log_x - math.floor(log_x)
    value = 10 ** fractional
    return int(value + 1e-12)


def fibonacci_counts(n):
    counts = [0] * 10

    phi = (1 + math.sqrt(5)) / 2
    log_phi = math.log10(phi)
    log_sqrt5 = math.log10(math.sqrt(5))

    small_fib = [
        1, 1, 2, 3, 5, 8, 13, 21, 34, 55,
        89, 144, 233, 377, 610, 987, 1597,
        2584, 4181, 6765
    ]

    for k in range(1, n + 1):
        if k <= len(small_fib):
            first_digit = int(str(small_fib[k - 1])[0])
        else:
            log_value = k * log_phi - log_sqrt5
            first_digit = first_digit_from_log(log_value)

        counts[first_digit] += 1

    return counts


def power2_counts(n):
    counts = [0] * 10
    log2 = math.log10(2)

    for k in range(n + 1):
        log_value = k * log2
        first_digit = first_digit_from_log(log_value)
        counts[first_digit] += 1

    return counts


def power3_counts(n):
    counts = [0] * 10
    log3 = math.log10(3)

    for k in range(n + 1):
        log_value = k * log3
        first_digit = first_digit_from_log(log_value)
        counts[first_digit] += 1

    return counts


def factorial_counts(n):
    counts = [0] * 10
    log_factorial = 0.0

    for k in range(1, n + 1):
        log_factorial += math.log10(k)
        first_digit = first_digit_from_log(log_factorial)
        counts[first_digit] += 1

    return counts


def print_results(counts):
    total = sum(counts)

    print("Digit  Count  Observed%  Benford%  Difference")

    for d in range(1, 10):
        observed = counts[d] / total * 100
        benford = math.log10(1 + 1 / d) * 100
        difference = observed - benford

        print(
            f"{d:5}  "
            f"{counts[d]:5}  "
            f"{observed:9.2f}  "
            f"{benford:8.2f}  "
            f"{difference:10.2f}"
        )

    print()
    print("Total count:", total)


def show_chart(counts, sequence):
    try:
        import matplotlib.pyplot as plt
    except ImportError:
        print("Chart requires matplotlib.")
        print("Install it with: pip install matplotlib")
        return

    digits = list(range(1, 10))
    total = sum(counts)

    observed = [
        counts[d] / total * 100
        for d in digits
    ]

    benford = [
        math.log10(1 + 1 / d) * 100
        for d in digits
    ]

    width = 0.35

    observed_x = [d - width / 2 for d in digits]
    benford_x = [d + width / 2 for d in digits]

    plt.bar(observed_x, observed, width, label="Observed")
    plt.bar(benford_x, benford, width, label="Benford")

    plt.xlabel("First Digit")
    plt.ylabel("Percentage")
    plt.title(f"Benford Analysis: {sequence} (terms = {total})")

    plt.xticks(digits)
    plt.legend()
    plt.show()


def main():
    if len(sys.argv) not in (3, 4):
        print("Usage: python benford.py <sequence> <n> [--chart]")
        print("Sequences: fibonacci, power2, power3, factorial")
        return

    sequence = sys.argv[1].lower()

    try:
        n = int(sys.argv[2])
    except ValueError:
        print("Error: n must be an integer.")
        return

    if n <= 0:
        print("Error: n must be greater than 0.")
        return

    show_graph = False

    if len(sys.argv) == 4:
        if sys.argv[3].lower() == "--chart":
            show_graph = True
        else:
            print("Error: optional argument must be --chart")
            return

    if sequence == "fibonacci":
        counts = fibonacci_counts(n)

    elif sequence == "power2":
        counts = power2_counts(n)

    elif sequence == "power3":
        counts = power3_counts(n)

    elif sequence == "factorial":
        counts = factorial_counts(n)

    else:
        print("Error: invalid sequence.")
        print("Choose: fibonacci, power2, power3, or factorial")
        return

    print()
    print("Sequence:", sequence)
    print("n =", n)
    print()

    print_results(counts)

    if show_graph:
        show_chart(counts, sequence)


if __name__ == "__main__":
    main()