import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Modal } from '../components/Modal';

type UserType = 'electrician' | 'dealer';

export const GenerateRewardQR = () => {
  const [points, setPoints] = useState('');
  const [description, setDescription] = useState('');
  const [userType, setUserType] = useState<UserType>('electrician');
  const [generating, setGenerating] = useState(false);
  const [qrData, setQrData] = useState<string | null>(null);
  const [qrId, setQrId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const generateQRCode = async () => {
    if (!points || !description.trim()) {
      alert('Please enter points and description');
      return;
    }

    if (!userType) {
      alert('Please select user type');
      return;
    }

    const pointsNum = parseInt(points);
    if (isNaN(pointsNum) || pointsNum <= 0) {
      alert('Please enter a valid positive number for points');
      return;
    }

    setGenerating(true);

    try {
      // Generate unique QR code ID
      const qrCodeId = `REWARD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Normalize userType to lowercase for consistency
      const normalizedUserType = userType ? userType.toLowerCase().trim() : userType;
      
      console.log('🔖 [QR-GEN-ADMIN] Generating QR code:', {
        userType: userType,
        normalizedUserType: normalizedUserType,
        points: pointsNum,
      });
      
      // Create QR code data as JSON (includes userType)
      const qrCodeData = {
        type: 'kimson_reward',
        rewardId: qrCodeId,
        points: pointsNum,
        description: description.trim(),
        userType: normalizedUserType, // Include normalized user type in QR code data
        createdAt: new Date().toISOString(),
      };

      // Store reward QR code in Firestore (includes userType)
      await addDoc(collection(db, 'rewardQRCodes'), {
        rewardId: qrCodeId,
        points: pointsNum,
        description: description.trim(),
        userType: normalizedUserType, // Store normalized user type in Firestore
        used: false,
        usedBy: null,
        usedAt: null,
        createdAt: Timestamp.now(),
        createdBy: 'admin', // You can get actual admin user ID here
      });

      // Set QR code data as JSON string
      setQrData(JSON.stringify(qrCodeData));
      setQrId(qrCodeId);
      setShowModal(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Failed to generate QR code. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const downloadQR = () => {
    if (!qrData) return;

    const svg = document.querySelector('#qr-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `kimson-reward-qr-${userType}-${qrId}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const resetForm = () => {
    setPoints('');
    setDescription('');
    setUserType('electrician');
    setQrData(null);
    setQrId(null);
    setShowModal(false);
  };

  const getUserTypeDisplay = (type: UserType) => {
    return type === 'electrician' ? 'Electrician' : 'Dealer';
  };

  return (
    <div className="p-8 min-h-screen bg-[#111111] animate-fadeIn">
      <div className="mb-10">
        <h1 className="text-5xl font-ubuntu font-black mb-2 text-white tracking-tight">
          Generate Reward QR Code
        </h1>
        <p className="text-white/60 font-ubuntu-light">Create QR codes for Electricians or Dealers to scan and receive rewards</p>
      </div>

      <div className="max-w-2xl">
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-8">
          <div className="space-y-6">
            {/* User Type Selection */}
            <div>
              <label className="block text-sm font-ubuntu-bold mb-3 text-white uppercase tracking-wide">
                User Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setUserType('electrician')}
                  className={`p-5 border-2 rounded-xl transition-all duration-300 ${
                    userType === 'electrician'
                      ? 'border-white bg-white/10 text-white'
                      : 'border-white/10 bg-black/50 text-white/60 hover:border-white/40'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">⚡</div>
                    <div className="font-ubuntu-bold text-base">Electrician</div>
                    <div className="font-ubuntu-light text-xs mt-1">For Electricians Only</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('dealer')}
                  className={`p-5 border-2 rounded-xl transition-all duration-300 ${
                    userType === 'dealer'
                      ? 'border-white bg-white/10 text-white'
                      : 'border-white/10 bg-black/50 text-white/60 hover:border-white/40'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">🏪</div>
                    <div className="font-ubuntu-bold text-base">Dealer</div>
                    <div className="font-ubuntu-light text-xs mt-1">For Dealers Only</div>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-ubuntu-bold mb-3 text-white uppercase tracking-wide">
                Reward Points
              </label>
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                placeholder="Enter points amount"
                className="w-full px-5 py-4 border border-white/10 rounded-xl bg-black/50 text-white placeholder-white/40 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/20 font-ubuntu-light transition-all duration-300"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-ubuntu-bold mb-3 text-white uppercase tracking-wide">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter reward description (e.g., Special Promotion, Event Bonus, etc.)"
                rows={4}
                className="w-full px-5 py-4 border border-white/10 rounded-xl bg-black/50 text-white placeholder-white/40 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/20 font-ubuntu-light transition-all duration-300 resize-none"
              />
            </div>

            <button
              onClick={generateQRCode}
              disabled={generating || !points || !description.trim() || !userType}
              className="w-full bg-[#E31E24] text-white py-4 rounded-xl hover:bg-white/90 disabled:opacity-50 font-ubuntu-black text-base tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-white/30 transform"
            >
              {generating ? 'Generating...' : 'Generate QR Code'}
            </button>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Reward QR Code Generated" size="md">
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="bg-white p-6 rounded-xl">
              {qrData && (
                <QRCodeSVG
                  id="qr-code-svg"
                  value={qrData}
                  size={256}
                  level="H"
                  includeMargin={true}
                />
              )}
            </div>
          </div>

          <div className="space-y-3 text-center">
            <div>
              <p className="text-white/60 font-ubuntu-light text-sm mb-1">User Type</p>
              <p className="text-white font-ubuntu-bold text-xl">{getUserTypeDisplay(userType)}</p>
            </div>
            <div>
              <p className="text-white/60 font-ubuntu-light text-sm mb-1">Reward Points</p>
              <p className="text-white font-ubuntu-bold text-2xl">{points}</p>
            </div>
            <div>
              <p className="text-white/60 font-ubuntu-light text-sm mb-1">Description</p>
              <p className="text-white font-ubuntu-medium">{description}</p>
            </div>
            <div>
              <p className="text-white/60 font-ubuntu-light text-sm mb-1">QR Code ID</p>
              <p className="text-white font-ubuntu-light text-xs break-all">{qrId}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={downloadQR}
              className="flex-1 bg-[#E31E24] text-white py-3 rounded-xl hover:bg-white/90 font-ubuntu-black transition-all duration-300 hover:scale-105"
            >
              Download QR Code
            </button>
            <button
              onClick={resetForm}
              className="flex-1 border border-white/30 text-white py-3 rounded-xl hover:bg-white/10 font-ubuntu-medium transition-all duration-300"
            >
              Generate Another
            </button>
          </div>

          <p className="text-white/50 font-ubuntu-light text-xs text-center">
            Only {getUserTypeDisplay(userType)} users can scan this QR code in the Kimson app to receive {points} points
          </p>
        </div>
      </Modal>
    </div>
  );
};
