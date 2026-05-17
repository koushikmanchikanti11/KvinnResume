import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit3, MoreVertical, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function ResumesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">My Resumes</h1>
          <p className="text-muted-foreground mt-1">Manage, edit, and optimize your tailored resumes.</p>
        </div>
        <Button className="pixel-shadow-sm shadow-primary/20">
          <Plus className="size-4 mr-2" />
          Create Resume
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search resumes..." className="pl-8 bg-card/50" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <Card className="pixel-shadow-sm border-border bg-card/50 backdrop-blur group hover:border-primary/50 transition-all cursor-pointer flex flex-col h-72">
          <CardContent className="flex flex-col items-center justify-center flex-1 text-center p-6 text-muted-foreground group-hover:text-foreground">
            <div className="bg-primary/10 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
              <Plus className="size-8 text-primary" />
            </div>
            <h3 className="font-display font-bold text-lg">Create New</h3>
            <p className="text-sm mt-2">Start from scratch or use an existing file</p>
          </CardContent>
        </Card>

        {/* Placeholder for an active resume */}
        <Card className="pixel-shadow-sm border-border bg-card/50 backdrop-blur group flex flex-col h-72 overflow-hidden">
          <div className="bg-muted h-32 flex items-center justify-center border-b border-border">
             <span className="text-muted-foreground font-mono text-xs">Preview</span>
          </div>
          <CardContent className="p-4 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold font-display line-clamp-1">Senior Frontend Engineer</h3>
                  <p className="text-xs text-muted-foreground mt-1">Updated 2 days ago</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-1">
                  <MoreVertical className="size-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Button className="w-full h-8 text-xs font-medium" variant="outline">
                <Edit3 className="size-3 mr-1" />
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
