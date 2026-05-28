const cart = new Map(); // name -> {name,unitPrice,priceLabel,qty}

function parsePrice(p){const m=String(p).match(/\d+/);return m?parseInt(m[0],10):0}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]))}

function renderNav(){
  document.getElementById("nav-list").innerHTML = sections.map(s=>
    `<li><a href="#${s.id}"><span>${s.icon}</span>${esc(s.title)}</a></li>`).join("");
}

function renderMenu(){
  const main = document.getElementById("menu-main");
  main.innerHTML = sections.map((s,idx)=>`
    <section class="section" id="${s.id}">
      <div class="section-head">
        <div class="icon">${s.icon}</div>
        <h2>${esc(s.title)}</h2>
        <div class="num">${String(idx+1).padStart(2,"0")} / ${String(sections.length).padStart(2,"0")}</div>
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
    const item = findItem(name);
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
  for(const s of sections) for(const it of s.items) if(it.name===name) return it;
  return null;
}

function addItem(encName){
  const name = decodeURIComponent(encName);
  const it = findItem(name); if(!it) return;
  const cur = cart.get(name);
  if(cur) cur.qty++;
  else cart.set(name,{name,unitPrice:parsePrice(it.price),priceLabel:it.price,qty:1});
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
  let sub=0,qty=0; for(const l of cart.values()){sub+=l.unitPrice*l.qty;qty+=l.qty}
  return {sub,qty,total: sub + (cart.size>0?DELIVERY_FEE:0)};
}

function updateCartUI(){
  const {sub,qty,total} = totals();
  const fab = document.getElementById("cart-fab");
  if(qty>0){fab.style.display="inline-flex";document.getElementById("fab-qty").textContent=qty;document.getElementById("fab-sub").textContent=sub}
  else fab.style.display="none";
  renderCartLines();
  document.getElementById("t-sub").textContent=sub;
  document.getElementById("t-del").textContent=cart.size>0?DELIVERY_FEE:0;
  document.getElementById("t-total").textContent=total;
}

function renderCartLines(){
  const box = document.getElementById("cart-lines");
  const form = document.getElementById("cart-form");
  if(cart.size===0){
    box.innerHTML = `<p style="text-align:center;color:var(--muted);padding:2rem 0">سلة الطلب فارغة</p>`;
    form.style.display="none"; return;
  }
  form.style.display="block";
  
  let html = "";
  for(const l of cart.values()){
    // التصميم الجديد للبطاقة: بيفصل الاسم فوق، والتفاصيل تحت عشان مفيش حاجة تضغط التانية
    html += `
    <div style="background: var(--card); border: 1px solid var(--border); border-radius: 0.5rem; padding: 1rem; margin-bottom: 0.75rem;">
      <div style="font-weight: bold; color: var(--primary); font-size: 1.1rem; margin-bottom: 0.75rem; text-align: right;">
        ${esc(l.name)}
      </div>
      
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
        
        <div style="font-size: 0.85rem; color: var(--muted);">
          السعر: ${l.unitPrice} ج
        </div>
        
        <div class="qty" style="display: flex; align-items: center; gap: 0.5rem; border: 1px solid rgba(217,179,90,.6); border-radius: 9999px; padding: 0.2rem 0.5rem;">
          <button onclick="addItem('${encodeURIComponent(l.name)}')">+</button>
          <span>${l.qty}</span>
          <button onclick="decItem('${encodeURIComponent(l.name)}')">−</button>
        </div>
        
        <div style="font-weight: bold; color: var(--fg);">
          فرعي: ${l.unitPrice * l.qty} ج
        </div>
        
        <button class="rm" onclick="removeItem('${encodeURIComponent(l.name)}')">🗑</button>
      </div>
    </div>`;
  }
  box.innerHTML = html;
}

function openCart(){document.getElementById("cart-modal").classList.add("open");updateCartUI()}
function closeCart(){document.getElementById("cart-modal").classList.remove("open")}

function sendWhatsApp(){
  if(cart.size===0) return;
  const {sub,total} = totals();
  const name = document.getElementById("cust-name").value.trim();
  const phone = document.getElementById("cust-phone").value.trim();
  const addr = document.getElementById("cust-addr").value.trim();
  const lines = [];
  lines.push(`🐟 *طلب جديد من ${SHOP_NAME}*`,"","*الأصناف:*");
  let i=1; for(const l of cart.values()){
    lines.push(`${i++}. ${l.name} × ${l.qty} = ${l.unitPrice*l.qty} ج.م`);
  }
  lines.push("",`المجموع الفرعي: ${sub} ج.م`,`🛵 خدمة التوصيل: ${DELIVERY_FEE} ج.م`,`*الإجمالي: ${total} ج.م*`);
  if(name||phone||addr){
    lines.push("","*بيانات العميل:*");
    if(name) lines.push(`الاسم: ${name}`);
    if(phone) lines.push(`الموبايل: ${phone}`);
    if(addr) lines.push(`العنوان: ${addr}`);
  }
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`,"_blank");
}

document.getElementById("year").textContent = new Date().getFullYear();
renderNav(); renderMenu(); updateCartUI();
