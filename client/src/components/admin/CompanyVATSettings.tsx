import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

export default function CompanyVATSettings() {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const [config, setConfig] = useState({
        company_name: "",
        company_address: "",
        trn_number: "",
        vat_percentage: 5,
        contact_email: "",
        contact_phone: "",
        receipt_terms: "",
        website_url: "https://gulfexpress.org"
    });

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const docRef = doc(db, "site_configs", "company_config");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setConfig({ ...config, ...docSnap.data() });
            }
        } catch (error) {
            console.error("Error fetching company config:", error);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // Parse vat percentage to ensure it's a number
            const vatPct = parseFloat(config.vat_percentage as any);
            const dataToSave = {
                ...config,
                vat_percentage: isNaN(vatPct) ? 5 : vatPct
            };

            await setDoc(doc(db, "site_configs", "company_config"), dataToSave, { merge: true });
            toast({
                title: "Success",
                description: "Company config saved successfully",
            });
        } catch (error) {
            console.error("Error saving company config:", error);
            toast({
                title: "Error",
                description: "Failed to save company configuration",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Company & VAT Configuration</CardTitle>
                        <CardDescription>
                            Details used on generated VAT receipts and official invoices
                        </CardDescription>
                    </div>
                    <Button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                        <Save className="mr-2 h-4 w-4" />
                        {loading ? "Saving..." : "Save Settings"}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                            id="companyName"
                            value={config.company_name}
                            onChange={(e) => setConfig({ ...config, company_name: e.target.value })}
                            placeholder="e.g. Gulf Express LLC"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="trnNumber">TRN Number (Tax Registration)</Label>
                        <Input
                            id="trnNumber"
                            value={config.trn_number}
                            onChange={(e) => setConfig({ ...config, trn_number: e.target.value })}
                            placeholder="e.g. 100000000000000"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="companyAddress">Company Address</Label>
                    <Textarea
                        id="companyAddress"
                        value={config.company_address}
                        onChange={(e) => setConfig({ ...config, company_address: e.target.value })}
                        placeholder="Full physical address for receipts"
                        rows={3}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="contactEmail">Contact Email</Label>
                        <Input
                            id="contactEmail"
                            type="email"
                            value={config.contact_email}
                            onChange={(e) => setConfig({ ...config, contact_email: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="contactPhone">Contact Phone</Label>
                        <Input
                            id="contactPhone"
                            value={config.contact_phone}
                            onChange={(e) => setConfig({ ...config, contact_phone: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="vatPercentage">Default VAT Percentage (%)</Label>
                        <Input
                            id="vatPercentage"
                            type="number"
                            step="0.1"
                            value={config.vat_percentage}
                            onChange={(e) => setConfig({ ...config, vat_percentage: parseFloat(e.target.value) || 0 })}
                        />
                        <p className="text-xs text-gray-500">Standard UAE rate is 5%</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="websiteUrl">Website URL</Label>
                        <Input
                            id="websiteUrl"
                            value={config.website_url}
                            onChange={(e) => setConfig({ ...config, website_url: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="receiptTerms">Receipt Terms & Conditions</Label>
                    <Textarea
                        id="receiptTerms"
                        value={config.receipt_terms}
                        onChange={(e) => setConfig({ ...config, receipt_terms: e.target.value })}
                        placeholder="Terms printed at the bottom of the VAT receipt"
                        rows={4}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
