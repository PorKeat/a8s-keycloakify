import { Fragment, useEffect } from "react";
import { assert } from "keycloakify/tools/assert";
import { useIsPasswordRevealed } from "keycloakify/tools/useIsPasswordRevealed";
import { getButtonToDisplayForMultivaluedAttributeField, useUserProfileForm, type FormAction, type FormFieldError } from "keycloakify/login/lib/useUserProfileForm";
import type { Attribute } from "keycloakify/login/KcContext";
import type { KcClsx } from "keycloakify/login/lib/kcClsx";
import type { UserProfileFormFieldsProps } from "keycloakify/login/UserProfileFormFieldsProps";

export default function UserProfileFormFieldsCompact(props: UserProfileFormFieldsProps) {
    const { kcContext, i18n, kcClsx, onIsFormSubmittableValueChange, doMakeUserConfirmPassword, BeforeField, AfterField } = props;

    const {
        formState: { formFieldStates, isFormSubmittable },
        dispatchFormAction
    } = useUserProfileForm({
        kcContext,
        i18n,
        doMakeUserConfirmPassword
    });

    useEffect(() => {
        onIsFormSubmittableValueChange(isFormSubmittable);
    }, [isFormSubmittable, onIsFormSubmittableValueChange]);

    const groupNameRef = { current: "" };

    return (
        <>
            {formFieldStates.map(({ attribute, displayableErrors, valueOrValues }) => (
                <Fragment key={attribute.name}>
                    <GroupLabel attribute={attribute} groupNameRef={groupNameRef} i18n={i18n} kcClsx={kcClsx} />
                    {BeforeField !== undefined && (
                        <BeforeField
                            attribute={attribute}
                            dispatchFormAction={dispatchFormAction}
                            displayableErrors={displayableErrors}
                            valueOrValues={valueOrValues}
                            kcClsx={kcClsx}
                            i18n={i18n}
                        />
                    )}
                    <div
                        className={kcClsx("kcFormGroupClass")}
                        style={{
                            display:
                                attribute.annotations.inputType === "hidden" ||
                                (attribute.name === "password-confirm" && !doMakeUserConfirmPassword)
                                    ? "none"
                                    : undefined
                        }}
                    >
                        <div className={kcClsx("kcLabelWrapperClass")}>
                            <label htmlFor={attribute.name} className={kcClsx("kcLabelClass")}>
                                {(i18n as any).advancedMsg(attribute.displayName ?? "")}
                            </label>
                            {attribute.required && <>{/* hidden by CSS, kept for semantics */} *</>}
                        </div>

                        <div className={kcClsx("kcInputWrapperClass")}>
                            {attribute.annotations.inputHelperTextBefore !== undefined && (
                                <div
                                    className={kcClsx("kcInputHelperTextBeforeClass")}
                                    id={`form-help-text-before-${attribute.name}`}
                                    aria-live="polite"
                                >
                                    {(i18n as any).advancedMsg(attribute.annotations.inputHelperTextBefore)}
                                </div>
                            )}

                            <InputFieldByType
                                attribute={attribute}
                                valueOrValues={valueOrValues}
                                displayableErrors={displayableErrors}
                                dispatchFormAction={dispatchFormAction}
                                kcClsx={kcClsx}
                                i18n={i18n}
                            />

                            <FieldErrors attribute={attribute} displayableErrors={displayableErrors} kcClsx={kcClsx} fieldIndex={undefined} />

                            {attribute.annotations.inputHelperTextAfter !== undefined && (
                                <div
                                    className={kcClsx("kcInputHelperTextAfterClass")}
                                    id={`form-help-text-after-${attribute.name}`}
                                    aria-live="polite"
                                >
                                    {(i18n as any).advancedMsg(attribute.annotations.inputHelperTextAfter)}
                                </div>
                            )}

                            {AfterField !== undefined && (
                                <AfterField
                                    attribute={attribute}
                                    dispatchFormAction={dispatchFormAction}
                                    displayableErrors={displayableErrors}
                                    valueOrValues={valueOrValues}
                                    kcClsx={kcClsx}
                                    i18n={i18n}
                                />
                            )}
                        </div>
                    </div>
                </Fragment>
            ))}
        </>
    );
}

