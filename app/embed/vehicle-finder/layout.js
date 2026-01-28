export const metadata = {
  title: 'Vehicle Part Finder | IntroCar',
  description: 'Find parts for your Rolls-Royce or Bentley by make, model, year, or chassis number.',
};

export default function EmbedLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
