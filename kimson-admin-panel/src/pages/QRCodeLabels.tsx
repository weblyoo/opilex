import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { adminQRCodeService } from '../services/adminService';

type UserType = 'electrician' | 'dealer';

interface QRCodeItem {
  id: string;
  rewardId: string;
  points: number;
  description: string;
  userType: 'electrician' | 'dealer';
  used: boolean;
  usedBy: string | null;
  usedAt: any;
  createdAt: any;
  createdBy: string;
}

export const QRCodeLabels = () => {
  const [activeTab, setActiveTab] = useState<UserType>('electrician');
  const [electricianCodes, setElectricianCodes] = useState<QRCodeItem[]>([]);
  const [dealerCodes, setDealerCodes] = useState<QRCodeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQRCodes();
  }, []);

  const loadQRCodes = async () => {
    setLoading(true);
    try {
      const [electrician, dealer] = await Promise.all([
        adminQRCodeService.getQRCodesByUserType('electrician'),
        adminQRCodeService.getQRCodesByUserType('dealer'),
      ]);
      setElectricianCodes(electrician as QRCodeItem[]);
      setDealerCodes(dealer as QRCodeItem[]);
    } catch (error) {
      console.error('Error loading QR codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getQRCodeData = (code: QRCodeItem): string => {
    return JSON.stringify({
      type: 'opilex_reward',
      rewardId: code.rewardId,
      points: code.points,
      description: code.description,
      userType: code.userType,
      createdAt: code.createdAt?.toDate ? code.createdAt.toDate().toISOString() : new Date().toISOString(),
    });
  };

  const formatDate = (timestamp: any): string => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const exportToCSV = () => {
    const currentCodes = activeTab === 'electrician' ? electricianCodes : dealerCodes;
    const userTypeDisplay = activeTab === 'electrician' ? 'Electrician' : 'Dealer';
    
    // CSV headers
    const headers = [
      'QR Code ID',
      'User Type',
      'Points',
      'Description',
      'QR Code Data (JSON)',
      'Status',
      'Used By',
      'Created Date',
      'Created By'
    ];
    
    // CSV rows
    const rows = currentCodes.map(code => {
      const qrData = getQRCodeData(code);
      const status = code.used ? 'Used' : 'Unused';
      const usedBy = code.usedBy || 'N/A';
      const createdAt = formatDate(code.createdAt);
      const createdBy = code.createdBy || 'admin';
      
      return [
        code.rewardId,
        code.userType,
        code.points.toString(),
        code.description,
        qrData,
        status,
        usedBy,
        createdAt,
        createdBy
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
    });
    
    // Combine headers and rows
    const csvContent = [
      headers.map(h => `"${h}"`).join(','),
      ...rows
    ].join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `opilex-qr-codes-${userTypeDisplay.toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentCodes = activeTab === 'electrician' ? electricianCodes : dealerCodes;
  const userTypeDisplay = activeTab === 'electrician' ? 'Electrician' : 'Dealer';

  if (loading) {
    return (
      <div className="p-8 min-h-screen bg-[#111111] flex items-center justify-center">
        <p className="text-white font-ubuntu-light">Loading QR codes...</p>
      </div>
    );
  }

  return (
    <>
      <div className="p-8 min-h-screen bg-[#111111] print-area">
        <div className="no-print mb-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-5xl font-ubuntu font-black mb-2 text-white tracking-tight">
              QR Code Labels
            </h1>
            <p className="text-white/60 font-ubuntu-light">View and print QR codes for {userTypeDisplay.toLowerCase()}s</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportToCSV}
              className="px-6 py-3 bg-[#E31E24] text-white rounded-xl hover:bg-white/90 font-ubuntu-black transition-all duration-300 hover:scale-105 shadow-xl"
              title="Export to CSV for Bartender import"
            >
              📥 Bartender Export for Printing
            </button>
            <button
              onClick={handlePrint}
              className="px-6 py-3 bg-[#E31E24] text-white rounded-xl hover:bg-white/90 font-ubuntu-black transition-all duration-300 hover:scale-105 shadow-xl"
            >
              🖨️ Print Labels
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="no-print mb-8 flex gap-4">
          <button
            onClick={() => setActiveTab('electrician')}
            className={`px-6 py-3 rounded-xl font-ubuntu-bold transition-all duration-300 ${
              activeTab === 'electrician'
                ? 'bg-[#E31E24] text-white shadow-xl'
                : 'bg-[#111111] border border-white/10 text-white/60 hover:text-white hover:border-white/40'
            }`}
          >
            ⚡ Electrician ({electricianCodes.length})
          </button>
          <button
            onClick={() => setActiveTab('dealer')}
            className={`px-6 py-3 rounded-xl font-ubuntu-bold transition-all duration-300 ${
              activeTab === 'dealer'
                ? 'bg-[#E31E24] text-white shadow-xl'
                : 'bg-[#111111] border border-white/10 text-white/60 hover:text-white hover:border-white/40'
            }`}
          >
            🏪 Dealer ({dealerCodes.length})
          </button>
        </div>

        {/* QR Codes Grid */}
        {currentCodes.length === 0 ? (
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-12 text-center">
            <p className="text-white/60 font-ubuntu-light text-lg">
              No QR codes found for {userTypeDisplay.toLowerCase()}s. Generate QR codes first.
            </p>
          </div>
        ) : (
          <>
            {/* Export Info Banner */}
            <div className="no-print bg-white/10 border border-white/10 rounded-xl p-4 mb-6">
              <p className="text-white/80 font-ubuntu-medium text-sm">
                <strong>📥 For Bartender:</strong> Click "Bartender Export for Printing" to download a CSV file with all QR code data. 
                Import this CSV into Bartender to create labels with embedded QR codes using the "QR Code Data (JSON)" column.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print-items">
              {currentCodes.map((code) => (
                <div
                  key={code.id}
                  className="bg-white border-2 border-black rounded-xl p-6 print-item print-break-inside-avoid"
                >
                  {/* QR Code */}
                  <div className="flex justify-center mb-4 print-mb-0">
                    <div className="bg-white p-4 rounded-lg border-2 border-black print-qr-container">
                      <QRCodeSVG
                        value={getQRCodeData(code)}
                        size={180}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                  </div>

                  {/* Label Information - Hidden in Print */}
                  <div className="space-y-2 text-black no-print">
                    <div>
                      <p className="text-xs font-ubuntu-bold uppercase tracking-wider text-black/60 mb-1">
                        User Type
                      </p>
                      <p className="text-base font-ubuntu-bold">
                        {code.userType === 'electrician' ? '⚡ Electrician' : '🏪 Dealer'}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-ubuntu-bold uppercase tracking-wider text-black/60 mb-1">
                        Points
                      </p>
                      <p className="text-2xl font-ubuntu-black">{code.points}</p>
                    </div>

                    <div>
                      <p className="text-xs font-ubuntu-bold uppercase tracking-wider text-black/60 mb-1">
                        Description
                      </p>
                      <p className="text-sm font-ubuntu-medium">{code.description}</p>
                    </div>

                    <div>
                      <p className="text-xs font-ubuntu-bold uppercase tracking-wider text-black/60 mb-1">
                        QR Code ID
                      </p>
                      <p className="text-xs font-ubuntu-light break-all">{code.rewardId}</p>
                    </div>

                    <div>
                      <p className="text-xs font-ubuntu-bold uppercase tracking-wider text-black/60 mb-1">
                        QR Code Data
                      </p>
                      <p className="text-xs font-ubuntu-light break-all text-black/80">{getQRCodeData(code).substring(0, 60)}...</p>
                    </div>

                    <div>
                      <p className="text-xs font-ubuntu-bold uppercase tracking-wider text-black/60 mb-1">
                        Status
                      </p>
                      <p className={`text-xs font-ubuntu-bold ${code.used ? 'text-red-600' : 'text-green-600'}`}>
                        {code.used ? '✓ Used' : '○ Unused'}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-ubuntu-bold uppercase tracking-wider text-black/60 mb-1">
                        Created
                      </p>
                      <p className="text-xs font-ubuntu-light">{formatDate(code.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Print Styles - Optimized for TSC TTP 244 Pro Thermal Label Printer */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0.5cm;
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            width: 100% !important;
          }
          
          body > *:not(.print-area) {
            display: none !important;
          }
          
          .no-print {
            display: none !important;
            visibility: hidden !important;
          }
          
          .print-area {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            min-height: auto !important;
          }
          
          .print-items {
            display: grid !important;
            grid-template-columns: repeat(6, 1fr) !important;
            gap: 0.2cm !important;
            padding: 0.3cm !important;
            margin: 0 !important;
            width: 100% !important;
          }
          
          .print-item {
            background: white !important;
            border: 1px solid black !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            padding: 0.15cm !important;
            margin: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            min-height: 3cm !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }
          
          .print-item * {
            color: black !important;
          }
          
          .print-item > div:first-child {
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          .print-qr-container {
            padding: 0.1cm !important;
            border: none !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            width: 100% !important;
            height: 100% !important;
          }
          
          .print-qr-container svg {
            width: 100% !important;
            height: 100% !important;
            max-width: 100% !important;
            max-height: 100% !important;
          }
          
          .print-item svg path {
            fill: black !important;
            stroke: black !important;
          }
          
          .print-mb-0 {
            margin-bottom: 0 !important;
          }
          
          .print-break-inside-avoid {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>
    </>
  );
};
