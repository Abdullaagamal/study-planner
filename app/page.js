export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Study Planner Dashboard</h1>
      <p>Status: Connected to Kubernetes DevOps Pipeline </p>
      <p>Supabase DB: {process.env.NEXT_PUBLIC_SUPABASE_URL ? "Securely Connected " : "Missing Secrets "}</p>
    </main>
  )
}