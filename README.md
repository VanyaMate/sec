# SEC (Store, Effect, Combine)

Tiny state manager

*It may change in the future*

For react/preact/svelte/qwik/solid

```
npm i @vanyamate/sec
```

with

```
npm i @vanyamate/sec-react
npm i @vanyamate/sec-solidjs
```

## Documentation:

### Example

```tsx

import { effect, store, marker, pending, to } from '@vanyamate/sec';
import { useStore } from '@vanyamate/sec-react';


const logout = async function () {
    return api('v1/auth/logout', { method: 'POST' });
};

const getPosts = async function (userId: number): Promise<Array<Post>> {
    return api(`v1/posts/byUserId/${ userId }`);
};

const getPostsForUserPageEffect = effect(getPosts);
const logoutEffect              = effect(logout);

const disableMarker = marker('afterAll')
    .on('onBefore', logoutEffect);

const $userPagePostsPending = pending([ getPostsForUserPageEffect ]);
const $userPagePosts        = store<Array<Post>>([])
    .disableOn(disableMarker)
    .on('onBefore', getPostsForUserPageEffect, (_) => to([]))
    .on('onSuccess', getPostsForUserPageEffect, (_, { result }) => result);

const UserPage = function (userId: number) {
    const postsPending = useStore($userPagePostsPending);
    const posts        = useStore($userPagePosts);

    useLayoutEffect(() => {
        getPostsForUserPageEffect(userId);
    }, [ userId ]);

    if (postsPending) {
        return <Loader/>;
    }

    return posts.map((post) => <Post key={ post.id } post={ post }/>);
};
```

### effect

Effect is a wrapper around action. Action is any asynchronous action. Store subscribes to effect. Effect can be called
from anywhere in the code.

Effect takes one value - action.

```typescript

const loginAction = async function (loginData: LoginData): Promise<UserData> {
    // login action.. (fetch, etc.)
    return fetch(`${ __API__ }/v1/auth`, {
        method: 'POST',
        body  : JSON.stringify(loginData),
    })
        .then((response) => response.json());
};

const loginEffect = effect(loginAction);

// Anywhere in code
loginEffect({ login: 'VanyaMate', password: 'qwerty12345' });

```

### marker

markers are needed to enable/disable the store. markers also subscribe to the effect. marker takes 1 value of the
subscription type. `afterAll`, `beforeAll` or `undefined`

The marker has an api.

- `on` - subscribe to effect. takes 2 parameters. type (`onBefore`, `onSuccess`, `onError` and `onFinally`) and effect.
  after effect is triggered, all listeners that were set via `subscribe` are triggered.
- `subscribe` - adds a handler that will be triggered when any effect of the required type is executed.

```typescript

const loginMarker  = marker('beforeAll').on('onSuccess', loginEffect);
const logoutMarker = marker('afterAll').on('onSuccess', logoutEffect);

```

order of execution: 'beforeAll' -> undefined -> 'afterAll' (within one type (for example `onSuccess`))

### to

Just helper. Returns a function that returns the passed value.

```typescript

to(123); // Return () => 123

```

```typescript
// before    .on(logoutEffect, 'onSuccess', () => []);
// after     .on(logoutEffect, 'onSuccess', to([]));
```

### pending

Just helper. wrapper over store. returns a bool value and is used to create a pending-store.

```typescript
/**
 *
 * instead of
 * const postsIsPending = store<boolean>(false)
 *  .on(getPostsForUser, 'onBefore', () => true)
 *  .on(getPostsForUser, 'onFinally', () => false)
 *  .on(createPostEffect, 'onBefore', () => true)
 *  .on(createPostEffect, 'onFinally', () => false);
 *
 */

const postsIsPending = pending([
        getPostsForUser,
        createPostEffect,
    ]);
```

### store

Store stores data and subscribes to effect.

When initializing, the store takes 2 values. The first value is the initialization data. The second value is optional -
enable/disable. When disabled, the store will not be updated.

The store has an api.

- `on` - subscription to effect. takes 3 parameters. effect, type (`onBefore`, `onSuccess`, `onError` and `onFinally`)
  and handler. handler has signature depending on type. handler is a function that takes 2 parameters and should always
  return value of the type that is currently specified in store. first parameter is current state of store, and the
  second is an object and depends on subscription type. for `onBefore` it is only `{ args }` where `args` is an array of
  arguments of the function that we passed to effect. for `onSuccess` it is `{ args, result }` where `result` is result
  of `Promise` execution. for `onError` `{ args, error }` where `error` is `unknown`. and for `onFinally` it is
  `{ args }`.
    - `onBefore` - `(state, { args }) => state`
    - `onSuccess` - `(state, { args, result }) => state`
    - `onError` - `(state, { args, error }) => state`
    - `onFinally` - `(state, { args }) => state`
- `get` - get current store value.
- `set` - set new value
- `subscribe` - receives a function as input that will be executed when the store changes and returns an unsubscribe
  function.
- `enableOn` - receives a marker that, when triggered, will enable the store.
- `disableOn` - receives a marker that, when triggered, will disable the store.

```typescript

const authIsPending = store<boolean>(false)
    .on(loginEffect, 'onBefore', () => true)
    .on(loginEffect, 'onFinally', to(false)); // instead of () => false

const authError = store<Error | null>(null)
    .on(loginEffect, 'onError', (_, { error }) => {
        // For example
        if (error instanceof Error) {
            return error;
        } else {
            return new Error(error);
        }
    });

const authData = store<UserData | null>(null)
    .on(loginEffect, 'onSuccess', (_, { result }) => result)
    .on(logoutEffect, 'onSuccess', () => null);

const postsForUserId = store<number>(0)
    .enableOn(loginMarker)
    .disableOn(logoutMarker)
    .on(getPostsForUser, 'onBefore', (_, { args: [ id ] }) => id);

/**
 *
 * instead of
 * const postsIsPending = store<boolean>(false)
 *  .on(getPostsForUser, 'onBefore', () => true)
 *  .on(getPostsForUser, 'onFinally', () => false)
 *  .on(createPostEffect, 'onBefore', () => true)
 *  .on(createPostEffect, 'onFinally', () => false);
 *
 */

const postsIsPending = pending([
    getPostsForUser,
    createPostEffect,
]);

const posts = store<Array<Post>>([])
    .enableOn(loginMarker)
    .disableOn(logoutMarker)
    .on(getPostsForUser, 'onSuccess', (state, { result, args: [ userId ] }) => {
        if (postsForUserId.get() === userId) {
            return state.concat(result);
        } else {
            return result;
        }
    })
    .on(createPostEffect, 'onSuccess', (state, { result, args: [ userId ] }) => {
        if (postsForUserId.get() === userId) {
            return state.concat(result);
        } else {
            return state;
        }
    })
    .on(logoutEffect, 'onSuccess', to([]));
```

### Types

#### StoreHandlerMap

instead of writing everything in `.on` - you can take out the handlers separately, setting the required type for them.
`StoreHandlerMap` is a generic and takes 2 parameters, and then the type is selected.
first is type of store value. second is action signature. and then select type of subscribe.

```
StoreHandlerMap<number, typeof getRandomId>['onSuccess']
```

```typescript
// Example:

const getRandomId = async function () {
    return { id: Math.random() };
};

const getRandomEffect = effect(getRandomId);

const handler: StoreHandlerMap<number, typeof getRandomId>['onSuccess'] = function (state, { result }) {
    return result.id;
};

const num = store<number>(0)
    .on(getRandomEffect, 'onSuccess', handler);
```