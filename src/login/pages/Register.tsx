import { useEffect, useLayoutEffect, useState } from "react";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import UserProfileFormFields from "keycloakify/login/UserProfileFormFields";
import type { ClassKey } from "keycloakify/login";
import { getKcClsx } from "keycloakify/login/lib/kcClsx";
import { useInitialize } from "keycloakify/login/Template.useInitialize";
import { useSetClassName } from "keycloakify/tools/useSetClassName";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { ActionArrowIcon, AuthLayout } from "../components/AuthLayout";
import { getSortedSocialProviders, SocialProvidersSection } from "../components/SocialProviders";

type RegisterKcContext = Extract<KcContext, { pageId: "register.ftl" }>;
type RegisterKcContextWithSocial = RegisterKcContext & {
    social?: Extract<KcContext, { pageId: "login.ftl" }>["social"];
};

const doMakeUserConfirmPassword = true;

export default function Register(props: { kcContext: RegisterKcContext; i18n: I18n }) {
    const { kcContext, i18n } = props;

    const {
        realm,
        url,
        message,
        messagesPerField,
        recaptchaRequired,
        recaptchaVisible,
        recaptchaSiteKey,
        recaptchaAction,
        termsAcceptanceRequired
    } = kcContext;
    const { social } = kcContext as RegisterKcContextWithSocial;

    const { advancedMsg } = i18n;

    const [isFormSubmittable, setIsFormSubmittable] = useState(false);
    const [areTermsAccepted, setAreTermsAccepted] = useState(false);
    const [isRegisterButtonDisabled, setIsRegisterButtonDisabled] = useState(false);

    const { kcClsx } = getKcClsx({
        doUseDefaultCss: false,
        classes: registerClasses
    });

    useLayoutEffect(() => {
        (window as Window & { onSubmitRecaptcha?: () => void }).onSubmitRecaptcha = () => {
            const form = document.getElementById("kc-register-form");

            if (form instanceof HTMLFormElement) {
                form.requestSubmit();
            }
        };

        return () => {
            delete (window as Window & { onSubmitRecaptcha?: () => void }).onSubmitRecaptcha;
        };
    }, []);

    useEffect(() => {
        document.title = "Sign Up";
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

    const isSubmitDisabled = !isFormSubmittable || (termsAcceptanceRequired && !areTermsAccepted) || isRegisterButtonDisabled;
    const socialProviders = getSortedSocialProviders(social?.providers ?? []);
    const showSocialProviders = socialProviders.length > 0;

    return (
        <AuthLayout
            realmDisplayName={realm.displayName || realm.name}
            title="Sign Up"
            subtitle="Create your account to get started."
            panelClassName="max-w-[78rem]"
            contentClassName="md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]"
            rightColumnClassName="md:px-12 lg:px-14"
            formShellClassName="max-w-[41rem]"
        >
            {message !== undefined && (
                <div
                    className="kc-alert mb-6"
                    data-variant={message.type}
                    dangerouslySetInnerHTML={{
                        __html: kcSanitize(message.summary)
                    }}
                />
            )}

            <form
                id="kc-register-form"
                className="space-y-5"
                action={url.registrationAction}
                method="post"
                onSubmit={() => {
                    setIsRegisterButtonDisabled(true);
                    return true;
                }}
            >
                <div className="kc-register-fields-grid">
                    <UserProfileFormFields
                        kcContext={kcContext}
                        i18n={i18n}
                        kcClsx={kcClsx}
                        onIsFormSubmittableValueChange={setIsFormSubmittable}
                        doMakeUserConfirmPassword={doMakeUserConfirmPassword}
                    />
                </div>

                {termsAcceptanceRequired && (
                    <TermsAcceptance
                        i18n={i18n}
                        messagesPerField={messagesPerField}
                        areTermsAccepted={areTermsAccepted}
                        onAreTermsAcceptedValueChange={setAreTermsAccepted}
                    />
                )}

                {recaptchaRequired && (recaptchaVisible || recaptchaAction === undefined) && (
                    <div className="kc-register-recaptcha pt-1">
                        <div className="g-recaptcha" data-size="compact" data-sitekey={recaptchaSiteKey} data-action={recaptchaAction}></div>
                    </div>
                )}

                <div className="pt-1">
                    {recaptchaRequired && !recaptchaVisible && recaptchaAction !== undefined ? (
                        <button
                            className="kc-primary-button g-recaptcha flex h-12 w-full items-center justify-center gap-3 rounded-full border-0 px-6 text-[0.94rem] font-semibold uppercase tracking-[0.18em] text-white disabled:cursor-not-allowed"
                            data-sitekey={recaptchaSiteKey}
                            data-callback="onSubmitRecaptcha"
                            data-action={recaptchaAction}
                            type="submit"
                            disabled={isSubmitDisabled}
                        >
                            <span>Sign Up</span>
                            <ActionArrowIcon className="kc-primary-arrow h-4 w-4" />
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={isSubmitDisabled}
                            className="kc-primary-button flex h-12 w-full items-center justify-center gap-3 rounded-full border-0 px-6 text-[0.94rem] font-semibold uppercase tracking-[0.18em] text-white disabled:cursor-not-allowed"
                        >
                            <span>Sign Up</span>
                            <ActionArrowIcon className="kc-primary-arrow h-4 w-4" />
                        </button>
                    )}
                </div>
            </form>

            {showSocialProviders && <SocialProvidersSection providers={socialProviders} title="Or sign up with" className="mt-8" />}

            <div className="mt-6">
                <div className="kc-divider h-px w-full" />
                <p className="mt-4 text-center text-[0.84rem] text-[var(--kc-field-muted)]">
                    <a href={url.loginUrl} className="kc-link-accent font-semibold">
                        {advancedMsg("backToLogin")}
                    </a>
                </p>
            </div>
        </AuthLayout>
    );
}

function TermsAcceptance(props: {
    i18n: I18n;
    messagesPerField: Pick<KcContext["messagesPerField"], "existsError" | "get">;
    areTermsAccepted: boolean;
    onAreTermsAcceptedValueChange: (areTermsAccepted: boolean) => void;
}) {
    const { i18n, messagesPerField, areTermsAccepted, onAreTermsAcceptedValueChange } = props;

    const { msg, advancedMsg } = i18n;

    return (
        <div className="space-y-3 rounded-[1.35rem] border border-[var(--kc-card-border)] bg-[rgba(255,255,255,0.03)] p-4">
            <div className="space-y-2">
                <p className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[var(--kc-field-muted)]">{msg("termsTitle")}</p>
                <div className="kc-muted text-[0.9rem] leading-7">{advancedMsg("termsText")}</div>
            </div>

            <label className="flex cursor-pointer items-start gap-3 text-[0.9rem] text-[var(--kc-page-fg)]">
                <input
                    type="checkbox"
                    id="termsAccepted"
                    name="termsAccepted"
                    className="kc-check-input mt-1 h-4 w-4 rounded border-[var(--kc-field-border)] bg-transparent"
                    checked={areTermsAccepted}
                    onChange={event => onAreTermsAcceptedValueChange(event.target.checked)}
                    aria-invalid={messagesPerField.existsError("termsAccepted")}
                />
                <span className="leading-6">{msg("acceptTerms")}</span>
            </label>

            {messagesPerField.existsError("termsAccepted") && (
                <p
                    id="input-error-terms-accepted"
                    className="kc-helper-error text-[0.82rem] leading-6"
                    aria-live="polite"
                    dangerouslySetInnerHTML={{
                        __html: kcSanitize(messagesPerField.get("termsAccepted"))
                    }}
                />
            )}
        </div>
    );
}

const registerClasses = {
    kcFormGroupClass: "kc-register-field-group",
    kcLabelWrapperClass: "kc-register-label-wrapper",
    kcLabelClass: "kc-register-label",
    kcInputWrapperClass: "kc-register-input-wrapper",
    kcInputClass: "kc-register-input kc-input-control",
    kcTextareaClass: "kc-register-input kc-register-textarea kc-input-control",
    kcInputErrorMessageClass: "kc-helper-error kc-register-error",
    kcInputHelperTextBeforeClass: "kc-register-helper",
    kcInputHelperTextAfterClass: "kc-register-helper",
    kcInputGroup: "kc-register-password-group",
    kcFormPasswordVisibilityButtonClass: "kc-register-password-toggle kc-icon-button inline-flex h-9 w-9 items-center justify-center rounded-full",
    kcFormPasswordVisibilityIconShow: "kc-register-password-icon kc-register-password-icon-show",
    kcFormPasswordVisibilityIconHide: "kc-register-password-icon kc-register-password-icon-hide",
    kcContentWrapperClass: "kc-register-group-copy",
    kcFormGroupHeader: "kc-register-group-header"
} satisfies { [key in ClassKey]?: string };
