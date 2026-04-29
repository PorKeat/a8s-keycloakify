import { useState } from "react";
import { AuthLayout } from "../components/AuthLayout";
import { AlertMessage, getHomeHref, PasswordField, PrimaryButton, SecondaryButton, useAuthPageSetup } from "../components/FormPrimitives";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

type LoginUpdatePasswordKcContext = Extract<KcContext, { pageId: "login-update-password.ftl" }>;

export default function LoginUpdatePassword(props: { kcContext: LoginUpdatePasswordKcContext; i18n: I18n }) {
    const { kcContext, i18n } = props;
    const { realm, url, messagesPerField, message, isAppInitiatedAction } = kcContext;
    const { msg, msgStr } = i18n;

    const { isReadyToRender } = useAuthPageSetup({
        kcContext,
        documentTitle: msgStr("updatePasswordTitle")
    });

    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const hasPasswordError = messagesPerField.existsError("password", "password-confirm");
    const isSubmitDisabled = password === "" || passwordConfirm === "";

    if (!isReadyToRender) {
        return null;
    }

    return (
        <AuthLayout
            realmDisplayName={realm.displayName || realm.name}
            title="Update Password"
            subtitle="Create a new password for your account."
            panelClassName="max-w-[72rem]"
            formShellClassName="max-w-[36rem]"
            homeHref={getHomeHref(kcContext)}
        >
            {!hasPasswordError && <AlertMessage message={message} />}

            <form id="kc-passwd-update-form" className="space-y-5" action={url.loginAction} method="post">
                <PasswordField
                    id="password-new"
                    name="password-new"
                    label={msg("passwordNew")}
                    i18n={i18n}
                    value={password}
                    onChange={event => setPassword(event.target.value)}
                    autoFocus
                    errorHtml={messagesPerField.existsError("password") ? messagesPerField.get("password") : undefined}
                    hasError={hasPasswordError}
                />

                <PasswordField
                    id="password-confirm"
                    name="password-confirm"
                    label={msg("passwordConfirm")}
                    i18n={i18n}
                    value={passwordConfirm}
                    onChange={event => setPasswordConfirm(event.target.value)}
                    errorHtml={messagesPerField.existsError("password-confirm") ? messagesPerField.get("password-confirm") : undefined}
                    hasError={hasPasswordError}
                />

                <label className="flex cursor-pointer items-start gap-3 text-[0.86rem] text-[var(--kc-field-muted)]">
                    <input
                        type="checkbox"
                        id="logout-sessions"
                        name="logout-sessions"
                        value="on"
                        defaultChecked
                        className="kc-check-input mt-1 h-4 w-4 rounded border-[var(--kc-field-border)] bg-transparent"
                    />
                    <span className="leading-6">{msg("logoutOtherSessions")}</span>
                </label>

                <div className="space-y-3">
                    <PrimaryButton disabled={isSubmitDisabled}>{msg("doSubmit")}</PrimaryButton>
                    {isAppInitiatedAction && (
                        <SecondaryButton name="cancel-aia" value="true">
                            {msg("doCancel")}
                        </SecondaryButton>
                    )}
                </div>
            </form>
        </AuthLayout>
    );
}
