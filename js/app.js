const sections = window.__SECTIONS__;
const cart = new Map();

/* ===== أدوات ===== */
function parsePrice(p){const m=String(p).match(/\d+/);return m?parseInt(m[0],10):0}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]))}
function todayKey(){const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function nowStr(){const d=new Date();const p=n=>String(n).padStart(2,"0");return `${todayKey()} ${p(d.getHours())}:${p(d.getMinutes())}`}

/* ===== تخزين (localStorage) ===== */
const LS_INV="mf_invoices", LS_NUM="mf_invnum", LS_VIS="mf_visits";

function nextInvoiceNumber(){
  const today = todayKey();
  let st = {};
  try{ st = JSON.parse(localStorage.getItem(LS_NUM)||"{}") }catch(e){}
  if(st.date !== today){ st = {date: today, n: INVOICE_START_NUMBER}; }
  else { st.n = (st.n||INVOICE_START_NUMBER) + 1; }
  localStorage.setItem(LS_NUM, JSON.stringify(st));
  return st.n;
}

function saveInvoice(inv){
  let arr=[]; try{arr=JSON.parse(localStorage.getItem(LS_INV)||"[]")}catch(e){}
  arr.push(inv);
  localStorage.setItem(LS_INV, JSON.stringify(arr));
}

function trackVisit(){
  let v={total:0,days:{}}; try{v=JSON.parse(localStorage.getItem(LS_VIS)||'{"total":0,"days":{}}')}catch(e){}
  const t=todayKey();
  v.total = (v.total||0)+1;
  v.days[t] = (v.days[t]||0)+1;
  localStorage.setItem(LS_VIS, JSON.stringify(v));
}

/* ===== عرض المنيو ===== */
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
function addItem(enc){
  const name=decodeURIComponent(enc);const it=findItem(name);if(!it)return;
  const cur=cart.get(name);
  if(cur)cur.qty++;else cart.set(name,{name,unitPrice:parsePrice(it.price),qty:1});
  refreshAllSlots();updateCartUI();
}
function decItem(enc){
  const name=decodeURIComponent(enc);const cur=cart.get(name);if(!cur)return;
  cur.qty--;if(cur.qty<=0)cart.delete(name);
  refreshAllSlots();updateCartUI();
}
function removeItem(enc){cart.delete(decodeURIComponent(enc));refreshAllSlots();updateCartUI()}

function totals(){
  let sub=0,qty=0;for(const l of cart.values()){sub+=l.unitPrice*l.qty;qty+=l.qty}
  return {sub,qty,del:cart.size>0?DELIVERY_FEE:0,total:sub+(cart.size>0?DELIVERY_FEE:0)};
}

function updateCartUI(){
  const {sub,qty,del,total}=totals();
  const fab=document.getElementById("cart-fab");
  if(qty>0){fab.style.display="inline-flex";document.getElementById("fab-qty").textContent=qty;document.getElementById("fab-sub").textContent=sub}
  else fab.style.display="none";
  renderCartLines();
  document.getElementById("t-sub").textContent=sub;
  document.getElementById("t-del").textContent=del;
  document.getElementById("t-total").textContent=total;
}
function renderCartLines(){
  const box=document.getElementById("cart-lines");
  const form=document.getElementById("cart-form");
  if(cart.size===0){
    box.innerHTML=`<p style="text-align:center;color:var(--muted);padding:2rem 0">سلة الطلب فارغة</p>`;
    form.style.display="none";return;
  }
  form.style.display="block";
  box.innerHTML=Array.from(cart.values()).map(l=>`
    <div class="line">
      <div class="name"><b>${esc(l.name)}</b><small>${l.unitPrice} ج.م × ${l.qty}</small></div>
      <div class="qty">
        <button onclick="addItem('${encodeURIComponent(l.name)}')">+</button>
        <span>${l.qty}</span>
        <button onclick="decItem('${encodeURIComponent(l.name)}')">−</button>
      </div>
      <div class="lp">${l.unitPrice*l.qty} ج.م</div>
      <button class="rm" onclick="removeItem('${encodeURIComponent(l.name)}')">🗑</button>
    </div>`).join("");
}
function openCart(){document.getElementById("cart-modal").classList.add("open");updateCartUI()}
function closeCart(){document.getElementById("cart-modal").classList.remove("open")}

/* ===== بناء قالب الفاتورة ===== */
function buildReceiptHTML(inv){
  const rows = inv.items.map((l,i)=>`
    <tr>
      <td class="c">${i+1}</td>
      <td>${esc(l.name)}<div style="font-size:11px;color:#444">${l.unitPrice} × ${l.qty}</div></td>
      <td class="p">${l.unitPrice*l.qty}</td>
    </tr>`).join("");
  const cust = (inv.customer.name||inv.customer.phone||inv.customer.addr) ? `
    <div class="r-cust">
      ${inv.customer.name?`<div><b>العميل:</b> ${esc(inv.customer.name)}</div>`:""}
      ${inv.customer.phone?`<div><b>الموبايل:</b> ${esc(inv.customer.phone)}</div>`:""}
      ${inv.customer.addr?`<div><b>العنوان:</b> ${esc(inv.customer.addr)}</div>`:""}
    </div>` : "";
  return `
    <div class="r-head">
      <div class="r-logo">${SHOP_LOGO}</div>
      <div class="r-shop">${esc(SHOP_NAME)}</div>
      <div class="r-sub">${esc(SHOP_ADDRESS)}</div>
      <div class="r-sub">📞 ${esc(SHOP_PHONE)}</div>
    </div>
    <div class="r-meta">
      <span><b>فاتورة #</b> ${inv.number}</span>
      <span>${esc(inv.date)}</span>
    </div>
    ${cust}
    <table>
      <thead><tr><th class="c">#</th><th>الصنف</th><th class="p">ج.م</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="r-tot">
      <div class="row"><span>المجموع الفرعي</span><span>${inv.sub} ج.م</span></div>
      <div class="row"><span>🛵 خدمة التوصيل</span><span>${inv.del} ج.م</span></div>
      <div class="row grand"><span>الإجمالي</span><span>${inv.total} ج.م</span></div>
    </div>
    <div class="r-foot">
      شكراً لطلبكم من ${esc(SHOP_NAME)}<br>
      نتمنى لكم وجبة شهية 🐟
    </div>`;
}

async function generateReceiptImage(inv){
  const stage=document.getElementById("receipt");
  stage.innerHTML = buildReceiptHTML(inv);
  // انتظر تطبيق الأنماط
  await new Promise(r=>setTimeout(r,80));
  const canvas = await html2canvas(stage,{scale:2,backgroundColor:"#ffffff",useCORS:true,logging:false});
  return new Promise(res=>canvas.toBlob(b=>res(b),"image/png",1));
}

async function sendWhatsApp(){
  if(cart.size===0) return;
  const btn=document.querySelector(".send-wa");
  btn.disabled=true; const orig=btn.textContent; btn.textContent="جاري إنشاء الفاتورة…";

  const {sub,del,total}=totals();
  const name=document.getElementById("cust-name").value.trim();
  const phone=document.getElementById("cust-phone").value.trim();
  const addr=document.getElementById("cust-addr").value.trim();
  const items=Array.from(cart.values()).map(l=>({name:l.name,unitPrice:l.unitPrice,qty:l.qty}));
  const number=nextInvoiceNumber();
  const inv={number,date:nowStr(),customer:{name,phone,addr},items,sub,del,total,createdAt:Date.now()};

  try{
    const blob = await generateReceiptImage(inv);
    saveInvoice(inv);

    const file = new File([blob],`فاتورة-${number}.png`,{type:"image/png"});
    const text = `🐟 طلب جديد من ${SHOP_NAME}\nفاتورة رقم: ${number}\nالإجمالي: ${total} ج.م`;

    // 1) جرّب مشاركة الصورة مباشرة (موبايل)
    if(navigator.canShare && navigator.canShare({files:[file]})){
      try{
        await navigator.share({files:[file],text,title:`فاتورة ${number}`});
        btn.disabled=false; btn.textContent=orig;
        cart.clear(); refreshAllSlots(); updateCartUI(); closeCart();
        return;
      }catch(e){ /* المستخدم ألغى - أكمل للبديل */ }
    }

    // 2) بديل: نزّل الصورة + افتح واتساب برسالة
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `فاتورة-${number}.png`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),2000);

    const waText = `${text}\n\n(صورة الفاتورة تم تنزيلها — أرفقها في هذه المحادثة 📎)`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waText)}`,"_blank");

    cart.clear(); refreshAllSlots(); updateCartUI(); closeCart();
  }catch(err){
    console.error(err);
    alert("تعذّر إنشاء صورة الفاتورة. حاول مرة أخرى.");
  }finally{
    btn.disabled=false; btn.textContent=orig;
  }
}

document.getElementById("year").textContent = new Date().getFullYear();
renderNav(); renderMenu(); updateCartUI(); trackVisit();
