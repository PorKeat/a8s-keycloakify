import { kcSanitize } from "keycloakify/lib/kcSanitize";
import { AuthLayout } from "../components/AuthLayout";
import { getHomeHref, PrimaryLink, useAuthPageSetup } from "../components/FormPrimitives";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

type InfoKcContext = Extract<KcContext, { pageId: "info.ftl" }>;

export default function Info(props: { kcContext: InfoKcContext; i18n: I18n }) {
    const { kcContext, i18n } = props;
    const { realm, messageHeader, message, requiredActions, skipLink, pageRedirectUri, actionUri, client } = kcContext;
    const { advancedMsgStr, msg } = i18n;

    const { isReadyToRender } = useAuthPageSetup({
        kcContext,
        documentTitle: messageHeader ? advancedMsgStr(messageHeader) : "Information"
    });

    if (!isReadyToRender) {
        return null;
    }

    const title = messageHeader ? advancedMsgStr(messageHeader) : message.type === "success" ? "Success" : "Information";
    const summaryHtml = (() => {
        let html = message.summary?.trim() ?? "";

        if (requiredActions) {
            html += " <b>";
            html += requiredActions.map(requiredAction => advancedMsgStr(`requiredAction.${requiredAction}`)).join(", ");
            html += "</b>";
        }

        return html;
    })();
    const nextHref = pageRedirectUri ?? actionUri ?? client.baseUrl;
    const nextLabel = pageRedirectUri || client.baseUrl ? msg("backToApplication") : msg("proceedWithAction");

    return (
        <AuthLayout
            realmDisplayName={realm.displayName || realm.name}
            title={title}
            subtitle="Your authentication request needs your attention."
            panelClassName="max-w-[72rem]"
            formShellClassName="max-w-[36rem]"
            homeHref={getHomeHref(kcContext)}
        >
            <div className="space-y-5">
                <div
                    id="kc-info-message"
                    className="kc-message-card text-[0.94rem] leading-7 text-[var(--kc-page-fg)]"
                    dangerouslySetInnerHTML={{ __html: kcSanitize(summaryHtml) }}
                />
                {!skipLink && nextHref && (
                    <PrimaryLink href={nextHref}>{nextLabel}</PrimaryLink>
                )}
            </div>
        </AuthLayout>
    );
}
