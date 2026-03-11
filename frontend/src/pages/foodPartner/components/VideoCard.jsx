import React from 'react';
import { Heart, MessageCircle, Trash2 } from 'lucide-react';

/**
 * Sub-component: Video Card for the Grid
 */
const VideoCard = ({ video, onClick, onDelete }) => {
    const handlePlay = (e) => e.target.play();
    const handlePause = (e) => e.target.pause();

    return (
        <div className="video-card" onClick={onClick}>
            {onDelete && (
                <button className="delete-reel-btn" onClick={onDelete} title="Delete Reel">
                    <Trash2 size={16} />
                </button>
            )}
            <video 
                src={video.video} 
                muted
                onMouseOver={handlePlay}
                onMouseOut={handlePause}
                onTouchStart={handlePlay}
                onTouchEnd={handlePause}
                loop
                playsInline
            />
            <div className="video-card-overlay">
                <div className="video-card-info-row">
                    <p className="video-card-title">{video.name}</p>
                    <div className="video-metrics-row">
                        <div className="metric-stat">
                            <Heart 
                                size={12} 
                                fill={video.isLiked ? "#FF324D" : "none"} 
                                color={video.isLiked ? "#FF324D" : "white"}
                                strokeWidth={video.isLiked ? 0 : 2.5} 
                            />
                            <span>{video.likesCount || 0}</span>
                        </div>
                        <div className="metric-stat">
                            <MessageCircle size={12} fill="white" strokeWidth={0} />
                            <span>{video.commentsCount || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoCard;
