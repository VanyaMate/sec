const u = function(s, o) {
  s && o();
}, a = function(s, o = !0) {
  const c = {
    on: (n, f, t) => (f === "onBefore" ? n.onBefore(
      (...r) => u(
        o,
        () => s = t(s, { args: r })
      )
    ) : f === "onSuccess" ? n.onSuccess(
      (r, ...e) => u(
        o,
        () => s = t(s, {
          result: r,
          args: e
        })
      )
    ) : f === "onError" ? n.onError(
      (r, ...e) => u(
        o,
        () => s = t(s, {
          error: r,
          args: e
        })
      )
    ) : n.onFinally(
      (...r) => u(
        o,
        () => s = t(s, { args: r })
      )
    ), c),
    get() {
      return s;
    },
    set(n) {
      s = n;
    },
    subscribe(n) {
      return () => {
      };
    },
    enableOn(n) {
      return n.subscribe(() => o = !0), c;
    },
    disableOn(n) {
      return n.subscribe(() => o = !1), c;
    }
  };
  return c;
}, h = function() {
  return {
    afterAll: [],
    beforeAll: [],
    other: []
  };
}, b = function(s) {
  const o = h(), c = h(), n = h(), f = h(), t = async function(...r) {
    return o.beforeAll.forEach((e) => e(...r)), o.other.forEach((e) => e(...r)), o.afterAll.forEach((e) => e(...r)), s(...r).then((e) => (c.beforeAll.forEach((l) => l(e, ...r)), c.other.forEach((l) => l(e, ...r)), c.afterAll.forEach((l) => l(e, ...r)), e)).catch((e) => {
      throw n.beforeAll.forEach((l) => l(e, ...r)), n.other.forEach((l) => l(e, ...r)), n.afterAll.forEach((l) => l(e, ...r)), e;
    }).finally(() => {
      f.beforeAll.forEach((e) => e(...r)), f.other.forEach((e) => e(...r)), f.afterAll.forEach((e) => e(...r));
    });
  };
  return t.onBefore = (r, e) => {
    switch (e) {
      case "beforeAll":
        o.beforeAll.push(r);
        break;
      case "afterAll":
        o.afterAll.push(r);
        break;
      default:
        o.other.push(r);
    }
  }, t.onSuccess = (r, e) => {
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
  }, t.onError = (r, e) => {
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
  }, t.onFinally = (r, e) => {
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
  }, t;
}, A = function(s, o, c = !0) {
  let n = o(...s);
  const f = [];
  s.forEach((r) => {
    r.subscribe(() => {
      u(c, () => {
        n = o(...s), f.forEach((e) => e(n));
      });
    });
  });
  const t = {
    on: () => {
      throw new Error("Cannot call 'on' on combined store");
    },
    get() {
      return n;
    },
    set() {
      throw new Error("Cannot call 'set' on combined store");
    },
    subscribe(r) {
      return f.push(r), () => {
        const e = f.indexOf(r);
        ~e && f.splice(e, 1);
      };
    },
    enableOn(r) {
      return r.subscribe(() => c = !1), t;
    },
    disableOn(r) {
      return r.subscribe(() => c = !0), t;
    }
  };
  return t;
}, E = function(s) {
  const o = [], c = {
    on: (n, f) => (n === "onBefore" ? f.onBefore(() => o.forEach((t) => t()), s) : n === "onSuccess" ? f.onSuccess(() => o.forEach((t) => t()), s) : n === "onError" ? f.onError(() => o.forEach((t) => t()), s) : f.onFinally(() => o.forEach((t) => t()), s), c),
    subscribe: (n) => {
      o.push(n);
    }
  };
  return c;
}, i = function(s) {
  return () => s;
}, p = function(s) {
  const o = a(!1);
  return s.forEach((c) => {
    o.on(c, "onBefore", i(!0)), o.on(c, "onFinally", i(!1));
  }), o;
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
