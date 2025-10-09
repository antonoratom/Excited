 document.addEventListener('DOMContentLoaded', () => {
    const debounce = (fn, ms) => {
      let timer;
      return (...args) => (clearTimeout(timer), timer = setTimeout(() => fn(...args), ms));
    };

    const updateSwipers = () => {
      const isMobile = innerWidth < 767;
      document.querySelectorAll('.swiper').forEach(el => {
        if (!el.querySelector('.swiper-wrapper')) return;

        if (isMobile && !el.swiper) {
          new Swiper(el, {
            slidesPerView: 1,

            breakpoints: { 
            100: { slidesPerView: 1} 
            }
          });
        } else if (!isMobile && el.swiper) {
          el.swiper.destroy(true, true);
        }
      });
    };

    updateSwipers();
    addEventListener('resize', debounce(updateSwipers, 250));
  });
