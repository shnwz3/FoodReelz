import React, { useEffect, useState, useRef } from 'react';
import { ChevronLeft } from 'lucide-react';
import ReelVideo from '../../../components/ReelVideo';

/**
 * Sub-component: Full-screen Reels Feed Overlay
 */
const PartnerReelsOverlay = ({ videos, startIndex, onClose, partnerName }) => {
    const containerRef = useRef(null);
    const [hasScrolled, setHasScrolled] = useState(false);

    useEffect(() => {
        if (containerRef.current && !hasScrolled) {
            const reelHeight = window.innerHeight;
            containerRef.current.scrollTo({
                top: startIndex * reelHeight,
                behavior: 'auto'
            });
            setHasScrolled(true);
        }
    }, [startIndex, hasScrolled]);

    // Prevent body scroll when overlay is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    return (
        <div className="full-screen-reels-overlay">
            <div className="shared-reels-header">
                <button className="shared-overlay-back-btn" onClick={onClose}>
                    <ChevronLeft size={28} />
                </button>
                <div className="shared-partner-info">
                    <span>{partnerName}'s Reels</span>
                </div>
            </div>
            
            <div className="reels-container" ref={containerRef}>
                {videos.map((video) => (
                    <ReelVideo 
                        key={video._id}
                        id={video._id}
                        videoUrl={video.video}
                        title={video.name}
                        userName={partnerName}
                        caption={video.caption}
                        isLiked={video.isLiked}
                        isSaved={video.isSaved}
                        likesCount={video.likesCount}
                        savesCount={video.savesCount}
                        commentsCount={video.commentsCount}
                    />
                ))}
            </div>
        </div>
    );
};

export default PartnerReelsOverlay;
