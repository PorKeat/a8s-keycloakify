import { kcSanitize } from "keycloakify/lib/kcSanitize";
import { AuthLayout } from "../components/AuthLayout";
import { getHomeHref, PrimaryLink, useAuthPageSetup } from "../components/FormPrimitives";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

type ErrorKcContext = Extract<KcContext, { pageId: "error.ftl" }>;

export default function Error(props: { kcContext: ErrorKcContext; i18n: I18n }) {
    const { kcContext, i18n } = props;
    const { realm, message, client, skipLink } = kcContext;
    const { msg, msgStr } = i18n;

    const { isReadyToRender } = useAuthPageSetup({
        kcContext,
        documentTitle: msgStr("errorTitle")
    });

    if (!isReadyToRender) {
        return null;
    }

    return (
        <AuthLayout
            realmDisplayName={realm.displayName || realm.name}
            title="Something Went Wrong"
            subtitle="The request could not be completed."
            panelClassName="max-w-[72rem]"
            formShellClassName="max-w-[36rem]"
            homeHref={getHomeHref(kcContext)}
        >
            <div className="space-y-5">
                <div
                    id="kc-error-message"
                    className="kc-message-card kc-message-card-error text-[0.94rem] leading-7"
                    dangerouslySetInnerHTML={{ __html: kcSanitize(message.summary) }}
                />
                {!skipLink && client?.baseUrl !== undefined && (
                    <PrimaryLink id="backToApplication" href={client.baseUrl}>
                        {msg("backToApplication")}
                    </PrimaryLink>
                )}
            </div>
        </AuthLayout>
    );
}
