import { useEffect, useState } from "react";
import { clsx } from "keycloakify/tools/clsx";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import { useSetClassName } from "keycloakify/tools/useSetClassName";
import { useInitialize } from "keycloakify/login/Template.useInitialize";
import { useScript } from "keycloakify/login/pages/Login.useScript";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import logoUrl from "../assets/Logo.svg";

type LoginKcContext = Extract<KcContext, { pageId: "login.ftl" }>;
type ColorScheme = "light" | "dark";

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

    const [colorScheme, setColorScheme] = useState<ColorScheme>(() => getPreferredColorScheme());
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isLoginButtonDisabled, setIsLoginButtonDisabled] = useState(false);

    const webAuthnButtonId = "authenticateWebAuthnButton";

    useScript({
        webAuthnButtonId,
        kcContext,
        i18n
    });

    useEffect(() => {
        document.title = msgStr("loginTitle", realm.displayName || realm.name);
    }, [msgStr, realm.displayName, realm.name]);

    useEffect(() => {
        document.documentElement.dataset.kcColorScheme = colorScheme;
        window.localStorage.setItem("kc-login-color-scheme", colorScheme);
    }, [colorScheme]);

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
    const socialProviders = realm.password ? social?.providers ?? [] : [];
    const showSocialProviders = socialProviders.length > 0;
    const showRegistration = realm.password && realm.registrationAllowed && !registrationDisabled;

    return (
        <div className="relative isolate flex min-h-screen select-none items-center justify-center overflow-hidden px-5 py-8 sm:px-8">
            <div className="kc-scene-glow kc-scene-glow-center pointer-events-none absolute left-1/2 top-1/2 z-0 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--kc-ambient-glow)] blur-3xl" />
            <div className="kc-scene-glow kc-scene-glow-left pointer-events-none absolute -bottom-28 -left-24 z-0 h-80 w-80 rounded-full bg-[var(--kc-scene-glow-left)] blur-3xl" />
            <div className="kc-scene-glow kc-scene-glow-right pointer-events-none absolute -right-16 -top-20 z-0 h-72 w-72 rounded-full bg-[var(--kc-scene-glow-right)] blur-3xl" />

            <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
                <div className="kc-theme-toggle-shell flex items-center gap-1.5 rounded-full border border-[var(--kc-card-border)] bg-[var(--kc-card-bg)] p-1 shadow-[0_8px_18px_rgba(0,0,0,0.08)] backdrop-blur-xl">
                    <ColorSchemeButton
                        label="Light"
                        icon={<SunIcon className="h-4 w-4" />}
                        isActive={colorScheme === "light"}
                        onClick={() => setColorScheme("light")}
                    />
                    <ColorSchemeButton
                        label="Dark"
                        icon={<MoonIcon className="h-4 w-4" />}
                        isActive={colorScheme === "dark"}
                        onClick={() => setColorScheme("dark")}
                    />
                </div>
            </div>

            <div className="kc-auth-panel kc-panel-enter relative z-10 w-full max-w-[78rem] overflow-hidden rounded-[2.25rem]">
                <PanelDecor />

                <div className="grid gap-8 md:grid-cols-2 md:gap-0">
                    <section className="kc-brand-column relative z-10 flex min-h-[26rem] flex-col justify-center gap-8 px-8 py-14 sm:px-12 md:min-h-[38rem] md:gap-10 md:pl-22 md:pr-8 md:py-20 lg:pl-24 lg:pr-10">
                        <div className="kc-brand-mark max-w-[20rem]">
                            <img
                                src={logoUrl}
                                alt={realm.displayName || realm.name}
                                className="kc-logo-mark h-auto w-[11rem] drop-shadow-[0_0_16px_var(--kc-logo-glow)] sm:w-[11.75rem]"
                            />
                            <p className="mt-4 text-[1.08rem] font-semibold tracking-[0.28em] text-[var(--kc-page-fg)] opacity-80">Autonomous</p>
                        </div>

                        <div className="kc-copy-block max-w-[32rem]">
                            <h1 className="font-display text-[3.25rem] font-semibold leading-[0.97] tracking-[-0.06em] text-[var(--kc-page-fg)] sm:text-[4rem] lg:text-[4.65rem]">
                                Sign In
                            </h1>
                            <p className="kc-muted mt-4 max-w-[28rem] text-[1.08rem] leading-8 sm:text-[1.12rem]">Sign in to continue.</p>
                        </div>
                    </section>

                    <section className="kc-form-column kc-right-column relative z-10 flex items-center justify-center px-8 pb-14 pt-0 sm:px-12 md:px-14 md:py-20 lg:px-16">
                        <div className="kc-form-shell w-full max-w-[26.5rem] rounded-[1.75rem] px-6 py-7 sm:px-8 sm:py-8">
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
                                    className="space-y-7"
                                    id="kc-form-login"
                                    action={url.loginAction}
                                    method="post"
                                    onSubmit={() => {
                                        setIsLoginButtonDisabled(true);
                                        return true;
                                    }}
                                >
                                    {!usernameHidden && (
                                        <FieldGroup
                                            label={usernameLabel}
                                            htmlFor="username"
                                            errorHtml={usernameErrorHtml}
                                            errorId="input-error-username"
                                        >
                                            <div className="kc-line-field flex items-center gap-3" data-invalid={usernameHasError || undefined}>
                                                <EnvelopeIcon className="kc-muted h-4 w-4 shrink-0" />
                                                <input
                                                    tabIndex={2}
                                                    id="username"
                                                    name="username"
                                                    type="text"
                                                    autoFocus
                                                    required
                                                    defaultValue={login.username ?? ""}
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

                                    <FieldGroup
                                        label={msgStr("password")}
                                        htmlFor="password"
                                        errorHtml={passwordErrorHtml}
                                        errorId="input-error-password"
                                    >
                                        <div className="kc-line-field flex items-center gap-3" data-invalid={passwordHasError || undefined}>
                                            <LockIcon className="kc-muted h-4 w-4 shrink-0" />
                                            <input
                                                tabIndex={3}
                                                id="password"
                                                name="password"
                                                type={isPasswordVisible ? "text" : "password"}
                                                required
                                                defaultValue={login.password ?? ""}
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

                                    <div className="flex items-center justify-between gap-4 pt-1">
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
                                            disabled={isLoginButtonDisabled}
                                            className="kc-primary-button flex h-14 w-full items-center justify-center gap-3 rounded-full border-0 px-6 text-[0.97rem] font-semibold uppercase tracking-[0.18em] text-white disabled:cursor-not-allowed"
                                        >
                                            <span>{msgStr("doLogIn")}</span>
                                            <ActionArrowIcon className="kc-primary-arrow h-4 w-4" />
                                        </button>
                                    </div>
                                </form>
                            )}

                            {auth.showTryAnotherWayLink && (
                                <form id="kc-select-try-another-way-form" action={url.loginAction} method="post" className="mt-5 text-right">
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
                                <div className="mt-5 space-y-4">
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
                                        className="kc-social-button flex h-[3.25rem] w-full items-center justify-center rounded-full px-5 text-[0.9rem] font-semibold text-[var(--kc-page-fg)]"
                                    >
                                        {msgStr("passkey-doAuthenticate")}
                                    </button>
                                </div>
                            )}

                            {showSocialProviders && (
                                <div className="mt-8">
                                    <div className="flex items-center gap-4">
                                        <div className="kc-divider h-px flex-1" />
                                        <span className="kc-muted text-[0.68rem] font-semibold uppercase tracking-[0.16em]">Or continue with</span>
                                        <div className="kc-divider h-px flex-1" />
                                    </div>

                                    <div className="mt-5 grid grid-cols-3 gap-3">
                                        {socialProviders.map(provider => (
                                            <a
                                                key={provider.alias}
                                                id={`social-${provider.alias}`}
                                                href={provider.loginUrl}
                                                className="kc-social-button group flex min-h-[4.35rem] flex-col items-center justify-center gap-2 rounded-[1rem] px-3 py-3 text-center"
                                            >
                                                <SocialProviderIcon
                                                    providerId={provider.providerId || provider.alias}
                                                    className="h-5 w-5 text-[var(--kc-field-muted)] transition group-hover:text-[var(--kc-page-fg)]"
                                                />
                                                <span
                                                    className="text-[0.76rem] font-medium text-[var(--kc-field-muted)] transition group-hover:text-[var(--kc-page-fg)]"
                                                    dangerouslySetInnerHTML={{
                                                        __html: kcSanitize(provider.displayName)
                                                    }}
                                                />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {showRegistration && (
                                <div className="mt-6">
                                    <div className="kc-divider h-px w-full" />
                                    <p className="mt-4 text-center text-[0.84rem] text-[var(--kc-field-muted)]">
                                        {msg("noAccount")}{" "}
                                        <a tabIndex={8} href={url.registrationUrl} className="kc-link-accent font-semibold">
                                            {msg("doRegister")}
                                        </a>
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

function PanelDecor() {
    return (
        <>
            <svg viewBox="0 0 188 138" className="kc-decor kc-decor-top-left" aria-hidden="true">
                <path
                    d="M0 0h188v14c0 14-11 26-25 27-31 3-52 14-61 35-13 31-37 62-102 62V0Z"
                    fill="var(--kc-blob-a)"
                    stroke="var(--kc-shape-outline)"
                    strokeWidth="1.25"
                />
                <path d="M0 18h58c19 0 32 15 32 34v15c0 15-11 27-26 27H48c-20 0-34 16-34 36v8H0V18Z" fill="var(--kc-blob-c)" opacity="0.88" />
                <ellipse cx="123" cy="26" rx="35" ry="11" fill="var(--kc-shape-highlight)" opacity="0.7" />
            </svg>

            <svg viewBox="0 0 188 138" className="kc-decor kc-decor-top-right" aria-hidden="true">
                <g transform="translate(188 0) scale(-1 1)">
                    <path
                        d="M0 0h188v14c0 14-11 26-25 27-31 3-52 14-61 35-13 31-37 62-102 62V0Z"
                        fill="var(--kc-blob-a)"
                        stroke="var(--kc-shape-outline)"
                        strokeWidth="1.25"
                    />
                    <path d="M0 18h58c19 0 32 15 32 34v15c0 15-11 27-26 27H48c-20 0-34 16-34 36v8H0V18Z" fill="var(--kc-blob-c)" opacity="0.86" />
                    <ellipse cx="123" cy="26" rx="35" ry="11" fill="var(--kc-shape-highlight)" opacity="0.62" />
                </g>
            </svg>

            <svg viewBox="0 0 360 230" className="kc-decor kc-decor-bottom-left" aria-hidden="true">
                <path
                    d="M0 230V74c0-34 24-58 58-58 37 0 58 25 58 62v58c0 17 11 26 27 26 27 0 45-14 64-34 27-30 61-46 97-46 32 0 56 20 56 58v90H0Z"
                    fill="var(--kc-blob-a)"
                    stroke="var(--kc-shape-outline)"
                    strokeWidth="1.25"
                />
                <path d="M30 230v-96c0-31 18-52 43-52 23 0 39 16 39 42v106H30Z" fill="var(--kc-blob-c)" opacity="0.9" />
                <path d="M132 230v-16c30-30 68-46 102-46 30 0 52 12 68 34v28H132Z" fill="var(--kc-blob-b)" opacity="0.5" />
                <ellipse cx="226" cy="118" rx="54" ry="16" fill="var(--kc-shape-highlight)" opacity="0.34" />
            </svg>
        </>
    );
}

function getPreferredColorScheme(): ColorScheme {
    if (typeof window === "undefined") {
        return "light";
    }

    const storedValue = window.localStorage.getItem("kc-login-color-scheme");

    if (storedValue === "light" || storedValue === "dark") {
        return storedValue;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function FieldGroup(props: { label: string; htmlFor: string; errorHtml?: string; errorId?: string; children: React.ReactNode }) {
    const { label, htmlFor, errorHtml, errorId, children } = props;

    return (
        <div className="space-y-2.5">
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

function ColorSchemeButton(props: { label: string; icon: React.ReactNode; isActive: boolean; onClick: () => void }) {
    const { label, icon, isActive, onClick } = props;

    return (
        <button
            type="button"
            onClick={onClick}
            className={clsx(
                "kc-control-button inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[0.78rem] font-semibold transition",
                isActive
                    ? "bg-[var(--color-brand-500)] text-white shadow-[0_10px_24px_rgba(245,96,33,0.26)]"
                    : "text-[var(--kc-field-muted)] hover:bg-[rgba(255,255,255,0.06)] hover:text-[var(--kc-page-fg)]"
            )}
            aria-pressed={isActive}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
}

function SocialProviderIcon(props: { providerId: string; className?: string }) {
    const key = props.providerId.toLowerCase();

    switch (key) {
        case "github":
            return <GitHubIcon className={props.className} />;
        case "gitlab":
            return <GitLabIcon className={props.className} />;
        case "google":
            return <GoogleIcon className={props.className} />;
        default:
            return <CircleStackIcon className={props.className} />;
    }
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

function GitHubIcon(props: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={props.className} aria-hidden="true">
            <path d="M12 .75a11.25 11.25 0 0 0-3.556 21.924c.563.106.768-.244.768-.543 0-.268-.01-.98-.015-1.924-3.124.679-3.784-1.505-3.784-1.505-.512-1.301-1.25-1.648-1.25-1.648-1.023-.699.077-.684.077-.684 1.132.08 1.728 1.162 1.728 1.162 1.006 1.724 2.64 1.226 3.283.937.102-.728.394-1.226.716-1.507-2.494-.283-5.117-1.247-5.117-5.55 0-1.226.438-2.229 1.157-3.015-.116-.284-.501-1.426.11-2.971 0 0 .944-.302 3.094 1.152a10.77 10.77 0 0 1 5.632 0c2.149-1.454 3.091-1.152 3.091-1.152.613 1.545.228 2.687.112 2.971.72.786 1.155 1.789 1.155 3.015 0 4.314-2.627 5.263-5.128 5.54.404.347.765 1.032.765 2.08 0 1.502-.013 2.713-.013 3.082 0 .301.202.654.774.542A11.25 11.25 0 0 0 12 .75Z" />
        </svg>
    );
}

function GitLabIcon(props: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={props.className} aria-hidden="true">
            <path d="m12 21.77 3.95-12.15H8.05L12 21.77Zm0-18.54 2.46 7.57H9.54L12 3.23Zm-5.08 7.57h2.62L7.3 17.66c-.12.35-.61.35-.73 0L4.66 10.8h2.26Zm8.54 0h2.26l-1.91 6.86c-.12.35-.61.35-.73 0l-2.24-6.86h2.62Zm-10.98 0 1.91-5.53a.49.49 0 0 1 .93 0l1.13 3.46H4.48Zm11.04 0 1.13-3.46a.49.49 0 0 1 .93 0l1.91 5.53h-4.97Z" />
        </svg>
    );
}

function GoogleIcon(props: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={props.className} aria-hidden="true">
            <path
                d="M21.75 12.26c0-.71-.06-1.39-.2-2.04H12v3.86h5.46a4.67 4.67 0 0 1-2.03 3.06v2.53h3.3c1.93-1.78 3.02-4.4 3.02-7.41Z"
                fill="currentColor"
            />
            <path
                d="M12 22.17c2.73 0 5.03-.9 6.7-2.43l-3.3-2.53c-.91.61-2.08.98-3.4.98-2.62 0-4.84-1.77-5.63-4.14H2.97v2.61A10.12 10.12 0 0 0 12 22.17Z"
                fill="currentColor"
                opacity="0.85"
            />
            <path
                d="M6.37 14.05A6.08 6.08 0 0 1 6.05 12c0-.71.12-1.39.32-2.05V7.34H2.97A10.12 10.12 0 0 0 1.83 12c0 1.62.39 3.16 1.14 4.66l3.4-2.61Z"
                fill="currentColor"
                opacity="0.7"
            />
            <path
                d="M12 5.81c1.49 0 2.82.51 3.87 1.5l2.91-2.91C17.02 2.77 14.73 1.83 12 1.83a10.12 10.12 0 0 0-9.03 5.51l3.4 2.61c.79-2.38 3.01-4.14 5.63-4.14Z"
                fill="currentColor"
                opacity="0.55"
            />
        </svg>
    );
}

function CircleStackIcon(props: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={props.className} aria-hidden="true">
            <circle cx="12" cy="12" r="8.25" />
            <path d="M8.75 12h6.5M12 8.75v6.5" />
        </svg>
    );
}

function ActionArrowIcon(props: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={props.className} aria-hidden="true">
            <path d="M5 12h14" />
            <path d="m13 6 6 6-6 6" />
        </svg>
    );
}

function SunIcon(props: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={props.className} aria-hidden="true">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2.75v2.5M12 18.75v2.5M21.25 12h-2.5M5.25 12h-2.5M18.54 5.46l-1.77 1.77M7.23 16.77l-1.77 1.77M18.54 18.54l-1.77-1.77M7.23 7.23 5.46 5.46" />
        </svg>
    );
}

function MoonIcon(props: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={props.className} aria-hidden="true">
            <path d="M18.51 14.94A7.75 7.75 0 0 1 9.06 5.49a8.5 8.5 0 1 0 9.45 9.45Z" />
        </svg>
    );
}
