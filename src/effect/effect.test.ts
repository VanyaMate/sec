import { describe, it, expect, vi, beforeEach } from 'vitest';
import { effect } from './index';


// Сгенерировано AI

describe('effect()', () => {
    let resolveEffect: ReturnType<typeof effect<(x: number) => Promise<number>>>;
    let rejectEffect: ReturnType<typeof effect<(x: number) => Promise<number>>>;

    beforeEach(() => {
        resolveEffect = effect(async (x: number) => x + 1);
        rejectEffect  = effect(async () => {
            throw new Error('fail');
        });
    });

    it('calls the original action and returns result', async () => {
        const result = await resolveEffect(2);
        expect(result).toBe(3);
    });

    it('calls onBefore callbacks in order', async () => {
        const order: string[] = [];

        resolveEffect.onBefore(() => order.push('beforeAll-1'), 'beforeAll');
        resolveEffect.onBefore(() => order.push('before-1'));
        resolveEffect.onBefore(() => order.push('afterAll-1'), 'afterAll');

        await resolveEffect(1);

        expect(order).toEqual([ 'beforeAll-1', 'before-1', 'afterAll-1' ]);
    });

    it('calls onSuccess callbacks in order with result and args', async () => {
        const order: string[] = [];
        const spy             = vi.fn();

        resolveEffect.onSuccess((res, x) => {
            order.push('beforeAll');
            spy(res, x);
        }, 'beforeAll');
        resolveEffect.onSuccess(() => order.push('other'));
        resolveEffect.onSuccess(() => order.push('afterAll'), 'afterAll');

        await resolveEffect(10);

        expect(order).toEqual([ 'beforeAll', 'other', 'afterAll' ]);
        expect(spy).toHaveBeenCalledWith(11, 10);
    });

    it('calls onError callbacks in order with error and args', async () => {
        const order: string[] = [];
        const spy             = vi.fn();

        rejectEffect.onError((err, x) => {
            order.push('beforeAll');
            spy(err, x);
        }, 'beforeAll');
        rejectEffect.onError(() => order.push('other'));
        rejectEffect.onError(() => order.push('afterAll'), 'afterAll');

        try {
            await rejectEffect(5);
        } catch (_) {
        }

        expect(order).toEqual([ 'beforeAll', 'other', 'afterAll' ]);
        expect(spy.mock.calls[0][0]).toBeInstanceOf(Error);
        expect(spy.mock.calls[0][0].message).toBe('fail');
        expect(spy.mock.calls[0][1]).toBe(5);
    });

    it('calls onFinally callbacks in order', async () => {
        const order: string[] = [];

        resolveEffect.onFinally(() => order.push('beforeAll'), 'beforeAll');
        resolveEffect.onFinally(() => order.push('other'));
        resolveEffect.onFinally(() => order.push('afterAll'), 'afterAll');

        await resolveEffect(1);

        expect(order).toEqual([ 'beforeAll', 'other', 'afterAll' ]);
    });

    it('calls onFinally even if action fails', async () => {
        const order: string[] = [];

        rejectEffect.onFinally(() => order.push('finally'));

        try {
            await rejectEffect(1);
        } catch (_) {
        }

        expect(order).toEqual([ 'finally' ]);
    });

    it('throws error after executing error and finally handlers', async () => {
        const spy = vi.fn();

        rejectEffect.onError(spy);
        rejectEffect.onFinally(spy);

        await expect(rejectEffect(123)).rejects.toThrow('fail');

        expect(spy).toHaveBeenCalledTimes(2);
    });
});
