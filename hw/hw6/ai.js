// ai.js
// Bottom-up dynamic-programming / minimax AI.
//
// game.js must be loaded before this file.
//
// Each DP entry has:
//
// {
//     value: -1, 0, or 1,
//     bestMove: successor state or null
// }
//
// All values are from Player A's perspective.


function bestMoveDP(depth) {

    if (depth % 2 !== 0) {
        throw new Error("depth must be even");
    }


    const dp = new Map();


    // ------------------------------------------------------------
    // Base cases at maximum depth
    // ------------------------------------------------------------

    for (let i = 0; i < 5; i++) {

        for (let j = 0; j < 5; j++) {

            for (let k = 0; k < 5; k++) {

                for (let l = 0; l < 5; l++) {

                    const state = [
                        [i, j],
                        [k, l],
                        depth
                    ];


                    const terminal =
                        terminalValue(state);


                    if (terminal !== null) {

                        dp.set(
                            stateKey(state),
                            {
                                value: terminal,
                                bestMove: null
                            }
                        );

                    } else {

                        // Search limit reached while
                        // both players are still alive.
                        dp.set(
                            stateKey(state),
                            {
                                value: 0,
                                bestMove: null
                            }
                        );
                    }
                }
            }
        }
    }


    // ------------------------------------------------------------
    // Build table backward
    // ------------------------------------------------------------

    for (let h = depth - 1; h >= 0; h--) {

        for (let i = 0; i < 5; i++) {

            for (let j = 0; j < 5; j++) {

                for (let k = 0; k < 5; k++) {

                    for (let l = 0; l < 5; l++) {

                        const state = [
                            [i, j],
                            [k, l],
                            h
                        ];


                        // Terminal state.
                        const terminal =
                            terminalValue(state);


                        if (terminal !== null) {

                            dp.set(
                                stateKey(state),
                                {
                                    value: terminal,
                                    bestMove: null
                                }
                            );

                            continue;
                        }


                        const moves =
                            nextMoves(state);


                        // ------------------------------------------------
                        // Player A: MAX
                        // ------------------------------------------------

                        if (h % 2 === 0) {

                            let bestValue = -2;
                            let bestMove = null;


                            for (const move of moves) {

                                const result =
                                    dp.get(
                                        stateKey(move)
                                    );

                                const value =
                                    result.value;


                                if (value > bestValue) {

                                    bestValue =
                                        value;

                                    bestMove =
                                        move;
                                }
                            }


                            dp.set(
                                stateKey(state),
                                {
                                    value: bestValue,
                                    bestMove: bestMove
                                }
                            );
                        }


                        // ------------------------------------------------
                        // Player B: MIN
                        // ------------------------------------------------

                        else {

                            let bestValue = 2;
                            let bestMove = null;


                            for (const move of moves) {

                                const result =
                                    dp.get(
                                        stateKey(move)
                                    );

                                const value =
                                    result.value;


                                if (value < bestValue) {

                                    bestValue =
                                        value;

                                    bestMove =
                                        move;
                                }
                            }


                            dp.set(
                                stateKey(state),
                                {
                                    value: bestValue,
                                    bestMove: bestMove
                                }
                            );
                        }
                    }
                }
            }
        }
    }


    return dp;
}


// Look up one state in the DP table.
function getDPResult(dp, state) {
    return dp.get(
        stateKey(state)
    );
}