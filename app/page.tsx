export default function Home() {
  return (
    <main className="min-h-screen pixel-grid-bg">
      {/* TODO: Landing page sections */}
      {/* <LandingNavbar /> */}
      {/* <HeroSection /> */}
      {/* <FeatureGrid /> */}
      {/* <WorkflowSection /> */}
      {/* <TemplateShowcase /> */}
      {/* <ATSSection /> */}
      {/* <ParserModeComparison /> */}
      {/* <PublicResumePreview /> */}
      {/* <PricingPreview /> */}
      {/* <FAQSection /> */}
      {/* <LandingFooter /> */}

      {/* Temporary: Dev landing */}
      <div className="flex flex-col items-center justify-center min-h-screen gap-6">
        <h1 className="text-5xl font-display font-bold tracking-tight">
          Kvinn<span className="text-kr-green">Resume</span>
        </h1>
        <p className="text-kr-muted font-pixel text-sm tracking-widest uppercase">
          AI Resume Operating System
        </p>
        <div className="flex gap-3 mt-4">
          <button className="btn-primary-pixel text-sm">Upload Resume</button>
          <button className="key-button px-5 py-3 text-sm">Try AI Editor</button>
        </div>
        <div className="flex gap-2 mt-6">
          <span className="px-3 py-1 text-xs font-pixel bg-kr-green/10 text-kr-green border border-kr-green/30 rounded-pixel">
            PARSED
          </span>
          <span className="px-3 py-1 text-xs font-pixel bg-kr-blue/10 text-kr-blue border border-kr-blue/30 rounded-pixel">
            ATS_89
          </span>
          <span className="px-3 py-1 text-xs font-pixel bg-kr-violet/10 text-kr-violet border border-kr-violet/30 rounded-pixel">
            AI_READY
          </span>
        </div>
      </div>
    </main>
  );
}
