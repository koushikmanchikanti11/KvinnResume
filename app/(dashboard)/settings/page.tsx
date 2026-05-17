import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account settings and preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <nav className="flex flex-col space-y-1">
            <Button variant="secondary" className="justify-start">Profile</Button>
            <Button variant="ghost" className="justify-start">Account</Button>
            <Button variant="ghost" className="justify-start">Appearance</Button>
            <Button variant="ghost" className="justify-start">Notifications</Button>
          </nav>
        </div>
        <div className="md:col-span-2 space-y-6">
          <Card className="pixel-shadow-sm border-border bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update your personal information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" defaultValue="john@example.com" disabled />
                <p className="text-xs text-muted-foreground">Contact support to change your email.</p>
              </div>
              <Button className="pixel-shadow-sm shadow-primary/20">Save Changes</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
