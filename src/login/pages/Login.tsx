import { useEffect, useState } from "react";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import { useSetClassName } from "keycloakify/tools/useSetClassName";
import { useInitialize } from "keycloakify/login/Template.useInitialize";
import { useScript } from "keycloakify/login/pages/Login.useScript";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { ActionArrowIcon, AuthLayout } from "../components/AuthLayout";
import { getSortedSocialProviders, SocialProvidersSection } from "../components/SocialProviders";

type LoginKcContext = Extract<KcContext, { pageId: "login.ftl" }>;

export default function Login(props: { kcContext: LoginKcContext; i18n: I18n }) {
    const { kcContext, i18n } = props;

    const {
        social,
        realm,
        url,
        usernameHidden,
        login,
        auth,
        registrationDisabled,
        messagesPerField,
        enableWebAuthnConditionalUI,
        authenticators,
        message,
        isAppInitiatedAction
    } = kcContext;

    const { msg, msgStr } = i18n;

    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [usernameValue, setUsernameValue] = useState(login.username ?? "");
    const [passwordValue, setPasswordValue] = useState(login.password ?? "");
    const [isLoginButtonDisabled, setIsLoginButtonDisabled] = useState(false);

    const webAuthnButtonId = "authenticateWebAuthnButton";

    useScript({
        webAuthnButtonId,
        kcContext,
        i18n
    });

    useEffect(() => {
        document.title = "Sign In";
    }, []);

    useSetClassName({
        qualifiedName: "html",
        className: "kc-html"
    });

    useSetClassName({
        qualifiedName: "body",
        className: "kc-body"
    });

    const { isReadyToRender } = useInitialize({
        kcContext,
        doUseDefaultCss: false
    });

    if (!isReadyToRender) {
        return null;
    }

    const usernameLabel = !realm.loginWithEmailAllowed
        ? msgStr("username")
        : !realm.registrationEmailAsUsername
          ? msgStr("usernameOrEmail")
          : msgStr("email");

    const fieldErrorHtml = messagesPerField.getFirstError("username", "password");
    const hasFieldError = messagesPerField.existsError("username", "password");
    const usernameSpecificError = !usernameHidden && messagesPerField.exists("username") ? messagesPerField.get("username") : undefined;
    const passwordSpecificError = messagesPerField.exists("password") ? messagesPerField.get("password") : undefined;
    const usernameHasError = !usernameHidden && (usernameSpecificError !== undefined || hasFieldError);
    const passwordHasError = passwordSpecificError !== undefined || hasFieldError;
    const usernameErrorHtml = usernameSpecificError;
    const passwordErrorHtml = passwordSpecificError ?? (hasFieldError ? fieldErrorHtml : undefined);
    const shouldDisplayAlert = message !== undefined && !hasFieldError && (message.type !== "warning" || !isAppInitiatedAction);
    const socialProviders = realm.password ? getSortedSocialProviders(social?.providers ?? []) : [];
    const showSocialProviders = socialProviders.length > 0;
    const showRegistration = realm.password && realm.registrationAllowed && !registrationDisabled;
    const isCredentialFormComplete = (usernameHidden || usernameValue.trim() !== "") && passwordValue !== "";
    const isSubmitDisabled = isLoginButtonDisabled || !isCredentialFormComplete;

    return (
        <AuthLayout
            realmDisplayName={realm.displayName || realm.name}
            title="Sign In"
            subtitle="Sign in to your account to continue."
            panelClassName="max-w-[78rem] md:min-h-[40rem]"
            contentClassName="md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]"
            rightColumnClassName="md:min-h-[40rem] md:px-12 lg:px-14"
            formShellClassName="max-w-[41rem] md:min-h-[30rem]"
        >
            {auth.showUsername && usernameHidden && auth.attemptedUsername && (
                <div className="mb-6 rounded-[1rem] border border-[var(--kc-card-border)] bg-[rgba(255,255,255,0.04)] px-4 py-3 text-sm text-[var(--kc-page-fg)]">
                    <div className="flex items-center justify-between gap-3">
                        <span className="truncate">{auth.attemptedUsername}</span>
                        <a href={url.loginRestartFlowUrl} className="kc-link-accent shrink-0 text-[0.8rem] font-semibold">
                            Change
                        </a>
                    </div>
                </div>
            )}

            {shouldDisplayAlert && message !== undefined && (
                <div
                    className="kc-alert mb-6"
                    data-variant={message.type}
                    dangerouslySetInnerHTML={{
                        __html: kcSanitize(message.summary)
                    }}
                />
            )}

            {realm.password && (
                <form
                    className="space-y-4 sm:space-y-5"
                    id="kc-form-login"
                    action={url.loginAction}
                    method="post"
                    onSubmit={() => {
                        setIsLoginButtonDisabled(true);
                        return true;
                    }}
                >
                    {!usernameHidden && (
                        <FieldGroup label={usernameLabel} htmlFor="username" errorHtml={usernameErrorHtml} errorId="input-error-username">
                            <div className="kc-line-field flex items-center gap-3" data-invalid={usernameHasError || undefined}>
                                <EnvelopeIcon className="kc-muted h-4 w-4 shrink-0" />
                                <input
                                    tabIndex={2}
                                    id="username"
                                    name="username"
                                    type="text"
                                    autoFocus
                                    required
                                    value={usernameValue}
                                    onChange={event => setUsernameValue(event.target.value)}
                                    autoComplete={enableWebAuthnConditionalUI ? "username webauthn" : "username"}
                                    aria-invalid={usernameHasError}
                                    aria-describedby={usernameErrorHtml ? "input-error-username" : undefined}
                                    className="kc-line-input kc-input-control select-text"
                                    placeholder={usernameLabel}
                                    spellCheck={false}
                                />
                            </div>
                        </FieldGroup>
                    )}

                    <FieldGroup label={msgStr("password")} htmlFor="password" errorHtml={passwordErrorHtml} errorId="input-error-password">
                        <div className="kc-line-field flex items-center gap-3" data-invalid={passwordHasError || undefined}>
                            <LockIcon className="kc-muted h-4 w-4 shrink-0" />
                                <input
                                    tabIndex={3}
                                    id="password"
                                    name="password"
                                    type={isPasswordVisible ? "text" : "password"}
                                    required
                                    value={passwordValue}
                                    onChange={event => setPasswordValue(event.target.value)}
                                    autoComplete="current-password"
                                    aria-invalid={passwordHasError}
                                    aria-describedby={passwordErrorHtml ? "input-error-password" : undefined}
                                    className="kc-line-input kc-input-control select-text"
                                    placeholder={msgStr("password")}
                            />
                            <button
                                type="button"
                                onClick={() => setIsPasswordVisible(value => !value)}
                                aria-label={msgStr(isPasswordVisible ? "hidePassword" : "showPassword")}
                                aria-controls="password"
                                className="kc-icon-button inline-flex h-9 w-9 items-center justify-center rounded-full"
                            >
                                <EyeIcon className="h-4 w-4" crossed={isPasswordVisible} />
                            </button>
                        </div>
                    </FieldGroup>

                    <div className="flex flex-col items-start gap-3 pt-1 min-[480px]:flex-row min-[480px]:items-center min-[480px]:justify-between min-[480px]:gap-4">
                        {realm.rememberMe && !usernameHidden ? (
                            <label className="flex cursor-pointer items-center gap-2 text-[0.82rem] text-[var(--kc-field-muted)]">
                                <input
                                    tabIndex={5}
                                    id="rememberMe"
                                    name="rememberMe"
                                    type="checkbox"
                                    defaultChecked={!!login.rememberMe}
                                    className="kc-check-input h-4 w-4 rounded border-[var(--kc-field-border)] bg-transparent"
                                />
                                <span>{msg("rememberMe")}</span>
                            </label>
                        ) : (
                            <span />
                        )}

                        {realm.resetPasswordAllowed && (
                            <a tabIndex={6} href={url.loginResetCredentialsUrl} className="kc-link text-[0.82rem]">
                                {msg("doForgotPassword")}
                            </a>
                        )}
                    </div>

                    <div className="pt-1">
                        <input type="hidden" id="id-hidden-input" name="credentialId" value={auth.selectedCredential} />
                        <button
                            tabIndex={7}
                            id="kc-login"
                            name="login"
                            type="submit"
                            disabled={isSubmitDisabled}
                            className="kc-primary-button flex h-12 w-full items-center justify-center gap-3 rounded-full border-0 px-6 text-[0.94rem] font-semibold uppercase tracking-[0.18em] text-white disabled:cursor-not-allowed"
                        >
                            <span>{msgStr("doLogIn")}</span>
                            <ActionArrowIcon className="kc-primary-arrow h-4 w-4" />
                        </button>
                    </div>
                </form>
            )}

            {auth.showTryAnotherWayLink && (
                <form id="kc-select-try-another-way-form" action={url.loginAction} method="post" className="mt-4 text-left min-[480px]:mt-5 min-[480px]:text-right">
                    <input type="hidden" name="tryAnotherWay" value="on" />
                    <a
                        href="#"
                        id="try-another-way"
                        className="kc-link text-[0.82rem] font-medium"
                        onClick={event => {
                            const form = document.getElementById("kc-select-try-another-way-form");

                            if (form instanceof HTMLFormElement) {
                                form.requestSubmit();
                            }

                            event.preventDefault();
                        }}
                    >
                        {msg("doTryAnotherWay")}
                    </a>
                </form>
            )}

            {enableWebAuthnConditionalUI && (
                <div className="mt-4 space-y-4 sm:mt-5">
                    <form id="webauth" action={url.loginAction} method="post">
                        <input type="hidden" id="clientDataJSON" name="clientDataJSON" />
                        <input type="hidden" id="authenticatorData" name="authenticatorData" />
                        <input type="hidden" id="signature" name="signature" />
                        <input type="hidden" id="credentialId" name="credentialId" />
                        <input type="hidden" id="userHandle" name="userHandle" />
                        <input type="hidden" id="error" name="error" />
                    </form>

                    {authenticators !== undefined && authenticators.authenticators.length !== 0 && (
                        <form id="authn_select">
                            {authenticators.authenticators.map((authenticator, index) => (
                                <input key={index} type="hidden" name="authn_use_chk" readOnly value={authenticator.credentialId} />
                            ))}
                        </form>
                    )}

                    <button
                        id={webAuthnButtonId}
                        type="button"
                        className="kc-social-button flex h-[3rem] w-full items-center justify-center rounded-full px-5 text-[0.88rem] font-semibold text-[var(--kc-page-fg)] sm:h-[3.25rem] sm:text-[0.9rem]"
                    >
                        {msgStr("passkey-doAuthenticate")}
                    </button>
                </div>
            )}

            {showSocialProviders && <SocialProvidersSection providers={socialProviders} className="mt-6 sm:mt-8" />}

            {showRegistration && (
                <div className="mt-5 sm:mt-6">
                    <div className="kc-divider h-px w-full" />
                    <p className="mt-4 text-center text-[0.84rem] text-[var(--kc-field-muted)]">
                        {msg("noAccount")}{" "}
                        <a tabIndex={8} href={url.registrationUrl} className="kc-link-accent font-semibold">
                            {msg("doRegister")}
                        </a>
                    </p>
                </div>
            )}
        </AuthLayout>
    );
}

