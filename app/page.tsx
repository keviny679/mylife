import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center" style={{ background: '#140d05' }}>
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,100,20,0.07) 0%, transparent 70%)' }} />
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,140,30,0.05) 0%, transparent 70%)' }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-48 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(220,80,10,0.06) 0%, transparent 70%)' }} />

      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <h1 style={{ fontFamily: 'var(--font-lora)', color: '#e8956d', fontSize: '48px', marginBottom: '12px' }}>MyLife</h1>
        <p style={{ fontFamily: 'var(--font-lora)', color: '#5c3d22', fontSize: '18px', fontStyle: 'italic', marginBottom: '48px' }}>Your private space to reflect.</p>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link href="/signup" style={{ display: 'block', width: '100%', padding: '14px', borderRadius: '8px', background: '#c45e2a', color: '#140d05', fontWeight: '500', fontSize: '15px', fontFamily: 'var(--font-lora)', textAlign: 'center', textDecoration: 'none' }}>
            Start writing
          </Link>
          <Link href="/login" style={{ display: 'block', width: '100%', padding: '14px', borderRadius: '8px', background: 'transparent', color: '#5c3d22', fontSize: '15px', fontFamily: 'var(--font-lora)', textAlign: 'center', textDecoration: 'none', border: '1px solid #3b2410' }}>
            Log in
          </Link>
        </div>
      </div>
    </main>
  )
}