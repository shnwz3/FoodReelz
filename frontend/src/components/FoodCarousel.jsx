import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, ChevronLeft, ChevronRight, Bookmark } from 'lucide-react';
import './FoodCarousel.css';

// Hardcoded food data for the carousel
const FOODS = [
  {
    name: 'Butter Chicken',
    emoji: '🍛',
    bgColor: '#921A22',
    description: 'Rich, creamy tomato-based curry with chicken pieces. A classic North Indian delight.',
    authorName: 'Chef Rajan',
    authorAvatar: '👨‍🍳',
  },
  {
    name: 'Sushi Roll',
    emoji: '🍣',
    bgColor: '#143628',
    description: 'Fresh fish, seasoned rice, and crisp nori — the art of Japanese cuisine rolled to perfection.',
    authorName: 'Chef Yuki',
    authorAvatar: '👩‍🍳',
  },
  {
    name: 'Margherita Pizza',
    emoji: '🍕',
    bgColor: '#8B6B00',
    description: 'Wood-fired crust topped with San Marzano tomatoes, fresh mozzarella, and fragrant basil.',
    authorName: 'Chef Marco',
    authorAvatar: '🧑‍🍳',
  },
  {
    name: 'Tacos Al Pastor',
    emoji: '🌮',
    bgColor: '#8B2E00',
    description: 'Spit-roasted pork with pineapple, onion, and cilantro on warm corn tortillas.',
    authorName: 'Chef Sofia',
    authorAvatar: '👩‍🍳',
  },
  {
    name: 'Ramen',
    emoji: '🍜',
    bgColor: '#4A1D1A',
    description: 'Rich tonkotsu broth, hand-pulled noodles, chashu pork, and a soft-boiled egg.',
    authorName: 'Chef Hiro',
    authorAvatar: '👨‍🍳',
  },
  {
    name: 'Croissant',
    emoji: '🥐',
    bgColor: '#6B4E00',
    description: 'Flaky, buttery layers of golden pastry — the crown jewel of French baking.',
    authorName: 'Chef Pierre',
    authorAvatar: '🧑‍🍳',
  },
];

