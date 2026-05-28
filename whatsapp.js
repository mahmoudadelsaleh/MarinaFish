// ======== إعدادات الواتساب ========
// غيّر رقم الواتساب واسم المحل من هنا فقط

const WHATSAPP_NUMBER = "201040440805"; // مع كود الدولة بدون + أو 00
const SHOP_NAME       = "مارينا فيش";

function sendWhatsApp(){
  if(cart.size===0) return;
  const {sub,total} = totals();
  const name  = document.getElementById("cust-name").value.trim();
  const phone = document.getElementById("cust-phone").value.trim();
  const addr  = document.getElementById("cust-addr").value.trim();
  const lines = [];
  lines.push(`🐟 *طلب جديد من ${SHOP_NAME}*`,"","*الأصناف:*");
  let i=1; for(const l of cart.values()){
    lines.push(`${i++}. ${l.name} × ${l.qty} = ${l.unitPrice*l.qty} ج.م`);
  }
  lines.push(
    "",
    `المجموع الفرعي: ${sub} ج.م`,
    `🛵 خدمة التوصيل: ${DELIVERY_FEE} ج.م`,
    `*الإجمالي: ${total} ج.م*`
  );
  if(name||phone||addr){
    lines.push("","*بيانات العميل:*");
    if(name)  lines.push(`الاسم: ${name}`);
    if(phone) lines.push(`الموبايل: ${phone}`);
    if(addr)  lines.push(`العنوان: ${addr}`);
  }
  window.open(
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`,
    "_blank"
  );
}
