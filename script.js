
// BRAZEN PROPERTY & HOME SERVICES

document.addEventListener("DOMContentLoaded", function () {

  // TOP-RIGHT HAMBURGER MENU
  const menuToggle = document.querySelector(".menu-toggle");
  const siteNav = document.querySelector(".site-nav");

  if (menuToggle && siteNav) {
    menuToggle.addEventListener("click", function () {
      const isOpen = siteNav.classList.toggle("active");

      menuToggle.setAttribute("aria-expanded", isOpen);
      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation" : "Open navigation"
      );

      menuToggle.innerHTML = isOpen ? "&times;" : "&#9776;";
    });

    // Close menu after choosing a page
    siteNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        siteNav.classList.remove("active");
        menuToggle.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation");
        menuToggle.innerHTML = "&#9776;";
      });
    });

    // Close menu when clicking outside it
    document.addEventListener("click", function (event) {
      if (
        !siteNav.contains(event.target) &&
        !menuToggle.contains(event.target)
      ) {
        siteNav.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation");
        menuToggle.innerHTML = "&#9776;";
      }
    });
  }

  // SERVICE REQUEST FORM
  const requestForm = document.getElementById("requestForm");

  if (requestForm) {
    requestForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const name = document.getElementById("name").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const email = document.getElementById("email").value.trim();
      const service = document.getElementById("service").value;
      const address = document.getElementById("address").value.trim();
      const details = document.getElementById("details").value.trim();

      const subject = encodeURIComponent("BRAZEN Service Request - " + name);

      const body = encodeURIComponent(
        "NEW SERVICE REQUEST\n\n" +
        "Name: " + name + "\n" +
        "Phone: " + phone + "\n" +
        "Email: " + (email || "Not provided") + "\n" +
        "Service: " + service + "\n" +
        "Address: " + address + "\n\n" +
        "Project Details:\n" + details
      );

      window.location.href =
        "mailto:brazenservices031@gmail.com?subject=" +
        subject + "&body=" + body;
    });
  }

});
