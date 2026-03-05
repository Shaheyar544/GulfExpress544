import { type Receipt } from "@shared/schema";

export function renderReceiptHTML(receipt: Receipt, company: any): string {
  // Extract terms from company config (up to 8)
  const terms = [];
  for (let i = 1; i <= 8; i++) {
    const term = company[`receipt_terms_${i}`];
    if (term) terms.push(term);
  }

  // Format dates
  const issueDateStr = new Date(receipt.issueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const supplyDateStr = new Date(receipt.supplyDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const generatedStr = new Date(receipt.generatedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' GST';

  // Build rows for line items
  const rows = receipt.lineItems.map((item, index) => {
    return `
    <tr>
      <td style="color:#94a3b8;text-align:center;font-size:11px">${index + 1}</td>
      <td>
        <div class="svc-n">${item.description}</div>
        <div class="svc-d">${item.detail}</div>
      </td>
      <td>${item.quantity}</td>
      <td>AED ${item.unitPrice.toFixed(2)}</td>
      <td style="${item.discount > 0 ? '' : 'color:#94a3b8'}">${item.discount > 0 ? '−' + item.discount + '%' : '—'}</td>
      <td>AED ${item.vatAmount.toFixed(2)}</td>
      <td style="font-weight:600">AED ${item.total.toFixed(2)}</td>
    </tr>
    `;
  }).join('');

  // Build T&C items
  const tcHTML = terms.map(t => `<div class="r-tc-i">${t}</div>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>VAT Receipt — ${receipt.receiptNumber}</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    :root {
      --ink: #0a0f1a; --ink2: #2d3748; --ink3: #64748b; --ink4: #94a3b8;
      --rule: #e2e8f0; --rule2: #cbd5e1;
      --purple: #7c3aed; --purple-l: #ede9fe;
      --teal: #0d9488; --teal-l: #ccfbf1;
      --gold: #b45309; --gold-bg: #fffbeb;
      --green: #065f46; --green-bg: #d1fae5;
      --bg: #fff; --white: #fff;
    }
    @page { size: A4; margin: 0; }
    body { background: var(--bg); font-family: 'DM Sans', sans-serif; color: var(--ink); width: 210mm; padding: 15px 15px; margin: 0 auto; box-sizing: border-box; }
    .wrap { max-width: 860px; margin: 0 auto; }
    .receipt { background: #fff; position: relative; }
    .r-stripe { height: 6px; background: linear-gradient(90deg, #6d28d9 0%, #7c3aed 35%, #0d9488 70%, #059669 100%); }
    .r-hdr { padding: 15px 25px 15px; display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid var(--rule); }
    .r-logo-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
    .r-logo { width: 45px; height: 45px; background: linear-gradient(135deg, #6d28d9, #4c1d95); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; color: #fff; letter-spacing: -1px; }
    .r-co-name { font-family: 'Playfair Display', serif; font-size: 19px; font-weight: 700; color: var(--ink); letter-spacing: -.3px; }
    .r-co-tag { font-size: 10px; color: var(--ink3); }
    .r-co-det { font-size: 11px; color: var(--ink3); line-height: 1.6; }
    .r-co-det b { color: var(--ink2); font-weight: 500; }
    .r-trn { display: inline-flex; align-items: center; gap: 5px; background: var(--gold-bg); border: 1px solid #fde68a; border-radius: 6px; padding: 4px 10px; margin-top: 8px; font-size: 10.5px; font-weight: 600; color: var(--gold); }
    .r-meta-side { text-align: right; min-width: 215px; }
    .r-type { font-family: 'Playfair Display', serif; font-size: 25px; font-weight: 700; color: var(--ink); letter-spacing: -.4px; margin-bottom: 3px; }
    .r-vbadge { display: inline-block; background: var(--purple-l); color: var(--purple); font-size: 9.5px; font-weight: 700; padding: 3px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: .8px; margin-bottom: 14px; }
    .r-no { font-family: 'DM Mono', monospace; font-size: 14.5px; font-weight: 500; color: var(--purple); margin-bottom: 4px; }
    .r-meta-det { font-size: 11.5px; color: var(--ink3); line-height: 1.85; }
    .r-meta-det b { color: var(--ink2); }
    .r-igrid { display: grid; grid-template-columns: 1fr 1fr 1fr; border-bottom: 1px solid var(--rule); }
    .r-ic { padding: 12px 18px; border-right: 1px solid var(--rule); }
    .r-ic:last-child { border-right: none; }
    .r-cl { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.1px; color: var(--ink4); margin-bottom: 7px; }
    .r-cv { font-size: 12px; color: var(--ink2); line-height: 1.7; }
    .r-cv strong { display: block; font-size: 13px; font-weight: 600; color: var(--ink); margin-bottom: 2px; }
    .r-cv .mono { font-family: 'DM Mono', monospace; font-size: 11.5px; color: var(--purple); font-weight: 500; }
    .rb-route { display: inline-flex; align-items: center; gap: 5px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 5px; padding: 3px 9px; font-size: 10.5px; font-weight: 600; color: var(--green); margin-top: 4px; }
    .rb-pay { display: inline-flex; align-items: center; gap: 5px; background: var(--teal-l); border: 1px solid #99f6e4; border-radius: 5px; padding: 3px 9px; font-size: 10.5px; font-weight: 600; color: var(--teal); margin-top: 5px; }
    /* table */
    .r-tbl { width: 100%; border-collapse: collapse; }
    .r-tbl thead th { background: #f8fafc; padding: 8px 15px; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: .9px; color: var(--ink3); text-align: left; border-bottom: 1px solid var(--rule2); }
    .r-tbl thead th:not(:first-child) { text-align: right; }
    .r-tbl tbody td { padding: 8px 15px; font-size: 11.5px; color: var(--ink2); border-bottom: 1px solid var(--rule); vertical-align: top; }
    .r-tbl tbody td:not(:first-child) { text-align: right; }
    .r-tbl tbody tr:last-child td { border-bottom: none; }
    .svc-n { font-weight: 500; color: var(--ink); }
    .svc-d { font-size: 10.5px; color: var(--ink3); margin-top: 2px; }
    /* totals */
    .r-srow { display: flex; justify-content: flex-end; padding: 8px 22px 0; }
    .r-sbox { min-width: 295px; }
    .r-sr { display: flex; justify-content: space-between; padding: 3px 0; font-size: 11.5px; color: var(--ink2); border-bottom: 1px solid var(--rule); }
    .r-sr:last-child { border-bottom: none; }
    .r-sr.vat { color: var(--teal); }
    .r-sr.vat .rv { color: var(--teal); font-weight: 600; }
    .r-sr.disc { color: #dc2626; }
    .r-sr.disc .rv { color: #dc2626; }
    .r-sr.grand { background: var(--ink); margin: 9px 0 0; padding: 13px 15px; border-radius: 7px; }
    .r-sr.grand .rk { color: #fff; font-weight: 700; font-size: 13.5px; }
    .r-sr.grand .rv { color: #fff; font-weight: 800; font-size: 18px; font-family: 'DM Mono', monospace; }
    .rk {}
    .rv { font-weight: 500; }
    .r-words { text-align: right; padding: 9px 22px 0; font-size: 11px; color: var(--ink3); font-style: italic; }
    .r-words b { font-style: normal; color: var(--ink2); }
    /* vat panel */
    .r-vpanel { margin: 10px 22px 0; background: var(--gold-bg); border: 1px solid #fde68a; border-radius: 8px; padding: 8px 16px; }
    .r-vptitle { font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .9px; color: var(--gold); margin-bottom: 9px; }
    .r-vgrid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; }
    .r-vc { border-right: 1px solid #fde68a; padding: 0 14px; }
    .r-vc:first-child { padding-left: 0; }
    .r-vc:last-child { border-right: none; }
    .r-vcl { font-size: 8.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .6px; color: var(--gold); margin-bottom: 2px; }
    .r-vcv { font-size: 12px; font-weight: 600; color: var(--ink); font-family: 'DM Mono', monospace; }
    /* uae */
    .r-uae { margin: 8px 22px 0; border: 1px solid #bfdbfe; border-radius: 7px; padding: 8px 15px; background: #eff6ff; display: flex; gap: 12px; align-items: flex-start; }
    .r-uae-f { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
    .r-uae-t { font-size: 10.5px; color: #1e40af; line-height: 1.65; }
    .r-uae-t b { color: #1d4ed8; }
    /* tc */
    .r-tc { margin: 8px 22px 0; background: #f8fafc; border: 1px solid var(--rule2); border-radius: 7px; padding: 8px 16px; page-break-inside: avoid; }
    .r-tc-t { font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .9px; color: var(--ink2); margin-bottom: 9px; }
    .r-tc-g { display: grid; grid-template-columns: 1fr 1fr; gap: 5px 20px; }
    .r-tc-i { font-size: 10.5px; color: var(--ink3); line-height: 1.5; padding-left: 11px; position: relative; }
    .r-tc-i::before { content: '•'; position: absolute; left: 0; color: var(--purple); font-weight: 700; }
    /* footer */
    .r-ftr { background: #f8fafc; border-top: 1px solid var(--rule); padding: 10px 22px; margin-top: 10px; display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; page-break-inside: avoid; }
    .r-fl { flex: 1; }
    .r-fl-l { font-size: 8.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .9px; color: var(--ink4); margin-bottom: 3px; }
    .r-fl-t { font-size: 11px; color: var(--ink3); line-height: 1.65; }
    .r-fl-t b { color: var(--ink2); }
    .r-fr { text-align: right; }
    .r-fr-g { font-size: 9.5px; color: var(--ink4); line-height: 1.8; }
    .r-fr-g b { color: var(--ink3); }
    .r-qw { display: flex; flex-direction: column; align-items: center; gap: 3px; }
    .r-ql { font-size: 7.5px; color: var(--ink4); text-transform: uppercase; letter-spacing: .5px; font-weight: 600; }
    .r-bstripe { height: 4px; background: linear-gradient(90deg, #059669, #0d9488, #7c3aed); }
  </style>
</head>
<body>
<div class="wrap">
<div class="receipt">
<div class="r-stripe"></div>

<!-- Header -->
<div class="r-hdr">
  <div>
    <div class="r-logo-row">
      <div class="r-logo">GE</div>
      <div><div class="r-co-name">Gulf Express</div><div class="r-co-tag">UAE's Premier Courier & Logistics Partner</div></div>
    </div>
    <div class="r-co-det">
      <b>${receipt.companyName}</b><br/>
      ${receipt.companyAddress}<br/>
      <b>Tel:</b> ${receipt.companyPhone} · <b>Email:</b> ${receipt.companyEmail}<br/>
      <b>Web:</b> www.${receipt.companyWeb}
    </div>
    <div class="r-trn">🏛 TRN: ${receipt.companyTRN} · VAT Reg: ${receipt.companyVATReg}</div>
  </div>
  <div class="r-meta-side">
    <div class="r-type">Tax Invoice</div>
    <div class="r-vbadge">VAT Receipt · UAE FTA Compliant</div>
    <div class="r-no">${receipt.receiptNumber}</div>
    <div class="r-meta-det">
      <b>Issue Date:</b> ${issueDateStr}<br/>
      <b>Supply Date:</b> ${supplyDateStr}<br/>
      <b>Due Date:</b> Immediate<br/>
      <b>Currency:</b> UAE Dirham (AED)<br/>
      <b>Tracking:</b> <span style="font-family:'DM Mono',monospace;font-size:11px;color:#7c3aed">${receipt.trackingId}</span>
    </div>
  </div>
</div>

<!-- INFO GRID — 3 columns -->
<div class="r-igrid">
  <!-- Col 1: Bill To / Sender (SAME PERSON) -->
  <div class="r-ic">
    <div class="r-cl">📤 Bill To / Sender (From)</div>
    <div class="r-cv">
      <strong>${receipt.senderName}</strong><br/>
      ${receipt.senderAddress ? receipt.senderAddress.replace(/\n/g, '<br/>') + '<br/>' : ''}
      ${receipt.originEmirate}, UAE<br/>
      ${receipt.senderPhone ? '📞 ' + receipt.senderPhone + '<br/>' : ''}
      ${receipt.customerEmail ? '✉ ' + receipt.customerEmail : ''}
    </div>
  </div>

  <!-- Col 2: Receiver (TO) -->
  <div class="r-ic">
    <div class="r-cl">📥 Receiver (To)</div>
    <div class="r-cv">
      <strong>${receipt.receiverName}</strong><br/>
      ${receipt.receiverAddress ? receipt.receiverAddress.replace(/\n/g, '<br/>') + '<br/>' : ''}
      ${receipt.destinationEmirate}, UAE<br/>
      ${receipt.receiverPhone ? '📞 ' + receipt.receiverPhone : ''}
    </div>
  </div>

  <!-- Col 3: Payment -->
  <div class="r-ic">
    <div class="r-cl">Payment Information</div>
    <div class="r-cv">
      <strong>Payment Received ✓</strong>
      <div class="rb-pay">💳 ${receipt.paymentMethod}</div>
      <div style="margin-top:6px">
        Ref: <span class="mono">${receipt.paymentRef}</span><br/>
        Date: ${issueDateStr}<br/>
        Status: <b style="color:#065f46">Paid in Full</b>
      </div>
    </div>
  </div>
</div>

<!-- Services table -->
<table class="r-tbl">
  <thead><tr>
    <th style="width:34px">#</th><th>Service Description</th>
    <th style="width:60px">Qty</th><th style="width:105px">Unit Price</th>
    <th style="width:85px">Discount</th><th style="width:85px">VAT (${receipt.vatRate}%)</th>
    <th style="width:105px">Total (AED)</th>
  </tr></thead>
  <tbody>
    ${rows}
  </tbody>
</table>

<!-- Totals -->
<div class="r-srow">
  <div class="r-sbox">
    <div class="r-sr"><span class="rk">Subtotal (excl. VAT)</span><span class="rv">AED ${receipt.subtotalExVAT.toFixed(2)}</span></div>
    ${receipt.discountAmount > 0 ? `<div class="r-sr disc"><span class="rk">Discount Applied</span><span class="rv">− AED ${receipt.discountAmount.toFixed(2)}</span></div>` : ''}
    <div class="r-sr vat"><span class="rk">VAT @ ${receipt.vatRate}% (UAE FTA)</span><span class="rv">+ AED ${receipt.vatAmount.toFixed(2)}</span></div>
    <div class="r-sr grand"><span class="rk">Total Amount Due</span><span class="rv">AED ${receipt.grandTotal.toFixed(2)}</span></div>
  </div>
</div>
<div class="r-words">Amount in words: <b>${receipt.amountInWords}</b></div>

<!-- VAT Breakdown -->
<div class="r-vpanel">
  <div class="r-vptitle">🏛 UAE FTA VAT Breakdown — Federal Tax Authority Compliant</div>
  <div class="r-vgrid">
    <div class="r-vc"><div class="r-vcl">Taxable Amount</div><div class="r-vcv">AED ${(receipt.subtotalExVAT - receipt.discountAmount).toFixed(2)}</div></div>
    <div class="r-vc"><div class="r-vcl">VAT Rate</div><div class="r-vcv">${receipt.vatRate.toFixed(2)}%</div></div>
    <div class="r-vc"><div class="r-vcl">VAT Amount</div><div class="r-vcv">AED ${receipt.vatAmount.toFixed(2)}</div></div>
    <div class="r-vc"><div class="r-vcl">Total inc. VAT</div><div class="r-vcv">AED ${receipt.grandTotal.toFixed(2)}</div></div>
  </div>
</div>

<!-- UAE Compliance -->
<div class="r-uae">
  <div class="r-uae-f">🇦🇪</div>
  <div class="r-uae-t"><b>UAE Federal Tax Authority (FTA) Compliance:</b> This is a valid Tax Invoice issued under UAE Federal Decree-Law No. 8 of 2017 on Value Added Tax. VAT charged at ${receipt.vatRate}% standard rate. ${receipt.companyName} is registered with UAE FTA under TRN <b>${receipt.companyTRN}</b>. This document must be retained for 5 years as required by UAE tax law. VAT queries: <b>${receipt.companyEmail}</b></div>
</div>

<!-- Terms -->
<div class="r-tc">
  <div class="r-tc-t">📋 Terms & Conditions — UAE Regulatory Compliance</div>
  <div class="r-tc-g">
    ${tcHTML}
  </div>
</div>

<!-- Footer -->
<div class="r-ftr">
  <div class="r-fl">
    <div class="r-fl-l">Support & Contact</div>
    <div class="r-fl-t"><b>${receipt.companyName}</b> · ${receipt.companyAddress}<br/>📞 ${receipt.companyPhone} · ✉ ${receipt.companyEmail} · 🌐 www.${receipt.companyWeb}<br/>Track: ${receipt.companyWeb}/track · Receipt: <b>${receipt.receiptNumber}</b></div>
  </div>
  <div class="r-qw">
    <!-- Static QR code placeholder mapping to verify URL -->
    <img src="https://api.qrserver.com/v1/create-qr-code/?size=68x68&data=https://gulfexpress.org/verify/${receipt.receiptNumber}&margin=0" width="68" height="68" alt="QR Code" style="border-radius:4px;" />
    <div class="r-ql">Verify Receipt</div>
  </div>
  <div class="r-fr">
    <div class="r-fr-g">Generated: <b>Gulf Express System (${receipt.generatedBy})</b><br/>${generatedStr}<br/><b>${receipt.receiptNumber}</b></div>
  </div>
</div>

<div class="r-bstripe"></div>
</div>
</div>
</body>
</html>`;
}
