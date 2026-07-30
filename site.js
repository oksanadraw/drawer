document.querySelectorAll("[data-current-year]").forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});

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
