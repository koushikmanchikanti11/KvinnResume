// TODO: Public resume page
// - Profile header, summary, experience, projects
// - Skills chips, education, certifications
// - Download PDF, QR code, visibility badge

export default function PublicResumePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <div className="min-h-screen bg-kr-bg">
      <p className="text-kr-muted text-sm font-pixel tracking-wider text-center py-20">
        PUBLIC_RESUME // PENDING
      </p>
    </div>
  );
}