function GroupLabel(props: {
    attribute: Attribute;
    groupNameRef: { current: string };
    i18n: any;
    kcClsx: KcClsx;
}) {
    const { attribute, groupNameRef, i18n, kcClsx } = props;

    if (attribute.group?.name !== groupNameRef.current) {
        groupNameRef.current = attribute.group?.name ?? "";

        if (groupNameRef.current !== "") {
            assert(attribute.group !== undefined);

            return (
                <div
                    className={kcClsx("kcFormGroupClass")}
                    {...Object.fromEntries(Object.entries(attribute.group.html5DataAnnotations).map(([key, value]) => [`data-${key}`, value]))}
                >
                    <div className={kcClsx("kcContentWrapperClass")}>
                        <label id={`header-${attribute.group.name}`} className={kcClsx("kcFormGroupHeader")}>
                            {(() => {
                                const groupDisplayHeader = attribute.group?.displayHeader ?? "";
                                return groupDisplayHeader !== "" ? i18n.advancedMsg(groupDisplayHeader) : attribute.group?.name;
                            })()}
                        </label>
                    </div>

                    {attribute.group.displayDescription !== undefined && attribute.group.displayDescription !== "" && (
                        <div className={kcClsx("kcLabelWrapperClass")}>
                            <label id={`description-${attribute.group.name}`} className={kcClsx("kcLabelClass")}>
                                {i18n.advancedMsg(attribute.group.displayDescription)}
                            </label>
                        </div>
                    )}
                </div>
            );
        }
    }

    return null;
}

function FieldErrors(props: {
    attribute: Attribute;
    fieldIndex: number | undefined;
    displayableErrors: FormFieldError[];
    kcClsx: KcClsx;
}) {
    const { attribute, fieldIndex, kcClsx } = props;
    const displayableErrors = props.displayableErrors.filter(error => error.fieldIndex === fieldIndex);
    const primaryError = pickPrimaryError(displayableErrors);

    if (primaryError === undefined) {
        return null;
    }

    return (
        <span
            id={`input-error-${attribute.name}${fieldIndex === undefined ? "" : `-${fieldIndex}`}`}
            className={kcClsx("kcInputErrorMessageClass")}
            aria-live="polite"
        >
            {primaryError.errorMessage}
        </span>
    );
}

function pickPrimaryError(displayableErrors: FormFieldError[]) {
    const uniqueErrors = displayableErrors.filter((error, index, arr) => arr.findIndex(({ errorMessageStr }) => errorMessageStr === error.errorMessageStr) === index);

    return uniqueErrors
        .map((error, index) => ({
            error,
            index,
            priority: getErrorPriority(error)
        }))
        .sort((a, b) => a.priority - b.priority || a.index - b.index)[0]?.error;
}

function getErrorPriority(error: FormFieldError) {
    switch (error.source.type) {
        case "other":
            switch (error.source.rule) {
                case "requiredField":
                    return 0;
                case "passwordConfirmMatchesPassword":
                    return 3;
            }
            return 6;
        case "server":
            return 1;
        case "validator":
            return 2;
        case "passwordPolicy":
            return 4;
        default:
            return 5;
    }
}

function InputFieldByType(props: {
    attribute: Attribute;
    valueOrValues: string | string[];
    displayableErrors: FormFieldError[];
    dispatchFormAction: React.Dispatch<FormAction>;
    kcClsx: KcClsx;
    i18n: any;
}) {
    const { attribute, valueOrValues } = props;

    switch (attribute.annotations.inputType) {
        case "hidden":
            return <input type="hidden" name={attribute.name} value={valueOrValues} />;
        case "textarea":
            return <TextareaTag {...props} />;
        case "select":
        case "multiselect":
            return <SelectTag {...props} />;
        case "select-radiobuttons":
        case "multiselect-checkboxes":
            return <InputTagSelects {...props} />;
        default: {
            if (valueOrValues instanceof Array) {
                return (
                    <>
                        {valueOrValues.map((_, i) => (
                            <InputTag key={i} {...props} fieldIndex={i} />
                        ))}
                    </>
                );
            }

            const inputNode = <InputTag {...props} fieldIndex={undefined} />;

            if (attribute.name === "password" || attribute.name === "password-confirm") {
                return (
                    <PasswordWrapper kcClsx={props.kcClsx} i18n={props.i18n} passwordInputId={attribute.name}>
                        {inputNode}
                    </PasswordWrapper>
                );
            }

            return inputNode;
        }
    }
}

