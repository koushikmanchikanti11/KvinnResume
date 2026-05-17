import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Eye } from "lucide-react";

export default function TemplatesPage() {
  const templates = [
    { id: 'pixel', name: 'Pixel Perfect', category: 'Creative', isPremium: false },
    { id: 'modern', name: 'Modern ATS', category: 'Professional', isPremium: false },
    { id: 'executive', name: 'Executive Suite', category: 'Professional', isPremium: true },
    { id: 'startup', name: 'Startup Hustle', category: 'Creative', isPremium: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Resume Templates</h1>
          <p className="text-muted-foreground mt-1">Choose a design that fits your industry and personality.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="pixel-shadow-sm border-border bg-card/50 backdrop-blur group overflow-hidden flex flex-col">
            <div className="bg-muted h-64 relative flex items-center justify-center border-b border-border group-hover:bg-muted/80 transition-colors">
              {template.isPremium && (
                <div className="absolute top-2 right-2 bg-amber-500/10 text-amber-500 px-2 py-1 rounded text-xs font-bold font-mono flex items-center gap-1">
                  <Sparkles className="size-3" />
                  PREMIUM
                </div>
              )}
              <span className="text-muted-foreground font-mono text-xs">{template.name} Preview</span>
              <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button variant="secondary" size="sm">
                  <Eye className="size-4 mr-2" />
                  Preview
                </Button>
              </div>
            </div>
            <CardContent className="p-4 flex flex-col justify-between flex-1">
              <div>
                <h3 className="font-bold font-display text-lg">{template.name}</h3>
                <p className="text-sm text-muted-foreground">{template.category}</p>
              </div>
              <Button className="w-full mt-4" variant={template.isPremium ? "default" : "outline"}>
                Use Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
