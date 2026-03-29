let A = 0, E = /* @__PURE__ */ new Map();
const w = () => A += 1, B = () => {
  A -= 1, S() && k();
}, S = () => A === 0, p = (o, t) => {
  w(), E.set(o, t), queueMicrotask(B);
}, k = () => {
  E.forEach((o) => o()), E.clear();
}, i = function(o, t) {
  o && t();
}, C = function(o, t = { enabled: !0, instantListenerExecution: !0 }) {
  const u = /* @__PURE__ */ new Set();
  let s = o, { enabled: c = !0, instantListenerExecution: l = !0 } = t;
  const r = {
    on: (e, n, f) => (n === "onBefore" ? e.onBefore(
      (...a) => i(
        c,
        () => r.set(
          f(o, { args: a })
        )
      )
    ) : n === "onSuccess" ? e.onSuccess(
      (a, ...b) => i(
        c,
        () => r.set(
          f(o, {
            result: a,
            args: b
          })
        )
      )
    ) : n === "onError" ? e.onError(
      (a, ...b) => i(
        c,
        () => r.set(
          f(o, {
            error: a,
            args: b
          })
        )
      )
    ) : e.onFinally(
      (...a) => i(
        c,
        () => r.set(
          f(o, { args: a })
        )
      )
    ), r),
    get() {
      return o;
    },
    set(e) {
      o = e, p(this, () => {
        s !== o && (s = o, u.forEach((n) => n(o)));
      });
    },
    subscribe(e, n = !0) {
      return u.add(e), n && l && e(o), () => u.delete(e);
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
  const t = h(), u = h(), s = h(), c = h(), l = async function(...r) {
    return t.beforeAll.forEach((e) => e(...r)), t.other.forEach((e) => e(...r)), t.afterAll.forEach((e) => e(...r)), o(...r).then((e) => (u.beforeAll.forEach((n) => n(e, ...r)), u.other.forEach((n) => n(e, ...r)), u.afterAll.forEach((n) => n(e, ...r)), e)).catch((e) => {
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
        u.beforeAll.push(r);
        break;
      case "afterAll":
        u.afterAll.push(r);
        break;
      default:
        u.other.push(r);
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
}, y = function(o, t, u = { enabled: !0, instantListenerExecution: !0 }) {
  let s, c;
  s = c = t(o);
  const l = /* @__PURE__ */ new Set();
  let { enabled: r = !0, instantListenerExecution: e = !0 } = u;
  o.forEach((f) => {
    f.subscribe(() => {
      i(r, () => {
        p(n, () => {
          s = t(o), s !== c && (c = s, l.forEach((a) => a(s)));
        });
      });
    }, !1);
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
    subscribe(f, a = !0) {
      return l.add(f), a && e && f(s), () => l.delete(f);
    },
    enableOn(f) {
      return f.subscribe(() => r = !0), n;
    },
    disableOn(f) {
      return f.subscribe(() => r = !1), n;
    }
  };
  return n;
}, x = function(o) {
  const t = [], u = {
    on: (s, c) => (s === "onBefore" ? c.onBefore(() => t.forEach((l) => l()), o) : s === "onSuccess" ? c.onSuccess(() => t.forEach((l) => l()), o) : s === "onError" ? c.onError(() => t.forEach((l) => l()), o) : c.onFinally(() => t.forEach((l) => l()), o), u),
    subscribe: (s) => {
      t.push(s);
    }
  };
  return u;
}, d = function(o) {
  return () => o;
}, F = function(o) {
  const t = C(!1);
  return o.forEach((u) => {
    t.on(u, "onBefore", d(!0)), t.on(u, "onFinally", d(!1));
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
