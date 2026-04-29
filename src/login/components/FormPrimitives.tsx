import { useEffect, useState } from "react";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import { useInitialize } from "keycloakify/login/Template.useInitialize";
import { useSetClassName } from "keycloakify/tools/useSetClassName";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { ActionArrowIcon } from "./AuthLayout";

export function useAuthPageSetup(params: { kcContext: KcContext; documentTitle: string }) {
    const { kcContext, documentTitle } = params;

    useEffect(() => {
        document.title = documentTitle;
    }, [documentTitle]);

    useSetClassName({
        qualifiedName: "html",
        className: "kc-html"
    });

    useSetClassName({
        qualifiedName: "body",
        className: "kc-body"
    });

    return useInitialize({
        kcContext,
        doUseDefaultCss: false
    });
}

export function getHomeHref(kcContext: Pick<KcContext, "client">) {
    return (kcContext.client as { baseUrl?: string } | undefined)?.baseUrl ?? "/";
}

export function AlertMessage(props: { message?: KcContext["message"]; className?: string }) {
    const { message, className = "mb-6" } = props;

    if (message === undefined) {
        return null;
    }

    return (
        <div
            className={`kc-alert ${className}`}
            data-variant={message.type}
            dangerouslySetInnerHTML={{
                __html: kcSanitize(message.summary)
            }}
        />
    );
}

export function FieldGroup(props: {
    label: React.ReactNode;
    htmlFor: string;
    errorHtml?: string;
    errorId?: string;
    children: React.ReactNode;
}) {
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

export function TextField(props: {
    id: string;
    name: string;
    type?: string;
    value?: string;
    defaultValue?: string;
    placeholder?: string;
    autoFocus?: boolean;
    required?: boolean;
    autoComplete?: string;
    hasError?: boolean;
    icon?: React.ReactNode;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
}) {
    const { id, name, type = "text", value, defaultValue, placeholder, autoFocus, required, autoComplete, hasError, icon, onChange } = props;

    return (
        <div className="kc-line-field flex items-center gap-3" data-invalid={hasError || undefined}>
            {icon}
            <input
                id={id}
                name={name}
                type={type}
                value={value}
                defaultValue={defaultValue}
                onChange={onChange}
                autoFocus={autoFocus}
                required={required}
                autoComplete={autoComplete}
                aria-invalid={hasError}
                aria-describedby={hasError ? `input-error-${id}` : undefined}
                className="kc-line-input kc-input-control select-text"
                placeholder={placeholder}
                spellCheck={false}
            />
        </div>
    );
}

export function PasswordField(props: {
    id: string;
    name: string;
    label: React.ReactNode;
    i18n: I18n;
    value?: string;
    autoFocus?: boolean;
    autoComplete?: string;
    errorHtml?: string;
    hasError?: boolean;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
}) {
    const { id, name, label, i18n, value, autoFocus, autoComplete = "new-password", errorHtml, hasError, onChange } = props;
    const { msgStr } = i18n;
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    return (
        <FieldGroup label={label} htmlFor={id} errorHtml={errorHtml} errorId={`input-error-${id}`}>
            <div className="kc-line-field flex items-center gap-3" data-invalid={hasError || undefined}>
                <LockIcon className="kc-muted h-4 w-4 shrink-0" />
                <input
                    id={id}
                    name={name}
                    type={isPasswordVisible ? "text" : "password"}
                    value={value}
                    onChange={onChange}
                    autoFocus={autoFocus}
                    autoComplete={autoComplete}
                    aria-invalid={hasError}
                    aria-describedby={errorHtml ? `input-error-${id}` : undefined}
                    className="kc-line-input kc-input-control select-text"
                    placeholder={typeof label === "string" ? label : undefined}
                />
                <button
                    type="button"
                    onClick={() => setIsPasswordVisible(current => !current)}
                    aria-label={msgStr(isPasswordVisible ? "hidePassword" : "showPassword")}
                    aria-controls={id}
                    className="kc-icon-button inline-flex h-9 w-9 items-center justify-center rounded-full"
                >
                    <EyeIcon className="h-4 w-4" crossed={isPasswordVisible} />
                </button>
            </div>
        </FieldGroup>
    );
}

export function PrimaryButton(props: {
    children: React.ReactNode;
    disabled?: boolean;
    name?: string;
    value?: string;
    id?: string;
    formNoValidate?: boolean;
}) {
    const { children, disabled, name, value, id, formNoValidate } = props;

    return (
        <button
            id={id}
            name={name}
            value={value}
            type="submit"
            disabled={disabled}
            formNoValidate={formNoValidate}
            className="kc-primary-button flex h-12 w-full items-center justify-center gap-3 rounded-full border-0 px-6 text-[0.94rem] font-semibold uppercase tracking-[0.18em] text-white disabled:cursor-not-allowed"
        >
            <span>{children}</span>
            <ActionArrowIcon className="kc-primary-arrow h-4 w-4" />
        </button>
    );
}

export function PrimaryLink(props: { href: string; children: React.ReactNode; id?: string }) {
    const { href, children, id } = props;

    return (
        <a
            id={id}
            href={href}
            className="kc-primary-button flex h-12 w-full items-center justify-center gap-3 rounded-full border-0 px-6 text-[0.94rem] font-semibold uppercase tracking-[0.18em] text-white"
        >
            <span>{children}</span>
            <ActionArrowIcon className="kc-primary-arrow h-4 w-4" />
        </a>
    );
}

export function SecondaryButton(props: { children: React.ReactNode; name?: string; value?: string; formNoValidate?: boolean }) {
    const { children, name, value, formNoValidate } = props;

    return (
        <button
            type="submit"
            name={name}
            value={value}
            formNoValidate={formNoValidate}
            className="kc-secondary-button flex h-12 w-full items-center justify-center rounded-full px-6 text-[0.9rem] font-semibold uppercase tracking-[0.16em]"
        >
            {children}
        </button>
    );
}

export function BackToLogin(props: { href: string; children: React.ReactNode }) {
    const { href, children } = props;

    return (
        <div className="mt-5 sm:mt-6">
            <div className="kc-divider h-px w-full" />
            <p className="mt-4 text-center text-[0.84rem] text-[var(--kc-field-muted)]">
                <a href={href} className="kc-link-accent font-semibold">
                    {children}
                </a>
            </p>
        </div>
    );
}

export function EnvelopeIcon(props: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={props.className} aria-hidden="true">
            <rect x="3.75" y="5.75" width="16.5" height="12.5" rx="2.25" />
            <path d="M5.5 8.25 12 13l6.5-4.75" />
        </svg>
    );
}

export function LockIcon(props: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={props.className} aria-hidden="true">
            <rect x="4.75" y="10.25" width="14.5" height="9" rx="2.25" />
            <path d="M8 10.25V8a4 4 0 1 1 8 0v2.25" />
        </svg>
    );
}

export function EyeIcon(props: { className?: string; crossed?: boolean }) {
    const { className, crossed = false } = props;

    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
            <path d="M2.75 12S6.5 6.75 12 6.75 21.25 12 21.25 12 17.5 17.25 12 17.25 2.75 12 2.75 12Z" />
            <circle cx="12" cy="12" r="2.75" />
            {crossed && <path d="M4 20 20 4" />}
        </svg>
    );
}
