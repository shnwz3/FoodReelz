import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import './ReelVideo.css';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { cachedGet, invalidateCache } from '../api/apiCache';
import { Heart, Bookmark, Share2, MoreVertical, MessageCircle } from 'lucide-react';
import SocialUsersModal from './SocialUsersModal';
import CommentsModal from './CommentsModal';
import ConfirmModal from './ConfirmModal';

const ReelVideo = React.forwardRef(({ 
  id, 
  videoUrl, 
  title, 
  userName, 
  partnerId, 
  caption, 
  isLiked: initialIsLiked, 
  isSaved: initialIsSaved, 
  likesCount: initialLikesCount, 
  savesCount: initialSavesCount,
  commentsCount: initialCommentsCount 
}, ref) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  // Social States
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [likesCount, setLikesCount] = useState(initialLikesCount || 0);
  const [savesCount, setSavesCount] = useState(initialSavesCount || 0);

  const [socialModal, setSocialModal] = useState({ isOpen: false, title: '', type: '', users: [], loading: false });
  const [commentsModal, setCommentsModal] = useState({ isOpen: false });
  const [commentsCount, setCommentsCount] = useState(initialCommentsCount || 0);


  const fetchSocialUsers = async (type) => {
    setSocialModal({ isOpen: true, title: type === 'likes' ? 'Liked by' : 'Saved by', type, users: [], loading: true });
    try {
      const endpoint = type === 'likes' ? `/food/${id}/likes` : `/food/${id}/saves`;
      const response = await cachedGet(endpoint, { ttl: 30000 });
      setSocialModal(prev => ({ ...prev, users: response.data.users, loading: false }));
    } catch (err) {
      console.error("Failed to fetch social users", err);
      setSocialModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (video && video.duration) {
      setProgress((video.currentTime / video.duration) * 100);
    }
  }, []);


  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(err => console.debug("Playback interaction failed", err));
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleLike = async (e) => {
    e.stopPropagation();
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);

    try {
      const response = await api.post('/food/like', { food: id });
      setLikesCount(response.data.likesCount);
      setIsLiked(response.data.isLiked);
      invalidateCache(`/food/${id}/likes`);
    } catch (err) {
      setIsLiked(!newLikedState);
      setLikesCount(prev => !newLikedState ? prev + 1 : prev - 1);
      if (err.response?.status === 401) {
        setAlertModal({
          isOpen: true,
          title: "Login Required",
          message: "Please login as a user to join the community and like reels!",
          type: "warning",
          confirmText: "Go to Login",
          cancelText: "Maybe Later",
          onConfirm: () => navigate('/user/login')
        });
      }
    }
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    const newSavedState = !isSaved;
    setIsSaved(newSavedState);
    setSavesCount(prev => newSavedState ? prev + 1 : prev - 1);

    try {
      const response = await api.post('/food/save', { food: id });
      setSavesCount(response.data.savesCount);
      setIsSaved(response.data.isSaved);
      invalidateCache(`/food/${id}/saves`);
    } catch (err) {
      setIsSaved(!newSavedState);
      setSavesCount(prev => !newSavedState ? prev + 1 : prev - 1);
      if (err.response?.status === 401) {
        setAlertModal({
          isOpen: true,
          title: "Login Required",
          message: "Please login as a user to save your favorite reels!",
          type: "warning",
          confirmText: "Go to Login",
          cancelText: "Maybe Later",
          onConfirm: () => navigate('/user/login')
        });
      }
    }
  };

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.7, 
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        const video = videoRef.current;
        if (!video) return;

        if (entry.isIntersecting) {
          video.currentTime = 0;
          video.play().catch(err => console.debug("Autoplay blocked/failed", err));
          setIsPlaying(true);
        } else {
          video.pause();
          setIsPlaying(false);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const currentVideo = videoRef.current;

    if (currentVideo) {
      observer.observe(currentVideo);
    }

    return () => {
      if (currentVideo) {
        observer.unobserve(currentVideo);
      }
    };
  }, []);

  const ProgressBar = useMemo(() => (
    <div className="progress-bar-container">
      <div 
        className="progress-bar-fill" 
        style={{ width: `${progress}%` }}
      />
    </div>
  ), [progress]);

  const PlayOverlay = useMemo(() => {
    if (isPlaying) return null;
    return (
      <div className="video-overlay">
        <span className="play-icon">▶</span>
      </div>
    );
  }, [isPlaying]);

  const TitleOverlay = useMemo(() => {
    if (!title) return null;
    return (
      <div className="video-info-stack">
        <div className="video-text-container">
          <h2 className="video-title">{title}</h2>
          {caption && <p className="video-caption">{caption}</p>}
        </div>
        
        <div className="video-meta-row">
          <button className="video-username-badge" 
                  aria-label="View user profile" 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/foodpartner/${partnerId}`);
                  }}>
            @{userName || 'partner'}
          </button>
        </div>
      </div>
    );
  }, [title, userName, partnerId, navigate, caption, progress]);

  const SideActions = useMemo(() => (
    <div className="side-actions-container">
      <div className="action-item">
        <div className={`action-icon-wrapper ${isLiked ? 'active like' : ''}`} onClick={handleLike}>
          <Heart size={26} fill={isLiked ? "currentColor" : "none"} />
        </div>
        <span onClick={(e) => { e.stopPropagation(); fetchSocialUsers('likes'); }}>{likesCount}</span>
      </div>

      <div className="action-item">
        <div className="action-icon-wrapper" onClick={(e) => { e.stopPropagation(); setCommentsModal({ isOpen: true }); }}>
          <MessageCircle size={26} />
        </div>
        <span>{commentsCount}</span>
      </div>

      <div className="action-item">
        <div className={`action-icon-wrapper ${isSaved ? 'active save' : ''}`} onClick={handleSave}>
          <Bookmark size={26} fill={isSaved ? "currentColor" : "none"} />
        </div>
        <span onClick={(e) => { e.stopPropagation(); fetchSocialUsers('saves'); }}>{savesCount}</span>
      </div>

      <div className="action-item">
        <div className="action-icon-wrapper">
          <Share2 size={26} />
        </div>
      </div>
    </div>
  ), [isLiked, isSaved, likesCount, savesCount, commentsCount]);

  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', type: 'info', confirmText: 'OK', onConfirm: null });

  const handleCommentUpdate = (change) => {
    setCommentsCount(prev => prev + change);
  };

  return (
    <article ref={ref} className="reel-item">
      <video
        ref={videoRef}
        src={videoUrl}
        className="reel-video"
        loop
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onClick={togglePlay}
        aria-label={`Food reel: ${title || 'video'}`}
      />
      
      {TitleOverlay}
      {SideActions}
      {ProgressBar}
      {PlayOverlay}

      <SocialUsersModal 
        isOpen={socialModal.isOpen}
        onClose={() => setSocialModal(prev => ({ ...prev, isOpen: false }))}
        title={socialModal.title}
        users={socialModal.users}
        loading={socialModal.loading}
      />

      <CommentsModal 
        isOpen={commentsModal.isOpen}
        onClose={() => setCommentsModal({ isOpen: false })}
        foodId={id}
        partnerId={partnerId}
        onCommentAdded={() => handleCommentUpdate(1)}
        onCommentDeleted={() => handleCommentUpdate(-1)}
      />

      <ConfirmModal 
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={alertModal.onConfirm}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        confirmText={alertModal.confirmText}
        cancelText={alertModal.cancelText}
      />
    </article>
  );
});

export default React.memo(ReelVideo);
