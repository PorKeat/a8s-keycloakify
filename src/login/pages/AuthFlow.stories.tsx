import type { Meta, StoryObj } from "@storybook/react";
import type { DeepPartial } from "keycloakify/tools/DeepPartial";
import { createKcPageStory } from "../KcPageStory";
import type { KcContext } from "../KcContext";

function KcPagePreview(props: { pageId: KcContext["pageId"]; kcContext?: DeepPartial<KcContext> }) {
    const { KcPageStory } = createKcPageStory({ pageId: props.pageId });

    return <KcPageStory kcContext={props.kcContext} />;
}

const meta = {
    title: "login/auth flow pages"
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const ForgotPassword: Story = {
    render: () => <KcPagePreview pageId="login-reset-password.ftl" />
};

export const ForgotPasswordWithError: Story = {
    render: () => (
        <KcPagePreview
            pageId="login-reset-password.ftl"
            kcContext={{
                messagesPerField: {
                    existsError: (fieldName: string) => fieldName === "username",
                    get: (fieldName: string) => (fieldName === "username" ? "Please enter a valid username or email." : "")
                }
            }}
        />
    )
};

export const UpdatePassword: Story = {
    render: () => <KcPagePreview pageId="login-update-password.ftl" />
};

export const VerifyEmail: Story = {
    render: () => (
        <KcPagePreview
            pageId="login-verify-email.ftl"
            kcContext={{
                user: {
                    email: "alex@example.com"
                }
            }}
        />
    )
};

export const InfoMessage: Story = {
    render: () => (
        <KcPagePreview
            pageId="info.ftl"
            kcContext={{
                message: {
                    type: "info",
                    summary: "An email with instructions has been sent to you."
                }
            }}
        />
    )
};

export const SuccessMessage: Story = {
    render: () => (
        <KcPagePreview
            pageId="info.ftl"
            kcContext={{
                message: {
                    type: "success",
                    summary: "Your account has been updated successfully."
                },
                pageRedirectUri: "#"
            }}
        />
    )
};

export const ErrorPage: Story = {
    render: () => (
        <KcPagePreview
            pageId="error.ftl"
            kcContext={{
                message: {
                    type: "error",
                    summary: "The login session expired. Please sign in again."
                }
            }}
        />
    )
};

export const Terms: Story = {
    render: () => <KcPagePreview pageId="terms.ftl" />
};

export const UpdateProfile: Story = {
    render: () => <KcPagePreview pageId="login-update-profile.ftl" />
};

export const IdpReviewProfile: Story = {
    render: () => <KcPagePreview pageId="idp-review-user-profile.ftl" />
};

export const UpdateEmail: Story = {
    render: () => <KcPagePreview pageId="update-email.ftl" />
};
