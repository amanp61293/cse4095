// game.js
// Chopsticks game-engine logic ported from the professor's Python code.
//
// State format:
// [
//     [A_left, A_right],
//     [B_left, B_right],
//     level
// ]


// Sum two hand values.
// If the result reaches 5 or more, the hand becomes 0.
function overflowSum(a, b) {
    if (a > 5 || b > 5) {
        console.log("input error.");
        return undefined;
    }

    if (a < 0 || b < 0) {
        console.log("input error.");
        return undefined;
    }

    if (a + b >= 5) {
        return 0;
    }

    return a + b;
}


// Return true if either player has lost.
function isTerminal(state) {
    const [a, b] = state;

    const aDead = a[0] === 0 && a[1] === 0;
    const bDead = b[0] === 0 && b[1] === 0;

    return aDead || bDead;
}


// Return the terminal value from Player A's perspective.
//
// -1 = A loses
//  0 = both players are zero
//  1 = A wins
// null = not terminal
function terminalValue(state) {
    const [a, b] = state;

    const aDead = a[0] === 0 && a[1] === 0;
    const bDead = b[0] === 0 && b[1] === 0;

    if (aDead && bDead) {
        return 0;
    }

    if (aDead) {
        return -1;
    }

    if (bDead) {
        return 1;
    }

    return null;
}


// Convert a state into a unique string.
// JavaScript arrays cannot be compared by value in a Set.
function stateKey(state) {
    return JSON.stringify(state);
}


// Add a state only once.
function addUniqueMove(moveMap, state) {
    moveMap.set(stateKey(state), state);
}


// Return every legal successor state.
function nextMoves(v) {
    const moveMap = new Map();

    // No moves after the game has ended.
    if (
        (v[0][0] === 0 && v[0][1] === 0) ||
        (v[1][0] === 0 && v[1][1] === 0)
    ) {
        return [];
    }

    const l0 = v[0][0];
    const r0 = v[0][1];

    const l1 = v[1][0];
    const r1 = v[1][1];

    const h = v[2];


    // ------------------------------------------------------------
    // Player A
    // ------------------------------------------------------------

    if (h % 2 === 0) {

        // A left attacks B left.
        if (l0 > 0 && l1 > 0) {
            const item = [
                [l0, r0],
                [overflowSum(l0, l1), r1],
                h + 1
            ];

            addUniqueMove(moveMap, item);
        }

        // A left attacks B right.
        if (l0 > 0 && r1 > 0) {
            const item = [
                [l0, r0],
                [l1, overflowSum(l0, r1)],
                h + 1
            ];

            addUniqueMove(moveMap, item);
        }

        // A right attacks B left.
        if (r0 > 0 && l1 > 0) {
            const item = [
                [l0, r0],
                [overflowSum(r0, l1), r1],
                h + 1
            ];

            addUniqueMove(moveMap, item);
        }

        // A right attacks B right.
        if (r0 > 0 && r1 > 0) {
            const item = [
                [l0, r0],
                [l1, overflowSum(r0, r1)],
                h + 1
            ];

            addUniqueMove(moveMap, item);
        }


        // Move fingers from A left to A right.
        for (let i = 1; i <= l0; i++) {
            const l = l0 - i;

            if (r0 + i < 5) {
                const r = overflowSum(r0, i);

                if (!(r === l0 && l === r0)) {
                    const item = [
                        [l, r],
                        [l1, r1],
                        h + 1
                    ];

                    addUniqueMove(moveMap, item);
                }
            }
        }


        // Move fingers from A right to A left.
        for (let i = 1; i <= r0; i++) {
            const l = overflowSum(l0, i);
            const r = r0 - i;

            if (l0 + i < 5) {
                if (!(r === l0 && l === r0)) {
                    const item = [
                        [l, r],
                        [l1, r1],
                        h + 1
                    ];

                    addUniqueMove(moveMap, item);
                }
            }
        }
    }


    // ------------------------------------------------------------
    // Player B
    // ------------------------------------------------------------

    else {

        // B left attacks A left.
        if (l1 > 0 && l0 > 0) {
            const item = [
                [overflowSum(l0, l1), r0],
                [l1, r1],
                h + 1
            ];

            addUniqueMove(moveMap, item);
        }

        // B left attacks A right.
        if (l1 > 0 && r0 > 0) {
            const item = [
                [l0, overflowSum(r0, l1)],
                [l1, r1],
                h + 1
            ];

            addUniqueMove(moveMap, item);
        }

        // B right attacks A left.
        if (r1 > 0 && l0 > 0) {
            const item = [
                [overflowSum(l0, r1), r0],
                [l1, r1],
                h + 1
            ];

            addUniqueMove(moveMap, item);
        }

        // B right attacks A right.
        if (r1 > 0 && r0 > 0) {
            const item = [
                [l0, overflowSum(r0, r1)],
                [l1, r1],
                h + 1
            ];

            addUniqueMove(moveMap, item);
        }


        // Move fingers from B left to B right.
        for (let i = 1; i <= l1; i++) {
            const l = l1 - i;
            const r = overflowSum(r1, i);

            if (r1 + i < 5) {
                if (!(r === l1 && l === r1)) {
                    const item = [
                        [l0, r0],
                        [l, r],
                        h + 1
                    ];

                    addUniqueMove(moveMap, item);
                }
            }
        }


        // Move fingers from B right to B left.
        for (let i = 1; i <= r1; i++) {
            const l = overflowSum(l1, i);
            const r = r1 - i;

            if (l1 + i < 5) {
                if (!(r === l1 && l === r1)) {
                    const item = [
                        [l0, r0],
                        [l, r],
                        h + 1
                    ];

                    addUniqueMove(moveMap, item);
                }
            }
        }
    }


    return Array.from(moveMap.values());
}