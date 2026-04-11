(function () {
  var form = document.getElementById("contact-form");
  if (!form) return;
  var btn = form.querySelector('button[type="submit"]');
  var label = btn ? btn.textContent : "Submit";

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    var fd = new FormData(form);
    if (fd.get("bot-field")) return;

    var payload = {
      name: String(fd.get("name") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      phone: String(fd.get("phone") || "").trim(),
      location: String(fd.get("location") || "").trim(),
      interest: String(fd.get("interest") || "").trim(),
      message: String(fd.get("message") || "").trim(),
    };

    if (!payload.name || !payload.email || !payload.message) {
      window.alert("Please fill in your name, email, and message.");
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.textContent = "Sending…";
    }

    try {
      var res = await fetch("/.netlify/functions/contact-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      var data = {};
      try {
        data = await res.json();
      } catch (_) {}
      if (!res.ok) throw new Error(data.error || "Request failed");
      window.location.href = "/thank-you.html";
    } catch (err) {
      window.alert(
        "We couldn’t send your message right now. Please try again in a moment, or email rootsandlegacyjamaica@gmail.com directly."
      );
      if (btn) {
        btn.disabled = false;
        btn.textContent = label;
      }
    }
  });
})();
