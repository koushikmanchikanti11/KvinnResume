import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, File, MoreVertical } from "lucide-react";

export default function FilesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Source Files</h1>
          <p className="text-muted-foreground mt-1">Upload and manage your source resumes and data files.</p>
        </div>
        <Button className="pixel-shadow-sm shadow-primary/20">
          <Upload className="size-4 mr-2" />
          Upload File
        </Button>
      </div>

      <Card className="pixel-shadow-sm border-border bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle>All Files</CardTitle>
          <CardDescription>View all your uploaded files and their parsing status.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border">
            <div className="p-4 text-center text-muted-foreground py-12">
              <div className="bg-muted size-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <File className="size-6 text-muted-foreground" />
              </div>
              <p>No files uploaded yet.</p>
              <Button variant="link" className="text-primary mt-2">Upload your first resume</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
