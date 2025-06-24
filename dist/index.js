const u = function(o, c) {
  o && c();
}, b = function(o, c = !0) {
  const f = [], l = {
    on: (n, s, r) => (s === "onBefore" ? n.onBefore(
      (...e) => u(
        c,
        () => {
          o = r(o, { args: e }), f.forEach((t) => t(o));
        }
      )
    ) : s === "onSuccess" ? n.onSuccess(
      (e, ...t) => u(
        c,
        () => {
          o = r(o, {
            result: e,
            args: t
          }), f.forEach((i) => i(o));
        }
      )
    ) : s === "onError" ? n.onError(
      (e, ...t) => u(
        c,
        () => {
          o = r(o, {
            error: e,
            args: t
          }), f.forEach((i) => i(o));
        }
      )
    ) : n.onFinally(
      (...e) => u(
        c,
        () => o = r(o, { args: e })
      )
    ), l),
    get() {
      return o;
    },
    set(n) {
      o = n;
    },
    subscribe(n) {
      return f.push(n), () => {
        const s = f.indexOf(n);
        ~s && f.splice(s, 1);
      };
    },
    enableOn(n) {
      return n.subscribe(() => c = !0), l;
    },
    disableOn(n) {
      return n.subscribe(() => c = !1), l;
    }
  };
  return l;
}, h = function() {
  return {
    afterAll: [],
    beforeAll: [],
    other: []
  };
}, A = function(o) {
  const c = h(), f = h(), l = h(), n = h(), s = async function(...r) {
    return c.beforeAll.forEach((e) => e(...r)), c.other.forEach((e) => e(...r)), c.afterAll.forEach((e) => e(...r)), o(...r).then((e) => (f.beforeAll.forEach((t) => t(e, ...r)), f.other.forEach((t) => t(e, ...r)), f.afterAll.forEach((t) => t(e, ...r)), e)).catch((e) => {
      throw l.beforeAll.forEach((t) => t(e, ...r)), l.other.forEach((t) => t(e, ...r)), l.afterAll.forEach((t) => t(e, ...r)), e;
    }).finally(() => {
      n.beforeAll.forEach((e) => e(...r)), n.other.forEach((e) => e(...r)), n.afterAll.forEach((e) => e(...r));
    });
  };
  return s.onBefore = (r, e) => {
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
  }, s.onSuccess = (r, e) => {
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
  }, s.onError = (r, e) => {
    switch (e) {
      case "beforeAll":
        l.beforeAll.push(r);
        break;
      case "afterAll":
        l.afterAll.push(r);
        break;
      default:
        l.other.push(r);
    }
  }, s.onFinally = (r, e) => {
    switch (e) {
      case "beforeAll":
        n.beforeAll.push(r);
        break;
      case "afterAll":
        n.afterAll.push(r);
        break;
      default:
        n.other.push(r);
    }
  }, s;
}, E = function(o, c, f = !0) {
  let l = c(...o);
  const n = [];
  o.forEach((r) => {
    r.subscribe(() => {
      u(f, () => {
        l = c(...o), n.forEach((e) => e(l));
      });
    });
  });
  const s = {
    on: () => {
      throw new Error("Cannot call 'on' on combined store");
    },
    get() {
      return l;
    },
    set() {
      throw new Error("Cannot call 'set' on combined store");
    },
    subscribe(r) {
      return n.push(r), () => {
        const e = n.indexOf(r);
        ~e && n.splice(e, 1);
      };
    },
    enableOn(r) {
      return r.subscribe(() => f = !1), s;
    },
    disableOn(r) {
      return r.subscribe(() => f = !0), s;
    }
  };
  return s;
}, p = function(o) {
  const c = [], f = {
    on: (l, n) => (l === "onBefore" ? n.onBefore(() => c.forEach((s) => s()), o) : l === "onSuccess" ? n.onSuccess(() => c.forEach((s) => s()), o) : l === "onError" ? n.onError(() => c.forEach((s) => s()), o) : n.onFinally(() => c.forEach((s) => s()), o), f),
    subscribe: (l) => {
      c.push(l);
    }
  };
  return f;
}, a = function(o) {
  return () => o;
}, w = function(o) {
  const c = b(!1);
  return o.forEach((f) => {
    c.on(f, "onBefore", a(!0)), c.on(f, "onFinally", a(!1));
  }), c;
};
export {
  E as combine,
  A as effect,
  u as enableCheck,
  p as marker,
  w as pending,
  b as store,
  a as to
};
