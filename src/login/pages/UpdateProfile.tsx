import { useState } from "react";
import type { ClassKey } from "keycloakify/login";
import { getKcClsx } from "keycloakify/login/lib/kcClsx";
import { AuthLayout } from "../components/AuthLayout";
import { AlertMessage, getHomeHref, PrimaryButton, SecondaryButton, useAuthPageSetup } from "../components/FormPrimitives";
import UserProfileFormFieldsCompact from "../components/UserProfileFormFieldsCompact";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

type UpdateProfileKcContext = Extract<
    KcContext,
    { pageId: "login-update-profile.ftl" | "idp-review-user-profile.ftl" | "update-email.ftl" }
>;

const doMakeUserConfirmPassword = true;

export default function UpdateProfile(props: { kcContext: UpdateProfileKcContext; i18n: I18n }) {
    const { kcContext, i18n } = props;
    const { realm, url, message, messagesPerField, isAppInitiatedAction } = kcContext;
    const { msg, msgStr } = i18n;

    const { kcClsx } = getKcClsx({
        doUseDefaultCss: false,
        classes: updateProfileClasses
    });

    const pageCopy = getPageCopy(kcContext.pageId);

    const { isReadyToRender } = useAuthPageSetup({
        kcContext,
        documentTitle: pageCopy.documentTitle
    });

    const [isFormSubmittable, setIsFormSubmittable] = useState(false);
    const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);

    if (!isReadyToRender) {
        return null;
    }

    return (
        <AuthLayout
            realmDisplayName={realm.displayName || realm.name}
            title={pageCopy.title}
            subtitle={pageCopy.subtitle}
            panelClassName="max-w-[78rem]"
            contentClassName="md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]"
            rightColumnClassName="md:px-12 lg:px-14"
            formShellClassName="max-w-[41rem]"
            homeHref={getHomeHref(kcContext)}
        >
            {messagesPerField.exists("global") && <AlertMessage message={message} />}

            <form
                id="kc-update-profile-form"
                className="space-y-5"
                action={url.loginAction}
                method="post"
                onSubmit={() => {
                    setIsSubmitDisabled(true);
                    return true;
                }}
            >
                <div className="kc-register-fields-grid">
                    <UserProfileFormFieldsCompact
                        kcContext={kcContext}
                        i18n={i18n}
                        kcClsx={kcClsx}
                        onIsFormSubmittableValueChange={setIsFormSubmittable}
                        doMakeUserConfirmPassword={doMakeUserConfirmPassword}
                    />
                </div>

                <div className="space-y-3">
                    <PrimaryButton disabled={!isFormSubmittable || isSubmitDisabled}>{msg("doSubmit")}</PrimaryButton>
                    {isAppInitiatedAction && (
                        <SecondaryButton name="cancel-aia" value="true" formNoValidate>
                            {msg("doCancel")}
                        </SecondaryButton>
                    )}
                </div>
            </form>
        </AuthLayout>
    );

    function getPageCopy(pageId: UpdateProfileKcContext["pageId"]) {
        switch (pageId) {
            case "idp-review-user-profile.ftl":
                return {
                    title: "Review Profile",
                    subtitle: "Confirm your profile details before continuing.",
                    documentTitle: msgStr("loginProfileTitle")
                };
            case "update-email.ftl":
                return {
                    title: "Update Email",
                    subtitle: "Confirm the email address for your account.",
                    documentTitle: msgStr("email")
                };
            case "login-update-profile.ftl":
                return {
                    title: "Update Profile",
                    subtitle: "Complete your account details to continue.",
                    documentTitle: msgStr("loginProfileTitle")
                };
        }
    }
}

const updateProfileClasses = {
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
