from collections import deque


def get_neighbors(state):
    neighbors = []

    # Find the blank
    blank = state.index(0)

    # Find the row and column of the blank
    row = blank // 3
    col = blank % 3

    # Up, down, left, right
    moves = [
        (-1, 0),
        (1, 0),
        (0, -1),
        (0, 1)
    ]

    for row_change, col_change in moves:
        new_row = row + row_change
        new_col = col + col_change

        # Check if the move stays inside the board
        if 0 <= new_row < 3 and 0 <= new_col < 3:
            new_blank = new_row * 3 + new_col

            # Convert to list so we can swap
            new_state = list(state)

            # Swap blank with neighboring tile
            new_state[blank], new_state[new_blank] = \
                new_state[new_blank], new_state[blank]

            # Convert back to tuple
            neighbors.append(tuple(new_state))

    return neighbors


def bfs(initial_state, goal_state):
    queue = deque([initial_state])
    discovered = {initial_state}

    # Keep track of where each state came from
    parent = {initial_state: None}

    states_expanded = 0

    while queue:
        current = queue.popleft()
        states_expanded += 1

        # Check if goal has been reached
        if current == goal_state:
            return parent, states_expanded, len(discovered)

        # Explore neighboring states
        for neighbor in get_neighbors(current):
            if neighbor not in discovered:
                discovered.add(neighbor)
                parent[neighbor] = current
                queue.append(neighbor)

    return None, states_expanded, len(discovered)


def reconstruct_path(parent, goal_state):
    path = []
    current = goal_state

    # Follow parents backward from goal to start
    while current is not None:
        path.append(current)
        current = parent[current]

    # Reverse so path goes from start to goal
    path.reverse()

    return path


def print_state(state):
    for i in range(0, 9, 3):
        print(state[i], state[i + 1], state[i + 2])


# Initial state
initial_state = (
    8, 7, 6,
    5, 4, 3,
    2, 1, 0
)

# Goal state
goal_state = (
    1, 2, 3,
    4, 5, 6,
    7, 8, 0
)


# Run BFS
parent, states_expanded, states_discovered = bfs(
    initial_state, goal_state
)


if parent is not None:
    path = reconstruct_path(parent, goal_state)

    # Display every state in the solution
    for step, state in enumerate(path):
        print("Step", step)
        print_state(state)
        print()

    # Display statistics
    print("Total moves:", len(path) - 1)
    print("States expanded:", states_expanded)
    print("States discovered:", states_discovered)

else:
    print("No solution found.")