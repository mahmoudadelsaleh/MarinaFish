// ======== إعدادات وإرسال الواتساب مع صورة ========

async function sendWhatsApp() {
  if (typeof cart === 'undefined' || cart.size === 0) {
    alert("❌ السلة فارغة! أضف بعض الأصناف أولاً.");
    return;
  }
  
  // جلب البيانات من الحقول
  const name = document.getElementById("cust-name").value.trim();
  const phone = document.getElementById("cust-phone").value.trim();
  const address = document.getElementById("cust-addr").value.trim();
  const pickupTime = document.getElementById("pickup-time").value.trim();
  const notes = document.getElementById("cust-notes").value.trim();
  
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
  let itemsHtml = '';
  let itemsText = '';
  let counter = 1;
  
  for (const l of cart.values()) {
    const itemTotal = l.unitPrice * l.qty;
    subTotal += itemTotal;
    itemsHtml += `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding-bottom: 5px; border-bottom: 1px dashed #ddd;">
        <div style="flex: 2;">
          <div style="font-weight: bold; color: #c9a03d;">${esc(l.name)}</div>
          <div style="font-size: 11px; color: #666;">${l.unitPrice} ج.م × ${l.qty}</div>
        </div>
        <div style="font-weight: bold; color: #c9a03d;">${itemTotal} ج.م</div>
      </div>
    `;
    itemsText += `${l.name} (${l.unitPrice}ج.م × ${l.qty} = ${itemTotal}ج.م)\n`;
  }
  
  const deliveryFee = typeof DELIVERY_FEE !== 'undefined' ? DELIVERY_FEE : 50;
  const totalAmount = subTotal + deliveryFee;
  
  // الحصول على رقم الفاتورة
  let invoiceNum = 701;
  if (typeof getInvoiceNumber === 'function') {
    invoiceNum = getInvoiceNumber();
  }
  
  // إنشاء التاريخ
  const now = new Date();
  const invoiceDate = now.toLocaleString('ar-EG');
  
  // إنشاء محتوى الفاتورة للصورة
  const invoiceHTML = `
    <div style="font-family: 'Cairo', 'Amiri', sans-serif; direction: rtl; background: white; padding: 12px; border-radius: 12px; width: 100%; box-sizing: border-box;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 15px; border-bottom: 2px solid #c9a03d; padding-bottom: 10px;">
        <div style="font-size: 22px; font-weight: bold; color: #c9a03d;">🐟 مارينا فيش</div>
        <div style="font-size: 11px; color: #888;">MARINA FISH</div>
        <div style="font-size: 12px; margin-top: 5px;">
          <span style="background: #c9a03d; color: #1a1a2e; padding: 2px 8px; border-radius: 20px; font-weight: bold;">فاتورة #${invoiceNum}</span>
        </div>
        <div style="font-size: 10px; color: #888; margin-top: 5px;">📅 ${invoiceDate}</div>
      </div>
      
      <!-- Items -->
      <div style="margin-bottom: 15px;">
        <div style="font-weight: bold; margin-bottom: 10px; color: #1a1a2e; border-right: 3px solid #c9a03d; padding-right: 8px;">🍽️ الأصناف المطلوبة</div>
        ${itemsHtml}
      </div>
      
      <!-- Totals -->
      <div style="background: #f5f5f5; padding: 12px; border-radius: 10px; margin-bottom: 15px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
          <span style="color: #666;">المجموع الفرعي</span>
          <span>${subTotal} ج.م</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
          <span style="color: #666;">🛵 خدمة التوصيل</span>
          <span>${deliveryFee} ج.م</span>
        </div>
        <div style="border-top: 1px solid #ddd; margin: 8px 0;"></div>
        <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 16px;">
          <span>🇪🇬 الإجمالي</span>
          <span style="color: #c9a03d;">${totalAmount} ج.م</span>
        </div>
      </div>
      
      <!-- Customer Info -->
      <div style="margin-bottom: 15px;">
        <div style="font-weight: bold; margin-bottom: 8px; color: #1a1a2e; border-right: 3px solid #c9a03d; padding-right: 8px;">👤 بيانات العميل</div>
        <div style="background: #fafafa; padding: 10px; border-radius: 8px; font-size: 12px;">
          <div><span style="color: #666;">📛 الاسم:</span> ${esc(name)}</div>
          <div><span style="color: #666;">📞 الهاتف:</span> ${esc(phone)}</div>
          <div><span style="color: #666;">📍 العنوان:</span> ${esc(address)}</div>
          ${pickupTime ? `<div><span style="color: #666;">⏰ وقت الاستلام:</span> ${esc(pickupTime)}</div>` : ''}
          ${notes ? `<div><span style="color: #666;">📝 ملاحظات:</span> ${esc(notes)}</div>` : ''}
        </div>
      </div>
      
      <!-- Footer -->
      <div style="text-align: center; font-size: 10px; color: #aaa; border-top: 1px solid #eee; padding-top: 10px;">
        ✨ شكراً لتسوقكم مع مارينا فيش ✨
      </div>
    </div>
  `;
  
  // وضع المحتوى في العنصر الخفي
  const previewContainer = document.getElementById('invoice-content');
  if (previewContainer) {
    previewContainer.innerHTML = invoiceHTML;
  }
  
  // انتظار قليلاً ثم تحويل إلى صورة
  const previewElem = document.getElementById('invoice-preview');
  
  // إظهار العنصر مؤقتاً لأخذ الصورة (مخفي بصرياً ولكن موجود في DOM)
  previewElem.style.opacity = '0';
  previewElem.style.position = 'fixed';
  previewElem.style.left = '0';
  previewElem.style.top = '0';
  previewElem.style.pointerEvents = 'none';
  
  // إضافة بعض الوقت للتأكد من تحميل الخطوط
  await new Promise(resolve => setTimeout(resolve, 100));
  
  try {
    // تحويل إلى صورة
    const canvas = await html2canvas(previewElem, {
      scale: 2,  // دقة عالية
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true
    });
    
    // تحويل canvas إلى blob (ملف صورة)
    canvas.toBlob(async (blob) => {
      // إنشاء ملف الصورة
      const imageFile = new File([blob], `invoice_${invoiceNum}.png`, { type: 'image/png' });
      
      // زيادة رقم الفاتورة
      if (typeof incrementInvoiceNumber === 'function') {
        incrementInvoiceNumber();
      }
      
      // محاولة إرسال عبر واتساب (نص + صورة)
      // ملاحظة: واتساب ويب لا يدعم إرسال الصور مباشرة من الرابط
      // لذلك سنرسل النص مع رابط تحميل الصورة، أو نفتح واتساب مع النص
      
      const messageText = `🏝️ *مارينا فيش*\n📄 فاتورة رقم: #${invoiceNum}\n💰 الإجمالي: ${totalAmount} ج.م\n👤 ${name}\n📞 ${phone}\n\n✨ تم إنشاء فاتورة الطلب - يمكنك حفظ الصورة المرفقة مع الطلب ✨`;
      
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(messageText)}`;
      window.open(whatsappUrl, "_blank");
      
      // عرض رابط تحميل الصورة للعميل
      const imageUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = imageUrl;
      downloadLink.download = `فاتورة_مارينا_فيش_${invoiceNum}.png`;
      downloadLink.click();
      
      alert(`✅ تم إنشاء فاتورة رقم #${invoiceNum}\n📸 تم حفظ صورة الفاتورة على جهازك\n💬 سيتم فتح واتساب لإرسال تفاصيل الطلب`);
      
      URL.revokeObjectURL(imageUrl);
      
    }, 'image/png', 1.0);
    
  } catch(error) {
    console.error('خطأ في إنشاء الصورة:', error);
    alert('حدث خطأ في إنشاء الصورة. سيتم إرسال النص فقط.');
    
    // إرسال نص عادي كبديل
    sendTextOnly();
  }
  
  // إخفاء العنصر مرة أخرى
  previewElem.style.left = '-9999px';
}

