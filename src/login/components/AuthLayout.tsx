import { useEffect, useState } from "react";
import { clsx } from "keycloakify/tools/clsx";
import logoUrl from "../assets/Logo.svg";

type ColorScheme = "light" | "dark";

export function AuthLayout(props: {
    realmDisplayName: string;
    title: React.ReactNode;
    subtitle: React.ReactNode;
    children: React.ReactNode;
    panelClassName?: string;
    contentClassName?: string;
    formShellClassName?: string;
    rightColumnClassName?: string;
    brandLabel?: string;
}) {
    const {
        realmDisplayName,
        title,
        subtitle,
        children,
        panelClassName,
        contentClassName,
        formShellClassName,
        rightColumnClassName,
        brandLabel = "Autonomous"
    } = props;

    const [colorScheme, setColorScheme] = useState<ColorScheme>(() => getPreferredColorScheme());

    useEffect(() => {
        document.documentElement.dataset.kcColorScheme = colorScheme;
        window.localStorage.setItem("kc-login-color-scheme", colorScheme);
    }, [colorScheme]);

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

            <div
                className={clsx(
                    "kc-auth-panel kc-panel-enter relative z-10 w-full max-w-[78rem] overflow-hidden rounded-[2.25rem]",
                    panelClassName
                )}
            >
                <PanelDecor />

                <div className={clsx("grid gap-8 md:grid-cols-2 md:gap-0", contentClassName)}>
                    <section className="kc-brand-column relative z-10 flex min-h-[26rem] flex-col justify-center gap-8 px-8 py-14 sm:px-12 md:min-h-[38rem] md:gap-10 md:pl-22 md:pr-8 md:py-20 lg:pl-24 lg:pr-10">
                        <div className="kc-brand-mark max-w-[20rem]">
                            <img
                                src={logoUrl}
                                alt={realmDisplayName}
                                className="kc-logo-mark h-auto w-[11rem] drop-shadow-[0_0_16px_var(--kc-logo-glow)] sm:w-[11.75rem]"
                            />
                            <p className="mt-4 text-[1.08rem] font-semibold tracking-[0.28em] text-[var(--kc-page-fg)] opacity-80">{brandLabel}</p>
                        </div>

                        <div className="kc-copy-block max-w-[32rem]">
                            <h1 className="font-display text-[3.25rem] font-semibold leading-[0.97] tracking-[-0.06em] text-[var(--kc-page-fg)] sm:text-[4rem] lg:text-[4.65rem]">
                                {title}
                            </h1>
                            <p className="kc-muted mt-4 max-w-[28rem] text-[1.08rem] leading-8 sm:text-[1.12rem]">{subtitle}</p>
                        </div>
                    </section>

                    <section
                        className={clsx(
                            "kc-form-column kc-right-column relative z-10 flex items-center justify-center px-8 pb-14 pt-0 sm:px-12 md:px-14 md:py-20 lg:px-16",
                            rightColumnClassName
                        )}
                    >
                        <div className={clsx("kc-form-shell w-full rounded-[1.75rem] px-6 py-7 sm:px-8 sm:py-8", formShellClassName)}>
                            {children}
                        </div>
                    </section>
                </div>
            </div>
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

export function ActionArrowIcon(props: { className?: string }) {
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
