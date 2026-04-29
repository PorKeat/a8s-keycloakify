import { useState } from "react";
import { AuthLayout } from "../components/AuthLayout";
import { AlertMessage, BackToLogin, EnvelopeIcon, FieldGroup, getHomeHref, PrimaryButton, TextField, useAuthPageSetup } from "../components/FormPrimitives";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

type LoginResetPasswordKcContext = Extract<KcContext, { pageId: "login-reset-password.ftl" }>;

export default function LoginResetPassword(props: { kcContext: LoginResetPasswordKcContext; i18n: I18n }) {
    const { kcContext, i18n } = props;
    const { realm, url, auth, messagesPerField, message } = kcContext;
    const { msg, msgStr } = i18n;

    const { isReadyToRender } = useAuthPageSetup({
        kcContext,
        documentTitle: msgStr("emailForgotTitle")
    });

    const [username, setUsername] = useState(auth.attemptedUsername ?? "");
    const hasUsernameError = messagesPerField.existsError("username");
    const usernameLabel = !realm.loginWithEmailAllowed
        ? msgStr("username")
        : !realm.registrationEmailAsUsername
          ? msgStr("usernameOrEmail")
          : msgStr("email");

    if (!isReadyToRender) {
        return null;
    }

    return (
        <AuthLayout
            realmDisplayName={realm.displayName || realm.name}
            title="Forgot Password"
            subtitle="Enter your account details and we will send instructions to reset your password."
            panelClassName="max-w-[72rem]"
            formShellClassName="max-w-[36rem]"
            homeHref={getHomeHref(kcContext)}
        >
            {!hasUsernameError && <AlertMessage message={message} />}

            <form id="kc-reset-password-form" className="space-y-5" action={url.loginAction} method="post">
                <FieldGroup
                    label={usernameLabel}
                    htmlFor="username"
                    errorHtml={hasUsernameError ? messagesPerField.get("username") : undefined}
                    errorId="input-error-username"
                >
                    <TextField
                        id="username"
                        name="username"
                        value={username}
                        onChange={event => setUsername(event.target.value)}
                        placeholder={usernameLabel}
                        autoFocus
                        hasError={hasUsernameError}
                        icon={<EnvelopeIcon className="kc-muted h-4 w-4 shrink-0" />}
                    />
                </FieldGroup>

                <PrimaryButton disabled={username.trim() === ""}>{msg("doSubmit")}</PrimaryButton>
            </form>

            <BackToLogin href={url.loginUrl}>{msg("backToLogin")}</BackToLogin>
        </AuthLayout>
    );
}
