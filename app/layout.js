export const metadata = {
  title: "Study Planner",
  description:
    "DevOps demo: a Next.js app shipped with Docker, Kubernetes and Helm.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
        }}
      >
        {children}
      </body>
    </html>
  );
}