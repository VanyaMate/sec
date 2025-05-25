export const to = function <State> (state: State) {
    return () => state;
};