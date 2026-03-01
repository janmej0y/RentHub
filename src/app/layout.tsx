import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: {
    default: 'RentHub',
    template: '%s | RentHub',
  },
  description: 'Find verified rental rooms, compare properties, and book with confidence on RentHub.',
  openGraph: {
    title: 'RentHub',
    description: 'Find verified rental rooms, compare properties, and book with confidence on RentHub.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-body antialiased">
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
