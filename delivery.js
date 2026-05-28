// ======== خدمة التوصيل ========
const DELIVERY_FEE = 50; // رسم التوصيل 50 جنيه
const WHATSAPP_NUMBER = "01040440885"; // رقم الواتساب الجديد
const SHOP_NAME = "مارينا فيش";

// ======== نظام رقم الفاتورة ========
function getInvoiceNumber() {
  const today = new Date().toDateString();
  const stored = localStorage.getItem("invoice_data");
  let invoiceNum = 701;
  let lastDate = null;
  
  if (stored) {
    try {
      const data = JSON.parse(stored);
      lastDate = data.date;
      if (lastDate === today) {
        invoiceNum = data.number;
      } else {
        // يوم جديد - يبدأ من 701
        invoiceNum = 701;
      }
    } catch(e) {}
  }
  
  // حفظ الرقم الجديد
  localStorage.setItem("invoice_data", JSON.stringify({
    date: today,
    number: invoiceNum
  }));
  
  return invoiceNum;
}

function incrementInvoiceNumber() {
  const today = new Date().toDateString();
  const stored = localStorage.getItem("invoice_data");
  let currentNum = 701;
  
  if (stored) {
    try {
      const data = JSON.parse(stored);
      if (data.date === today) {
        currentNum = data.number;
      }
    } catch(e) {}
  }
  
  const newNum = currentNum + 1;
  localStorage.setItem("invoice_data", JSON.stringify({
    date: today,
    number: newNum
  }));
  
  return newNum;
}