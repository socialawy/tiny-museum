export default function StudioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="studio-active">
      <style>{`
        .studio-active ~ .bottom-nav { display: none; }
        .studio-active { height: 100dvh; }
      `}</style>
      {children}
    </div>
  );
}
