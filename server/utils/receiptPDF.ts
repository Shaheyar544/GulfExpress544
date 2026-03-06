import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
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
    const outputPath = path.join(RECEIPTS_DIR, `${receipt.receiptNumber}.pdf`);

    // Launch serverless Chromium
    const browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();

    // Pass raw HTML directly rather than resolving a local temp file URL, which also 
    // bypasses tricky Vercel local filesystem read-locks
    await page.setContent(html, { waitUntil: "networkidle0" });

    // Inject custom print margins CSS explicitly
    await page.addStyleTag({ content: '@page { size: auto; margin: 0mm; } body { margin: 0; }' });

    // Generate PDF at A4 scaling 
    await page.pdf({
        path: outputPath,
        format: "A4",
        printBackground: true,
        scale: 0.95,
        margin: { top: "0", bottom: "0", left: "0", right: "0" },
    });

    await browser.close();

    return outputPath;
}
