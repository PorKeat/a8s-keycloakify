import { AuthLayout } from "../components/AuthLayout";
import { getHomeHref, PrimaryLink, useAuthPageSetup } from "../components/FormPrimitives";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

type LoginVerifyEmailKcContext = Extract<KcContext, { pageId: "login-verify-email.ftl" }>;

export default function LoginVerifyEmail(props: { kcContext: LoginVerifyEmailKcContext; i18n: I18n }) {
    const { kcContext, i18n } = props;
    const { realm, url, user } = kcContext;
    const { msg, msgStr } = i18n;

    const { isReadyToRender } = useAuthPageSetup({
        kcContext,
        documentTitle: msgStr("emailVerifyTitle")
    });

    if (!isReadyToRender) {
        return null;
    }

    return (
        <AuthLayout
            realmDisplayName={realm.displayName || realm.name}
            title="Verify Email"
            subtitle="Check your inbox and confirm your email address to continue."
            panelClassName="max-w-[72rem]"
            formShellClassName="max-w-[36rem]"
            homeHref={getHomeHref(kcContext)}
        >
            <div className="space-y-5">
                <div className="kc-message-card space-y-3">
                    <p className="text-[0.96rem] leading-7 text-[var(--kc-page-fg)]">{msg("emailVerifyInstruction1", user?.email ?? "")}</p>
                    <p className="kc-muted text-[0.9rem] leading-7">
                        {msg("emailVerifyInstruction2")} {msg("emailVerifyInstruction3")}
                    </p>
                </div>

                <PrimaryLink href={url.loginAction}>{msg("doClickHere")}</PrimaryLink>
            </div>
        </AuthLayout>
    );
}
