import React from 'react';
import { jsPDF } from 'jspdf';
import { X, Download, CheckCircle2, Building2, Phone, MapPin, ReceiptText } from 'lucide-react';
import { Payment } from '../types';

interface ReceiptModalProps {
  payment: Payment | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ payment, onClose }) => {
  if (!payment) return null;

  const isFullyPaid = payment.paymentStatus === 'Paid' || payment.balance === 0;

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Colors
      const primaryColor = [15, 23, 42]; // Slate-900
      const accentColor = [14, 116, 144]; // Cyan-700
      const lightBg = [248, 250, 252]; // Slate-50

      // Outer Border
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.8);
      doc.roundedRect(10, 10, 190, 277, 4, 4);

      // Header Banner Background
      doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
      doc.rect(11, 11, 188, 48, 'F');

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("TLNR MEN'S PG", 105, 24, { align: 'center' });

      // Subtitle / Address & Contact
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.text('KPHB Road Number 3', 105, 31, { align: 'center' });
      doc.text('Owner Contact: 9908522152 / 9133699944', 105, 37, { align: 'center' });

      // Receipt Title & Badge
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text('OFFICIAL PAYMENT RECEIPT', 105, 48, { align: 'center' });

      // Divider Line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(15, 62, 195, 62);

      // Receipt Meta (Left and Right)
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('Receipt Number:', 20, 72);
      doc.setFont('helvetica', 'normal');
      doc.text(payment.receiptNumber || 'TLNR-000', 60, 72);

      doc.setFont('helvetica', 'bold');
      doc.text('Payment Date:', 130, 72);
      doc.setFont('helvetica', 'normal');
      doc.text(payment.paymentDate || new Date().toISOString().split('T')[0], 165, 72);

      doc.setFont('helvetica', 'bold');
      doc.text('Payment Mode:', 20, 80);
      doc.setFont('helvetica', 'normal');
      doc.text(payment.paymentMode || 'Cash', 60, 80);

      doc.setFont('helvetica', 'bold');
      doc.text('Transaction ID:', 130, 80);
      doc.setFont('helvetica', 'normal');
      doc.text(payment.transactionId || 'N/A', 165, 80);

      // Resident Details Card
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(18, 90, 174, 32, 2, 2, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text('RESIDENT INFORMATION', 24, 98);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Resident Name:', 24, 107);
      doc.setFont('helvetica', 'normal');
      doc.text(payment.residentName, 60, 107);

      doc.setFont('helvetica', 'bold');
      doc.text('Room Number:', 125, 107);
      doc.setFont('helvetica', 'normal');
      doc.text(`Room ${payment.roomNumber}`, 160, 107);

      doc.setFont('helvetica', 'bold');
      doc.text('Mobile Number:', 24, 115);
      doc.setFont('helvetica', 'normal');
      doc.text(payment.mobile || 'N/A', 60, 115);

      // Fee Breakdown Table Header
      const tableTop = 132;
      doc.setFillColor(15, 23, 42);
      doc.rect(18, tableTop, 174, 10, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text('DESCRIPTION', 24, tableTop + 7);
      doc.text('AMOUNT (INR)', 155, tableTop + 7);

      // Table Rows
      let rowY = tableTop + 10;
      const rows = [
        { label: 'Room Monthly Rent', amount: `₹${(payment.rent || 0).toLocaleString('en-IN')}` },
        { label: 'Security Advance Deposit', amount: `₹${(payment.advance || 0).toLocaleString('en-IN')}` },
        { label: 'Total Payable Amount', amount: `₹${(payment.totalAmount || 0).toLocaleString('en-IN')}`, isBold: true },
        { label: 'Amount Paid', amount: `₹${(payment.amountPaid || 0).toLocaleString('en-IN')}`, isBold: true },
        { label: 'Balance Outstanding', amount: `₹${(payment.balance || 0).toLocaleString('en-IN')}`, isBold: true }
      ];

      rows.forEach((r, idx) => {
        const isAlternate = idx % 2 === 1;
        if (isAlternate) {
          doc.setFillColor(248, 250, 252);
          doc.rect(18, rowY, 174, 10, 'F');
        }
        doc.setDrawColor(226, 232, 240);
        doc.line(18, rowY + 10, 192, rowY + 10);

        doc.setFont('helvetica', r.isBold ? 'bold' : 'normal');
        doc.setTextColor(30, 41, 59);
        doc.text(r.label, 24, rowY + 7);
        doc.text(r.amount, 160, rowY + 7);
        rowY += 10;
      });

      // Payment Status Stamp / Badge
      if (isFullyPaid) {
        doc.setDrawColor(22, 163, 74);
        doc.setLineWidth(1.2);
        doc.roundedRect(24, rowY + 14, 55, 18, 3, 3);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(22, 163, 74);
        doc.text('FULLY PAID', 30, rowY + 26);
      } else {
        doc.setDrawColor(217, 119, 6);
        doc.setLineWidth(1.2);
        doc.roundedRect(24, rowY + 14, 65, 18, 3, 3);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(217, 119, 6);
        doc.text(`STATUS: ${payment.paymentStatus.toUpperCase()}`, 28, rowY + 26);
      }

      // Notes
      if (payment.notes) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(`Notes: ${payment.notes}`, 24, rowY + 42);
      }

      // Signature area
      const signY = 240;
      doc.setDrawColor(148, 163, 184);
      doc.setLineWidth(0.5);
      doc.line(130, signY, 185, signY);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.text("Authorized Signatory", 137, signY + 6);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("TLNR MEN'S PG Management", 134, signY + 11);

      // Footer notice
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        'This is a computer-generated official receipt issued by TLNR MEN\'S PG, KPHB Road Number 3.',
        105,
        278,
        { align: 'center' }
      );

      doc.save(`TLNR_Receipt_${payment.receiptNumber || 'bill'}.pdf`);
    } catch (err) {
      console.error('PDF Generation Error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-800/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-2 text-slate-800">
            <ReceiptText className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold">Payment Receipt Preview</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable/Preview Receipt Card */}
        <div className="p-6">
          <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50/50 shadow-inner relative overflow-hidden">
            {/* Header branding */}
            <div className="text-center pb-5 border-b border-slate-200">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white mb-2 shadow-sm">
                <Building2 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black tracking-tight text-slate-900">TLNR MEN&apos;S PG</h2>
              <p className="text-xs text-slate-600 flex items-center justify-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                KPHB Road Number 3
              </p>
              <p className="text-xs text-slate-600 flex items-center justify-center gap-1 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                Owner: 9908522152 / 9133699944
              </p>
            </div>

            {/* Receipt Meta */}
            <div className="grid grid-cols-2 gap-3 py-4 text-xs border-b border-slate-200">
              <div>
                <span className="text-slate-500 font-medium block">Receipt Number</span>
                <span className="font-bold text-slate-900 text-sm">{payment.receiptNumber}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 font-medium block">Payment Date</span>
                <span className="font-semibold text-slate-800">{payment.paymentDate}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Resident Name</span>
                <span className="font-bold text-slate-900 text-sm">{payment.residentName}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 font-medium block">Room Number</span>
                <span className="font-bold text-slate-900 text-sm">Room {payment.roomNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Payment Mode</span>
                <span className="font-semibold text-slate-800">{payment.paymentMode}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 font-medium block">Mobile</span>
                <span className="font-semibold text-slate-800">{payment.mobile || 'N/A'}</span>
              </div>
            </div>

            {/* Breakdown Table */}
            <div className="py-4 space-y-2 text-sm">
              <div className="flex justify-between py-1 text-slate-600 text-xs">
                <span>Monthly Rent</span>
                <span className="font-medium text-slate-900">₹{payment.rent.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 text-slate-600 text-xs">
                <span>Advance Deposit</span>
                <span className="font-medium text-slate-900">₹{payment.advance.toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t border-dashed border-slate-200 pt-2 flex justify-between font-semibold text-slate-800">
                <span>Total Amount</span>
                <span>₹{payment.totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl">
                <span>Amount Paid</span>
                <span>₹{payment.amountPaid.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-700 px-3 py-1">
                <span>Balance Amount</span>
                <span className={payment.balance > 0 ? 'text-amber-600' : 'text-slate-500'}>
                  ₹{payment.balance.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Status Badge */}
            <div className="pt-2 flex items-center justify-between">
              {isFullyPaid ? (
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  FULLY PAID
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs uppercase tracking-wider">
                  STATUS: {payment.paymentStatus}
                </div>
              )}

              <span className="text-[11px] text-slate-400 font-medium italic">Authorized Stamp</span>
            </div>
          </div>
        </div>

        {/* Action Button: Specifically mandated wording "Download PDF Receipt" */}
        <div className="p-6 pt-0 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-all active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
