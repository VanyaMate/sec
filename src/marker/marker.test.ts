import { beforeAll, describe, expect, test, vi } from 'vitest';
import { marker } from './index';
import { effect } from '../effect';
import { store } from '../store';


const createPostAction = async (id: number) => {
    return new Promise<{ id: number }>((resolve) => {
        setTimeout(() => {
            resolve({ id });
        }, 500);
    });
};
const loginAction      = async () => {
};
const logoutAction     = async () => {
};
const loginEffect      = effect(loginAction);
const logoutEffect     = effect(logoutAction);
const createPostEffect = effect(createPostAction);
const loginMarker      = marker('beforeAll').on('onSuccess', loginEffect);
const logoutMarker     = marker('afterAll').on('onSuccess', logoutEffect);

const postsStore = store<Array<{ id: number }>>([], true)
    .enableOn(loginMarker)
    .disableOn(logoutMarker)
    .on(createPostEffect, 'onSuccess', (state, { result }) => state.concat(result));

describe('marker', () => {
    beforeAll(() => {
        postsStore.set([]);
    });

    test('check with effect', async () => {
        const mockFunction = vi.fn();
        loginMarker.subscribe(mockFunction);
        await loginEffect().finally(() => {
            expect(mockFunction).toBeCalledTimes(1);
        });
        await loginEffect().finally(() => {
            expect(mockFunction).toBeCalledTimes(2);
        });
    });

    test('check with effect + store', () => {
        createPostEffect(1)
            .finally(() => {
                expect(postsStore.get()).deep.eq([]);
            });

        loginEffect().finally(async () => {
            await createPostEffect(2).finally(() => {
                expect(postsStore.get()).deep.eq([ { id: 2 } ]);
            });
            createPostEffect(3)
                .then(() => {
                    expect(postsStore.get()).deep.eq([ { id: 2 } ]);
                });
            logoutEffect();
        });
    });

    test('check queue', () => {
        const queue: Array<number> = [];
        const logoutEffect         = async function () {
            return new Promise(resolve => setTimeout(resolve, 100));
        };
        const beforeLogout         = effect(logoutEffect);
        const middleLogout         = effect(logoutEffect);
        const afterLogout          = effect(logoutEffect);

        store<Array<number>>([]).on(middleLogout, 'onSuccess', (state) => {
            queue.push(2);
            return state;
        });

        marker('afterAll').on('onSuccess', afterLogout).subscribe(() => queue.push(3));
        marker('beforeAll').on('onSuccess', beforeLogout).subscribe(() => queue.push(1));

        logoutEffect()
            .finally(() => {
                expect(queue).deep.eq([ 1, 2, 3 ]);
            });
    });
});