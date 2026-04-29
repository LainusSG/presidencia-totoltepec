(function() {
    "use strict";

    const ADMIN_SESSION_KEY = "totoltepec.transparencia.admin";
    const ADMIN_USER = "admin";
    const ADMIN_PASSWORD = "admin2026";

    function initLogin() {
        const form = document.getElementById("admin-login-form");
        const error = document.getElementById("login-error");

        if (!form) {
            return;
        }

        form.addEventListener("submit", function(event) {
            event.preventDefault();

            const usuario = String(form.elements.usuario.value || "").trim();
            const password = String(form.elements.password.value || "");

            if (usuario === ADMIN_USER && password === ADMIN_PASSWORD) {
                sessionStorage.setItem(ADMIN_SESSION_KEY, "1");
                window.location.href = "transparencia.html";
                return;
            }

            if (error) {
                error.hidden = false;
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initLogin);
    } else {
        initLogin();
    }
})();
