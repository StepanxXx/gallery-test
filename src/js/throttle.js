'use strict';

function throttle(func, limit, usePreventDefault = false) {
    let isReady = true;

    return function (...args) {
        if (usePreventDefault) {
            const event = args[0];
            if (!event || typeof event.preventDefault !== 'function') {
                return;
            }
            event.preventDefault();
        }
        if (!isReady) return;

        func.apply(this, args);
        isReady = false;

        setTimeout(() => {
            isReady = true;
        }, limit);
    };
}

export default throttle;