export const delay = function (ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}