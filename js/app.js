// جلب البيانات من ملف config.js
const sectionsData = typeof sections !== 'undefined' ? sections : (window.__SECTIONS__ || []);
const cart = new Map();

function parsePrice(p){const m=String(p).match(/\d+/);return m?parseInt(m[0],10):0}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]))}

function renderNav(){
  const navList = document.getElementById("nav-list");
  if(navList) navList.innerHTML = sectionsData.map(s=>
    `<li><a href="#${s.id}"><span>${s.icon}</span>${esc(s.title)}</a></li>`).join("");
}

function renderMenu(){
  const main = document.getElementById("menu-main");
  if (!main) return;
  main.innerHTML = sectionsData.map((s,idx)=>`
    <section class="section" id="${s.id}">
      <div class="section-head">
        <div class="icon">${s.icon}</div>
        <h2>${esc(s.title)}</h2>
        <div class="num">${String(idx+1).padStart(2,"0")} / ${String(sectionsData.length).padStart(2,"0")}</div>
        <div class="divider"></div>
      </div>
      <div class="grid">
        ${s.items.map(it=>`
          <article class="card">
            <div class="card-top">
              <h3>${esc(it.name)}</h3>
              <span class="price">${esc(it.price)} ج.م</span>
            </div>
            ${it.desc?`<p class="desc">${esc(it.desc)}</p>`:""}
            <div class="card-actions" data-slot="${encodeURIComponent(it.name)}"></div>
          </article>`).join("")}
      </div>
    </section>`).join("");
  refreshAllSlots();
}

function refreshAllSlots(){
  document.querySelectorAll("[data-slot]").forEach(slot=>{
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
  for(const s of sectionsData) for(const it of s.items) if(it.name===name) return it;
  return null;
}

function addItem(encName){
  const name = decodeURIComponent(encName);
  const it = findItem(name); if(!it) return;
  const cur = cart.get(name);
  if(cur) cur.qty++;
  else cart.set(name,{name: name, unitPrice:parsePrice(it.price), priceLabel:it.price, qty:1});
  refreshAllSlots(); updateCartUI();
}

function decItem(encName){
  const name = decodeURIComponent(encName);
  const cur = cart.get(name); if(!cur) return;
  cur.qty--; if(cur.qty<=0) cart.delete(name);
  refreshAllSlots(); updateCartUI();
}

function removeItem(encName){
  cart.delete(decodeURIComponent(encName));
  refreshAllSlots(); updateCartUI();
}

function totals(){
  let sub=0,qty=0; 
  for(const item of cart.values()){ sub += item.unitPrice*item.qty; qty += item.qty; }
  return {sub,qty,total: sub + (cart.size>0 ? DELIVERY_FEE : 0)};
}

function updateCartUI(){
  const {sub,qty,total} = totals();
  const fab = document.getElementById("cart-fab");
  if(qty>0){
      fab.style.display="inline-flex";
      document.getElementById("fab-qty").textContent=qty;
      document.getElementById("fab-sub").textContent=sub;
  } else {
      fab.style.display="none";
  }
  renderCartLines();
  document.getElementById("t-sub").textContent=sub;
  document.getElementById("t-del").textContent=cart.size>0 ? DELIVERY_FEE : 0;
  document.getElementById("t-total").textContent=total;
}

// التحديث الجذري لدالة الرسم لحل مشكلة اختفاء الاسم
function renderCartLines(){
  const box = document.getElementById("cart-lines");
  const form = document.getElementById("cart-form");
  if(!box || !form) return;
  
  if(cart.size===0){
    box.innerHTML = `<p style="text-align:center;color:var(--muted);padding:2rem 0">سلة الطلب فارغة</p>`;
    form.style.display="none"; 
    return;
  }
  
  form.style.display="block";
  
  let html = "";
  // استخدام for...of المضمونة لجلب الاسم والبيانات
  for(const [itemName, itemData] of cart.entries()){
    html += `
    <div class="line" style="display:flex; align-items:center; gap:0.5rem; border:1px solid var(--border); border-radius:0.5rem; padding:0.75rem; margin-bottom:0.5rem;">
      
      <div class="name" style="flex:1; min-width:0; overflow:hidden;">
        <div style="font-weight:700; color:var(--primary); font-size:1.05rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:0.25rem;">
          ${itemName}
        </div>
        <small style="color:var(--muted); font-size:0.85rem;">${itemData.unitPrice} ج.م × ${itemData.qty}</small>
      </div>

      <div class="qty" style="display:inline-flex; align-items:center; gap:0.5rem; border:1px solid rgba(217,179,90,0.6); border-radius:9999px; padding:0.25rem 0.5rem;">
        <button style="background:rgba(217,179,90,0.1); color:var(--primary); border-radius:50%; width:1.75rem; height:1.75rem; border:none; cursor:pointer;" onclick="addItem('${encodeURIComponent(itemName)}')">+</button>
        <span style="color:var(--primary); font-weight:700; min-width:1.5rem; text-align:center;">${itemData.qty}</span>
        <button style="background:rgba(217,179,90,0.1); color:var(--primary); border-radius:50%; width:1.75rem; height:1.75rem; border:none; cursor:pointer;" onclick="decItem('${encodeURIComponent(itemName)}')">−</button>
      </div>

      <div class="lp" style="font-weight:700; color:var(--fg); min-width:3.5rem; text-align:left;">
        ${itemData.unitPrice*itemData.qty} ج.م
      </div>

      <button class="rm" style="background:transparent; border:none; color:#e57373; font-size:1.2rem; cursor:pointer; padding:0.25rem;" onclick="removeItem('${encodeURIComponent(itemName)}')">🗑</button>
    </div>`;
  }
  box.innerHTML = html;
}

function openCart(){document.getElementById("cart-modal").classList.add("open");updateCartUI();}
function closeCart(){document.getElementById("cart-modal").classList.remove("open");}

function sendWhatsApp(){
  if(cart.size===0) return;
  const {sub,total} = totals();
  const name = document.getElementById("cust-name").value.trim();
  const phone = document.getElementById("cust-phone").value.trim();
  const addr = document.getElementById("cust-addr").value.trim();
  
  const shopName = typeof SHOP_NAME !== 'undefined' ? SHOP_NAME : "المطعم";
  const delivery = typeof DELIVERY_FEE !== 'undefined' ? DELIVERY_FEE : 0;
  const waNumber = typeof WHATSAPP_NUMBER !== 'undefined' ? WHATSAPP_NUMBER : "";
  
  const lines = [];
  lines.push(`🐟 *طلب جديد من ${shopName}*`,"","*الأصناف:*");
  
  let i=1; 
  for(const [itemName, itemData] of cart.entries()){
    lines.push(`${i++}. ${itemName} × ${itemData.qty} = ${itemData.unitPrice*itemData.qty} ج.م`);
  }
  
  lines.push("",`المجموع الفرعي: ${sub} ج.م`,`🛵 خدمة التوصيل: ${delivery} ج.م`,`*الإجمالي: ${total} ج.م*`);
  
  if(name||phone||addr){
    lines.push("","*بيانات العميل:*");
    if(name) lines.push(`الاسم: ${name}`);
    if(phone) lines.push(`الموبايل: ${phone}`);
    if(addr) lines.push(`العنوان: ${addr}`);
  }
  
  window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(lines.join("\n"))}`,"_blank");
}

if(document.getElementById("year")) {
    document.getElementById("year").textContent = new Date().getFullYear();
}
renderNav(); 
renderMenu(); 
updateCartUI();
