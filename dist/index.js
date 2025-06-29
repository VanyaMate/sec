const u = function(t, n) {
  t && n();
}, a = function(t, n = !0) {
  const f = [], c = {
    on: (o, s, e) => (s === "onBefore" ? o.onBefore(
      (...r) => u(
        n,
        () => c.set(
          e(t, { args: r })
        )
      )
    ) : s === "onSuccess" ? o.onSuccess(
      (r, ...l) => u(
        n,
        () => c.set(
          e(t, {
            result: r,
            args: l
          })
        )
      )
    ) : s === "onError" ? o.onError(
      (r, ...l) => u(
        n,
        () => c.set(
          e(t, {
            error: r,
            args: l
          })
        )
      )
    ) : o.onFinally(
      (...r) => u(
        n,
        () => c.set(
          e(t, { args: r })
        )
      )
    ), c),
    get() {
      return t;
    },
    set(o) {
      t = o, f.forEach((s) => s(t));
    },
    subscribe(o) {
      return f.push(o), () => {
        const s = f.indexOf(o);
        ~s && f.splice(s, 1);
      };
    },
    enableOn(o) {
      return o.subscribe(() => n = !0), c;
    },
    disableOn(o) {
      return o.subscribe(() => n = !1), c;
    }
  };
  return c;
}, h = function() {
  return {
    afterAll: [],
    beforeAll: [],
    other: []
  };
}, b = function(t) {
  const n = h(), f = h(), c = h(), o = h(), s = async function(...e) {
    return n.beforeAll.forEach((r) => r(...e)), n.other.forEach((r) => r(...e)), n.afterAll.forEach((r) => r(...e)), t(...e).then((r) => (f.beforeAll.forEach((l) => l(r, ...e)), f.other.forEach((l) => l(r, ...e)), f.afterAll.forEach((l) => l(r, ...e)), r)).catch((r) => {
      throw c.beforeAll.forEach((l) => l(r, ...e)), c.other.forEach((l) => l(r, ...e)), c.afterAll.forEach((l) => l(r, ...e)), r;
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
        c.beforeAll.push(e);
        break;
      case "afterAll":
        c.afterAll.push(e);
        break;
      default:
        c.other.push(e);
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
}, A = function(t, n, f = !0) {
  console.log("Combine", t, n, f);
  let c = n(t);
  const o = [];
  t.forEach((e) => {
    e.subscribe(() => {
      u(f, () => {
        c = n(t), o.forEach((r) => r(c));
      });
    });
  });
  const s = {
    on: () => {
      throw new Error("Cannot call 'on' on combined store");
    },
    get() {
      return c;
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
      return e.subscribe(() => f = !0), s;
    },
    disableOn(e) {
      return e.subscribe(() => f = !1), s;
    }
  };
  return s;
}, E = function(t) {
  const n = [], f = {
    on: (c, o) => (c === "onBefore" ? o.onBefore(() => n.forEach((s) => s()), t) : c === "onSuccess" ? o.onSuccess(() => n.forEach((s) => s()), t) : c === "onError" ? o.onError(() => n.forEach((s) => s()), t) : o.onFinally(() => n.forEach((s) => s()), t), f),
    subscribe: (c) => {
      n.push(c);
    }
  };
  return f;
}, i = function(t) {
  return () => t;
}, p = function(t) {
  const n = a(!1);
  return t.forEach((f) => {
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
