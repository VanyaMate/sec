let d = 0, A = [];
const E = () => d += 1, p = () => {
  d -= 1, B() && C();
}, B = () => d == 0, y = (o) => {
  B() ? o() : A.push(o);
}, C = () => {
  A.forEach((o) => o()), A.length = 0;
}, i = function(o, n) {
  o && n();
}, k = function(o, n = { enabled: !0, instantListenerExecution: !1 }) {
  const c = /* @__PURE__ */ new Set();
  let l, { enabled: t = !0, instantListenerExecution: f = !1 } = n;
  const e = {
    on: (r, s, a) => (s === "onBefore" ? r.onBefore(
      (...u) => i(
        t,
        () => e.set(
          a(o, { args: u })
        )
      )
    ) : s === "onSuccess" ? r.onSuccess(
      (u, ...b) => i(
        t,
        () => e.set(
          a(o, {
            result: u,
            args: b
          })
        )
      )
    ) : s === "onError" ? r.onError(
      (u, ...b) => i(
        t,
        () => e.set(
          a(o, {
            error: u,
            args: b
          })
        )
      )
    ) : r.onFinally(
      (...u) => i(
        t,
        () => e.set(
          a(o, { args: u })
        )
      )
    ), e),
    get() {
      return o;
    },
    set(r) {
      o = r, y(() => {
        l != o && (l = o, c.forEach((s) => s(o)));
      });
    },
    subscribe(r) {
      return c.add(r), f && r(o), () => c.delete(r);
    },
    enableOn(r, s) {
      return r.subscribe(() => {
        t = !0, s !== void 0 && (E(), queueMicrotask(() => {
          p(), e.set(s);
        }));
      }), e;
    },
    disableOn(r, s) {
      return r.subscribe(() => {
        t = !1, s !== void 0 && (E(), queueMicrotask(() => {
          p(), e.set(s);
        }));
      }), e;
    }
  };
  return e;
}, h = function() {
  return {
    afterAll: [],
    beforeAll: [],
    other: []
  };
}, m = function(o) {
  const n = h(), c = h(), l = h(), t = h(), f = async function(...e) {
    E();
    try {
      return n.beforeAll.forEach((r) => r(...e)), n.other.forEach((r) => r(...e)), n.afterAll.forEach((r) => r(...e)), await o(...e).then((r) => (c.beforeAll.forEach((s) => s(r, ...e)), c.other.forEach((s) => s(r, ...e)), c.afterAll.forEach((s) => s(r, ...e)), r)).catch((r) => {
        throw l.beforeAll.forEach((s) => s(r, ...e)), l.other.forEach((s) => s(r, ...e)), l.afterAll.forEach((s) => s(r, ...e)), r;
      }).finally(() => {
        t.beforeAll.forEach((r) => r(...e)), t.other.forEach((r) => r(...e)), t.afterAll.forEach((r) => r(...e));
      });
    } finally {
      p();
    }
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
        t.beforeAll.push(e);
        break;
      case "afterAll":
        t.afterAll.push(e);
        break;
      default:
        t.other.push(e);
    }
  }, f;
}, S = function(o, n, c = !0) {
  console.log("Combine", o, n, c);
  let l = n(o);
  const t = [];
  o.forEach((e) => {
    e.subscribe(() => {
      i(c, () => {
        l = n(o), t.forEach((r) => r(l));
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
      return t.push(e), () => {
        const r = t.indexOf(e);
        ~r && t.splice(r, 1);
      };
    },
    enableOn(e) {
      return e.subscribe(() => c = !0), f;
    },
    disableOn(e) {
      return e.subscribe(() => c = !1), f;
    }
  };
  return f;
}, x = function(o) {
  const n = [], c = {
    on: (l, t) => (l === "onBefore" ? t.onBefore(() => n.forEach((f) => f()), o) : l === "onSuccess" ? t.onSuccess(() => n.forEach((f) => f()), o) : l === "onError" ? t.onError(() => n.forEach((f) => f()), o) : t.onFinally(() => n.forEach((f) => f()), o), c),
    subscribe: (l) => {
      n.push(l);
    }
  };
  return c;
}, w = function(o) {
  return () => o;
}, F = function(o) {
  const n = k(!1);
  return o.forEach((c) => {
    n.on(c, "onBefore", w(!0)), n.on(c, "onFinally", w(!1));
  }), n;
}, O = function() {
  return (o, { result: n }) => n;
};
export {
  S as combine,
  m as effect,
  i as enableCheck,
  x as marker,
  F as pending,
  O as result,
  k as store,
  w as to
};
