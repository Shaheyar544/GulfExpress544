import { chromium } from "playwright";
import { renderReceiptHTML } from "./receiptTemplate.js";
import type { Receipt } from "@shared/schema";
import path from "path";
import fs from "fs";

const RECEIPTS_DIR = path.join(process.cwd(), "generated_receipts");

// Ensure the directory exists
if (!fs.existsSync(RECEIPTS_DIR)) {
    fs.mkdirSync(RECEIPTS_DIR, { recursive: true });
}

export async function generateReceiptPDF(receipt: Receipt, company: any): Promise<string> {
    const html = renderReceiptHTML(receipt, company);
    const tempPath = path.join(RECEIPTS_DIR, `_temp_${receipt.receiptNumber}.html`);
    const outputPath = path.join(RECEIPTS_DIR, `${receipt.receiptNumber}.pdf`);

    // Write HTML to a temporary file
    fs.writeFileSync(tempPath, html, "utf-8");

    // Launch Playwright and render PDF
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(`file://${tempPath}`, { waitUntil: "networkidle" });

    await page.addStyleTag({ content: '@page { size: auto; margin: 0mm; } body { margin: 0; }' });

    await page.pdf({
        path: outputPath,
        format: "A4",
        printBackground: true,
        scale: 0.95, // Scale down slightly to ensure it doesn't bleed to page 2
        margin: { top: "0", bottom: "0", left: "0", right: "0" },
    });

    await browser.close();

    // Cleanup temp HTML
    try {
        fs.unlinkSync(tempPath);
    } catch (err) {
        console.warn(`Failed to cleanup temp file ${tempPath}`);
    }

    return outputPath;
}
