const checkoutButtons = document.querySelectorAll(".checkout-button");
const packageButtons = document.querySelectorAll(".scroll-to-package");
const packageSection = document.querySelector("#pacote");

async function startCheckout(button) {
  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = "A preparar pagamento...";

  try {
    const response = await fetch("/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok || !data.url) {
      throw new Error(data.error || "Nao foi possivel iniciar o pagamento.");
    }

    window.location.href = data.url;
  } catch (error) {
    button.textContent = "Tentar novamente";
    button.disabled = false;
    alert(error.message);
    setTimeout(() => {
      button.textContent = originalText;
    }, 2200);
  }
}

checkoutButtons.forEach((button) => {
  button.addEventListener("click", () => startCheckout(button));
});

packageButtons.forEach((button) => {
  button.addEventListener("click", () => {
    packageSection?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
