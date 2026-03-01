'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { useAuthContext } from '@/context/AuthContext';
import { getBookings } from '@/lib/bookingService';
import type { Booking } from '@/types/booking';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Download } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
const RECEIPT_ARCHIVE_KEY = 'renthub-receipt-archive';

type ReceiptSnapshot = {
  bookingId: string;
  roomTitle: string;
  roomLocation: string;
  monthlyRent: number;
  status: string;
  checkInIso: string;
  checkOutIso: string;
  generatedAtIso: string;
};

function getBookingNights(booking: Booking): number {
  const checkIn = new Date(booking.checkIn);
  const checkOut = new Date(booking.checkOut);
  const diff = checkOut.getTime() - checkIn.getTime();
  if (diff <= 0) return 1;
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function getProratedRent(booking: Booking): {
  nights: number;
  dailyRent: number;
  totalRent: number;
} {
  const nights = getBookingNights(booking);
  const dailyRent = booking.room.rent / 30;
  const totalRent = Math.round(dailyRent * nights);
  return { nights, dailyRent, totalRent };
}

function buildReceiptHtml(snapshot: ReceiptSnapshot): string {
  const checkIn = new Date(snapshot.checkInIso);
  const checkOut = new Date(snapshot.checkOutIso);
  const diff = checkOut.getTime() - checkIn.getTime();
  const nights = diff <= 0 ? 1 : Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  const dailyRent = snapshot.monthlyRent / 30;
  const totalRent = Math.round(dailyRent * nights);
  const utilities = Math.round(nights * 120);
  const platformFee = Math.round(Math.max(199, totalRent * 0.015));
  const grandTotal = totalRent + utilities + platformFee;

  return `
    <html>
      <head>
        <title>Booking Receipt - ${snapshot.bookingId}</title>
        <style>
          :root {
            --ink: #0f172a;
            --muted: #475569;
            --brand: #0ea5a4;
            --brand-dark: #0f766e;
            --soft: #ecfeff;
            --border: #99f6e4;
          }
          @page { size: A4; margin: 14mm; }
          body {
            margin: 0;
            font-family: "Segoe UI", Arial, sans-serif;
            color: var(--ink);
            background: linear-gradient(180deg, #f0fdfa, #ffffff);
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .receipt { border: 2px solid var(--border); border-radius: 14px; overflow: hidden; box-shadow: 0 8px 30px rgba(15, 118, 110, 0.12); }
          .head { background: linear-gradient(120deg, var(--brand), var(--brand-dark)); color: white; padding: 18px 20px; }
          .corp { font-size: 12px; letter-spacing: 1.2px; text-transform: uppercase; opacity: 0.95; }
          .brand { font-size: 28px; font-weight: 800; margin-top: 4px; }
          .sub { margin-top: 4px; font-size: 13px; opacity: 0.95; }
          .body { padding: 18px 20px 20px; }
          .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
          .meta-card { background: var(--soft); border: 1px solid var(--border); border-radius: 10px; padding: 10px 12px; font-size: 13px; }
          .meta-label { color: var(--muted); font-weight: 600; margin-bottom: 4px; }
          .tbl { width: 100%; border-collapse: collapse; margin-top: 6px; }
          .tbl th { text-align: left; background: #ccfbf1; color: #115e59; font-size: 13px; padding: 10px; }
          .tbl td { font-size: 13px; padding: 10px; border-bottom: 1px solid #d1fae5; }
          .totals { margin-top: 12px; margin-left: auto; width: 320px; border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
          .totals-row { display: flex; justify-content: space-between; padding: 10px 12px; font-size: 13px; background: #f8fffe; border-bottom: 1px solid #d1fae5; }
          .totals-row:last-child { border-bottom: none; background: #a7f3d0; color: #064e3b; font-weight: 800; }
          .approval { margin-top: 22px; display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; }
          .signature-block { flex: 1; }
          .sig { font-family: "Segoe Script", "Brush Script MT", cursive; font-size: 26px; color: #0f766e; margin-bottom: 2px; }
          .sig-name { font-size: 13px; font-weight: 700; }
          .sig-role { font-size: 12px; color: var(--muted); }
          .stamp { width: 178px; height: 178px; position: relative; border: 4px solid #0b766e; border-radius: 50%; transform: rotate(-10deg); background: radial-gradient(circle at 50% 50%, rgba(15, 118, 110, 0.18), rgba(15, 118, 110, 0.04) 62%), rgba(236, 254, 255, 0.9); box-shadow: inset 0 0 0 3px rgba(255, 255, 255, 0.9), 0 6px 18px rgba(6, 95, 70, 0.18); }
          .stamp-ring { position: absolute; inset: 14px; border: 2px solid #0b766e; border-radius: 50%; }
          .stamp-inner { position: absolute; inset: 34px; border: 1px dashed #0f766e; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: #0f766e; }
          .stamp-star { font-size: 18px; line-height: 1; margin-bottom: 2px; }
          .stamp-brand { font-size: 16px; font-weight: 900; letter-spacing: 1px; line-height: 1.1; }
          .stamp-role { margin-top: 2px; font-size: 10px; font-weight: 700; letter-spacing: 0.9px; }
          .stamp-top,.stamp-bottom { position: absolute; left: 50%; width: 150px; margin-left: -75px; text-align: center; color: #0f766e; font-weight: 800; font-size: 9px; letter-spacing: 1px; text-transform: uppercase; line-height: 1.2; }
          .stamp-top { top: 14px; }
          .stamp-bottom { bottom: 14px; }
          .foot { margin-top: 16px; font-size: 12px; color: var(--muted); }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="head">
            <div class="corp">Mahato's Brothers Ltd.</div>
            <div class="brand">RentHub Booking Receipt</div>
            <div class="sub">Official Color Copy - Payment Acknowledgement</div>
          </div>
          <div class="body">
            <div class="meta">
              <div class="meta-card"><div class="meta-label">Receipt No.</div><div>${snapshot.bookingId}</div></div>
              <div class="meta-card"><div class="meta-label">Generated On</div><div>${new Date(snapshot.generatedAtIso).toLocaleString('en-IN')}</div></div>
              <div class="meta-card"><div class="meta-label">Check-in</div><div>${checkIn.toLocaleDateString('en-IN')}</div></div>
              <div class="meta-card"><div class="meta-label">Check-out</div><div>${checkOut.toLocaleDateString('en-IN')}</div></div>
            </div>
            <table class="tbl">
              <thead><tr><th>Description</th><th>Details</th><th style="text-align:right">Amount</th></tr></thead>
              <tbody>
                <tr><td>Property</td><td>${snapshot.roomTitle} (${snapshot.roomLocation})</td><td style="text-align:right">-</td></tr>
                <tr><td>Daily Rent (Prorated)</td><td>${nights} day(s) x ${formatCurrency(Math.round(dailyRent))}</td><td style="text-align:right">${formatCurrency(totalRent)}</td></tr>
                <tr><td>Booking Status</td><td>${snapshot.status === 'pending' ? 'Pending Review' : 'Confirmed'}</td><td style="text-align:right">-</td></tr>
              </tbody>
            </table>
            <div class="totals">
              <div class="totals-row"><span>Monthly Listed Rent</span><span>${formatCurrency(snapshot.monthlyRent)}</span></div>
              <div class="totals-row"><span>Chargeable Days</span><span>${nights}</span></div>
              <div class="totals-row"><span>Utilities + Platform Fee</span><span>${formatCurrency(utilities + platformFee)}</span></div>
              <div class="totals-row"><span>Total Payable</span><span>${formatCurrency(grandTotal)}</span></div>
            </div>
            <div class="approval">
              <div class="signature-block">
                <div class="sig">Janmejoy Mahato</div>
                <div class="sig-name">Janmejoy Mahato</div>
                <div class="sig-role">Authorised Signatory - CEO, RentHub</div>
              </div>
              <div class="stamp">
                <div class="stamp-ring"></div>
                <div class="stamp-inner"><div class="stamp-star">*</div><div class="stamp-brand">RENTHUB</div><div class="stamp-role">CEO SEAL</div></div>
                <div class="stamp-top">Mahato's Brothers Ltd.</div>
                <div class="stamp-bottom">Official Verified Stamp</div>
              </div>
            </div>
            <div class="foot">Note: Security deposit is not charged upfront. It is charged only if damaged products are found after inspection.</div>
          </div>
        </div>
      </body>
    </html>
  `;
}

function downloadBookingReceipt(booking: Booking) {
  const snapshot: ReceiptSnapshot = {
    bookingId: booking.id,
    roomTitle: booking.room.title,
    roomLocation: booking.room.location,
    monthlyRent: booking.room.rent,
    status: booking.status || 'pending',
    checkInIso: new Date(booking.checkIn).toISOString(),
    checkOutIso: new Date(booking.checkOut).toISOString(),
    generatedAtIso: new Date().toISOString(),
  };

  try {
    const raw = window.localStorage.getItem(RECEIPT_ARCHIVE_KEY);
    const existing = raw ? (JSON.parse(raw) as ReceiptSnapshot[]) : [];
    const deduped = [snapshot, ...existing.filter(item => item.bookingId !== snapshot.bookingId)].slice(0, 50);
    window.localStorage.setItem(RECEIPT_ARCHIVE_KEY, JSON.stringify(deduped));
  } catch {
    // ignore archive write failures
  }

  const receiptWindow = window.open('', '_blank', 'width=900,height=1000');
  if (!receiptWindow) return;

  receiptWindow.document.open();
  receiptWindow.document.write(buildReceiptHtml(snapshot));
  receiptWindow.document.close();
  receiptWindow.focus();
  receiptWindow.print();
}

export default function MyBookingsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthContext();
  const router = useRouter();
  const { toast } = useToast();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [receiptArchive, setReceiptArchive] = useState<ReceiptSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🔐 Protect route
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // 📦 Fetch user's bookings
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(RECEIPT_ARCHIVE_KEY);
      setReceiptArchive(raw ? (JSON.parse(raw) as ReceiptSnapshot[]) : []);
    } catch {
      setReceiptArchive([]);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      const fetchBookings = async () => {
        try {
          setIsLoading(true);
          const data = await getBookings(user.id);
          setBookings(data);
        } catch (error: any) {
          toast({
            variant: 'destructive',
            title: 'Failed to load bookings',
            description: error?.message || 'Something went wrong',
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchBookings();
    }
  }, [authLoading, isAuthenticated, user, toast]);

  const openArchivedReceipt = (snapshot: ReceiptSnapshot) => {
    const win = window.open('', '_blank', 'width=900,height=1000');
    if (!win) return;
    win.document.open();
    win.document.write(buildReceiptHtml(snapshot));
    win.document.close();
    win.focus();
    win.print();
  };

  const handleDownloadReceipt = (booking: Booking) => {
    downloadBookingReceipt(booking);
    try {
      const raw = window.localStorage.getItem(RECEIPT_ARCHIVE_KEY);
      setReceiptArchive(raw ? (JSON.parse(raw) as ReceiptSnapshot[]) : []);
    } catch {
      // ignore
    }
  };

  // ⏳ Loading / redirect state
  if (authLoading || !isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-1/3 mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-headline text-4xl font-bold">My Bookings</h1>
        <p className="mt-2 text-muted-foreground">
          Your upcoming and past stays.
        </p>
      </div>

      {receiptArchive.length > 0 && (
        <Card className="mb-6 border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle>Receipt Archive</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {receiptArchive.map(item => (
                <div key={item.bookingId} className="rounded-lg border border-border/70 p-3">
                  <p className="font-medium">{item.roomTitle}</p>
                  <p className="text-xs text-muted-foreground">
                    Receipt: {item.bookingId} • {new Date(item.generatedAtIso).toLocaleDateString('en-IN')}
                  </p>
                  <div className="mt-2">
                    <Button size="sm" variant="outline" onClick={() => openArchivedReceipt(item)}>
                      Open Receipt
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : bookings.length > 0 ? (
        <div className="space-y-6">
          {bookings.map(booking => (
            <Card key={booking.id}>
              <CardHeader>
                <CardTitle>{booking.room.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Check-in: {new Date(booking.checkIn).toLocaleDateString()}</p>
                <p>Check-out: {new Date(booking.checkOut).toLocaleDateString()}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant={booking.status === 'pending' ? 'secondary' : 'default'}>
                    {booking.status === 'pending' ? 'Pending Review' : 'Confirmed'}
                  </Badge>
                </div>
                <div className="mt-3 rounded-md border bg-muted/20 p-3 text-xs text-muted-foreground">
                  Timeline: Submitted {'->'} Payment Review {'->'} Confirmed
                </div>
                {booking.paymentScreenshotName ? (
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground">
                      Payment screenshot: {booking.paymentScreenshotName}
                    </p>
                    {booking.paymentScreenshotUrl ? (
                      <div className="relative mt-2 h-36 w-56 overflow-hidden rounded-md border">
                        <Image
                          src={booking.paymentScreenshotUrl}
                          alt={booking.paymentScreenshotName}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                    ) : null}
                  </div>
                ) : null}
                <div className="mt-4">
                  <Button variant="outline" size="sm" onClick={() => handleDownloadReceipt(booking)}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Receipt
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="You have no bookings yet."
          description="Start exploring and book your next stay."
          actionLabel="Explore Properties"
          onAction={() => router.push('/')}
        />
      )}
    </div>
  );
}


