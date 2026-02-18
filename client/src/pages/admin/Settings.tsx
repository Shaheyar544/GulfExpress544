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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IntegrationsSettings from "@/components/admin/IntegrationsSettings";
import ContactSettings from "@/components/admin/ContactSettings";

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [settings, setSettings] = useState({
    sameDayCutoff: "12:00",
    nextDayPolicy: "Orders placed before 6 PM will be delivered next business day",
    defaultETA: "3-5 business days",
    emailNotifications: true,
    smsNotifications: false,
    emailTemplate: "Dear {customer}, your shipment {trackingId} is {status}. Thank you for choosing Gulf Express.",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const docRef = doc(db, "settings", "general");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSettings({ ...settings, ...docSnap.data() });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, "settings", "general"), settings, { merge: true });
      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Configure system settings and preferences</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={loading}
          className="bg-gradient-to-r from-purple-600 to-purple-800"
        >
          <Save className="mr-2 h-4 w-4" />
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      <Tabs defaultValue="delivery" className="space-y-4">
        <TabsList>
          <TabsTrigger value="delivery">Delivery Settings</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="email">Email Templates</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="contact">Contact Info</TabsTrigger>
        </TabsList>

        <TabsContent value="delivery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Configuration</CardTitle>
              <CardDescription>Configure default delivery settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sameDayCutoff">Same-Day Cut-off Time</Label>
                <Input
                  id="sameDayCutoff"
                  type="time"
                  value={settings.sameDayCutoff}
                  onChange={(e) =>
                    setSettings({ ...settings, sameDayCutoff: e.target.value })
                  }
                />
                <p className="text-sm text-gray-500">
                  Orders placed before this time qualify for same-day delivery
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nextDayPolicy">Next-Day Delivery Policy</Label>
                <Textarea
                  id="nextDayPolicy"
                  value={settings.nextDayPolicy}
                  onChange={(e) =>
                    setSettings({ ...settings, nextDayPolicy: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultETA">Default ETA</Label>
                <Input
                  id="defaultETA"
                  value={settings.defaultETA}
                  onChange={(e) =>
                    setSettings({ ...settings, defaultETA: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Send email notifications to customers
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onChange={(e) =>
                    setSettings({ ...settings, emailNotifications: e.target.checked })
                  }
                  className="w-4 h-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="smsNotifications">SMS Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Send SMS notifications to customers
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="smsNotifications"
                  checked={settings.smsNotifications}
                  onChange={(e) =>
                    setSettings({ ...settings, smsNotifications: e.target.checked })
                  }
                  className="w-4 h-4"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>Customize email templates for customer notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emailTemplate">Shipment Status Template</Label>
                <Textarea
                  id="emailTemplate"
                  value={settings.emailTemplate}
                  onChange={(e) =>
                    setSettings({ ...settings, emailTemplate: e.target.value })
                  }
                  rows={6}
                />
                <p className="text-sm text-gray-500">
                  Available variables: {"{customer}"}, {"{trackingId}"}, {"{status}"}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <IntegrationsSettings />
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <ContactSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}



