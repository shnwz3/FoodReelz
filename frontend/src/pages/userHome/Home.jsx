import React, { useEffect, useState, useRef } from 'react';
import ReelVideo from '../../components/ReelVideo';
import '../../components/ReelVideo.css';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import UserMenu from '../../components/UserMenu';

const ReelSkeleton = () => (
    <div className="reel-skeleton">
        <div className="skeleton-info-stack">
            <div className="skeleton-badge"></div>
            <div className="skeleton-title"></div>
            <div className="skeleton-caption"></div>
        </div>
        <div className="skeleton-actions">
            <div className="skeleton-action-circle"></div>
            <div className="skeleton-action-circle"></div>
            <div className="skeleton-action-circle"></div>
        </div>
    </div>
);

const Home = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        api.get('/food')
            .then(response => {
                setVideos(response.data.foodItems || []);
            })
            .catch(error => {
                console.error('Error fetching videos:', error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    return (
        <div className="reels-wrapper">
            <header className="reels-header">
                <div className="logo">
                    <span>FoodReelz</span>
                </div>
                
                <UserMenu />
            </header>
            <div className="reels-container">
                {loading ? (
                    // Show 3 skeletons during initial load
                    [...Array(3)].map((_, i) => <ReelSkeleton key={i} />)
                ) : videos.length > 0 ? (
                    videos.map((fooditem, index) => (
                        <ReelVideo 
                            key={index}
                            id={fooditem._id}
                            videoUrl={fooditem.video} 
                            title={fooditem.name} 
                            userName={fooditem.foodPartnerId?.name || "anonymous"}
                            partnerId={fooditem.foodPartnerId?._id}
                            caption={fooditem.caption}
                            isLiked={fooditem.isLiked}
                            isSaved={fooditem.isSaved}
                            likesCount={fooditem.likesCount}
                            savesCount={fooditem.savesCount}
                        />
                    ))
                ) : (
                    <div style={{ color: 'white', textAlign: 'center', paddingTop: '50px' }}>
                        No videos found. Check back later!
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;