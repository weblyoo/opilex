import { Modal } from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'default';
}

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
}: ConfirmDialogProps) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-6">
        <p className="text-white font-ubuntu-light">{message}</p>
        <div className="flex gap-4 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-white/30 rounded-xl text-white font-ubuntu-medium hover:bg-white/10 transition-all duration-300 hover:scale-105"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-6 py-3 rounded-xl font-ubuntu-black transition-all duration-300 hover:scale-105 hover:shadow-lg ${
              variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700 text-white hover:shadow-red-500/50'
                : 'bg-white text-black hover:bg-white/90 hover:shadow-white/30'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};





