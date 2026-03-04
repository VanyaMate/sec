import { describe, it, expect, vi } from 'vitest';
import { effect } from '../effect';
import { pending } from './index';


// Сгенерировано AI

describe('pending()', () => {
    it('initially returns false', () => {
        const fx    = effect(async () => {
        });
        const state = pending([ fx ]);

        expect(state.get()).toBe(false);
    });

    it('sets true on onBefore and false on onFinally (success case)', async () => {
        const fx = effect(async () => {
            await new Promise((r) => setTimeout(r, 10));
        });

        const state              = pending([ fx ]);
        const updates: boolean[] = [];

        state.subscribe((v) => updates.push(v));

        const promise = fx();
        expect(state.get()).toBe(true); // set by onBefore

        await promise;
        expect(state.get()).toBe(false); // reset by onFinally

        expect(updates).toEqual([ true, false ]);
    });

    it('sets true on onBefore and false on onFinally (error case)', async () => {
        const fx = effect(async () => {
            await new Promise((_, rej) => setTimeout(() => rej(new Error('fail')), 10));
        });

        const state              = pending([ fx ]);
        const updates: boolean[] = [];

        state.subscribe((v) => updates.push(v));

        try {
            await fx();
        } catch (_) {
        }

        expect(updates).toEqual([ true, false ]);
        expect(state.get()).toBe(false);
    });

    it('supports multiple effects', async () => {
        const fx1 = effect(async () => {
        });
        const fx2 = effect(async () => {
        });

        const state              = pending([ fx1, fx2 ]);
        const changes: boolean[] = [];
        state.subscribe((v) => changes.push(v));

        await fx1();
        expect(changes).toEqual([ true, false ]);

        await fx2();
        expect(changes).toEqual([ true, false, true, false ]);
    });
});
