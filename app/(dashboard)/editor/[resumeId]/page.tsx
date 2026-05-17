// TODO: Resume editor page
// - EditorShell with FormPanel + PreviewPanel
// - SectionTree, EditorTopbar
// - AI Chat panel integration

export default function EditorPage({
  params,
}: {
  params: Promise<{ resumeId: string }>;
}) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-display font-bold">Resume Editor</h1>
      <p className="text-kr-muted text-sm font-pixel tracking-wider">
        EDITOR_MODULE // PENDING
      </p>
    </div>
  );
}
