// script.js

// Optional: Smooth scroll for 'Learn More' if it were an anchor link (not needed if it's just an external link)
document.addEventListener("DOMContentLoaded", () => {
  const learnMoreBtn = document.querySelector(".learn-more");

  if (learnMoreBtn && learnMoreBtn.href.includes("#")) {
    learnMoreBtn.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href").substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
      }
    });
  }
});