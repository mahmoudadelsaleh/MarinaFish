// ======== إعدادات الواتساب ========
const WHATSAPP_NUMBER = "01040440885";
const SHOP_NAME = "مارينا فيش";

function sendWhatsApp() {
  if (cart.size === 0) return;
  
  const { sub, total } = totals();
  const name = document.getElementById("cust-name").value.trim();
  const phone = document.getElementById("cust-phone").value.trim();
  const address = document.getElementById("cust-addr").value.trim();
  const pickupTime = document.getElementById("pickup-time").value.trim();
  const notes = document.getElementById("cust-notes").value.trim();
  
  // التحقق من البيانات الأساسية
  if (!name || !phone || !address) {
    alert("❌ الرجاء إدخال الاسم ورقم الهاتف والعنوان");
    return;
  }
  
  // إنشاء رقم فاتورة جديد
  const invoiceNum = getInvoiceNumber();
  const now = new Date();
  const invoiceDate = now.toLocaleString('ar-EG');
  
  // بناء الفاتورة
  let lines = [];
  lines.push(`🏝️ *${SHOP_NAME}*`);
  lines.push(`📄 فاتورة رقم: #${invoiceNum}`);
  lines.push(`📅 ${invoiceDate}`);
  lines.push(`━━━━━━━━━━━━━━━━━━`);
  lines.push(``);
  
  // الأصناف (بدون أرقام)
  let itemCounter = 1;
  for (const l of cart.values()) {
    const itemTotal = l.unitPrice * l.qty;
    lines.push(`🟡 ${l.name}`);
    lines.push(`   ${l.unitPrice} ج.م × ${l.qty} = ${itemTotal} ج.م`);
    lines.push(``);
  }
  
  lines.push(`━━━━━━━━━━━━━━━━━━`);
  lines.push(`💰 المجموع الفرعي: ${sub} ج.م`);
  lines.push(`🛵 خدمة التوصيل: ${DELIVERY_FEE} ج.م`);
  lines.push(`💵 *الإجمالي: ${total} ج.م*`);
  lines.push(`━━━━━━━━━━━━━━━━━━`);
  lines.push(``);
  lines.push(`👤 *بيانات العميل:*`);
  lines.push(`📛 الاسم: ${name}`);
  lines.push(`📞 الهاتف: ${phone}`);
  lines.push(`📍 العنوان: ${address}`);
  if (pickupTime) {
    lines.push(`⏰ وقت الاستلام: ${pickupTime}`);
  }
  if (notes) {
    lines.push(`📝 ملاحظات: ${notes}`);
  }
  lines.push(``);
  lines.push(`✨ شكراً لتسوقكم مع مارينا فيش ✨`);
  
  // زيادة رقم الفاتورة للطلب التالي
  incrementInvoiceNumber();
  
  // فتح واتساب
  window.open(
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`,
    "_blank"
  );
  
  // عرض رسالة تأكيد
  alert(`✅ تم إرسال الطلب رقم #${invoiceNum} بنجاح!\nسيتم التواصل معكم قريباً لتأكيد الطلب.`);
}