function PasswordWrapper(props: {
    kcClsx: KcClsx;
    i18n: any;
    passwordInputId: string;
    children: React.ReactNode;
}) {
    const { kcClsx, i18n, passwordInputId, children } = props;
    const { isPasswordRevealed, toggleIsPasswordRevealed } = useIsPasswordRevealed({ passwordInputId });

    return (
        <div className={kcClsx("kcInputGroup")}>
            {children}
            <button
                type="button"
                className={kcClsx("kcFormPasswordVisibilityButtonClass")}
                aria-label={i18n.msgStr(isPasswordRevealed ? "hidePassword" : "showPassword")}
                aria-controls={passwordInputId}
                onClick={toggleIsPasswordRevealed}
            >
                <i className={kcClsx(isPasswordRevealed ? "kcFormPasswordVisibilityIconHide" : "kcFormPasswordVisibilityIconShow")} aria-hidden={true} />
            </button>
        </div>
    );
}

function InputTag(props: {
    attribute: Attribute;
    fieldIndex: number | undefined;
    kcClsx: KcClsx;
    dispatchFormAction: React.Dispatch<FormAction>;
    valueOrValues: string | string[];
    i18n: any;
    displayableErrors: FormFieldError[];
}) {
    const { attribute, fieldIndex, kcClsx, dispatchFormAction, valueOrValues, i18n, displayableErrors } = props;

    return (
        <>
            <input
                type={(() => {
                    const { inputType } = attribute.annotations;

                    if (inputType?.startsWith("html5-")) {
                        return inputType.slice(6);
                    }

                    return inputType ?? "text";
                })()}
                id={attribute.name}
                name={attribute.name}
                value={(() => {
                    if (fieldIndex !== undefined) {
                        assert(valueOrValues instanceof Array);
                        return valueOrValues[fieldIndex];
                    }

                    assert(typeof valueOrValues === "string");
                    return valueOrValues;
                })()}
                className={kcClsx("kcInputClass")}
                aria-invalid={displayableErrors.find(error => error.fieldIndex === fieldIndex) !== undefined}
                disabled={attribute.readOnly}
                autoComplete={attribute.autocomplete}
                placeholder={getFieldPlaceholder({
                    attribute,
                    i18n
                })}
                pattern={attribute.annotations.inputTypePattern}
                size={attribute.annotations.inputTypeSize === undefined ? undefined : parseInt(`${attribute.annotations.inputTypeSize}`)}
                maxLength={attribute.annotations.inputTypeMaxlength === undefined ? undefined : parseInt(`${attribute.annotations.inputTypeMaxlength}`)}
                minLength={attribute.annotations.inputTypeMinlength === undefined ? undefined : parseInt(`${attribute.annotations.inputTypeMinlength}`)}
                max={attribute.annotations.inputTypeMax}
                min={attribute.annotations.inputTypeMin}
                step={attribute.annotations.inputTypeStep}
                {...Object.fromEntries(Object.entries(attribute.html5DataAnnotations ?? {}).map(([key, value]) => [`data-${key}`, value]))}
                onChange={event =>
                    dispatchFormAction({
                        action: "update",
                        name: attribute.name,
                        valueOrValues:
                            fieldIndex !== undefined
                                ? (valueOrValues as string[]).map((value, i) => (i === fieldIndex ? event.target.value : value))
                                : event.target.value
                    })
                }
                onBlur={() =>
                    dispatchFormAction({
                        action: "focus lost",
                        name: attribute.name,
                        fieldIndex
                    })
                }
            />

            {fieldIndex !== undefined && valueOrValues instanceof Array && (
                <>
                    <FieldErrors attribute={attribute} kcClsx={kcClsx} displayableErrors={displayableErrors} fieldIndex={fieldIndex} />
                    <AddRemoveButtonsMultiValuedAttribute
                        attribute={attribute}
                        values={valueOrValues}
                        fieldIndex={fieldIndex}
                        dispatchFormAction={dispatchFormAction}
                        i18n={i18n}
                    />
                </>
            )}
        </>
    );
}

