import React from 'react';
import { X, CloudUpload } from 'lucide-react';

/**
 * Sub-component: Upload Reel Modal
 * Extracted for cleaner logic
 */
const UploadReelModal = ({ 
    onClose, 
    handleUpload, 
    handleFileChange, 
    previewUrl, 
    setPreviewUrl, 
    setVideoFile,
    uploading,
    uploadProgress
}) => {
    return (
        <div className="upload-modal-overlay">
            <div className="upload-modal-card">
                <div className="modal-header">
                    <h3>Create New Reel</h3>
                    <button className="close-modal-x" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>
                
                <form onSubmit={handleUpload} className="upload-form">
                    <div className="upload-layout">
                        <div className="upload-media-section">
                            {!previewUrl ? (
                                <div className="file-drop-area">
                                    <input 
                                        type="file" 
                                        name="video" 
                                        accept="video/*" 
                                        required 
                                        onChange={handleFileChange}
                                        id="video-upload"
                                    />
                                    <label htmlFor="video-upload" className="drop-label">
                                        <div className="upload-icon-pulse">
                                            <CloudUpload size={48} />
                                        </div>
                                        <p>Choose or Drop Video</p>
                                        <span className="file-tip">MP4, WebM (max 50MB)</span>
                                    </label>
                                </div>
                            ) : (
                                <div className="video-preview-container">
                                    <video src={previewUrl} controls className="upload-preview" />
                                    <button 
                                        type="button" 
                                        className="change-video-btn"
                                        onClick={() => {
                                            setPreviewUrl(null);
                                            setVideoFile(null);
                                        }}
                                    >
                                        Change Video
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="upload-info-section">
                            <div className="input-group">
                                <label>Food Name</label>
                                <input 
                                    name="name" 
                                    placeholder="e.g. Signature Truffle Pasta" 
                                    required 
                                />
                            </div>
                            
                            <div className="input-group">
                                <label>Description / Caption</label>
                                <textarea 
                                    name="caption" 
                                    placeholder="Tell your customers what's special..." 
                                    required 
                                />
                            </div>
                        </div>
                    </div>

                    {uploading && (
                        <div className="upload-progress-container">
                            <div className="upload-progress-header">
                                <span>Uploading your delicious reel...</span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <div className="upload-progress-track">
                                <div 
                                    className="upload-progress-fill" 
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    <div className="modal-actions">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="secondary-btn"
                            disabled={uploading}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={uploading} 
                            className={`primary-submit-btn ${uploading ? 'uploading' : ''}`}
                        >
                            {uploading ? (
                                <span className="btn-content">
                                    <span className="spinner"></span>
                                    Uploading...
                                </span>
                            ) : 'Post Reel'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UploadReelModal;
