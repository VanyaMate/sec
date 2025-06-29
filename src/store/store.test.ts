import { describe, it, expect, vi, beforeEach } from 'vitest';
import { store } from './index';
import { effect } from '../effect';
import { marker } from '../marker';

// Сгенерировано AI

describe('store()', () => {
    let count: ReturnType<typeof store<number>>;

    beforeEach(() => {
        count = store(0);
    });

    it('returns initial state with get()', () => {
        expect(count.get()).toBe(0);
    });

    it('sets new state with set()', () => {
        count.set(10);
        expect(count.get()).toBe(10);
    });

    it('notifies subscribers on set()', () => {
        const spy = vi.fn();
        count.subscribe(spy);
        count.set(5);
        expect(spy).toHaveBeenCalledWith(5);
    });

    it('unsubscribes correctly', () => {
        const spy   = vi.fn();
        const unsub = count.subscribe(spy);
        count.set(1);
        unsub();
        count.set(2);
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('updates via onBefore from effect', async () => {
        const fx = effect(async (n: number) => n * 2);
        count.on(fx, 'onBefore', (state, { args }) => state + args[0]);
        await fx(3);
        expect(count.get()).toBe(3); // 0 + 3
    });

    it('updates via onSuccess from effect', async () => {
        const fx = effect(async (n: number) => n + 1);
        count.on(fx, 'onSuccess', (state, { result }) => result * 10);
        await fx(4);
        expect(count.get()).toBe(50); // (4+1) * 10
    });

    it('updates via onError from effect', async () => {
        const fx = effect(async () => {
            throw new Error('fail');
        });
        count.on(fx, 'onError', (state, { error }) => {
            if (error instanceof Error) return -1;
            return -999;
        });

        await expect(fx()).rejects.toThrow();
        expect(count.get()).toBe(-1);
    });

    it('updates via onFinally from effect', async () => {
        const fx = effect(async (n: number) => n * 2);
        count.on(fx, 'onFinally', (state, { args }) => state + args[0]);
        await fx(4);
        expect(count.get()).toBe(4); // 0 + 4
    });

    it('respects enabled=false and blocks effect updates', async () => {
        const fx            = effect(async (n: number) => n);
        const disabledStore = store(0, false);
        disabledStore.on(fx, 'onSuccess', (state, { result }) => result + 1);
        await fx(10);
        expect(disabledStore.get()).toBe(0); // update blocked
    });

    it('enableOn() re-enables updates via marker', async () => {
        const m             = marker<number>();
        const fx            = effect(async (n: number) => n);
        const disabledStore = store(0, false).on(fx, 'onSuccess', (state, { result }) => result);

        disabledStore.enableOn(m, 5); // enables + sets to 5
        m.on('onBefore', fx);

        await fx(42);
        expect(disabledStore.get()).toBe(42);
    });

    it('disableOn() disables updates via marker', async () => {
        const m = marker<number>();
        const e = effect(async (n: number) => n);
        const s = store(0, true).on(e, 'onSuccess', (state, { result }) => result);

        s.disableOn(m, -100); // disables + sets to -100
        m.on('onBefore', e);

        await expect(e(10)).resolves.toBe(10);
        expect(s.get()).toBe(-100); // should remain unchanged
    });
});