function AddRemoveButtonsMultiValuedAttribute(props: {
    attribute: Attribute;
    values: string[];
    fieldIndex: number;
    dispatchFormAction: React.Dispatch<FormAction>;
    i18n: any;
}) {
    const { attribute, values, fieldIndex, dispatchFormAction, i18n } = props;
    const { hasAdd, hasRemove } = getButtonToDisplayForMultivaluedAttributeField({ attribute, values, fieldIndex });
    const idPostfix = `-${attribute.name}-${fieldIndex + 1}`;

    return (
        <>
            {hasRemove && (
                <>
                    <button
                        id={`kc-remove${idPostfix}`}
                        type="button"
                        className="pf-c-button pf-m-inline pf-m-link"
                        onClick={() =>
                            dispatchFormAction({
                                action: "update",
                                name: attribute.name,
                                valueOrValues: values.filter((_, i) => i !== fieldIndex)
                            })
                        }
                    >
                        {i18n.msg("remove")}
                    </button>
                    {hasAdd ? <>{"\u00A0|\u00A0"}</> : null}
                </>
            )}
            {hasAdd && (
                <button
                    id={`kc-add${idPostfix}`}
                    type="button"
                    className="pf-c-button pf-m-inline pf-m-link"
                    onClick={() =>
                        dispatchFormAction({
                            action: "update",
                            name: attribute.name,
                            valueOrValues: [...values, ""]
                        })
                    }
                >
                    {i18n.msg("addValue")}
                </button>
            )}
        </>
    );
}

function InputTagSelects(props: {
    attribute: Attribute;
    dispatchFormAction: React.Dispatch<FormAction>;
    kcClsx: KcClsx;
    i18n: any;
    valueOrValues: string | string[];
    displayableErrors: FormFieldError[];
}) {
    const { attribute, dispatchFormAction, kcClsx, i18n, valueOrValues } = props;

    const { classDiv, classInput, classLabel, inputType } = (() => {
        const { inputType } = attribute.annotations;
        assert(inputType === "select-radiobuttons" || inputType === "multiselect-checkboxes");

        switch (inputType) {
            case "select-radiobuttons":
                return {
                    inputType: "radio" as const,
                    classDiv: kcClsx("kcInputClassRadio"),
                    classInput: kcClsx("kcInputClassRadioInput"),
                    classLabel: kcClsx("kcInputClassRadioLabel")
                };
            case "multiselect-checkboxes":
                return {
                    inputType: "checkbox" as const,
                    classDiv: kcClsx("kcInputClassCheckbox"),
                    classInput: kcClsx("kcInputClassCheckboxInput"),
                    classLabel: kcClsx("kcInputClassCheckboxLabel")
                };
        }
    })();

    const options = (() => {
        const { inputOptionsFromValidation } = attribute.annotations;
        const validators = attribute.validators as Record<string, { options?: string[] } | undefined>;

        if (inputOptionsFromValidation !== undefined) {
            const validator = validators[inputOptionsFromValidation];

            if (validator?.options !== undefined) {
                return validator.options;
            }
        }

        return attribute.validators.options?.options ?? [];
    })();

    return (
        <>
            {options.map((option: string) => (
                <div key={option} className={classDiv}>
                    <input
                        type={inputType}
                        id={`${attribute.name}-${option}`}
                        name={attribute.name}
                        value={option}
                        className={classInput}
                        aria-invalid={props.displayableErrors.length !== 0}
                        disabled={attribute.readOnly}
                        checked={valueOrValues instanceof Array ? valueOrValues.includes(option) : valueOrValues === option}
                        onChange={event =>
                            dispatchFormAction({
                                action: "update",
                                name: attribute.name,
                                valueOrValues:
                                    valueOrValues instanceof Array
                                        ? event.target.checked
                                            ? [...valueOrValues, option]
                                            : valueOrValues.filter(value => value !== option)
                                        : event.target.checked
                                          ? option
                                          : ""
                            })
                        }
                        onBlur={() =>
                            dispatchFormAction({
                                action: "focus lost",
                                name: attribute.name,
                                fieldIndex: undefined
                            })
                        }
                    />
                    <label
                        htmlFor={`${attribute.name}-${option}`}
                        className={`${classLabel}${attribute.readOnly ? ` ${kcClsx("kcInputClassRadioCheckboxLabelDisabled")}` : ""}`}
                    >
                        {inputLabel(i18n, attribute, option)}
                    </label>
                </div>
            ))}
        </>
    );
}

