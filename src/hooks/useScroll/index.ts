export const useScrollBody = (El: HTMLElement): Promise<true> => {
    return new Promise((resolve, reject) => {
        let index: number = 1;

        setInterval(() => {
            console.log('屏幕高度：',window.screen.height);
            console.log('顶部距离：', document.documentElement.scrollTop);
            console.log('盒子总高度：',El.offsetHeight);
            if ((window.screen.height * 1 + document.documentElement.scrollTop) >= El.offsetHeight) {
                console.log('到底了');
                index = 1;
                window.scrollTo(0, 0);
            } else {
                window.scrollTo({ 
                    top: index * window.screen.height * 0.6, 
                    behavior: "smooth" 
                });
                index++;
            };
        }, 15000);
        resolve(true);
    });
};