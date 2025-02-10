import React from 'react';

interface ButterflyProps {
    color?: string;
    delay?: string;
    duration?: string;
    tx?: number;
    ty?: number;
    rotate?: number;
}

const Butterfly: React.FC<ButterflyProps> = ({
    delay = '0s',
    duration = '3s',
    tx = 100,
    ty = -100,
    rotate = 45
}) => {
    return (
        <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-butterfly pointer-events-none"
            style={{
                '--tx': `${tx}px`,
                '--ty': `${ty}px`,
                '--rotate': `${rotate}deg`,
                '--duration': duration,
                animationDelay: delay,
            } as React.CSSProperties}
        >
            <div className="animate-wing-flap">
                <img
                    src="src/Image/Star.png" // Make sure to add this image to your public folder
                    alt="butterfly"
                    className="w-12 h-12 object-contain"
                    style={{
                        filter: 'drop-shadow(0 0 2px rgba(139, 92, 246, 0.3))'
                    }}
                />
            </div>
        </div>
    );
};

export default Butterfly;
