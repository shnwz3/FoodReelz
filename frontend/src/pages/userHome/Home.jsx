import React, { useEffect, useState, useRef } from 'react';
import ReelVideo from '../../components/ReelVideo';
import '../../components/ReelVideo.css';
import { cachedGet } from '../../api/apiCache';
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
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const navigate = useNavigate();
    const sentinelRef = useRef(null);

    const fetchVideos = (pageNum) => {
        const isInitial = pageNum === 1;
        if (isInitial) setLoading(true);
        else setLoadingMore(true);

        const limit = 5;
        cachedGet(`/food?page=${pageNum}&limit=${limit}`)
            .then(response => {
                const newVideos = response.data.foodItems || [];
                const pagination = response.data.pagination;

                setVideos(prev => isInitial ? newVideos : [...prev, ...newVideos]);
                setHasMore(pagination?.hasMore || false);
            })
            .catch(error => {
                console.error('Error fetching videos:', error);
            })
            .finally(() => {
                if (isInitial) setLoading(false);
                else setLoadingMore(false);
            });
    };

    useEffect(() => {
        fetchVideos(1);
    }, []);

    useEffect(() => {
        if (loading || !hasMore || loadingMore) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                const nextWeight = page + 1;
                setPage(nextWeight);
                fetchVideos(nextWeight);
            }
        }, { threshold: 0.1 });

        if (sentinelRef.current) {
            observer.observe(sentinelRef.current);
        }

        return () => observer.disconnect();
    }, [loading, hasMore, loadingMore, page]);

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
                    <>
                        {videos.map((fooditem, index) => (
                            <ReelVideo 
                                key={`${fooditem._id}-${index}`}
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
                        ))}
                        
                        {hasMore && (
                            <div className="infinite-scroll-sentinel" ref={sentinelRef}>
                                {loadingMore && <div className="loading-more-spinner"></div>}
                            </div>
                        )}
                    </>
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