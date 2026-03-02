import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import './ReelVideo.css';
import { useNavigate } from 'react-router-dom';

const ReelVideo = ({ videoUrl, title, userName }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  // --- Handlers ---

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (video && video.duration) {
      const currentProgress = (video.currentTime / video.duration) * 100;
      setProgress(currentProgress);
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

  // --- Intersection Observer Logic ---

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
          video.currentTime = 0; // Fresh start on every scroll
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

  // --- Render Helpers ---

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
        <button className="video-username-badge" 
        aria-label="View user profile" 
        onClick={() => navigate(`/foodpartner/${id}`)}>
          @{userName || 'partner'}
        </button>
        <h2 className="video-title">{title}</h2>
      </div>
    );
  }, [title, userName]);

  return (
    <article className="reel-item">
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
      {ProgressBar}
      {PlayOverlay}
    </article>
  );
};

export default React.memo(ReelVideo);
