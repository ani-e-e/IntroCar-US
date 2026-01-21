import './globals.css';

export const metadata = {
  title: 'IntroCar USA | Rolls-Royce & Bentley Parts',
  description: 'The world\'s trusted supplier of Rolls-Royce and Bentley parts. 230,000+ genuine, recycled & reconditioned spares with 3-year warranty on Prestige Parts®.',
  keywords: 'Bentley parts, Rolls-Royce parts, Prestige Parts, car parts, luxury car parts, vintage car parts',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-white text-introcar-charcoal antialiased">
        {children}
      </body>
    </html>
  );
}
