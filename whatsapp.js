// ======== إعدادات وإرسال الواتساب ========

function sendWhatsApp() {
  console.log("🔵 تم الضغط على زر الإرسال");
  console.log("حجم السلة:", cart ? cart.size : "cart غير موجود");
  
  // التحقق من وجود cart
  if (typeof cart === 'undefined') {
    alert("❌ خطأ في النظام. الرجاء تحديث الصفحة.");
    return;
  }
  
  if (cart.size === 0) {
    alert("❌ السلة فارغة! أضف بعض الأصناف أولاً.");
    return;
  }
  
  // جلب البيانات من الحقول
  const name = document.getElementById("cust-name").value.trim();
  const phone = document.getElementById("cust-phone").value.trim();
  const address = document.getElementById("cust-addr").value.trim();
  const pickupTime = document.getElementById("pickup-time").value.trim();
  const notes = document.getElementById("cust-notes").value.trim();
  
  console.log("الاسم:", name, "الهاتف:", phone, "العنوان:", address);
  
  // التحقق من البيانات الأساسية
  if (!name) {
    alert("❌ الرجاء إدخال الاسم");
    document.getElementById("cust-name").focus();
    return;
  }
  if (!phone) {
    alert("❌ الرجاء إدخال رقم الهاتف");
    document.getElementById("cust-phone").focus();
    return;
  }
  if (!address) {
    alert("❌ الرجاء إدخال العنوان بالتفصيل");
    document.getElementById("cust-addr").focus();
    return;
  }
  
  // حساب المجاميع
  let subTotal = 0;
  let itemsList = [];
  let counter = 1;
  
  for (const l of cart.values()) {
    const itemTotal = l.unitPrice * l.qty;
    subTotal += itemTotal;
    itemsList.push(`${l.name} (${l.unitPrice} ج.م × ${l.qty} = ${itemTotal} ج.م)`);
  }
  
  const deliveryFee = DELIVERY_FEE || 50;
  const totalAmount = subTotal + deliveryFee;
  
  // الحصول على رقم الفاتورة
  let invoiceNum = 701;
  if (typeof getInvoiceNumber === 'function') {
    invoiceNum = getInvoiceNumber();
  }
  
  // إنشاء التاريخ
  const now = new Date();
  const invoiceDate = now.toLocaleString('ar-EG');
  
  // بناء نص الفاتورة
  let message = `🏝️ *مارينا فيش*\n`;
  message += `📄 فاتورة رقم: #${invoiceNum}\n`;
  message += `📅 ${invoiceDate}\n`;
  message += `━━━━━━━━━━━━━━━━━━\n\n`;
  
  // الأصناف (بدون أرقام تسلسلية)
  for (const item of itemsList) {
    message += `🟡 ${item}\n\n`;
  }
  
  message += `━━━━━━━━━━━━━━━━━━\n`;
  message += `💰 المجموع الفرعي: ${subTotal} ج.م\n`;
  message += `🛵 خدمة التوصيل: ${deliveryFee} ج.م\n`;
  message += `💵 *الإجمالي: ${totalAmount} ج.م*\n`;
  message += `━━━━━━━━━━━━━━━━━━\n\n`;
  message += `👤 *بيانات العميل:*\n`;
  message += `📛 الاسم: ${name}\n`;
  message += `📞 الهاتف: ${phone}\n`;
  message += `📍 العنوان: ${address}\n`;
  
  if (pickupTime) {
    message += `⏰ وقت الاستلام: ${pickupTime}\n`;
  }
  if (notes) {
    message += `📝 ملاحظات: ${notes}\n`;
  }
  
  message += `\n✨ شكراً لتسوقكم مع مارينا فيش ✨`;
  
  console.log("الرسالة المرسلة:", message);
  
  // زيادة رقم الفاتورة
  if (typeof incrementInvoiceNumber === 'function') {
    incrementInvoiceNumber();
  }
  
  // فتح واتساب
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  console.log("فتح الرابط:", whatsappUrl);
  window.open(whatsappUrl, "_blank");
  
  alert(`✅ تم إرسال الطلب رقم #${invoiceNum} بنجاح!\nسيتم فتح واتساب لإرسال الطلب.`);
}