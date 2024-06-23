import React, { useState, useEffect } from 'react';
import { ProgressBar } from 'react-bootstrap';

const ProgressBarCustom = () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const duration = 30000;
        const intervalTime = 100;
        const increment = (intervalTime / duration) * 100;

        const interval = setInterval(() => {
            setProgress(prevProgress => {
                if (prevProgress >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prevProgress + increment;
            });
        }, intervalTime);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="progress-bar-container" style={{ width: '100%', marginTop: '20px' }}>
            <ProgressBar animated now={progress} />
        </div>
    );
};

export default ProgressBarCustom;