function TextareaTag(props: {
    attribute: Attribute;
    dispatchFormAction: React.Dispatch<FormAction>;
    kcClsx: KcClsx;
    displayableErrors: FormFieldError[];
    valueOrValues: string | string[];
}) {
    const { attribute, dispatchFormAction, kcClsx, displayableErrors, valueOrValues } = props;
    assert(typeof valueOrValues === "string");

    return (
        <textarea
            id={attribute.name}
            name={attribute.name}
            className={kcClsx("kcInputClass")}
            aria-invalid={displayableErrors.length !== 0}
            disabled={attribute.readOnly}
            cols={attribute.annotations.inputTypeCols === undefined ? undefined : parseInt(`${attribute.annotations.inputTypeCols}`)}
            rows={attribute.annotations.inputTypeRows === undefined ? undefined : parseInt(`${attribute.annotations.inputTypeRows}`)}
            maxLength={attribute.annotations.inputTypeMaxlength === undefined ? undefined : parseInt(`${attribute.annotations.inputTypeMaxlength}`)}
            value={valueOrValues}
            onChange={event =>
                dispatchFormAction({
                    action: "update",
                    name: attribute.name,
                    valueOrValues: event.target.value
                })
            }
            onBlur={() =>
                dispatchFormAction({
                    action: "focus lost",
                    name: attribute.name,
                    fieldIndex: undefined
                })
            }
        />
    );
}

function SelectTag(props: {
    attribute: Attribute;
    dispatchFormAction: React.Dispatch<FormAction>;
    kcClsx: KcClsx;
    displayableErrors: FormFieldError[];
    i18n: any;
    valueOrValues: string | string[];
}) {
    const { attribute, dispatchFormAction, kcClsx, displayableErrors, i18n, valueOrValues } = props;
    const isMultiple = attribute.annotations.inputType === "multiselect";

    return (
        <select
            id={attribute.name}
            name={attribute.name}
            className={kcClsx("kcInputClass")}
            aria-invalid={displayableErrors.length !== 0}
            disabled={attribute.readOnly}
            multiple={isMultiple}
            size={attribute.annotations.inputTypeSize === undefined ? undefined : parseInt(`${attribute.annotations.inputTypeSize}`)}
            value={valueOrValues}
            onChange={event =>
                dispatchFormAction({
                    action: "update",
                    name: attribute.name,
                    valueOrValues: isMultiple ? Array.from(event.target.selectedOptions).map(option => option.value) : event.target.value
                })
            }
            onBlur={() =>
                dispatchFormAction({
                    action: "focus lost",
                    name: attribute.name,
                    fieldIndex: undefined
                })
            }
        >
            {!isMultiple && <option value="" />}
            {(() => {
                const { inputOptionsFromValidation } = attribute.annotations;
                const validators = attribute.validators as Record<string, { options?: string[] } | undefined>;
                const options =
                    inputOptionsFromValidation !== undefined
                        ? validators[inputOptionsFromValidation]?.options ?? attribute.validators.options?.options ?? []
                        : attribute.validators.options?.options ?? [];

                return options.map((option: string) => (
                    <option key={option} value={option}>
                        {inputLabel(i18n, attribute, option)}
                    </option>
                ));
            })()}
        </select>
    );
}

function inputLabel(i18n: any, attribute: Attribute, option: string) {
    if (attribute.annotations.inputOptionLabels !== undefined) {
        return i18n.advancedMsg(attribute.annotations.inputOptionLabels[option] ?? option);
    }

    if (attribute.annotations.inputOptionLabelsI18nPrefix !== undefined) {
        return i18n.advancedMsg(`${attribute.annotations.inputOptionLabelsI18nPrefix}.${option}`);
    }

    return option;
}

function getFieldPlaceholder(params: { attribute: Attribute; i18n: any }) {
    const { attribute, i18n } = params;

    if (attribute.annotations.inputTypePlaceholder !== undefined) {
        return i18n.advancedMsgStr(attribute.annotations.inputTypePlaceholder);
    }

    switch (attribute.name) {
        case "firstName":
            return "First name";
        case "lastName":
            return "Last name";
        case "username":
            return "Username";
        case "email":
            return "Email address";
        case "password":
            return "Password";
        case "password-confirm":
            return "Confirm password";
        default:
            return undefined;
    }
}
