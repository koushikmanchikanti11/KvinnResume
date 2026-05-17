import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, CreditCard, Clock, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Billing & Credits</h1>
          <p className="text-muted-foreground mt-1">Manage your credit balance and view usage history.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="pixel-shadow-sm border-border bg-card/50 backdrop-blur md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="size-5 text-amber-500 fill-amber-500" />
              Credit Balance
            </CardTitle>
            <CardDescription>Your current available credits for AI operations.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="flex items-end justify-between mb-2">
                <div>
                  <span className="text-5xl font-display font-bold">150</span>
                  <span className="text-muted-foreground ml-2">credits available</span>
                </div>
                <div className="text-sm text-muted-foreground">Resets in 15 days</div>
              </div>
              <Progress value={30} className="h-3" />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="flex-1 pixel-shadow-sm shadow-primary/20">Buy Credits</Button>
              <Button variant="outline" className="flex-1">Upgrade to Pro</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="pixel-shadow-sm border-border bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg">Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-2xl font-bold font-display">Free Tier</div>
                <div className="text-muted-foreground text-sm">500 credits / month</div>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-emerald-500" /> 1 Active Resume</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-emerald-500" /> Standard AI parsing</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-emerald-500" /> Basic templates</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="pixel-shadow-sm border-border bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle>Recent Usage</CardTitle>
          <CardDescription>History of your credit consumption.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded">
                  <Clock className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Resume Parsing</p>
                  <p className="text-xs text-muted-foreground">Today at 10:23 AM</p>
                </div>
              </div>
              <div className="text-amber-500 font-mono font-medium">-10 Credits</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
