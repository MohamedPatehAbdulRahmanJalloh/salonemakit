import { useRegion } from "@/context/RegionContext";

interface OrderData {
  id: string;
  created_at: string;
  customer_name: string;
  phone: string;
  address: string;
  district: string;
  payment_method: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  coupon_code: string | null;
  order_items: {
    id: string;
    product_name: string;
    product_price: number;
    quantity: number;
    selected_size: string | null;
  }[];
}

export const generateInvoiceHTML = (order: OrderData, formatPrice: (n: number) => string) => {
  const date = new Date(order.created_at).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  const itemRows = order.order_items.map((item) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${item.product_name}${item.selected_size ? ` (${item.selected_size})` : ""}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">${formatPrice(item.product_price)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;">${formatPrice(item.product_price * item.quantity)}</td>
    </tr>
  `).join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice #${order.id.slice(0, 8).toUpperCase()}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111; padding: 40px; max-width: 800px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 3px solid #1a5c3a; padding-bottom: 20px; }
        .brand { font-size: 24px; font-weight: 800; color: #1a5c3a; }
        .brand-sub { font-size: 11px; color: #666; margin-top: 2px; }
        .invoice-title { text-align: right; }
        .invoice-title h1 { font-size: 28px; color: #1a5c3a; }
        .invoice-title p { font-size: 12px; color: #666; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
        .info-box h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; margin-bottom: 8px; }
        .info-box p { font-size: 13px; color: #333; line-height: 1.6; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        th { background: #1a5c3a; color: white; padding: 10px 12px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
        th:nth-child(2), th:nth-child(3), th:nth-child(4) { text-align: center; }
        th:last-child { text-align: right; }
        td { font-size: 13px; }
        .totals { margin-left: auto; width: 280px; }
        .totals .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #555; }
        .totals .row.total { border-top: 2px solid #1a5c3a; padding-top: 10px; margin-top: 6px; font-size: 18px; font-weight: 800; color: #1a5c3a; }
        .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 11px; color: #999; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="brand">SaloneMakitSL</div>
          <div class="brand-sub">DI PLACE FO SHOP</div>
          <p style="font-size:12px;color:#666;margin-top:8px;">WhatsApp: +232 78 928 111</p>
        </div>
        <div class="invoice-title">
          <h1>INVOICE</h1>
          <p>#${order.id.slice(0, 8).toUpperCase()}</p>
          <p>${date}</p>
        </div>
      </div>

      <div class="info-grid">
        <div class="info-box">
          <h3>Bill To</h3>
          <p><strong>${order.customer_name}</strong></p>
          <p>${order.address}</p>
          <p>${order.district}</p>
          <p>${order.phone}</p>
        </div>
        <div class="info-box">
          <h3>Payment</h3>
          <p>${order.payment_method === "orange_money" ? "Orange Money" : "Cash on Delivery"}</p>
          ${order.coupon_code ? `<p style="margin-top:4px;">Coupon: <strong>${order.coupon_code}</strong></p>` : ""}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th style="text-align:center;">Qty</th>
            <th style="text-align:right;">Unit Price</th>
            <th style="text-align:right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>

      <div class="totals">
        <div class="row"><span>Subtotal</span><span>${formatPrice(order.subtotal)}</span></div>
        <div class="row"><span>Delivery</span><span>${formatPrice(order.delivery_fee)}</span></div>
        <div class="row total"><span>Total</span><span>${formatPrice(order.total)}</span></div>
      </div>

      <div class="footer">
        <p>Thank you for shopping with SaloneMakitSL!</p>
        <p style="margin-top:4px;">Di Place Fo Shop • salonemakit.lovable.app</p>
      </div>
    </body>
    </html>
  `;
};

export const downloadInvoice = (order: OrderData, formatPrice: (n: number) => string) => {
  const html = generateInvoiceHTML(order, formatPrice);
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    // Auto-trigger print dialog for PDF save
    setTimeout(() => printWindow.print(), 500);
  }
};
