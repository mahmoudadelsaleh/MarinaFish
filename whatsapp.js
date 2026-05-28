// ======== إعدادات الواتساب مع إرسال الصورة ========
const WHATSAPP_NUMBER = "201040440805";
const SHOP_NAME       = "مارينا فيش";

// دالة لتوليد الفاتورة كصورة
async function generateInvoiceImage() {
    // إنشاء عنصر مؤقت يحمل الفاتورة بشكل جميل
    const div = document.createElement('div');
    div.style.cssText = `
        background: white;
        padding: 20px;
        font-family: 'Cairo', monospace;
        direction: rtl;
        width: 400px;
        color: black;
        border-radius: 12px;
        box-shadow: 0 0 20px rgba(0,0,0,0.1);
    `;
    
    // بناء محتوى الفاتورة
    const {sub, total} = totals();
    let itemsHtml = '';
    for (const l of cart.values()) {
        itemsHtml += `<div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #eee;">
            <span>${l.name} × ${l.qty}</span>
            <span>${l.unitPrice * l.qty} ج.م</span>
        </div>`;
    }
    
    div.innerHTML = `
        <div style="text-align: center; margin-bottom: 16px;">
            <div style="font-size: 20px; font-weight: bold; color: #d9b35a;">MARINA FISH</div>
            <div style="font-size: 12px;">فاتورة #${Date.now().toString().slice(-6)}</div>
            <div style="font-size: 11px;">${new Date().toLocaleString('ar-EG')}</div>
        </div>
        <div style="border-top: 2px solid #d9b35a; margin: 10px 0;"></div>
        ${itemsHtml}
        <div style="border-top: 1px dashed #ccc; margin: 10px 0;"></div>
        <div style="display: flex; justify-content: space-between; padding: 6px 0;">
            <span>المجموع الفرعي</span>
            <span>${sub} ج.م</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 6px 0;">
            <span>توصيل</span>
            <span>${cart.size > 0 ? DELIVERY_FEE : 0} ج.م</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 10px 0; font-weight: bold; font-size: 16px; border-top: 2px solid #d9b35a;">
            <span>الإجمالي</span>
            <span style="color: #d9b35a;">${total} ج.م</span>
        </div>
        <div style="border-top: 1px dashed #ccc; margin: 10px 0;"></div>
        <div style="font-size: 11px; text-align: center; color: #666;">
            ${document.getElementById("cust-name")?.value || 'عميل'} | 
            ${document.getElementById("cust-phone")?.value || ''}
        </div>
    `;
    
    document.body.appendChild(div);
    const canvas = await html2canvas(div, { scale: 2, backgroundColor: '#ffffff' });
    document.body.removeChild(div);
    
    return canvas.toDataURL('image/png');
}

// الدالة الرئيسية للإرسال
async function sendWhatsApp() {
    if (cart.size === 0) {
        alert("سلة الطلب فارغة");
        return;
    }
    
    const name = document.getElementById("cust-name")?.value.trim() || '';
    const phone = document.getElementById("cust-phone")?.value.trim() || '';
    const addr = document.getElementById("cust-addr")?.value.trim() || '';
    const {sub, total} = totals();
    
    // بناء النص
    let text = `🐟 *طلب جديد من ${SHOP_NAME}*\n\n`;
    text += `*الأصناف:*\n`;
    let i = 1;
    for (const l of cart.values()) {
        text += `${i++}. ${l.name} × ${l.qty} = ${l.unitPrice * l.qty} ج.م\n`;
    }
    text += `\nالمجموع الفرعي: ${sub} ج.م`;
    text += `\n🛵 التوصيل: ${DELIVERY_FEE} ج.م`;
    text += `\n*الإجمالي: ${total} ج.م*\n`;
    
    if (name || phone || addr) {
        text += `\n*بيانات العميل:*\n`;
        if (name) text += `الاسم: ${name}\n`;
        if (phone) text += `الموبايل: ${phone}\n`;
        if (addr) text += `العنوان: ${addr}\n`;
    }
    
    // توليد الصورة
    const imageDataUrl = await generateInvoiceImage();
    
    // تحويل الصورة إلى blob للمشاركة
    const blob = await (await fetch(imageDataUrl)).blob();
    const file = new File([blob], `فاتورة_${Date.now()}.png`, { type: 'image/png' });
    
    // المحاولة الأولى: مشاركة مباشرة (للموبايل)
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
            title: `فاتورة ${SHOP_NAME}`,
            text: text.replace(/\*/g, ''),
            files: [file]
        });
    } 
    // المحاولة الثانية: فتح واتساب مع الصورة محفوظة مؤقتاً
    else {
        // حفظ الصورة مؤقتاً وفتح واتساب
        const a = document.createElement('a');
        a.href = imageDataUrl;
        a.download = `فاتورة_${Date.now()}.png`;
        a.click();
        
        // فتح واتساب مع النص
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
        
        setTimeout(() => {
            alert("تم حفظ الصورة. أرفقها مع الرسالة في واتساب");
        }, 1000);
    }
}