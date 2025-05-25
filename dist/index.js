const l = function(s, o) {
  s && o();
}, A = function(s, o = !0) {
  const c = {
    on: (n, f, t) => (f === "onBefore" ? n.onBefore(
      (...e) => l(
        o,
        () => s = t(s, { args: e })
      )
    ) : f === "onSuccess" ? n.onSuccess(
      (e, ...r) => l(
        o,
        () => s = t(s, {
          result: e,
          args: r
        })
      )
    ) : f === "onError" ? n.onError(
      (e, ...r) => l(
        o,
        () => s = t(s, {
          error: e,
          args: r
        })
      )
    ) : n.onFinally(
      (...e) => l(
        o,
        () => s = t(s, { args: e })
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
      return n.subscribe(() => o = !1), c;
    },
    disableOn(n) {
      return n.subscribe(() => () => o = !0), c;
    }
  };
  return c;
}, h = function() {
  return {
    afterAll: [],
    beforeAll: [],
    other: []
  };
}, E = function(s) {
  const o = h(), c = h(), n = h(), f = h(), t = async function(...e) {
    return o.beforeAll.forEach((r) => r(...e)), o.other.forEach((r) => r(...e)), o.afterAll.forEach((r) => r(...e)), s(...e).then((r) => (c.beforeAll.forEach((u) => u(r, ...e)), c.other.forEach((u) => u(r, ...e)), c.afterAll.forEach((u) => u(r, ...e)), r)).catch((r) => {
      throw n.beforeAll.forEach((u) => u(r, ...e)), n.other.forEach((u) => u(r, ...e)), n.afterAll.forEach((u) => u(r, ...e)), r;
    }).finally(() => {
      f.beforeAll.forEach((r) => r(...e)), f.other.forEach((r) => r(...e)), f.afterAll.forEach((r) => r(...e));
    });
  };
  return t.onBefore = (e, r) => {
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
  }, t.onSuccess = (e, r) => {
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
  }, t.onError = (e, r) => {
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
  }, t.onFinally = (e, r) => {
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
  }, t;
}, a = function(s, o, c = !0) {
  let n = o(...s);
  const f = [];
  s.forEach((e) => {
    e.subscribe(() => {
      l(c, () => {
        n = o(...s), f.forEach((r) => r(n));
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
    subscribe(e) {
      return f.push(e), () => {
        const r = f.indexOf(e);
        ~r && f.splice(r, 1);
      };
    },
    enableOn(e) {
      return e.subscribe(() => c = !1), t;
    },
    disableOn(e) {
      return e.subscribe(() => c = !0), t;
    }
  };
  return t;
}, i = function(s) {
  const o = [], c = {
    on: (n, f) => (n === "onBefore" ? f.onBefore(() => o.forEach((t) => t()), s) : n === "onSuccess" ? f.onSuccess(() => o.forEach((t) => t()), s) : n === "onError" ? f.onError(() => o.forEach((t) => t()), s) : f.onFinally(() => o.forEach((t) => t()), s), c),
    subscribe: (n) => {
      o.push(n);
    }
  };
  return c;
}, b = function(s) {
  return () => s;
}, p = function(s) {
  const o = A(!1);
  return s.forEach((c) => {
    o.on(c, "onBefore", b(!0)), o.on(c, "onFinally", b(!1));
  }), o;
};
export {
  a as combine,
  E as effect,
  l as enableCheck,
  i as marker,
  p as pending,
  A as store,
  b as to
};
