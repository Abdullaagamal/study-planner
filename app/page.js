export const dynamic = "force-dynamic";

const styles = {
  main: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1.5rem",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    color: "#e2e8f0",
  },
  card: {
    width: "100%",
    maxWidth: 560,
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: 16,
    padding: "2rem",
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.45)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "1.5rem",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: 600,
    letterSpacing: "-0.02em",
    margin: 0,
  },
  statusBadge: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    background: "#052e16",
    border: "1px solid #166534",
    color: "#4ade80",
    fontSize: "0.8rem",
    fontWeight: 600,
    padding: "0.35rem 0.75rem",
    borderRadius: 999,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#22c55e",
    boxShadow: "0 0 8px #22c55e",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0.75rem",
    marginBottom: "1.5rem",
  },
  stat: {
    background: "#0b1220",
    border: "1px solid #1f2937",
    borderRadius: 10,
    padding: "0.9rem 1rem",
  },
  label: {
    fontSize: "0.72rem",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#64748b",
    marginBottom: "0.3rem",
  },
  value: {
    fontSize: "0.95rem",
    fontWeight: 500,
    wordBreak: "break-all",
  },
  meta: {
    fontSize: "0.8rem",
    color: "#64748b",
    lineHeight: 1.6,
    borderTop: "1px solid #1f2937",
    paddingTop: "1rem",
  },
};

export default function Home() {
  const podName = process.env.POD_NAME;
  const nodeName = process.env.NODE_NAME;
  const podIp = process.env.POD_IP;
  const environment = process.env.NODE_ENV || "development";
  const inCluster = Boolean(podName);

  const stats = [
    { label: "Environment", value: environment },
    { label: "Pod", value: inCluster ? podName : "Local dev " },
    { label: "Node", value: inCluster ? nodeName : "Local machine" },
    { label: "Pod IP", value: inCluster ? podIp : "127.0.0.1" },
  ];

  return (
    <main style={styles.main}>
      <section style={styles.card}>
        <header style={styles.header}>
          <h1 style={styles.title}>Study Planner</h1>
          <span style={styles.statusBadge}>
            <span style={styles.dot} aria-hidden="true" />
            Operational
          </span>
        </header>

        <div style={styles.grid}>
          {stats.map((stat) => (
            <div key={stat.label} style={styles.stat}>
              <div style={styles.label}>{stat.label}</div>
              <div style={styles.value}>{stat.value}</div>
            </div>
          ))}
        </div>

        <p style={styles.meta}>
          Served by a Next.js app running inside a Docker container,
          {" "}
          orchestrated by Kubernetes.
          {inCluster
            ? " Runtime data is injected via the Kubernetes downward API."
            : " Run it locally, deploy it with docker compose, or ship it to Kubernetes for live pod telemetry."}
        </p>
      </section>
    </main>
  );
}