// دالة بديلة لإرسال النص فقط
function sendTextOnly() {
  const name = document.getElementById("cust-name").value.trim();
  const phone = document.getElementById("cust-phone").value.trim();
  const address = document.getElementById("cust-addr").value.trim();
  const pickupTime = document.getElementById("pickup-time").value.trim();
  const notes = document.getElementById("cust-notes").value.trim();
  
  let subTotal = 0;
  let itemsText = '';
  for (const l of cart.values()) {
    const itemTotal = l.unitPrice * l.qty;
    subTotal += itemTotal;
    itemsText += `🟡 ${l.name} : ${l.unitPrice} × ${l.qty} = ${itemTotal} ج.م\n`;
  }
  
  const deliveryFee = typeof DELIVERY_FEE !== 'undefined' ? DELIVERY_FEE : 50;
  const totalAmount = subTotal + deliveryFee;
  
  let invoiceNum = 701;
  if (typeof getInvoiceNumber === 'function') {
    invoiceNum = getInvoiceNumber();
  }
  
  const now = new Date();
  const invoiceDate = now.toLocaleString('ar-EG');
  
  let message = `🏝️ *مارينا فيش*\n`;
  message += `📄 فاتورة رقم: #${invoiceNum}\n`;
  message += `📅 ${invoiceDate}\n`;
  message += `━━━━━━━━━━━━━━━━━━\n\n`;
  message += `${itemsText}\n`;
  message += `━━━━━━━━━━━━━━━━━━\n`;
  message += `💰 المجموع الفرعي: ${subTotal} ج.م\n`;
  message += `🛵 خدمة التوصيل: ${deliveryFee} ج.م\n`;
  message += `💵 *الإجمالي: ${totalAmount} ج.م*\n`;
  message += `━━━━━━━━━━━━━━━━━━\n\n`;
  message += `👤 *بيانات العميل:*\n`;
  message += `📛 الاسم: ${name}\n`;
  message += `📞 الهاتف: ${phone}\n`;
  message += `📍 العنوان: ${address}\n`;
  if (pickupTime) message += `⏰ وقت الاستلام: ${pickupTime}\n`;
  if (notes) message += `📝 ملاحظات: ${notes}\n`;
  message += `\n✨ شكراً لتسوقكم مع مارينا فيش ✨`;
  
  if (typeof incrementInvoiceNumber === 'function') incrementInvoiceNumber();
  
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
  alert(`✅ تم إرسال الطلب رقم #${invoiceNum}`);
}