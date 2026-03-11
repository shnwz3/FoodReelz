import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import './ConfirmModal.css';

const ConfirmModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = "Confirm Action", 
    message = "Are you sure you want to proceed?", 
    confirmText = "Delete", 
    cancelText = "Cancel",
    type = "danger" // danger, warning, info
}) => {
    if (!isOpen) return null;

    return (
        <div className="confirm-modal-overlay" onClick={onClose}>
            <div className="confirm-modal-card" onClick={(e) => e.stopPropagation()}>
                <button className="confirm-modal-close" onClick={onClose}>
                    <X size={20} />
                </button>
                
                <div className="confirm-modal-content">
                    <div className={`confirm-modal-icon ${type}`}>
                        <AlertTriangle size={32} />
                    </div>
                    
                    <div className="confirm-modal-text">
                        <h3>{title}</h3>
                        <p>{message}</p>
                    </div>
                </div>

                <div className="confirm-modal-actions">
                    {cancelText && (
                        <button className="confirm-btn-cancel" onClick={onClose}>
                            {cancelText}
                        </button>
                    )}
                    <button className={`confirm-btn-action ${type}`} onClick={onConfirm || onClose}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
