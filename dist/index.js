const i = function(n, t) {
  n && t();
}, A = function(n, t = { enabled: !0, instantListenerExecution: !1 }) {
  const l = /* @__PURE__ */ new Set();
  let { enabled: s = !0, instantListenerExecution: c = !1 } = t;
  const o = {
    on: (e, r, f) => (r === "onBefore" ? e.onBefore(
      (...u) => i(
        s,
        () => o.set(
          f(n, { args: u })
        )
      )
    ) : r === "onSuccess" ? e.onSuccess(
      (u, ...a) => i(
        s,
        () => o.set(
          f(n, {
            result: u,
            args: a
          })
        )
      )
    ) : r === "onError" ? e.onError(
      (u, ...a) => i(
        s,
        () => o.set(
          f(n, {
            error: u,
            args: a
          })
        )
      )
    ) : e.onFinally(
      (...u) => i(
        s,
        () => o.set(
          f(n, { args: u })
        )
      )
    ), o),
    get() {
      return n;
    },
    set(e) {
      n = e, l.forEach((r) => r(n));
    },
    subscribe(e) {
      return l.add(e), c && e(n), () => l.delete(e);
    },
    enableOn(e, r) {
      return e.subscribe(() => s = !0), r !== void 0 && o.set(r), o;
    },
    disableOn(e, r) {
      return e.subscribe(() => s = !1), r !== void 0 && o.set(r), o;
    }
  };
  return o;
}, h = function() {
  return {
    afterAll: [],
    beforeAll: [],
    other: []
  };
}, E = function(n) {
  const t = h(), l = h(), s = h(), c = h(), o = async function(...e) {
    return t.beforeAll.forEach((r) => r(...e)), t.other.forEach((r) => r(...e)), t.afterAll.forEach((r) => r(...e)), n(...e).then((r) => (l.beforeAll.forEach((f) => f(r, ...e)), l.other.forEach((f) => f(r, ...e)), l.afterAll.forEach((f) => f(r, ...e)), r)).catch((r) => {
      throw s.beforeAll.forEach((f) => f(r, ...e)), s.other.forEach((f) => f(r, ...e)), s.afterAll.forEach((f) => f(r, ...e)), r;
    }).finally(() => {
      c.beforeAll.forEach((r) => r(...e)), c.other.forEach((r) => r(...e)), c.afterAll.forEach((r) => r(...e));
    });
  };
  return o.onBefore = (e, r) => {
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
  }, o.onSuccess = (e, r) => {
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
  }, o.onError = (e, r) => {
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
  }, o.onFinally = (e, r) => {
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
  }, o;
}, p = function(n, t, l = !0) {
  console.log("Combine", n, t, l);
  let s = t(n);
  const c = [];
  n.forEach((e) => {
    e.subscribe(() => {
      i(l, () => {
        s = t(n), c.forEach((r) => r(s));
      });
    });
  });
  const o = {
    on: () => {
      throw new Error("Cannot call 'on' on combined store");
    },
    get() {
      return s;
    },
    set() {
      throw new Error("Cannot call 'set' on combined store");
    },
    subscribe(e) {
      return c.push(e), () => {
        const r = c.indexOf(e);
        ~r && c.splice(r, 1);
      };
    },
    enableOn(e) {
      return e.subscribe(() => l = !0), o;
    },
    disableOn(e) {
      return e.subscribe(() => l = !1), o;
    }
  };
  return o;
}, d = function(n) {
  const t = [], l = {
    on: (s, c) => (s === "onBefore" ? c.onBefore(() => t.forEach((o) => o()), n) : s === "onSuccess" ? c.onSuccess(() => t.forEach((o) => o()), n) : s === "onError" ? c.onError(() => t.forEach((o) => o()), n) : c.onFinally(() => t.forEach((o) => o()), n), l),
    subscribe: (s) => {
      t.push(s);
    }
  };
  return l;
}, b = function(n) {
  return () => n;
}, w = function(n) {
  const t = A(!1);
  return n.forEach((l) => {
    t.on(l, "onBefore", b(!0)), t.on(l, "onFinally", b(!1));
  }), t;
}, C = function() {
  return (n, { result: t }) => t;
};
export {
  p as combine,
  E as effect,
  i as enableCheck,
  d as marker,
  w as pending,
  C as result,
  A as store,
  b as to
};
