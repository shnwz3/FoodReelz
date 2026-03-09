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
    const [nextCursor, setNextCursor] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const navigate = useNavigate();
    const observerRef = useRef(null);

    const fetchVideos = (cursor = null) => {
        const isInitial = !cursor;
        if (isInitial) setLoading(true);
        else setLoadingMore(true);

        const limit = 6;
        const url = `/food?limit=${limit}${cursor ? `&cursor=${cursor}` : ''}`;
        
        cachedGet(url)
            .then(response => {
                const newVideos = response.data.foodItems || [];
                const nextC = response.data.nextCursor;

                setVideos(prev => isInitial ? newVideos : [...prev, ...newVideos]);
                setNextCursor(nextC);
                setHasMore(response.data.hasMore || false);
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
        fetchVideos();
    }, []);

    // Senior Refinement: Infinite scroll with prefetching
    const lastVideoElementRef = (node) => {
        if (loading || loadingMore || !hasMore) return;
        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                fetchVideos(nextCursor);
            }
        }, { threshold: 0.1 });

        if (node) observerRef.current.observe(node);
    };

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
                        {videos.map((fooditem, index) => {
                            // Prefetch when user reaches the 4th item from the bottom
                            const isPrefetchTrigger = index === videos.length - 4;
                            const isLastItem = index === videos.length - 1;
                            
                            return (
                                <ReelVideo 
                                    ref={isPrefetchTrigger || (isLastItem && videos.length < 4) ? lastVideoElementRef : null}
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
                            );
                        })}
                        
                        {loadingMore && (
                            <div className="infinite-scroll-sentinel">
                                <div className="loading-more-spinner"></div>
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