function FieldGroup(props: { label: string; htmlFor: string; errorHtml?: string; errorId?: string; children: React.ReactNode }) {
    const { label, htmlFor, errorHtml, errorId, children } = props;

    return (
        <div className="space-y-2 sm:space-y-2.5">
            <label htmlFor={htmlFor} className="kc-muted block text-[0.72rem] font-semibold uppercase tracking-[0.16em]">
                {label}
            </label>
            {children}
            {errorHtml !== undefined && errorHtml !== "" && (
                <p
                    id={errorId}
                    className="kc-helper-error text-[0.82rem] leading-6"
                    aria-live="polite"
                    dangerouslySetInnerHTML={{
                        __html: kcSanitize(errorHtml)
                    }}
                />
            )}
        </div>
    );
}

function EnvelopeIcon(props: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={props.className} aria-hidden="true">
            <rect x="3.75" y="5.75" width="16.5" height="12.5" rx="2.25" />
            <path d="M5.5 8.25 12 13l6.5-4.75" />
        </svg>
    );
}

function LockIcon(props: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={props.className} aria-hidden="true">
            <rect x="4.75" y="10.25" width="14.5" height="9" rx="2.25" />
            <path d="M8 10.25V8a4 4 0 1 1 8 0v2.25" />
        </svg>
    );
}

function EyeIcon(props: { className?: string; crossed?: boolean }) {
    const { className, crossed = false } = props;

    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
            <path d="M2.75 12S6.5 6.75 12 6.75 21.25 12 21.25 12 17.5 17.25 12 17.25 2.75 12 2.75 12Z" />
            <circle cx="12" cy="12" r="2.75" />
            {crossed && <path d="M4 20 20 4" />}
        </svg>
    );
}
