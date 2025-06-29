const u = function(c, n) {
  c && n();
}, a = function(c, n = !0) {
  const f = [], t = {
    on: (s, o, e) => (o === "onBefore" ? s.onBefore(
      (...r) => u(
        n,
        () => t.set(
          e(c, { args: r })
        )
      )
    ) : o === "onSuccess" ? s.onSuccess(
      (r, ...l) => u(
        n,
        () => t.set(
          e(c, {
            result: r,
            args: l
          })
        )
      )
    ) : o === "onError" ? s.onError(
      (r, ...l) => u(
        n,
        () => t.set(
          e(c, {
            error: r,
            args: l
          })
        )
      )
    ) : s.onFinally(
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
    set(s) {
      c = s, f.forEach((o) => o(c));
    },
    subscribe(s) {
      return f.push(s), () => {
        const o = f.indexOf(s);
        ~o && f.splice(o, 1);
      };
    },
    enableOn(s, o) {
      return s.subscribe(() => n = !0), o !== void 0 && t.set(o), t;
    },
    disableOn(s, o) {
      return s.subscribe(() => n = !1), o !== void 0 && t.set(o), t;
    }
  };
  return t;
}, i = function() {
  return {
    afterAll: [],
    beforeAll: [],
    other: []
  };
}, b = function(c) {
  const n = i(), f = i(), t = i(), s = i(), o = async function(...e) {
    return n.beforeAll.forEach((r) => r(...e)), n.other.forEach((r) => r(...e)), n.afterAll.forEach((r) => r(...e)), c(...e).then((r) => (f.beforeAll.forEach((l) => l(r, ...e)), f.other.forEach((l) => l(r, ...e)), f.afterAll.forEach((l) => l(r, ...e)), r)).catch((r) => {
      throw t.beforeAll.forEach((l) => l(r, ...e)), t.other.forEach((l) => l(r, ...e)), t.afterAll.forEach((l) => l(r, ...e)), r;
    }).finally(() => {
      s.beforeAll.forEach((r) => r(...e)), s.other.forEach((r) => r(...e)), s.afterAll.forEach((r) => r(...e));
    });
  };
  return o.onBefore = (e, r) => {
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
  }, o.onSuccess = (e, r) => {
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
  }, o.onError = (e, r) => {
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
  }, o.onFinally = (e, r) => {
    switch (r) {
      case "beforeAll":
        s.beforeAll.push(e);
        break;
      case "afterAll":
        s.afterAll.push(e);
        break;
      default:
        s.other.push(e);
    }
  }, o;
}, A = function(c, n, f = !0) {
  console.log("Combine", c, n, f);
  let t = n(c);
  const s = [];
  c.forEach((e) => {
    e.subscribe(() => {
      u(f, () => {
        t = n(c), s.forEach((r) => r(t));
      });
    });
  });
  const o = {
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
      return s.push(e), () => {
        const r = s.indexOf(e);
        ~r && s.splice(r, 1);
      };
    },
    enableOn(e) {
      return e.subscribe(() => f = !0), o;
    },
    disableOn(e) {
      return e.subscribe(() => f = !1), o;
    }
  };
  return o;
}, E = function(c) {
  const n = [], f = {
    on: (t, s) => (t === "onBefore" ? s.onBefore(() => n.forEach((o) => o()), c) : t === "onSuccess" ? s.onSuccess(() => n.forEach((o) => o()), c) : t === "onError" ? s.onError(() => n.forEach((o) => o()), c) : s.onFinally(() => n.forEach((o) => o()), c), f),
    subscribe: (t) => {
      n.push(t);
    }
  };
  return f;
}, h = function(c) {
  return () => c;
}, p = function(c) {
  const n = a(!1);
  return c.forEach((f) => {
    n.on(f, "onBefore", h(!0)), n.on(f, "onFinally", h(!1));
  }), n;
}, w = function() {
  return (c, { result: n }) => n;
};
export {
  A as combine,
  b as effect,
  u as enableCheck,
  E as marker,
  p as pending,
  w as result,
  a as store,
  h as to
};
