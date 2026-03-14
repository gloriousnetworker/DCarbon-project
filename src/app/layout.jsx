import '../styles/globals.css';
import Providers from './Providers';

export const metadata = {
  title: 'DCarbon',
  description: 'Sustainable Innovation — Renewable Energy Certificate Management',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
