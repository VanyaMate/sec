let E = 0, A = /* @__PURE__ */ new Map();
const w = () => E += 1, B = () => {
  E -= 1, S() && k();
}, S = () => E == 0, d = (o, n) => {
  w(), A.set(o, n), queueMicrotask(B);
}, k = () => {
  A.forEach((o) => o()), A.clear();
}, a = function(o, n) {
  o && n();
}, C = function(o, n = { enabled: !0, instantListenerExecution: !1 }) {
  const c = /* @__PURE__ */ new Set();
  let l = o, { enabled: s = !0, instantListenerExecution: f = !1 } = n;
  const e = {
    on: (r, t, h) => (t === "onBefore" ? r.onBefore(
      (...u) => a(
        s,
        () => e.set(
          h(o, { args: u })
        )
      )
    ) : t === "onSuccess" ? r.onSuccess(
      (u, ...b) => a(
        s,
        () => e.set(
          h(o, {
            result: u,
            args: b
          })
        )
      )
    ) : t === "onError" ? r.onError(
      (u, ...b) => a(
        s,
        () => e.set(
          h(o, {
            error: u,
            args: b
          })
        )
      )
    ) : r.onFinally(
      (...u) => a(
        s,
        () => e.set(
          h(o, { args: u })
        )
      )
    ), e),
    get() {
      return o;
    },
    set(r) {
      o = r, d(this, () => {
        l != o && (l = o, c.forEach((t) => t(o)));
      });
    },
    subscribe(r) {
      return c.add(r), f && r(o), () => c.delete(r);
    },
    enableOn(r, t) {
      return r.subscribe(() => {
        s = !0, t !== void 0 && e.set(t);
      }), e;
    },
    disableOn(r, t) {
      return r.subscribe(() => {
        s = !1, t !== void 0 && e.set(t);
      }), e;
    }
  };
  return e;
}, i = function() {
  return {
    afterAll: [],
    beforeAll: [],
    other: []
  };
}, m = function(o) {
  const n = i(), c = i(), l = i(), s = i(), f = async function(...e) {
    return n.beforeAll.forEach((r) => r(...e)), n.other.forEach((r) => r(...e)), n.afterAll.forEach((r) => r(...e)), o(...e).then((r) => (c.beforeAll.forEach((t) => t(r, ...e)), c.other.forEach((t) => t(r, ...e)), c.afterAll.forEach((t) => t(r, ...e)), r)).catch((r) => {
      throw l.beforeAll.forEach((t) => t(r, ...e)), l.other.forEach((t) => t(r, ...e)), l.afterAll.forEach((t) => t(r, ...e)), r;
    }).finally(() => {
      s.beforeAll.forEach((r) => r(...e)), s.other.forEach((r) => r(...e)), s.afterAll.forEach((r) => r(...e));
    });
  };
  return f.onBefore = (e, r) => {
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
  }, f.onSuccess = (e, r) => {
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
  }, f.onError = (e, r) => {
    switch (r) {
      case "beforeAll":
        l.beforeAll.push(e);
        break;
      case "afterAll":
        l.afterAll.push(e);
        break;
      default:
        l.other.push(e);
    }
  }, f.onFinally = (e, r) => {
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
  }, f;
}, y = function(o, n, c = !0) {
  let l = n(o);
  const s = /* @__PURE__ */ new Set();
  o.forEach((e) => {
    e.subscribe(() => {
      a(c, () => {
        d(f, () => {
          l = n(o), s.forEach((r) => r(l));
        });
      });
    });
  });
  const f = {
    on: () => {
      throw new Error("Cannot call 'on' on combined store");
    },
    get() {
      return l;
    },
    set() {
      throw new Error("Cannot call 'set' on combined store");
    },
    subscribe(e) {
      return s.add(e), e(l), () => s.delete(e);
    },
    enableOn(e) {
      return e.subscribe(() => c = !0), f;
    },
    disableOn(e) {
      return e.subscribe(() => c = !1), f;
    }
  };
  return f;
}, F = function(o) {
  const n = [], c = {
    on: (l, s) => (l === "onBefore" ? s.onBefore(() => n.forEach((f) => f()), o) : l === "onSuccess" ? s.onSuccess(() => n.forEach((f) => f()), o) : l === "onError" ? s.onError(() => n.forEach((f) => f()), o) : s.onFinally(() => n.forEach((f) => f()), o), c),
    subscribe: (l) => {
      n.push(l);
    }
  };
  return c;
}, p = function(o) {
  return () => o;
}, x = function(o) {
  const n = C(!1);
  return o.forEach((c) => {
    n.on(c, "onBefore", p(!0)), n.on(c, "onFinally", p(!1));
  }), n;
}, L = function() {
  return (o, { result: n }) => n;
};
export {
  y as combine,
  m as effect,
  a as enableCheck,
  F as marker,
  x as pending,
  L as result,
  C as store,
  p as to
};
