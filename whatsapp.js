// ======== نظام الفاتورة كصورة وإرسالها للواتساب ========

async function sendWhatsApp() {
  // التحقق من السلة
  if (typeof cart === 'undefined' || cart.size === 0) {
    alert("❌ السلة فارغة! أضف بعض الأصناف أولاً.");
    return;
  }
  
  // جلب بيانات العميل
  const name = document.getElementById("cust-name").value.trim();
  const phone = document.getElementById("cust-phone").value.trim();
  const address = document.getElementById("cust-addr").value.trim();
  const pickupTime = document.getElementById("pickup-time").value.trim();
  const notes = document.getElementById("cust-notes").value.trim();
  
  // التحقق من البيانات الإلزامية
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
  let itemsArray = [];
  
  for (const l of cart.values()) {
    const itemTotal = l.unitPrice * l.qty;
    subTotal += itemTotal;
    itemsArray.push({
      name: l.name,
      unitPrice: l.unitPrice,
      qty: l.qty,
      total: itemTotal
    });
  }
  
  const deliveryFee = typeof DELIVERY_FEE !== 'undefined' ? DELIVERY_FEE : 50;
  const totalAmount = subTotal + deliveryFee;
  
  // الحصول على رقم الفاتورة
  let invoiceNum = 701;
  if (typeof getInvoiceNumber === 'function') {
    invoiceNum = getInvoiceNumber();
  }
  
  // التاريخ
  const now = new Date();
  const invoiceDate = now.toLocaleString('ar-EG', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // بناء HTML الفاتورة للصورة
  let itemsHtml = '';
  for (let i = 0; i < itemsArray.length; i++) {
    const item = itemsArray[i];
    itemsHtml += `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px dashed #e0e0e0;">
        <div style="flex: 2;">
          <div style="font-weight: bold; font-size: 14px; color: #1a1a2e;">${escapeHtml(item.name)}</div>
          <div style="font-size: 11px; color: #888;">${item.unitPrice} ج.م × ${item.qty}</div>
        </div>
        <div style="font-weight: bold; font-size: 14px; color: #c9a03d;">${item.total} ج.م</div>
      </div>
    `;
  }
  
  const invoiceHTML = `
    <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
      <!-- الهيدر -->
      <div style="background: linear-gradient(135deg, #0d1424, #1a1a2e); color: white; padding: 20px; text-align: center;">
        <div style="font-size: 28px; font-weight: bold; color: #c9a03d;">🐟 مارينا فيش</div>
        <div style="font-size: 12px; opacity: 0.8;">MARINA FISH - منذ 1995</div>
        <div style="margin-top: 12px;">
          <span style="background: #c9a03d; color: #0d1424; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: bold;">فاتورة #${invoiceNum}</span>
        </div>
        <div style="font-size: 11px; opacity: 0.7; margin-top: 8px;">📅 ${invoiceDate}</div>
      </div>
      
      <!-- المحتوى -->
      <div style="padding: 20px;">
        <!-- الأصناف -->
        <div style="margin-bottom: 20px;">
          <div style="font-weight: bold; font-size: 16px; margin-bottom: 12px; color: #1a1a2e; border-right: 3px solid #c9a03d; padding-right: 10px;">🍽️ الأصناف المطلوبة</div>
          ${itemsHtml}
        </div>
        
        <!-- الإجماليات -->
        <div style="background: #f8f8f8; padding: 15px; border-radius: 12px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #666;">المجموع الفرعي</span>
            <span style="font-weight: bold;">${subTotal} ج.م</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #666;">🛵 خدمة التوصيل</span>
            <span style="font-weight: bold;">${deliveryFee} ج.م</span>
          </div>
          <div style="border-top: 1px solid #ddd; margin: 10px 0;"></div>
          <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold;">
            <span>🇪🇬 الإجمالي</span>
            <span style="color: #c9a03d;">${totalAmount} ج.م</span>
          </div>
        </div>
        
        <!-- بيانات العميل -->
        <div style="margin-bottom: 15px;">
          <div style="font-weight: bold; font-size: 14px; margin-bottom: 10px; color: #1a1a2e; border-right: 3px solid #c9a03d; padding-right: 10px;">👤 بيانات العميل</div>
          <div style="background: #f8f8f8; padding: 12px; border-radius: 10px; font-size: 13px;">
            <div><span style="color: #666;">📛 الاسم:</span> ${escapeHtml(name)}</div>
            <div><span style="color: #666;">📞 الهاتف:</span> ${escapeHtml(phone)}</div>
            <div><span style="color: #666;">📍 العنوان:</span> ${escapeHtml(address)}</div>
            ${pickupTime ? `<div><span style="color: #666;">⏰ وقت الاستلام:</span> ${escapeHtml(pickupTime)}</div>` : ''}
            ${notes ? `<div><span style="color: #666;">📝 ملاحظات:</span> ${escapeHtml(notes)}</div>` : ''}
          </div>
        </div>
      </div>
      
      <!-- الفوتر -->
      <div style="background: #f0f0f0; padding: 12px; text-align: center; font-size: 11px; color: #888;">
        ✨ شكراً لتسوقكم مع مارينا فيش ✨
      </div>
    </div>
  `;
  
  // وضع المحتوى في عنصر التصوير
  const captureContainer = document.getElementById('capture-content');
  if (captureContainer) {
    captureContainer.innerHTML = invoiceHTML;
  }
  
  // إظهار العنصر مؤقتاً للتصوير
  const captureElem = document.getElementById('invoice-capture');
  captureElem.style.left = '0';
  captureElem.style.opacity = '1';
  captureElem.style.position = 'fixed';
  captureElem.style.top = '0';
  captureElem.style.zIndex = '9999';
  
  // انتظار التحميل
  await new Promise(resolve => setTimeout(resolve, 200));
  
  try {
    // تحويل إلى صورة
    const canvas = await html2canvas(captureElem, {
      scale: 2.5,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
      windowWidth: captureElem.scrollWidth,
      windowHeight: captureElem.scrollHeight
    });
    
    // تحويل canvas إلى blob
    canvas.toBlob(async (blob) => {
      // إنشاء ملف الصورة
      const imageFile = new File([blob], `invoice_${invoiceNum}.png`, { type: 'image/png' });
      const imageUrl = URL.createObjectURL(blob);
      
      // حفظ الصورة على جهاز العميل
      const downloadLink = document.createElement('a');
      downloadLink.href = imageUrl;
      downloadLink.download = `فاتورة_مارينا_فيش_${invoiceNum}.png`;
      downloadLink.click();
      
      // زيادة رقم الفاتورة
      if (typeof incrementInvoiceNumber === 'function') {
        incrementInvoiceNumber();
      }
      
      // فتح واتساب مع الصورة (على الموبايل)
      // ملاحظة: واتساب ويب لا يدعم إرفاق الصور تلقائياً
      // الحل: فتح واتساب مع رابط الصورة أو استخدام واتساب API على الموبايل
      
      const messageText = `🏝️ *مارينا فيش* 🏝️\n📄 فاتورة رقم: #${invoiceNum}\n💰 الإجمالي: ${totalAmount} ج.م\n👤 ${name}\n📞 ${phone}\n\n📸 تم إرفاق صورة الفاتورة بالطلب\n✨ شكراً لثقتكم ✨`;
      
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(messageText)}`;
      window.open(whatsappUrl, "_blank");
      
      // عرض تنبيه للعميل
      setTimeout(() => {
        alert(`✅ تم إنشاء فاتورة رقم #${invoiceNum}\n\n📸 تم حفظ صورة الفاتورة على جهازك.\n\n💬 سيتم فتح واتساب، الرجاء إرفاق الصورة يدوياً مع الرسالة.\n\n📍 يمكنك الآن مشاركة الصورة مع المطعم.`);
      }, 500);
      
      setTimeout(() => {
        URL.revokeObjectURL(imageUrl);
      }, 5000);
      
    }, 'image/png', 1.0);
    
  } catch(error) {
    console.error('خطأ في إنشاء الصورة:', error);
    alert('حدث خطأ في إنشاء الصورة. سيتم إرسال النص فقط.');
    sendTextOnlyFallback();
  }
  
  // إخفاء العنصر
  setTimeout(() => {
    captureElem.style.left = '-9999px';
  }, 1000);
}

// دالة بديلة في حالة فشل الصورة
function sendTextOnlyFallback() {
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
  alert(`✅ تم إرسال الطلب رقم #${invoiceNum} (نص فقط)`);
}

// دالة مساعدة لتجنب XSS
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  }).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function(c) {
    return c;
  });
}