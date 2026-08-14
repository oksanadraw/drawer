document.querySelectorAll("[data-current-year]").forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});

const artSlider = document.querySelector("[data-art-slider]");
if (artSlider) {
  const slides = [...artSlider.querySelectorAll("[data-slide]")];
  const dots = [...artSlider.querySelectorAll("[data-slider-dot]")];
  const previousButton = artSlider.querySelector("[data-slider-prev]");
  const nextButton = artSlider.querySelector("[data-slider-next]");
  let activeIndex = 0;
  let autoplayId;

  const showSlide = (index) => {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === activeIndex);
    });
    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === activeIndex;
      dot.classList.toggle("is-active", isActive);
      if (isActive) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
  };

  const startAutoplay = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    window.clearInterval(autoplayId);
    autoplayId = window.setInterval(() => showSlide(activeIndex + 1), 6000);
  };

  previousButton?.addEventListener("click", () => {
    showSlide(activeIndex - 1);
    startAutoplay();
  });
  nextButton?.addEventListener("click", () => {
    showSlide(activeIndex + 1);
    startAutoplay();
  });
  dots.forEach((dot, dotIndex) => {
    dot.addEventListener("click", () => {
      showSlide(dotIndex);
      startAutoplay();
    });
  });
  artSlider.addEventListener("mouseenter", () => window.clearInterval(autoplayId));
  artSlider.addEventListener("mouseleave", startAutoplay);
  startAutoplay();
}

const analyticsId = "G-TQB5V3KNCV";
window.dataLayer = window.dataLayer || [];
window.gtag = function gtag() {
  window.dataLayer.push(arguments);
};
window.gtag("js", new Date());
window.gtag("config", analyticsId, { anonymize_ip: true });

const analyticsScript = document.createElement("script");
analyticsScript.async = true;
analyticsScript.src = `https://www.googletagmanager.com/gtag/js?id=${analyticsId}`;
document.head.appendChild(analyticsScript);

const newsContainer = document.querySelector("[data-news-list]");
if (newsContainer) {
  fetch("news.json", { cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error("Не удалось загрузить новости");
      return response.json();
    })
    .then((items) => {
      newsContainer.replaceChildren();
      items.forEach((item) => {
        const article = document.createElement("article");
        article.className = "news-item";

        const time = document.createElement("time");
        time.textContent = item.date;

        const title = document.createElement("h2");
        title.textContent = item.title;

        const description = document.createElement("p");
        description.textContent = item.description;

        const link = document.createElement("a");
        link.href = item.link;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "Читать источник";

        article.append(time, title, description, link);
        newsContainer.append(article);
      });
    })
    .catch(() => {
      const message = document.createElement("p");
      message.className = "empty-state";
      message.textContent = "Новости временно недоступны. Пожалуйста, попробуйте позже.";
      newsContainer.replaceChildren(message);
    });
}
