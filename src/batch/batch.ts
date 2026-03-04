export let batches: number = 0;
export let batchedFns: Array<() => void> = [];

export const startBatch = () => batches += 1;
export const endBatch = () => {
    batches -= 1;
    if (isLastBatchItem())
        executeBatchedFns();
}
export const isLastBatchItem = () => batches == 0;
export const batched = (fn: () => void) => {
    if (isLastBatchItem())
        fn();
    else
        batchedFns.push(fn);
}
export const executeBatchedFns = () => {
    batchedFns.forEach((fn) => fn());
    batchedFns.length = 0;
};