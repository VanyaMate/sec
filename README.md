# SEC (Store, Effect, Combine)

Tiny state manager

*will be slightly revised in the future*


For react/preact/svelte/qwik/solid
```
npm i @vanyamate/sec
```
with
```
npm i @vanyamate/sec-react
npm i @vanyamate/sec-solidjs
```


For vue
```
npm i @vanyamate/sec-vue
```


## Example:

```typescript
// src/actions/user-posts
const getUserPosts = function (userId: string): Promise<Array<Post>> {
  // return posts
}
```

```typescript
// src/actions/auth
const logout = function (): Promise<LogoutData> {
  // logout handler
}
```

```typescript
// src/model/auth

const logoutEffect = effect(logout);
```

```typescript
// src/models/user-posts
import { effect, store } from '@vanyamate/sec';

const getUserPostsEffect = effect(getUserPosts);

const $userPostsIsPending = store(false)
  .on(getUserPostsEffect, 'onBefore', () => true)
  .on(getUserPostsEffect, 'onFinally', () => false);

const $userPosts = store<Array<Post>>([])
  .on(getUserPostsEffect, 'onSuccess', (_, { result }) => result)
  .on(logoutEffect, 'onSuccess', () => []);
```

```typescript
// src/models/notifications
import { store } from '@vanyamate/sec';

const errorHandler = async function (error: unknown): Notification {
  // transform error to notification
}

const errorHandlerEffect = effect(errorHandler);

const $notifications = store<Array<Notification>>([])
  .on(errorHandlerEffect, 'onSuccess', (state, { result }) => state.concat(result))
  .on(logoutEffect, 'onSuccess', () => []);
```

```typescript
// src/main.tsx
import { getUserPostsEffect, $userPostsIsPending, $userPosts, errorHandlerEffect, $notifications } from '@/models';
import { UserPosts } from '@/entity';
import { Toaster } from '@/shared';

export const App = function ({ userId }) {
  const notifications = useStore($notifications);
  const userPostsIsPending = useStore($userPostsIsPending);
  const userPosts = useStore($userPosts);

  useLayoutEffect(() => {
    getUserPostsEffect(userId).catch(errorHandlerEffect);
  }, [userId]);

  return (
    <main>
      <UserPosts list={ userPosts } pending={ userPostsIsPending } />
      <Toaster list={ notifications } />
    </main>
  );
}
```
