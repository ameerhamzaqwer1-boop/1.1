/* Kitchen Craft PK — storefront logic (no libraries needed) */
(function () {
  "use strict";

  var S = window.SHOP || {};
  var WA = String(S.whatsapp || "923019088013").replace(/\D/g, "");
  var CUR = S.currency || "Rs";
  var STORE = S.name || "Kitchen Craft PK";

  var $ = function (s, el) { return (el || document).querySelector(s); };
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  var money = function (n) { return CUR + " " + Number(n).toLocaleString("en-US"); };
  var waLink = function (text) { return "https://wa.me/" + WA + "?text=" + encodeURIComponent(text); };

  var state = { products: [], cat: "All", q: "", cart: {} }; // cart: { id: qty }
  var store = {
    get: function (k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  /* ---------- Static bits from config ---------- */
  $("#brandName").textContent = STORE;
  if (S.tagline) $("#brandTag").textContent = S.tagline;
  if (S.logo) $("#brandMark").innerHTML = '<img src="' + esc(S.logo) + '" alt="" width="44" height="44">';
  var hello = "Assalam o Alaikum " + STORE + "! Mujhe kuch items ke bare mein poochna hai.";
  ["#topWa", "#heroWa", "#footWa", "#fab", "#emptyWa"].forEach(function (id) { $(id).href = waLink(hello); });
  ["#topPhone", "#footPhone"].forEach(function (id) { $(id).textContent = S.phoneDisplay || S.whatsapp; });
  $("#year").textContent = new Date().getFullYear();

  /* ---------- Load products ---------- */
  function norm(p, i) {
    var d = p.details;
    if (typeof d === "string") d = d.split(/\n|;/).map(function (x) { return x.trim(); }).filter(Boolean);
    var price = (p.price === null || p.price === undefined || p.price === "") ? null : Number(p.price);
    return {
      id: String(p.id != null ? p.id : "i" + i),
      name: p.name || "Untitled item",
      subtitle: p.subtitle || "",
      category: String(p.category || "Other").trim(),
      brand: p.brand || "",
      price: isNaN(price) ? null : price,
      image: p.image || "",
      details: Array.isArray(d) ? d : [],
      inStock: !(p.in_stock === false || p.inStock === false)
    };
  }

  function loadProducts() {
    var fromFile = function () {
      return fetch("products.json", { cache: "no-cache" }).then(function (r) { return r.json(); });
    };
    if (S.supabaseUrl && S.supabaseAnonKey) {
      var url = S.supabaseUrl.replace(/\/$/, "") + "/rest/v1/products?select=*&order=sort.asc,created_at.desc";
      return fetch(url, { headers: { apikey: S.supabaseAnonKey, Authorization: "Bearer " + S.supabaseAnonKey } })
        .then(function (r) { if (!r.ok) throw new Error("supabase " + r.status); return r.json(); })
        .then(function (d) { if (!Array.isArray(d) || !d.length) throw new Error("empty"); return d; })
        .catch(function () { return fromFile(); });
    }
    return fromFile();
  }

  /* ---------- Helpers ---------- */
  function byId(id) { return state.products.filter(function (p) { return p.id === id; })[0]; }
  function categories() {
    var seen = [], counts = {};
    state.products.forEach(function (p) {
      if (!counts[p.category]) { counts[p.category] = 0; seen.push(p.category); }
      counts[p.category]++;
    });
    return { list: seen, counts: counts };
  }
  function visible() {
    var q = state.q.trim().toLowerCase();
    return state.products.filter(function (p) {
      if (state.cat !== "All" && p.category !== state.cat) return false;
      if (!q) return true;
      var hay = [p.name, p.subtitle, p.brand, p.category].concat(p.details).join(" ").toLowerCase();
      return q.split(/\s+/).every(function (w) { return hay.indexOf(w) > -1; });
    });
  }
  function singleMessage(p, qty) {
    var t = "Assalam o Alaikum " + STORE + "!\nMujhe yeh item order karna hai:\n\n";
    t += (qty || 1) + " x " + p.name + (p.brand ? " (" + p.brand + ")" : "");
    if (p.price != null) t += " - " + money(p.price);
    t += "\n\nPrice aur delivery ki details bata dein. Shukriya.";
    return t;
  }

  /* ---------- Render: tabs, grid, footer links ---------- */
  function renderTabs() {
    var c = categories();
    var all = ["All"].concat(c.list);
    $("#tabs").innerHTML = all.map(function (name) {
      var n = name === "All" ? state.products.length : c.counts[name];
      return '<button class="tab" role="tab" type="button" data-cat="' + esc(name) + '" aria-selected="' +
        (state.cat === name) + '">' + esc(name) + "<small>" + n + "</small></button>";
    }).join("");
    $("#footCats").innerHTML = c.list.map(function (name) {
      return '<li><button class="catlink" type="button" data-cat="' + esc(name) + '">' + esc(name) + "</button></li>";
    }).join("");
  }

  function cardHTML(p) {
    var img = p.image
      ? '<img src="' + esc(p.image) + '" alt="' + esc(p.name) + '" loading="lazy" width="440" height="550">'
      : '<span class="niche__blank" aria-hidden="true">' + esc(p.name.charAt(0)) + "</span>";
    var info = "";
    if (p.brand || p.details.length) {
      info = '<span class="niche__info">' + (p.brand ? "<b>" + esc(p.brand) + "</b>" : "") +
        (p.details.length ? "<ul>" + p.details.slice(0, 3).map(function (d) { return "<li>" + esc(d) + "</li>"; }).join("") + "</ul>" : "") +
        "</span>";
    }
    var price = p.price != null
      ? '<p class="card__price">' + money(p.price) + "</p>"
      : '<p class="card__price ask">Ask for price</p>';
    return '<article class="card' + (p.inStock ? "" : " is-soldout") + '" data-id="' + esc(p.id) + '">' +
      '<button class="niche" type="button" data-act="open" aria-label="See details: ' + esc(p.name) + '">' + img + info +
      (p.inStock ? "" : '<span class="niche__soldout">Sold out</span>') + "</button>" +
      '<div class="card__body">' +
      (p.brand ? '<p class="card__brand">' + esc(p.brand) + "</p>" : "") +
      '<h3 class="card__name"><button type="button" data-act="open">' + esc(p.name) + "</button></h3>" +
      (p.subtitle ? '<p class="card__sub">' + esc(p.subtitle) + "</p>" : "") + price +
      '<div class="card__actions">' +
      '<a class="btn btn--wa" href="' + waLink(singleMessage(p, 1)) + '" target="_blank" rel="noopener">' +
      '<svg width="18" height="18"><use href="#i-wa"/></svg><span class="lg">Order on WhatsApp</span><span class="sm">Order</span></a>' +
      '<button class="addbtn" type="button" data-act="add" aria-label="Add ' + esc(p.name) + ' to order list"><svg width="20" height="20"><use href="#i-plus"/></svg></button>' +
      "</div></div></article>";
  }

  function renderGrid() {
    var list = visible();
    $("#catTitle").textContent = state.cat === "All" ? "All items" : state.cat;
    $("#catCount").textContent = list.length + (list.length === 1 ? " item" : " items");
    $("#grid").innerHTML = list.map(cardHTML).join("");
    $("#empty").hidden = list.length > 0;
  }

  function renderPlates() {
    var withImg = state.products.filter(function (p) { return p.image; });
    if (!withImg.length) { $("#plates").hidden = true; return; }
    var pref = ["p01", "p02", "p12"].map(byId).filter(function (p) { return p && p.image; });
    var pick = pref.length === 3 ? pref : [0, 1, 2].map(function (i) { return withImg[Math.floor(i * withImg.length / 3)]; });
    var cls = ["a", "b", "c"];
    $("#plates").innerHTML = pick.map(function (p, i) {
      return '<div class="plate plate--' + cls[i] + '"><img src="' + esc(p.image) + '" alt="" loading="eager"></div>';
    }).join("");
  }

  /* ---------- Toast ---------- */
  var toastT;
  function toast(msg) {
    var t = $("#toast");
    t.textContent = msg; t.classList.add("is-on");
    clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove("is-on"); }, 1800);
  }

  /* ---------- Order list (cart) ---------- */
  function saveCart() { store.set("kcpk_cart_v1", state.cart); }
  function cartItems() {
    return Object.keys(state.cart).map(function (id) { return { p: byId(id), qty: state.cart[id] }; })
      .filter(function (x) { return x.p && x.qty > 0; });
  }
  function addToCart(id, qty) {
    state.cart[id] = Math.min(99, (state.cart[id] || 0) + (qty || 1));
    saveCart(); renderCart();
  }
  function renderCart() {
    var items = cartItems(), count = items.reduce(function (n, x) { return n + x.qty; }, 0);
    var badge = $("#cartCount");
    badge.hidden = count === 0; badge.textContent = count;
    $("#lines").innerHTML = items.map(function (x) {
      var p = x.p;
      var im = p.image ? '<img src="' + esc(p.image) + '" alt="">' : '<span class="line__blank"></span>';
      return '<li class="line" data-id="' + esc(p.id) + '">' + im +
        '<div><div class="line__name">' + esc(p.name) + '</div><div class="line__price">' +
        (p.price != null ? money(p.price) : "Price on WhatsApp") + "</div></div>" +
        '<div class="line__ctl"><div class="stepper">' +
        '<button type="button" data-q="-1" aria-label="Fewer"><svg width="16" height="16"><use href="#i-minus"/></svg></button>' +
        "<output>" + x.qty + "</output>" +
        '<button type="button" data-q="1" aria-label="More"><svg width="16" height="16"><use href="#i-plus"/></svg></button></div>' +
        '<button class="linkbtn rm" type="button" data-q="remove">Remove</button></div></li>';
    }).join("");
    $("#cartEmpty").hidden = items.length > 0;
    $("#orderForm").hidden = items.length === 0;
    $("#sendOrder").disabled = items.length === 0;
    $("#clearCart").hidden = items.length === 0;
    var priced = items.filter(function (x) { return x.p.price != null; });
    var total = priced.reduce(function (n, x) { return n + x.p.price * x.qty; }, 0);
    $("#cartTotal").textContent = priced.length
      ? (priced.length === items.length ? "Total: " : "Total of priced items: ") + money(total) : "";
  }
  function orderMessage() {
    var items = cartItems();
    var t = "Assalam o Alaikum " + STORE + "!\nMujhe yeh items order karne hain:\n\n";
    items.forEach(function (x, i) {
      t += (i + 1) + ". " + x.p.name + (x.p.brand ? " (" + x.p.brand + ")" : "") + " x " + x.qty;
      if (x.p.price != null) t += " - " + money(x.p.price * x.qty);
      t += "\n";
    });
    var priced = items.filter(function (x) { return x.p.price != null; });
    if (priced.length === items.length && priced.length) {
      t += "\nTotal: " + money(priced.reduce(function (n, x) { return n + x.p.price * x.qty; }, 0)) + "\n";
    }
    var name = $("#fName").value.trim(), city = $("#fCity").value.trim(), addr = $("#fAddr").value.trim();
    t += "\n";
    if (name) t += "Naam: " + name + "\n";
    if (city) t += "Shehr: " + city + "\n";
    if (addr) t += "Address: " + addr + "\n";
    t += "\nPrice aur delivery confirm kar dein. Shukriya.";
    return t;
  }

  var lastFocus;
  function openDrawer() {
    lastFocus = document.activeElement;
    $("#drawer").classList.add("is-open"); $("#drawer").setAttribute("aria-hidden", "false");
    $("#scrim").classList.add("is-on");
    setTimeout(function () { $("#drawerClose").focus(); }, 50);
  }
  function closeDrawer() {
    $("#drawer").classList.remove("is-open"); $("#drawer").setAttribute("aria-hidden", "true");
    $("#scrim").classList.remove("is-on");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  /* ---------- Quick view ---------- */
  var qvProduct = null, qvQty = 1;
  function openQuick(p) {
    qvProduct = p; qvQty = 1; $("#qvQty").textContent = 1;
    $("#qvImg").innerHTML = p.image ? '<img src="' + esc(p.image) + '" alt="' + esc(p.name) + '">' : "";
    $("#qvBrand").textContent = p.brand; $("#qvBrand").hidden = !p.brand;
    $("#qvName").textContent = p.name;
    $("#qvSub").textContent = p.subtitle; $("#qvSub").hidden = !p.subtitle;
    $("#qvDetails").innerHTML = p.details.map(function (d) {
      return '<li><svg width="18" height="18"><use href="#i-check"/></svg><span>' + esc(d) + "</span></li>";
    }).join("");
    var pr = $("#qvPrice");
    pr.textContent = p.price != null ? money(p.price) : "Ask for price";
    pr.className = "qv__price" + (p.price != null ? "" : " ask");
    $("#qvOrder").disabled = $("#qvAdd").disabled = !p.inStock;
    var dlg = $("#qv");
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
  }

  /* ---------- Events ---------- */
  function setCat(name) {
    state.cat = name; state.q = ""; $("#q").value = "";
    renderTabs(); renderGrid();
  }
  document.addEventListener("click", function (e) {
    var catBtn = e.target.closest("[data-cat]");
    if (catBtn) {
      setCat(catBtn.getAttribute("data-cat"));
      if (catBtn.classList.contains("catlink")) $("#shop").scrollIntoView();
      return;
    }
    var act = e.target.closest("[data-act]");
    if (act) {
      var card = act.closest(".card"), p = card && byId(card.getAttribute("data-id"));
      if (!p) return;
      if (act.getAttribute("data-act") === "open") openQuick(p);
      if (act.getAttribute("data-act") === "add") { addToCart(p.id, 1); toast("Added to your order list"); }
    }
  });

  $("#q").addEventListener("input", function (e) { state.q = e.target.value; renderGrid(); });

  $("#cartBtn").addEventListener("click", openDrawer);
  $("#drawerClose").addEventListener("click", closeDrawer);
  $("#scrim").addEventListener("click", closeDrawer);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && $("#drawer").classList.contains("is-open")) closeDrawer(); });

  $("#lines").addEventListener("click", function (e) {
    var b = e.target.closest("[data-q]"); if (!b) return;
    var id = b.closest(".line").getAttribute("data-id"), q = b.getAttribute("data-q");
    if (q === "remove") delete state.cart[id];
    else state.cart[id] = Math.max(0, Math.min(99, (state.cart[id] || 0) + Number(q)));
    if (!state.cart[id]) delete state.cart[id];
    saveCart(); renderCart();
  });
  $("#clearCart").addEventListener("click", function () { state.cart = {}; saveCart(); renderCart(); });
  ["fName", "fCity", "fAddr"].forEach(function (id) {
    var el = $("#" + id), saved = store.get("kcpk_cust_v1") || {};
    if (saved[id]) el.value = saved[id];
    el.addEventListener("input", function () {
      var c = store.get("kcpk_cust_v1") || {}; c[id] = el.value; store.set("kcpk_cust_v1", c);
    });
  });
  $("#sendOrder").addEventListener("click", function () {
    if (!cartItems().length) return;
    window.open(waLink(orderMessage()), "_blank", "noopener");
  });

  $("#qvClose").addEventListener("click", function () { $("#qv").close(); });
  $("#qv").addEventListener("click", function (e) { if (e.target === $("#qv")) $("#qv").close(); });
  $("#qvMinus").addEventListener("click", function () { qvQty = Math.max(1, qvQty - 1); $("#qvQty").textContent = qvQty; });
  $("#qvPlus").addEventListener("click", function () { qvQty = Math.min(99, qvQty + 1); $("#qvQty").textContent = qvQty; });
  $("#qvOrder").addEventListener("click", function () {
    if (qvProduct) window.open(waLink(singleMessage(qvProduct, qvQty)), "_blank", "noopener");
  });
  $("#qvAdd").addEventListener("click", function () {
    if (!qvProduct) return;
    addToCart(qvProduct.id, qvQty); $("#qv").close(); toast("Added to your order list");
  });

  /* ---------- Start ---------- */
  loadProducts().then(function (data) {
    state.products = data.map(norm);
    var saved = store.get("kcpk_cart_v1");
    if (saved && typeof saved === "object") state.cart = saved;
    renderTabs(); renderGrid(); renderPlates(); renderCart();
  }).catch(function () {
    $("#grid").innerHTML = '<p class="loading">Products could not be loaded. Please refresh the page, or message us on WhatsApp.</p>';
  });
})();
