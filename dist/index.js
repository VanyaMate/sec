let A = 0, E = /* @__PURE__ */ new Map();
const w = () => A += 1, B = () => {
  A -= 1, S() && k();
}, S = () => A === 0, p = (n, o) => {
  w(), E.set(n, o), queueMicrotask(B);
}, k = () => {
  E.forEach((n) => n()), E.clear();
}, i = function(n, o) {
  n && o();
}, y = function(n, o = { enabled: !0, instantListenerExecution: !1 }) {
  const f = /* @__PURE__ */ new Set();
  let s = n, { enabled: c = !0, instantListenerExecution: u = !1 } = o;
  const l = {
    on: (e, r, t) => (r === "onBefore" ? e.onBefore(
      (...a) => i(
        c,
        () => l.set(
          t(n, { args: a })
        )
      )
    ) : r === "onSuccess" ? e.onSuccess(
      (a, ...b) => i(
        c,
        () => l.set(
          t(n, {
            result: a,
            args: b
          })
        )
      )
    ) : r === "onError" ? e.onError(
      (a, ...b) => i(
        c,
        () => l.set(
          t(n, {
            error: a,
            args: b
          })
        )
      )
    ) : e.onFinally(
      (...a) => i(
        c,
        () => l.set(
          t(n, { args: a })
        )
      )
    ), l),
    get() {
      return n;
    },
    set(e) {
      n = e, p(this, () => {
        s !== n && (s = n, f.forEach((r) => r(n)));
      });
    },
    subscribe(e) {
      return f.add(e), u && e(n), () => f.delete(e);
    },
    enableOn(e, r) {
      return e.subscribe(() => {
        c = !0, r !== void 0 && l.set(r);
      }), l;
    },
    disableOn(e, r) {
      return e.subscribe(() => {
        c = !1, r !== void 0 && l.set(r);
      }), l;
    }
  };
  return l;
}, h = function() {
  return {
    afterAll: [],
    beforeAll: [],
    other: []
  };
}, C = function(n) {
  const o = h(), f = h(), s = h(), c = h(), u = n ?? (async (e) => e), l = async function(...e) {
    return o.beforeAll.forEach((r) => r(...e)), o.other.forEach((r) => r(...e)), o.afterAll.forEach((r) => r(...e)), u(...e).then((r) => (f.beforeAll.forEach((t) => t(r, ...e)), f.other.forEach((t) => t(r, ...e)), f.afterAll.forEach((t) => t(r, ...e)), r)).catch((r) => {
      throw s.beforeAll.forEach((t) => t(r, ...e)), s.other.forEach((t) => t(r, ...e)), s.afterAll.forEach((t) => t(r, ...e)), r;
    }).finally(() => {
      c.beforeAll.forEach((r) => r(...e)), c.other.forEach((r) => r(...e)), c.afterAll.forEach((r) => r(...e));
    });
  };
  return l.onBefore = (e, r) => {
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
  }, l.onSuccess = (e, r) => {
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
  }, l.onError = (e, r) => {
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
  }, l.onFinally = (e, r) => {
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
  }, l;
}, m = function(n, o, f = { enabled: !0, instantListenerExecution: !1 }) {
  let s, c;
  s = c = o(n);
  const u = /* @__PURE__ */ new Set();
  let { enabled: l = !0, instantListenerExecution: e = !1 } = f;
  n.forEach((t) => {
    t.subscribe(() => {
      i(l, () => {
        p(r, () => {
          s = o(n), s !== c && (c = s, u.forEach((a) => a(s)));
        });
      });
    });
  });
  const r = {
    on: () => {
      throw new Error("Cannot call 'on' on combined store");
    },
    get() {
      return s;
    },
    set() {
      throw new Error("Cannot call 'set' on combined store");
    },
    subscribe(t) {
      return u.add(t), e && t(s), () => u.delete(t);
    },
    enableOn(t) {
      return t.subscribe(() => l = !0), r;
    },
    disableOn(t) {
      return t.subscribe(() => l = !1), r;
    }
  };
  return r;
}, x = function(n) {
  const o = [], f = {
    on: (s, c) => (s === "onBefore" ? c.onBefore(() => o.forEach((u) => u()), n) : s === "onSuccess" ? c.onSuccess(() => o.forEach((u) => u()), n) : s === "onError" ? c.onError(() => o.forEach((u) => u()), n) : c.onFinally(() => o.forEach((u) => u()), n), f),
    subscribe: (s) => {
      o.push(s);
    }
  };
  return f;
}, d = function(n) {
  return () => n;
}, F = function(n) {
  const o = y(!1);
  return n.forEach((f) => {
    o.on(f, "onBefore", d(!0)), o.on(f, "onFinally", d(!1));
  }), o;
}, L = function() {
  return (n, { result: o }) => o;
};
export {
  m as combine,
  C as effect,
  i as enableCheck,
  x as marker,
  F as pending,
  L as result,
  y as store,
  d as to
};
