import { Suspense, lazy } from "react";
import type { ClassKey } from "keycloakify/login";
import type { KcContext } from "./KcContext";
import { useI18n } from "./i18n";
import DefaultPage from "keycloakify/login/DefaultPage";
import Template from "keycloakify/login/Template";
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const LoginResetPassword = lazy(() => import("./pages/LoginResetPassword"));
const LoginUpdatePassword = lazy(() => import("./pages/LoginUpdatePassword"));
const LoginVerifyEmail = lazy(() => import("./pages/LoginVerifyEmail"));
const Info = lazy(() => import("./pages/Info"));
const Error = lazy(() => import("./pages/Error"));
const Terms = lazy(() => import("./pages/Terms"));
const UpdateProfile = lazy(() => import("./pages/UpdateProfile"));
const UserProfileFormFields = lazy(
    () => import("keycloakify/login/UserProfileFormFields")
);

const doMakeUserConfirmPassword = true;

export default function KcPage(props: { kcContext: KcContext }) {
    const { kcContext } = props;

    const { i18n } = useI18n({ kcContext });

    return (
        <Suspense>
            {(() => {
                switch (kcContext.pageId) {
                    case "login.ftl":
                        return <Login kcContext={kcContext} i18n={i18n} />;
                    case "register.ftl":
                        return <Register kcContext={kcContext} i18n={i18n} />;
                    case "login-reset-password.ftl":
                        return <LoginResetPassword kcContext={kcContext} i18n={i18n} />;
                    case "login-update-password.ftl":
                        return <LoginUpdatePassword kcContext={kcContext} i18n={i18n} />;
                    case "login-verify-email.ftl":
                        return <LoginVerifyEmail kcContext={kcContext} i18n={i18n} />;
                    case "info.ftl":
                        return <Info kcContext={kcContext} i18n={i18n} />;
                    case "error.ftl":
                        return <Error kcContext={kcContext} i18n={i18n} />;
                    case "terms.ftl":
                        return <Terms kcContext={kcContext} i18n={i18n} />;
                    case "login-update-profile.ftl":
                    case "idp-review-user-profile.ftl":
                    case "update-email.ftl":
                        return <UpdateProfile kcContext={kcContext} i18n={i18n} />;
                    default:
                        return (
                            <DefaultPage
                                kcContext={kcContext}
                                i18n={i18n}
                                classes={classes}
                                Template={Template}
                                doUseDefaultCss={true}
                                UserProfileFormFields={UserProfileFormFields}
                                doMakeUserConfirmPassword={doMakeUserConfirmPassword}
                            />
                        );
                }
            })()}
        </Suspense>
    );
}

const classes = {} satisfies { [key in ClassKey]?: string };
