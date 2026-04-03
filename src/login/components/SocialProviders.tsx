import { kcSanitize } from "keycloakify/lib/kcSanitize";

type SocialProvider = {
    loginUrl: string;
    alias: string;
    providerId?: string;
    displayName: string;
};

export function getSortedSocialProviders(socialProviders: SocialProvider[]) {
    return [...socialProviders].sort((a, b) => {
        const providerRankDiff = getSocialProviderRank(a.providerId || a.alias) - getSocialProviderRank(b.providerId || b.alias);

        if (providerRankDiff !== 0) {
            return providerRankDiff;
        }

        return a.displayName.localeCompare(b.displayName);
    });
}

export function SocialProvidersSection(props: {
    providers: SocialProvider[];
    title?: string;
    className?: string;
}) {
    const { providers, title = "Or continue with", className } = props;

    if (providers.length === 0) {
        return null;
    }

    return (
        <div className={className}>
            <div className="flex items-center gap-4">
                <div className="kc-divider h-px flex-1" />
                <span className="kc-muted text-[0.68rem] font-semibold uppercase tracking-[0.16em]">{title}</span>
                <div className="kc-divider h-px flex-1" />
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
                {providers.map(provider => (
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

function getSocialProviderRank(providerId: string) {
    switch (providerId.toLowerCase()) {
        case "github":
            return 0;
        case "gitlab":
            return 1;
        case "google":
            return 2;
        default:
            return 99;
    }
}

function GitHubIcon(props: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={props.className} aria-hidden="true">
            <path
                fill="var(--kc-provider-github)"
                d="M12 .75a11.25 11.25 0 0 0-3.556 21.924c.563.106.768-.244.768-.543 0-.268-.01-.98-.015-1.924-3.124.679-3.784-1.505-3.784-1.505-.512-1.301-1.25-1.648-1.25-1.648-1.023-.699.077-.684.077-.684 1.132.08 1.728 1.162 1.728 1.162 1.006 1.724 2.64 1.226 3.283.937.102-.728.394-1.226.716-1.507-2.494-.283-5.117-1.247-5.117-5.55 0-1.226.438-2.229 1.157-3.015-.116-.284-.501-1.426.11-2.971 0 0 .944-.302 3.094 1.152a10.77 10.77 0 0 1 5.632 0c2.149-1.454 3.091-1.152 3.091-1.152.613 1.545.228 2.687.112 2.971.72.786 1.155 1.789 1.155 3.015 0 4.314-2.627 5.263-5.128 5.54.404.347.765 1.032.765 2.08 0 1.502-.013 2.713-.013 3.082 0 .301.202.654.774.542A11.25 11.25 0 0 0 12 .75Z"
            />
        </svg>
    );
}

function GitLabIcon(props: { className?: string }) {
    return (
        <svg viewBox="150 115 152 149" fill="none" className={props.className} aria-hidden="true">
            <path
                fill="#E24329"
                d="M302 174.37l-.21-.56-21.2-55.3a5.5 5.5 0 0 0-2.18-2.63 5.6 5.6 0 0 0-8.41 3.2l-14.31 43.81H197.74l-14.31-43.81a5.61 5.61 0 0 0-8.41-3.2 5.5 5.5 0 0 0-2.18 2.63l-21.19 55.31-.22.55a39.36 39.36 0 0 0 13.06 45.49l.08.06.18.14L197 244.23l16 12.09 9.72 7.35a6.57 6.57 0 0 0 7.92 0l9.72-7.35 16-12.09 32.48-24.31.09-.07A39.36 39.36 0 0 0 302 174.37Z"
            />
            <path
                fill="#FC6D26"
                d="M302 174.37l-.21-.56a71.5 71.5 0 0 0-28.5 12.82l-46.55 35.2 29.64 22.4 32.48-24.31.09-.07A39.36 39.36 0 0 0 302 174.37Z"
            />
            <path
                fill="#FCA326"
                d="M197 244.23l16 12.09 9.72 7.35a6.57 6.57 0 0 0 7.92 0l9.72-7.35 16-12.09-29.64-22.4Z"
            />
            <path
                fill="#FC6D26"
                d="M180.14 186.63a71.44 71.44 0 0 0-28.49-12.81l-.22.55a39.36 39.36 0 0 0 13.06 45.49l.08.06.18.14L197 244.23l29.66-22.4Z"
            />
        </svg>
    );
}

function GoogleIcon(props: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={props.className} aria-hidden="true">
            <path
                d="M21.75 12.26c0-.71-.06-1.39-.2-2.04H12v3.86h5.46a4.67 4.67 0 0 1-2.03 3.06v2.53h3.3c1.93-1.78 3.02-4.4 3.02-7.41Z"
                fill="#4285F4"
            />
            <path
                d="M12 22.17c2.73 0 5.03-.9 6.7-2.43l-3.3-2.53c-.91.61-2.08.98-3.4.98-2.62 0-4.84-1.77-5.63-4.14H2.97v2.61A10.12 10.12 0 0 0 12 22.17Z"
                fill="#34A853"
            />
            <path
                d="M6.37 14.05A6.08 6.08 0 0 1 6.05 12c0-.71.12-1.39.32-2.05V7.34H2.97A10.12 10.12 0 0 0 1.83 12c0 1.62.39 3.16 1.14 4.66l3.4-2.61Z"
                fill="#FBBC05"
            />
            <path
                d="M12 5.81c1.49 0 2.82.51 3.87 1.5l2.91-2.91C17.02 2.77 14.73 1.83 12 1.83a10.12 10.12 0 0 0-9.03 5.51l3.4 2.61c.79-2.38 3.01-4.14 5.63-4.14Z"
                fill="#EA4335"
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