export default function FoodCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isNavigating, setIsNavigating] = useState(false);

  const foods = FOODS;
  const currentFood = foods[currentIndex];

  const paginate = (newDirection) => {
    if (isNavigating) return;
    setIsNavigating(true);
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      let nextIndex = prevIndex + newDirection;
      if (nextIndex < 0) nextIndex = foods.length - 1;
      if (nextIndex >= foods.length) nextIndex = 0;
      return nextIndex;
    });
    setTimeout(() => setIsNavigating(false), 500);
  };

  const goToSlide = (index) => {
    if (isNavigating || index === currentIndex) return;
    setDirection(index > currentIndex ? 1 : -1);
    setIsNavigating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsNavigating(false), 500);
  };

  // Auto-play (12 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      paginate(1);
    }, 12000);
    return () => clearInterval(timer);
  }, [currentIndex, isNavigating]);

  // Mouse parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Scroll to change
  useEffect(() => {
    let lastScrollTime = 0;
    const scrollThreshold = 40;
    const scrollDebounce = 1000;

    const handleWheel = (e) => {
      const now = Date.now();
      if (now - lastScrollTime < scrollDebounce || isNavigating) return;
      if (Math.abs(e.deltaY) > scrollThreshold) {
        if (e.deltaY > 0) paginate(1);
        else paginate(-1);
        lastScrollTime = now;
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [isNavigating, foods.length]);

  // Framer Motion Variants
  const textContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
    exit: {
      opacity: 0,
      transition: { staggerChildren: 0.05, staggerDirection: -1 },
    },
  };

  const textItemVariants = {
    hidden: { opacity: 0, y: 50, rotateX: -45 },
    show: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: { type: 'spring', bounce: 0.4, duration: 0.8 },
    },
    exit: { opacity: 0, y: -50, transition: { duration: 0.3 } },
  };

  const food3DVariants = {
    enter: (dir) => ({
      z: -250,
      x: dir > 0 ? 80 : -80,
      opacity: 0,
      scale: 0.5,
    }),
    center: {
      z: 250,
      x: 0,
      rotateY: 15,
      rotateX: 5,
      scale: 1.3,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 70,
        damping: 10,
        mass: 1.5,
      },
    },
    exit: (dir) => ({
      z: 400,
      x: dir < 0 ? 150 : -150,
      opacity: 0,
      scale: 1.1,
      transition: { duration: 0.4 },
    }),
  };

  const bgColor = currentFood.bgColor || '#FF0055';

  return (
    <motion.div
      className="carousel-container perspective-2000"
      animate={{ backgroundColor: bgColor }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      {/* Camera Pan Container */}
      <motion.div
        className="carousel-inner preserve-3d"
        animate={{
          x: mousePosition.x,
          y: mousePosition.y,
          rotateY: mousePosition.x * 0.2,
          rotateX: -mousePosition.y * 0.2,
        }}
        transition={{ type: 'spring', stiffness: 50, damping: 20 }}
      >
        {/* Left Side: Staggered Typography */}
        <div className="carousel-text-side">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              variants={textContainerVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="carousel-text-content preserve-3d"
            >
              {/* Creator Profile Tag */}
              <motion.div variants={textItemVariants} className="creator-tag">
                <span className="creator-avatar">{currentFood.authorAvatar || '👨‍🍳'}</span>
                <span className="creator-name">{currentFood.authorName || 'FoodCreator'}</span>
                <button className="follow-btn">Follow</button>
              </motion.div>

              <motion.h1 variants={textItemVariants} className="food-name">
                {currentFood.name}
              </motion.h1>

              <motion.p variants={textItemVariants} className="food-description">
                {currentFood.description}
                <span className="food-hashtags">#foodie #{currentFood.name.toLowerCase().replace(/\s+/g, '')}</span>
              </motion.p>

              {/* Social Interaction Bar */}
              <motion.div variants={textItemVariants} className="social-bar">
                <button className="social-btn">
                  <div className="social-icon-wrap">
                    <Heart />
                  </div>
                  <span className="social-label">12.4k</span>
                </button>

                <button className="social-btn">
                  <div className="social-icon-wrap">
                    <MessageCircle />
                  </div>
                  <span className="social-label">342</span>
                </button>

                <button className="social-btn">
                  <div className="social-icon-wrap">
                    <Bookmark />
                  </div>
                  <span className="social-label">Save</span>
                </button>

                <button className="social-btn">
                  <div className="social-icon-wrap">
                    <Share2 />
                  </div>
                  <span className="social-label">Share</span>
                </button>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Side: Phone & 3D Food */}
        <div className="carousel-phone-side preserve-3d">
          <motion.div
            className="phone-frame preserve-3d"
            animate={{
              rotateY: -25,
              rotateX: 10,
              rotateZ: -2,
              scale: 1,
            }}
            transition={{ duration: 0.7, ease: 'circOut' }}
          >
            {/* Phone Screen */}
            <div className="phone-screen preserve-3d">
              {/* Screen Glow */}
              <motion.div
                className="screen-glow"
                animate={{ backgroundColor: bgColor }}
              />

              {/* 3D Floating Food */}
              <AnimatePresence custom={direction} mode="sync">
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={food3DVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="food-emoji-3d"
                >
                  {currentFood.emoji || '🍽️'}
                </motion.div>
              </AnimatePresence>

              {/* Glass overlay */}
              <div className="glass-overlay" />
            </div>

            {/* Phone Notch */}
            <div className="phone-notch" />

            {/* Phone Home Bar */}
            <div className="phone-home-bar" />
          </motion.div>
        </div>
      </motion.div>

      {/* Navigation Controls */}
      <div className="nav-controls">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => paginate(-1)}
          className="nav-arrow"
        >
          <ChevronLeft />
        </motion.button>

        <div className="nav-dots">
          {foods.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className="nav-dot-btn"
            >
              <motion.div
                animate={{
                  scale: idx === currentIndex ? 1.5 : 1,
                  backgroundColor: idx === currentIndex ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.3)',
                }}
                className="nav-dot"
              />
            </button>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => paginate(1)}
          className="nav-arrow"
        >
          <ChevronRight />
        </motion.button>
      </div>
    </motion.div>
  );
}
