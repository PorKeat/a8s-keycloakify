import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import "./login/theme.css";
import { KcPage } from "./kc.gen";
import faviconIcoUrl from "./login/assets/favicon.ico";

// The following block can be uncommented to test a specific page with `yarn dev`
// Don't forget to comment back or your bundle size will increase

import { getKcContextMock } from "./login/KcPageStory";

if (import.meta.env.DEV) {
    const requestedPage = new URL(window.location.href).searchParams.get("page");
    const pageId = requestedPage === "register" ? "register.ftl" : "login.ftl";
    const socialOverrides = {
        social: {
            displayInfo: true,
            providers: [
                {
                    loginUrl: "/#social-github",
                    alias: "github",
                    providerId: "github",
                    displayName: "GitHub",
                    iconClasses: "fa fa-github"
                },
                {
                    loginUrl: "/#social-gitlab",
                    alias: "gitlab",
                    providerId: "gitlab",
                    displayName: "GitLab",
                    iconClasses: "fa fa-gitlab"
                },
                {
                    loginUrl: "/#social-google",
                    alias: "google",
                    providerId: "google",
                    displayName: "Google",
                    iconClasses: "fa fa-google"
                }
            ]
        }
    };

    window.kcContext = getKcContextMock({
        pageId,
        overrides: socialOverrides as never
    });
}

setFavicon();

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        {!window.kcContext ? (
            <h1>No Keycloak Context</h1>
        ) : (
            <KcPage kcContext={window.kcContext} />
        )}
    </StrictMode>
);

function setFavicon() {
    const link = document.querySelector<HTMLLinkElement>("link[rel~='icon']") ?? document.createElement("link");

    link.rel = "icon";
    link.type = "image/x-icon";
    link.href = faviconIcoUrl;

    if (!link.parentNode) {
        document.head.appendChild(link);
    }
}
