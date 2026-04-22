const scrollToAnchor = (selector) => {
  const target = document.querySelector(selector);
  if (!target) {
    return;
  }

  const header = document.querySelector(".site-header");
  const headerHeight = header ? header.offsetHeight : 0;
  const targetTop = window.scrollY + target.getBoundingClientRect().top - headerHeight - 10;

  window.scrollTo({
    top: targetTop,
    behavior: "smooth",
  });
};

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    event.preventDefault();
    scrollToAnchor(anchor.getAttribute("href"));
  });
});

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("in-view");
        currentObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 70, 260)}ms`;
    observer.observe(item);
  });
} else {
  revealItems.forEach((item) => {
    item.classList.add("in-view");
  });
}
