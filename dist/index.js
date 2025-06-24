const u = function(c, n) {
  c && n();
}, a = function(c, n = !0) {
  const f = [], t = {
    on: (o, s, e) => (s === "onBefore" ? o.onBefore(
      (...r) => u(
        n,
        () => t.set(
          e(c, { args: r })
        )
      )
    ) : s === "onSuccess" ? o.onSuccess(
      (r, ...l) => u(
        n,
        () => t.set(
          e(c, {
            result: r,
            args: l
          })
        )
      )
    ) : s === "onError" ? o.onError(
      (r, ...l) => u(
        n,
        () => t.set(
          e(c, {
            error: r,
            args: l
          })
        )
      )
    ) : o.onFinally(
      (...r) => u(
        n,
        () => t.set(
          e(c, { args: r })
        )
      )
    ), t),
    get() {
      return c;
    },
    set(o) {
      c = o, f.forEach((s) => s(c));
    },
    subscribe(o) {
      return f.push(o), () => {
        const s = f.indexOf(o);
        ~s && f.splice(s, 1);
      };
    },
    enableOn(o) {
      return o.subscribe(() => n = !0), t;
    },
    disableOn(o) {
      return o.subscribe(() => n = !1), t;
    }
  };
  return t;
}, h = function() {
  return {
    afterAll: [],
    beforeAll: [],
    other: []
  };
}, b = function(c) {
  const n = h(), f = h(), t = h(), o = h(), s = async function(...e) {
    return n.beforeAll.forEach((r) => r(...e)), n.other.forEach((r) => r(...e)), n.afterAll.forEach((r) => r(...e)), c(...e).then((r) => (f.beforeAll.forEach((l) => l(r, ...e)), f.other.forEach((l) => l(r, ...e)), f.afterAll.forEach((l) => l(r, ...e)), r)).catch((r) => {
      throw t.beforeAll.forEach((l) => l(r, ...e)), t.other.forEach((l) => l(r, ...e)), t.afterAll.forEach((l) => l(r, ...e)), r;
    }).finally(() => {
      o.beforeAll.forEach((r) => r(...e)), o.other.forEach((r) => r(...e)), o.afterAll.forEach((r) => r(...e));
    });
  };
  return s.onBefore = (e, r) => {
    switch (r) {
      case "beforeAll":
        n.beforeAll.push(e);
        break;
      case "afterAll":
        n.afterAll.push(e);
        break;
      default:
        n.other.push(e);
    }
  }, s.onSuccess = (e, r) => {
    switch (r) {
      case "beforeAll":
        f.beforeAll.push(e);
        break;
      case "afterAll":
        f.afterAll.push(e);
        break;
      default:
        f.other.push(e);
    }
  }, s.onError = (e, r) => {
    switch (r) {
      case "beforeAll":
        t.beforeAll.push(e);
        break;
      case "afterAll":
        t.afterAll.push(e);
        break;
      default:
        t.other.push(e);
    }
  }, s.onFinally = (e, r) => {
    switch (r) {
      case "beforeAll":
        o.beforeAll.push(e);
        break;
      case "afterAll":
        o.afterAll.push(e);
        break;
      default:
        o.other.push(e);
    }
  }, s;
}, A = function(c, n, f = !0) {
  let t = n(...c);
  const o = [];
  c.forEach((e) => {
    e.subscribe(() => {
      u(f, () => {
        t = n(...c), o.forEach((r) => r(t));
      });
    });
  });
  const s = {
    on: () => {
      throw new Error("Cannot call 'on' on combined store");
    },
    get() {
      return t;
    },
    set() {
      throw new Error("Cannot call 'set' on combined store");
    },
    subscribe(e) {
      return o.push(e), () => {
        const r = o.indexOf(e);
        ~r && o.splice(r, 1);
      };
    },
    enableOn(e) {
      return e.subscribe(() => f = !1), s;
    },
    disableOn(e) {
      return e.subscribe(() => f = !0), s;
    }
  };
  return s;
}, E = function(c) {
  const n = [], f = {
    on: (t, o) => (t === "onBefore" ? o.onBefore(() => n.forEach((s) => s()), c) : t === "onSuccess" ? o.onSuccess(() => n.forEach((s) => s()), c) : t === "onError" ? o.onError(() => n.forEach((s) => s()), c) : o.onFinally(() => n.forEach((s) => s()), c), f),
    subscribe: (t) => {
      n.push(t);
    }
  };
  return f;
}, i = function(c) {
  return () => c;
}, p = function(c) {
  const n = a(!1);
  return c.forEach((f) => {
    n.on(f, "onBefore", i(!0)), n.on(f, "onFinally", i(!1));
  }), n;
};
export {
  A as combine,
  b as effect,
  u as enableCheck,
  E as marker,
  p as pending,
  a as store,
  i as to
};
