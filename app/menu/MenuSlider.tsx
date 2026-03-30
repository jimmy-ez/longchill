"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface MenuItem {
    id: string;
    name: string;
    category: "food" | "drink" | "mala";
    image_url: string | null;
    display_order: number;
    is_visible: boolean;
}

interface MenuSliderProps {
    foodItems: MenuItem[];
    drinkItems: MenuItem[];
    malaItems: MenuItem[];
}

export default function MenuSlider({ foodItems, drinkItems, malaItems }: MenuSliderProps) {
    const [activeTab, setActiveTab] = useState<"food" | "drink" | "mala">("food");
    const [currentIndex, setCurrentIndex] = useState(0);
    const touchStartX = useRef<number | null>(null);

    const activeItems = activeTab === "food" ? foodItems : activeTab === "drink" ? drinkItems : malaItems;

    const handleNext = useCallback(() => {
        if (activeItems.length === 0) return;
        setCurrentIndex((prev) => (prev + 1) % activeItems.length);
    }, [activeItems.length]);

    const handlePrev = useCallback(() => {
        if (activeItems.length === 0) return;
        setCurrentIndex((prev) => (prev === 0 ? activeItems.length - 1 : prev - 1));
    }, [activeItems.length]);

    const onTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const onTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return;
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) handleNext();
            else handlePrev();
        }
        touchStartX.current = null;
    };

    // Autoplay
    useEffect(() => {
        if (activeItems.length === 0) return;
        const timer = setInterval(() => {
            handleNext();
        }, 15000);
        return () => clearInterval(timer);
    }, [activeItems.length, handleNext]);

    return (
        <div className="menu-slider-container">
            <div className="tabs-container">
                <button
                    className={`tab-button ${activeTab === "food" ? "active" : ""}`}
                    onClick={() => {
                        setActiveTab("food");
                        setCurrentIndex(0);
                    }}
                >
                    <span className="tab-icon">🍽️</span>
                    อาหาร
                </button>
                <button
                    className={`tab-button ${activeTab === "drink" ? "active" : ""}`}
                    onClick={() => {
                        setActiveTab("drink");
                        setCurrentIndex(0);
                    }}
                >
                    <span className="tab-icon">🍹</span>
                    เครื่องดื่ม
                </button>
                <button
                    className={`tab-button ${activeTab === "mala" ? "active" : ""}`}
                    onClick={() => {
                        setActiveTab("mala");
                        setCurrentIndex(0);
                    }}
                >
                    <span className="tab-icon">🌶️</span>
                    หม่าล่า
                </button>
            </div>

            {activeItems.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <p>ไม่มีรายการเมนูในหมวดหมู่นี้</p>
                </div>
            ) : (
                <>
                    <div
                        className="slider-wrapper"
                        onTouchStart={onTouchStart}
                        onTouchEnd={onTouchEnd}
                    >
                        <button className="slider-control prev" onClick={handlePrev} aria-label="Previous menu">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        </button>

                        {activeItems[currentIndex] && (
                            <div className="slider-content" key={activeItems[currentIndex].id}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={activeItems[currentIndex].image_url!}
                                    alt={activeItems[currentIndex].name}
                                    className="slider-image fade-in"
                                />
                            </div>
                        )}

                        <button className="slider-control next" onClick={handleNext} aria-label="Next menu">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </button>
                    </div>

                    <div className="slider-footer">
                        <span className="slide-counter">
                            {currentIndex + 1} / {activeItems.length}
                        </span>
                        <div className="slider-dots">
                            {activeItems.map((_, index) => (
                                <button
                                    key={index}
                                    aria-label={`Go to slide ${index + 1}`}
                                    className={`dot ${index === currentIndex ? "active" : ""}`}
                                    onClick={() => setCurrentIndex(index)}
                                />
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
