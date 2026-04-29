import { AuthLayout } from "../components/AuthLayout";
import { getHomeHref, PrimaryButton, SecondaryButton, useAuthPageSetup } from "../components/FormPrimitives";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

type TermsKcContext = Extract<KcContext, { pageId: "terms.ftl" }>;

export default function Terms(props: { kcContext: TermsKcContext; i18n: I18n }) {
    const { kcContext, i18n } = props;
    const { realm, url } = kcContext;
    const { msg, msgStr } = i18n;

    const { isReadyToRender } = useAuthPageSetup({
        kcContext,
        documentTitle: msgStr("termsTitle")
    });

    if (!isReadyToRender) {
        return null;
    }

    return (
        <AuthLayout
            realmDisplayName={realm.displayName || realm.name}
            title="Terms"
            subtitle="Review and accept the terms to continue."
            panelClassName="max-w-[72rem]"
            formShellClassName="max-w-[40rem]"
            homeHref={getHomeHref(kcContext)}
        >
            <form id="kc-terms-form" className="space-y-5" action={url.loginAction} method="post">
                <div id="kc-terms-text" className="kc-message-card max-h-[22rem] overflow-auto text-[0.9rem] leading-7 text-[var(--kc-page-fg)]">
                    {msg("termsText")}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    <PrimaryButton id="kc-accept" name="accept">
                        {msg("doAccept")}
                    </PrimaryButton>
                    <SecondaryButton name="cancel" value="true">
                        {msg("doDecline")}
                    </SecondaryButton>
                </div>
            </form>
        </AuthLayout>
    );
}
