import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { renderReceiptHTML } from "./receiptTemplate.js";
import type { Receipt } from "@shared/schema";

export async function generateReceiptPDFBuffer(receipt: Receipt, company: any): Promise<Buffer> {
    const html = renderReceiptHTML(receipt, company);

    // Launch serverless Chromium
    const sparticuz: any = chromium;
    const browser = await puppeteer.launch({
        args: sparticuz.args,
        defaultViewport: sparticuz.defaultViewport,
        executablePath: await sparticuz.executablePath(),
        headless: sparticuz.headless,
        ignoreHTTPSErrors: true,
    } as any);

    const page = await browser.newPage();

    // Pass raw HTML directly rather than resolving a local temp file URL, which also 
    // bypasses tricky Vercel local filesystem read-locks
    await page.setContent(html, { waitUntil: "networkidle0" });

    // Inject custom print margins CSS explicitly
    await page.addStyleTag({ content: '@page { size: auto; margin: 0mm; } body { margin: 0; }' });

    // Generate PDF at A4 scaling directly into memory
    const pdfUint8Array = await page.pdf({
        format: "A4",
        printBackground: true,
        scale: 0.95,
        margin: { top: "0", bottom: "0", left: "0", right: "0" },
    });

    await browser.close();

    return Buffer.from(pdfUint8Array);
}
