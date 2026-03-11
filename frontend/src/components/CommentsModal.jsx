import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Send, User, Trash2, MessageSquare } from 'lucide-react';
import api from '../api/axios';
import { cachedGet, invalidateCache } from '../api/apiCache';
import ConfirmModal from './ConfirmModal';
import './CommentsModal.css';

const CommentsModal = ({ isOpen, onClose, foodId, partnerId, onCommentAdded, onCommentDeleted }) => {
    const navigate = useNavigate();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [modalConfig, setModalConfig] = useState({ 
        isOpen: false, 
        title: '', 
        message: '', 
        type: 'danger', 
        confirmText: 'Confirm', 
        cancelText: 'Cancel',
        onConfirm: null 
    });

    const inputRef = useRef(null);
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const currentPartner = JSON.parse(localStorage.getItem('foodPartner'));
    const commentEndpoint = `/food/${foodId}/comments`;

    useEffect(() => {
        if (isOpen && foodId) {
            fetchComments();
            // Focus input after a short delay to allow for modal transition
            setTimeout(() => {
                inputRef.current?.focus();
            }, 300);
        }
    }, [isOpen, foodId]);

    const fetchComments = async () => {
        setLoading(true);
        try {
            const response = await cachedGet(commentEndpoint, { ttl: 30000 });
            setComments(response.data.comments);
        } catch (err) {
            console.error('Failed to fetch comments:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const text = newComment.trim();
        if (!text || submitting) return;

        // Optimistic UI update
        const tempId = Date.now().toString();
        const optimisticComment = {
            _id: tempId,
            text,
            user: { _id: currentUser?.userId || currentUser?._id, name: currentUser?.name || 'You' },
            createdAt: new Date().toISOString(),
            isOptimistic: true // UI flag for styling if needed
        };

        setComments(prev => [optimisticComment, ...prev]);
        setNewComment('');
        setSubmitting(true);

        try {
            const response = await api.post(commentEndpoint, { text });
            invalidateCache(commentEndpoint);
            
            // Replace optimistic comment with real one from DB
            setComments(prev => prev.map(c => c._id === tempId ? response.data.comment : c));
            if (onCommentAdded) onCommentAdded();
        } catch (err) {
            // Rollback on error
            setComments(prev => prev.filter(c => c._id !== tempId));
            setNewComment(text); // Restore text so user doesn't lose it

            if (err.response?.status === 401) {
                setModalConfig({ 
                    isOpen: true, 
                    title: "Login Required", 
                    message: "Please login to join the conversation and post comments!",
                    type: "warning",
                    confirmText: "Go to Login",
                    cancelText: "Maybe Later",
                    onConfirm: () => navigate('/user/login')
                });
            } else {
                console.error('Failed to post comment:', err);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const triggerDeleteConfirm = (commentId) => {
        setModalConfig({ 
            isOpen: true, 
            title: "Delete Comment",
            message: "Are you sure you want to permanently delete this comment?",
            type: "danger",
            confirmText: "Delete",
            cancelText: "Cancel",
            onConfirm: () => handleDeleteComment(commentId)
        });
    };

    const handleDeleteComment = async (commentId) => {
        // Optimistic UI check: Save current state for potential rollback
        const originalComments = [...comments];
        
        // Immediate UI removal
        setComments(prev => prev.filter(c => c._id !== commentId));
        if (onCommentDeleted) onCommentDeleted();
        
        setModalConfig(prev => ({ ...prev, isOpen: false }));

        try {
            await api.delete(`/food/comments/${commentId}`);
            invalidateCache(commentEndpoint);
        } catch (err) {
            // Rollback on failure
            setComments(originalComments);
            if (onCommentDeleted) onCommentDeleted(1); // Optional: reverse the count change
            console.error('Failed to delete comment:', err);
            
            setModalConfig({
                isOpen: true,
                title: "Error",
                message: "We couldn't delete your comment right now. Please check your connection.",
                type: "danger",
                confirmText: "OK",
                cancelText: null
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="comments-modal-overlay" onClick={onClose}>
            <div className="comments-modal-sheet" onClick={(e) => e.stopPropagation()}>
                <div className="comments-modal-header">
                    <div className="comments-header-left">
                        <MessageSquare size={20} className="header-icon" />
                        <h3>Comments 
                            <span className="comment-count-pill">{comments.length}</span>
                        </h3>
                    </div>
                    <button className="comments-close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="comments-modal-body">
                    {loading ? (
                        <div className="comments-loading">
                            <div className="comments-spinner"></div>
                            <p>Loading comments...</p>
                        </div>
                    ) : comments.length > 0 ? (
                        <div className="comments-list">
                            {comments.map((comment) => (
                                <div key={comment._id} className="comment-item">
                                    <div className="comment-avatar">
                                        <User size={18} />
                                    </div>
                                    <div className="comment-content">
                                        <div className="comment-user-row">
                                            <span className="comment-username">
                                                {comment.user?.name || 'Anonymous'}
                                                {currentUser && currentUser.id === comment.user?._id && <span className="user-badge">You</span>}
                                            </span>
                                            <span className="comment-time">
                                                {new Date(comment.createdAt).toLocaleString([], { 
                                                    month: 'short', 
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                        <p className="comment-text">{comment.text}</p>
                                    </div>
                                    {((currentUser && (currentUser.userId === comment.user?._id || currentUser._id === comment.user?._id)) || 
                                      (currentPartner && (currentPartner.foodPartnerId === partnerId || currentPartner._id === partnerId))) && (
                                        <button 
                                            className="comment-delete-btn" 
                                            onClick={() => triggerDeleteConfirm(comment._id)}
                                            title="Delete comment"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="comments-empty">
                            <div className="empty-icon-wrapper">
                                <MessageSquare size={48} />
                            </div>
                            <p>No comments yet</p>
                            <span>Be the first to share your thoughts!</span>
                        </div>
                    )}
                </div>

                <div className="comments-modal-footer">
                    <form className="comment-input-wrapper" onSubmit={handleSubmit}>
                        <input 
                            ref={inputRef}
                            type="text" 
                            placeholder={currentUser ? "Add a comment..." : "Login to comment"}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            disabled={!currentUser || submitting}
                        />
                        <button 
                            type="submit" 
                            className={`comment-send-btn ${newComment.trim() ? 'active' : ''}`}
                            disabled={!newComment.trim() || submitting}
                        >
                            {submitting ? <div className="send-spinner"></div> : <Send size={20} />}
                        </button>
                    </form>
                </div>
            </div>

            <ConfirmModal 
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
                confirmText={modalConfig.confirmText}
                cancelText={modalConfig.cancelText}
                type={modalConfig.type}
            />
        </div>
    );
};

export default CommentsModal;
