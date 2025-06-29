import { describe, it, expect } from 'vitest';
import { result } from './index';
import { EffectAction } from '../effect';


describe('result', () => {
    it('should return the result as new state (primitive)', () => {
        const handler = result<number, EffectAction>();

        const prevState = 0;
        const newResult = 42;

        const newState = handler(prevState, {
            args  : [],
            result: newResult,
        });

        expect(newState).toBe(newResult);
    });

    it('should return the result as new state (object)', () => {
        const handler = result<{ name: string }, EffectAction>();

        const prevState = { name: 'Old' };
        const newResult = { name: 'New' };

        const newState = handler(prevState, {
            args  : [],
            result: newResult,
        });

        expect(newState).toEqual(newResult);
        expect(newState).not.toBe(prevState); // ensure it's not the same reference
    });

    it('should work with array result', () => {
        const handler = result<string[], EffectAction>();

        const prevState = [ 'a' ];
        const newResult = [ 'b', 'c' ];

        const newState = handler(prevState, {
            args  : [],
            result: newResult,
        });

        expect(newState).toEqual(newResult);
    });

    it('should ignore the previous state entirely', () => {
        const handler = result<any, EffectAction>();

        const prevState = Symbol('previous');
        const newResult = Symbol('new');

        const newState = handler(prevState, {
            args  : [],
            result: newResult,
        });

        expect(newState).toBe(newResult);
    });
});
