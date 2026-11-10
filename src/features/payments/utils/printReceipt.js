/**
 * In riêng biên lai. Gắn class lên <body> trong lúc in thay vì ẩn bằng selector cố định, vì biên lai
 * có thể nằm trong modal, drawer hay trang chi tiết. CSS in nằm trong PaymentReceipt.
 */
export const printReceipt = () => {
  document.body.classList.add('printing-receipt');
  const done = () => { document.body.classList.remove('printing-receipt'); window.removeEventListener('afterprint', done); };
  window.addEventListener('afterprint', done);
  window.print();
};
