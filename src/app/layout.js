import "./globals.css";

export const metadata = {
  title: "Vybe | Catch the Vybe",
  description: "The digital ecosystem for VIT Chennai students.",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="noise m-0 p-0 bg-[#0a0a0f] min-h-screen overflow-x-hidden">
        {/* Ambient background aura blobs — fixed, behind everything */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          {/* Neon violet — top left */}
          <div className="aura-blob -top-[220px] -left-[180px] w-[650px] h-[650px] bg-violet-600" style={{ animationDuration: '9s' }} />
          {/* Neon cyan — mid right */}
          <div className="aura-blob top-[35%] -right-[160px] w-[520px] h-[520px] bg-cyan-400" style={{ opacity: 0.14 }} />
          {/* Neon lime — bottom center */}
          <div className="aura-blob -bottom-[120px] left-[28%] w-[440px] h-[440px] bg-[#bcff00]" style={{ opacity: 0.1 }} />
          {/* Deep indigo fill — center, very subtle */}
          <div className="aura-blob top-[15%] left-[40%] w-[600px] h-[600px] bg-indigo-700" style={{ opacity: 0.13 }} />
        </div>
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}