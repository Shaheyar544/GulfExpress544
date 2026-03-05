import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { type LineItem } from "@shared/schema";

// Generate sequential receipt number
export async function generateReceiptNumber(prefix = "RCP"): Promise<string> {
    const counterRef = doc(db, "receipt_counter", "main");
    const counterSnap = await getDoc(counterRef);
    const current = counterSnap.exists() ? counterSnap.data().current : 0;
    const next = current + 1;
    await setDoc(counterRef, { current: next });
    const year = new Date().getFullYear();
    return `${prefix}-${year}-${String(next).padStart(6, "0")}`;
}

// Build line items from shipment data
export function buildLineItems(shipment: any, courierAmount: number, discountPercent = 0): LineItem[] {
    const vatRate = 0.05;
    const baseAmount = courierAmount / (1 + vatRate);
    const items: LineItem[] = [];

    // Main courier service
    items.push({
        description: `${shipment.serviceType || "Express"} Courier Service — ${shipment.originEmirate} to ${shipment.destinationEmirate}`,
        detail: `Door-to-door delivery · Weight: ${shipment.parcelWeight || 0}kg`,
        quantity: 1,
        unitPrice: parseFloat(baseAmount.toFixed(2)),
        discount: discountPercent,
        vatAmount: parseFloat((baseAmount * (1 - discountPercent / 100) * vatRate).toFixed(2)),
        total: parseFloat((baseAmount * (1 - discountPercent / 100) * (1 + vatRate)).toFixed(2)),
    });

    // Pickup fee if applicable
    if (shipment.pickupRequired) {
        const pickupBase = 14.29;
        items.push({
            description: "Doorstep Pickup Fee",
            detail: "Collection from sender address",
            quantity: 1,
            unitPrice: pickupBase,
            discount: 0,
            vatAmount: parseFloat((pickupBase * vatRate).toFixed(2)),
            total: parseFloat((pickupBase * (1 + vatRate)).toFixed(2)),
        });
    }

    return items;
}

// Load all company config from Firestore site_configs
export async function loadCompanyConfig(): Promise<Record<string, string>> {
    const keys = [
        "company_name", "company_address", "company_trn", "company_vat_reg",
        "company_email", "company_phone", "company_vat_rate", "receipt_prefix",
        "receipt_terms_1", "receipt_terms_2", "receipt_terms_3", "receipt_terms_4",
        "receipt_terms_5", "receipt_terms_6", "receipt_terms_7", "receipt_terms_8"
    ];
    const config: Record<string, string> = {
        // defaults
        company_name: "Gulf Express Courier LLC",
        company_address: "Office 412, Business Bay Tower, Business Bay, Dubai, UAE",
        company_trn: "100 4567 8900 003",
        company_vat_reg: "AE-VAT-GE-2024",
        company_email: "billing@gulfexpress.org",
        company_phone: "+971 4 000 0000",
        company_vat_rate: "5",
        receipt_prefix: "RCP",
        receipt_terms_1: "Liability limited to AED 500 unless additional insurance purchased.",
        receipt_terms_2: "Not liable for delays due to customs, force majeure, or incorrect address.",
        receipt_terms_3: "Prohibited items: cash, firearms, narcotics, perishables, hazardous materials.",
        receipt_terms_4: "Claims for loss/damage must be filed within 7 days of expected delivery.",
        receipt_terms_5: "All disputes subject to Dubai Courts under UAE Federal Law.",
        receipt_terms_6: "Refunds processed within 5–7 business days to original payment method.",
        receipt_terms_7: "By using Gulf Express you agree to full Terms at gulfexpress.org/terms.",
        receipt_terms_8: "Computer-generated invoice valid without signature per UAE e-commerce law.",
    };

    try {
        for (const key of keys) {
            const snap = await getDoc(doc(db, "site_configs", key));
            if (snap.exists() && snap.data().value) {
                config[key] = snap.data().value;
            }
        }
    } catch (error) {
        console.error("Error loading company config:", error);
    }

    return config;
}

// Convert number to words (AED)
export function numberToWords(amount: number): string {
    try {
        const { toWords } = require("number-to-words");
        const dirhams = Math.floor(amount);
        const fils = Math.round((amount - dirhams) * 100);
        let words = toWords(dirhams).replace(/\b\w/g, (l: string) => l.toUpperCase());
        if (fils > 0) {
            words += ` and ${toWords(fils).replace(/\b\w/g, (l: string) => l.toUpperCase())} Fils`;
        }
        return `${words} UAE Dirhams Only`;
    } catch (error) {
        return `AED ${amount.toFixed(2)} Only`;
    }
}
