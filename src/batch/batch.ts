import { Store } from "../store";

export let batches: number = 0;
export let batchedFnsMap: Map<Store<any>, () => void> = new Map();

export const startBatch = () => batches += 1;
export const endBatch = () => {
    batches -= 1;
    if (isLastBatchItem())
        executeBatchedFns();
}
export const isLastBatchItem = () => batches == 0;
export const batched = (fn: () => void, store: Store<any>) => {
    if (isLastBatchItem())
        fn();
    else
        batchedFnsMap.set(store, fn);
}
export const executeBatchedFns = () => {
    batchedFnsMap.forEach((fn) => fn());
    batchedFnsMap.clear();
};