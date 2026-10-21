import heapq


def get_neighbors(state):
    neighbors = []

    # Find the blank
    blank = state.index(0)

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

        # Make sure move stays inside the board
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


def manhattan_distance(state, goal_state):
    distance = 0

    # Tiles 1 through 8
    # Do not count blank tile 0
    for tile in range(1, 9):
        current_index = state.index(tile)
        goal_index = goal_state.index(tile)

        current_row = current_index // 3
        current_col = current_index % 3

        goal_row = goal_index // 3
        goal_col = goal_index % 3

        distance += abs(current_row - goal_row)
        distance += abs(current_col - goal_col)

    return distance


def astar(initial_state, goal_state):

    # Priority queue
    open_list = []

    # Best known g-value for each state
    g_score = {initial_state: 0}

    # Parent of each state
    parent = {initial_state: None}

    # Calculate initial f-value
    h = manhattan_distance(initial_state, goal_state)
    f = h

    # Add initial state to priority queue
    heapq.heappush(open_list, (f, initial_state))

    states_expanded = 0

    while open_list:

        # Get state with lowest f-value
        current_f, current = heapq.heappop(open_list)

        # Check for outdated heap entry
        expected_f = (
            g_score[current]
            + manhattan_distance(current, goal_state)
        )

        if current_f != expected_f:
            continue

        states_expanded += 1

        # Goal reached
        if current == goal_state:
            return (
                parent,
                g_score,
                states_expanded,
                len(g_score)
            )

        # Generate neighboring states
        for neighbor in get_neighbors(current):

            # Each move costs 1
            new_g = g_score[current] + 1

            # New state or better path to existing state
            if neighbor not in g_score or new_g < g_score[neighbor]:

                g_score[neighbor] = new_g
                parent[neighbor] = current

                h = manhattan_distance(neighbor, goal_state)
                f = new_g + h

                heapq.heappush(open_list, (f, neighbor))

    return None, g_score, states_expanded, len(g_score)


def reconstruct_path(parent, goal_state):
    path = []
    current = goal_state

    # Follow parent links from goal back to start
    while current is not None:
        path.append(current)
        current = parent[current]

    # Reverse to get start -> goal
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


# Run A*
parent, g_score, states_expanded, states_discovered = astar(
    initial_state,
    goal_state
)


if parent is not None:

    # Reconstruct complete solution
    path = reconstruct_path(parent, goal_state)

    print("A* Solution")
    print("===========")
    print()

    # Print every state from start to goal
    for step, state in enumerate(path):
        print("Step", step)
        print_state(state)
        print()

    # Final statistics
    print("Optimal moves:", len(path) - 1)
    print("States expanded:", states_expanded)
    print("States discovered/generated:", states_discovered)

else:
    print("No solution found.")