let A = 0, E = /* @__PURE__ */ new Map();
const w = () => A += 1, B = () => {
  A -= 1, S() && k();
}, S = () => A === 0, p = (o, t) => {
  w(), E.set(o, t), queueMicrotask(B);
}, k = () => {
  E.forEach((o) => o()), E.clear();
}, i = function(o, t) {
  o && t();
}, C = function(o, t = { enabled: !0, instantListenerExecution: !1 }) {
  const f = /* @__PURE__ */ new Set();
  let s = o, { enabled: c = !0, instantListenerExecution: l = !1 } = t;
  const r = {
    on: (e, n, u) => (n === "onBefore" ? e.onBefore(
      (...a) => i(
        c,
        () => r.set(
          u(o, { args: a })
        )
      )
    ) : n === "onSuccess" ? e.onSuccess(
      (a, ...b) => i(
        c,
        () => r.set(
          u(o, {
            result: a,
            args: b
          })
        )
      )
    ) : n === "onError" ? e.onError(
      (a, ...b) => i(
        c,
        () => r.set(
          u(o, {
            error: a,
            args: b
          })
        )
      )
    ) : e.onFinally(
      (...a) => i(
        c,
        () => r.set(
          u(o, { args: a })
        )
      )
    ), r),
    get() {
      return o;
    },
    set(e) {
      o = e, p(this, () => {
        s !== o && (s = o, f.forEach((n) => n(o)));
      });
    },
    subscribe(e) {
      return f.add(e), l && e(o), () => f.delete(e);
    },
    enableOn(e, n) {
      return e.subscribe(() => {
        c = !0, n !== void 0 && r.set(n);
      }), r;
    },
    disableOn(e, n) {
      return e.subscribe(() => {
        c = !1, n !== void 0 && r.set(n);
      }), r;
    }
  };
  return r;
}, h = function() {
  return {
    afterAll: [],
    beforeAll: [],
    other: []
  };
}, m = function(o) {
  const t = h(), f = h(), s = h(), c = h(), l = async function(...r) {
    return t.beforeAll.forEach((e) => e(...r)), t.other.forEach((e) => e(...r)), t.afterAll.forEach((e) => e(...r)), o(...r).then((e) => (f.beforeAll.forEach((n) => n(e, ...r)), f.other.forEach((n) => n(e, ...r)), f.afterAll.forEach((n) => n(e, ...r)), e)).catch((e) => {
      throw s.beforeAll.forEach((n) => n(e, ...r)), s.other.forEach((n) => n(e, ...r)), s.afterAll.forEach((n) => n(e, ...r)), e;
    }).finally(() => {
      c.beforeAll.forEach((e) => e(...r)), c.other.forEach((e) => e(...r)), c.afterAll.forEach((e) => e(...r));
    });
  };
  return l.onBefore = (r, e) => {
    switch (e) {
      case "beforeAll":
        t.beforeAll.push(r);
        break;
      case "afterAll":
        t.afterAll.push(r);
        break;
      default:
        t.other.push(r);
    }
  }, l.onSuccess = (r, e) => {
    switch (e) {
      case "beforeAll":
        f.beforeAll.push(r);
        break;
      case "afterAll":
        f.afterAll.push(r);
        break;
      default:
        f.other.push(r);
    }
  }, l.onError = (r, e) => {
    switch (e) {
      case "beforeAll":
        s.beforeAll.push(r);
        break;
      case "afterAll":
        s.afterAll.push(r);
        break;
      default:
        s.other.push(r);
    }
  }, l.onFinally = (r, e) => {
    switch (e) {
      case "beforeAll":
        c.beforeAll.push(r);
        break;
      case "afterAll":
        c.afterAll.push(r);
        break;
      default:
        c.other.push(r);
    }
  }, l;
}, y = function(o, t, f = { enabled: !0, instantListenerExecution: !1 }) {
  let s, c;
  s = c = t(o);
  const l = /* @__PURE__ */ new Set();
  let { enabled: r = !0, instantListenerExecution: e = !1 } = f;
  o.forEach((u) => {
    u.subscribe(() => {
      i(r, () => {
        p(n, () => {
          s = t(o), s !== c && (c = s, l.forEach((a) => a(s)));
        });
      });
    });
  });
  const n = {
    on: () => {
      throw new Error("Cannot call 'on' on combined store");
    },
    get() {
      return s;
    },
    set() {
      throw new Error("Cannot call 'set' on combined store");
    },
    subscribe(u) {
      return l.add(u), e && u(s), () => l.delete(u);
    },
    enableOn(u) {
      return u.subscribe(() => r = !0), n;
    },
    disableOn(u) {
      return u.subscribe(() => r = !1), n;
    }
  };
  return n;
}, x = function(o) {
  const t = [], f = {
    on: (s, c) => (s === "onBefore" ? c.onBefore(() => t.forEach((l) => l()), o) : s === "onSuccess" ? c.onSuccess(() => t.forEach((l) => l()), o) : s === "onError" ? c.onError(() => t.forEach((l) => l()), o) : c.onFinally(() => t.forEach((l) => l()), o), f),
    subscribe: (s) => {
      t.push(s);
    }
  };
  return f;
}, d = function(o) {
  return () => o;
}, F = function(o) {
  const t = C(!1);
  return o.forEach((f) => {
    t.on(f, "onBefore", d(!0)), t.on(f, "onFinally", d(!1));
  }), t;
}, L = function() {
  return (o, { result: t }) => t;
};
export {
  y as combine,
  m as effect,
  i as enableCheck,
  x as marker,
  F as pending,
  L as result,
  C as store,
  d as to
};
