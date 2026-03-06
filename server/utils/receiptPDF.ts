import { renderReceiptHTML } from "./receiptTemplate.js";
import type { Receipt } from "@shared/schema";

export async function generateReceiptClientDownload(receipt: Receipt, company: any): Promise<string> {
    const rawHtml = renderReceiptHTML(receipt, company);

    // We wrap the raw HTML in a generic full-page loader that automatically 
    // invokes html2pdf.js to force download the PDF on the client's local device.
    // This perfectly bypasses all Vercel/cPanel EACCES Chromium restrictions.
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Downloading Receipt ${receipt.receiptNumber}...</title>
    <!-- Include html2pdf.js from CDN -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
    <style>
        body { margin: 0; padding: 0; background-color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; }
        #loader-screen {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(255, 255, 255, 0.95); z-index: 9999;
            display: flex; flex-direction: column; justify-content: center; align-items: center;
        }
        .spinner {
            width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top-color: #6d28d9;
            border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        h2 { color: #0f172a; margin: 0 0 8px 0; }
        p { color: #64748b; margin: 0; }
        
        /* The printable container needs exact A4 styles for html2pdf to scale it */
        #printable-receipt {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            background: white;
            padding: 0; /* padding is handled inside template */
        }
    </style>
</head>
<body>
    <div id="loader-screen">
        <div class="spinner" id="spin-icon"></div>
        <h2 id="status-title">Generating your PDF...</h2>
        <p id="status-sub">Please wait while we prepare Receipt ${receipt.receiptNumber}</p>
        
        <button id="close-btn" style="display:none; margin-top:24px; padding:10px 24px; background:#6d28d9; color:white; border:none; border-radius:8px; font-weight:600; cursor:pointer;" onclick="window.close()">
            Close Window
        </button>
    </div>

    <!-- The physical receipt rendered off-screen (but still in DOM) to be captured -->
    <div style="position: absolute; top: 0; left: -9999px;">
        <div id="printable-receipt">
            ${rawHtml}
        </div>
    </div>

    <script>
        window.onload = function() {
            const element = document.getElementById('printable-receipt');
            const receiptName = 'Receipt_${receipt.receiptNumber}.pdf';

            const opt = {
                margin:       0,
                filename:     receiptName,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true, logging: false },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            // Start generation
            html2pdf().set(opt).from(element).save()
                .then(() => {
                    document.getElementById('spin-icon').style.display = 'none';
                    document.getElementById('status-title').innerText = 'PDF Downloaded!';
                    document.getElementById('status-title').style.color = '#059669';
                    document.getElementById('status-sub').innerText = 'Your receipt has been safely downloaded to your device.';
                    document.getElementById('close-btn').style.display = 'block';
                })
                .catch(err => {
                    document.getElementById('spin-icon').style.display = 'none';
                    document.getElementById('status-title').innerText = 'Error Generating PDF';
                    document.getElementById('status-title').style.color = '#dc2626';
                    document.getElementById('status-sub').innerText = err.message || 'There was a problem preparing the file.';
                });
        };
    </script>
</body>
</html>
    `;
}
