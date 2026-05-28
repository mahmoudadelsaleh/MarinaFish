// ======== منطق الموقع ========
const sections = window.__SECTIONS__ || [];
const cart = new Map();

function parsePrice(p){
  const m = String(p).match(/\d+/);
  return m ? parseInt(m[0],10) : 0;
}

function esc(s){
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[c]));
}

function renderNav(){
  const navList = document.getElementById("nav-list");
  if(!navList) return;
  navList.innerHTML = sections.map(s =>
    `<li><a href="#${s.id}"><span>${s.icon}</span>${esc(s.title)}</a></li>`
  ).join("");
}

function renderMenu(){
  const main = document.getElementById("menu-main");
  if(!main) return;
  
  main.innerHTML = sections.map((s, idx) => `
    <section class="section" id="${s.id}">
      <div class="section-head">
        <div class="icon">${s.icon}</div>
        <h2>${esc(s.title)}</h2>
        <div class="num">${String(idx+1).padStart(2,"0")} / ${String(sections.length).padStart(2,"0")}</div>
        <div class="divider"></div>
      </div>
      <div class="grid">
        ${s.items.map(it => `
          <article class="card">
            <div class="card-top">
              <h3>${esc(it.name)}</h3>
              <span class="price">${esc(it.price)} ج.م</span>
            </div>
            ${it.desc ? `<p class="desc">${esc(it.desc)}</p>` : ""}
            <div class="card-actions" data-slot="${encodeURIComponent(it.name)}"></div>
          </article>
        `).join("")}
      </div>
    </section>
  `).join("");
  
  refreshAllSlots();
}

function refreshAllSlots(){
  document.querySelectorAll("[data-slot]").forEach(slot => {
    const name = decodeURIComponent(slot.getAttribute("data-slot"));
    const line = cart.get(name);
    if(line){
      slot.innerHTML = `<div class="qty">
        <button onclick="addItem('${encodeURIComponent(name)}')">+</button>
        <span>${line.qty}</span>
        <button onclick="decItem('${encodeURIComponent(name)}')">−</button>
      </div>`;
    } else {
      slot.innerHTML = `<button class="add-btn" onclick="addItem('${encodeURIComponent(name)}')">+ أضف للطلب</button>`;
    }
  });
}

function findItem(name){
  for(const s of sections){
    for(const it of s.items){
      if(it.name === name) return it;
    }
  }
  return null;
}

function addItem(encName){
  const name = decodeURIComponent(encName);
  const it = findItem(name);
  if(!it) return;
  
  const cur = cart.get(name);
  if(cur){
    cur.qty++;
  } else {
    cart.set(name, {
      name: name,
      unitPrice: parsePrice(it.price),
      priceLabel: it.price,
      qty: 1
    });
  }
  refreshAllSlots();
  updateCartUI();
}

function decItem(encName){
  const name = decodeURIComponent(encName);
  const cur = cart.get(name);
  if(!cur) return;
  
  cur.qty--;
  if(cur.qty <= 0) cart.delete(name);
  refreshAllSlots();
  updateCartUI();
}

function removeItem(encName){
  cart.delete(decodeURIComponent(encName));
  refreshAllSlots();
  updateCartUI();
}

function totals(){
  let sub = 0;
  let qty = 0;
  for(const l of cart.values()){
    sub += l.unitPrice * l.qty;
    qty += l.qty;
  }
  const delivery = cart.size > 0 ? (typeof DELIVERY_FEE !== 'undefined' ? DELIVERY_FEE : 50) : 0;
  return { sub, qty, total: sub + delivery };
}

function updateCartUI(){
  const {sub, qty, total} = totals();
  const fab = document.getElementById("cart-fab");
  if(qty > 0){
    fab.style.display = "inline-flex";
    document.getElementById("fab-qty").textContent = qty;
    document.getElementById("fab-sub").textContent = sub;
  } else {
    fab.style.display = "none";
  }
  renderCartLines();
  
  const tSub = document.getElementById("t-sub");
  const tDel = document.getElementById("t-del");
  const tTotal = document.getElementById("t-total");
  if(tSub) tSub.textContent = sub;
  if(tDel) tDel.textContent = cart.size > 0 ? (typeof DELIVERY_FEE !== 'undefined' ? DELIVERY_FEE : 50) : 0;
  if(tTotal) tTotal.textContent = total;
}

function renderCartLines(){
  const box = document.getElementById("cart-lines");
  const form = document.getElementById("cart-form");
  
  if(!box) return;
  
  if(cart.size === 0){
    box.innerHTML = `<p style="text-align:center;color:var(--muted);padding:2rem 0">🛒 سلة الطلب فارغة</p>`;
    if(form) form.style.display = "none";
    return;
  }
  
  if(form) form.style.display = "block";
  
  let html = '';
  for(const l of cart.values()){
    const itemTotal = l.unitPrice * l.qty;
    html += `
      <div class="line">
        <div class="name">
          <b>${esc(l.name)}</b>
          <small>${l.unitPrice} ج.م</small>
        </div>
        <div class="qty">
          <button onclick="addItem('${encodeURIComponent(l.name)}')">+</button>
          <span>${l.qty}</span>
          <button onclick="decItem('${encodeURIComponent(l.name)}')">−</button>
        </div>
        <div class="lp">${itemTotal} ج.م</div>
        <button class="rm" onclick="removeItem('${encodeURIComponent(l.name)}')">🗑</button>
      </div>
    `;
  }
  box.innerHTML = html;
}

function openCart(){
  const modal = document.getElementById("cart-modal");
  if(modal) modal.classList.add("open");
  updateCartUI();
}

function closeCart(){
  const modal = document.getElementById("cart-modal");
  if(modal) modal.classList.remove("open");
}

// تشغيل الموقع عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", function() {
  const yearSpan = document.getElementById("year");
  if(yearSpan) yearSpan.textContent = new Date().getFullYear();
  
  renderNav();
  renderMenu();
  updateCartUI();
  
  console.log("✅ تم تحميل الموقع بنجاح");
  console.log("عدد الأقسام:", sections.length);
});