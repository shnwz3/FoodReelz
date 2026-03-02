import React, { useEffect, useState } from 'react';
import ReelVideo from '../../components/ReelVideo';
import '../../components/ReelVideo.css';
import axios from 'axios';


const Home = () => {
    const [videos, setVideos] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:3000/api/food')
            .then(response => {
                setVideos(response.data.foodItems || []);
            })
            .catch(error => {
                console.error('Error fetching videos:', error);
            });
    }, []);

    return (
        <div className="reels-wrapper">
            <div className="reels-container">
                {videos && videos.length > 0 ? (
                    videos.map((fooditem, index) => (
                        <ReelVideo 
                            key={index} 
                            videoUrl={fooditem.video} 
                            title={fooditem.name} 
                            userName={fooditem.foodPartnerId?.name || "anonymous"}
                        />
                    ))
                ) : (
                    <div style={{ color: 'white', textAlign: 'center', paddingTop: '50px' }}>
                        Loading delicious content...
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;