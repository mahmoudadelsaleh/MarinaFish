// ======== خدمة التوصيل ونظام الفاتورة ========
const DELIVERY_FEE = 50;
const WHATSAPP_NUMBER = "00201111214238";
const SHOP_NAME = "مارينا فيش";

// ======== نظام رقم الفاتورة ========
function getInvoiceNumber() {
  const today = new Date().toDateString();
  const stored = localStorage.getItem("invoice_data");
  let invoiceNum = 701;
  
  if (stored) {
    try {
      const data = JSON.parse(stored);
      if (data.date === today) {
        invoiceNum = data.number;
      }
    } catch(e) {}
  }
  
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