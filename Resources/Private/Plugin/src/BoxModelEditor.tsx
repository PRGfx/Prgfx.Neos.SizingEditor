import React, { useMemo, useState } from 'react';
import classes from './BoxModelEditor.module.css';

type BoxModelSizing = {
    blockStart: number;
    blockEnd: number;
    inlineStart: number;
    inlineEnd: number;
}

type BoxModelEditorOptions = {
    lockInline: boolean;
    lockBlock: boolean;
    disabled: boolean;
}

type BoxModelEditorProps = {
    id: string;
    value: Partial<BoxModelSizing> | null;
    options?: Partial<BoxModelEditorOptions>;
    commit: (value: BoxModelSizing) => void;
    i18nRegistry: { translate: (key: string, fallback?: string) => string };
    disabled?: boolean;
}

type Side = 'top' | 'right' | 'bottom' | 'left';

const sides: ReadonlyArray<{ side: Side, property: keyof BoxModelSizing, label: string }> = [
    { side: 'top', property: 'blockStart', label: 'Top' },
    { side: 'right', property: 'inlineEnd', label: 'Right' },
    { side: 'bottom', property: 'blockEnd', label: 'Bottom' },
    { side: 'left', property: 'inlineStart', label: 'Left' },
];

/** Sides whose value is mirrored from the opposite side when the axis is locked */
const mirrors: Partial<Record<keyof BoxModelSizing, keyof BoxModelSizing>> = {
    blockEnd: 'blockStart',
    inlineEnd: 'inlineStart',
};

const parseNumber = (input: string): number | null => {
    const trimmed = input.trim();
    if (trimmed === '') {
        return null;
    }
    const nr = Number(trimmed);
    return Number.isFinite(nr) ? nr : null;
};

export const BoxModelEditor: React.FunctionComponent<BoxModelEditorProps> = ({ value, options, commit, i18nRegistry, disabled, id }) => {
    const lockInline = options?.lockInline === true;
    const lockBlock = options?.lockBlock === true;
    const isDisabled = disabled === true || options?.disabled === true;

    const isLocked = (property: keyof BoxModelSizing) =>
        (lockBlock && property === 'blockEnd') || (lockInline && property === 'inlineEnd');

    const sizing = useMemo<BoxModelSizing>(() => {
        const blockStart = value?.blockStart ?? 0;
        const inlineStart = value?.inlineStart ?? 0;
        return {
            blockStart,
            blockEnd: lockBlock ? blockStart : value?.blockEnd ?? 0,
            inlineStart,
            inlineEnd: lockInline ? inlineStart : value?.inlineEnd ?? 0,
        };
    }, [ value, lockBlock, lockInline ]);

    const update = (property: keyof BoxModelSizing, nr: number) => {
        const next = { ...sizing, [property]: nr };
        for (const [ target, source ] of Object.entries(mirrors) as Array<[keyof BoxModelSizing, keyof BoxModelSizing]>) {
            if (isLocked(target)) {
                next[target] = next[source];
            }
        }
        commit(next);
    };

    return (
        <div className={classes.box}>
            {sides.map(({ side, property, label }) => (
                <SideInput
                    key={side}
                    // lets the inspector label focus the first input
                    id={side === 'top' ? id : undefined}
                    side={side}
                    label={i18nRegistry.translate(`Prgfx.Neos.SizingEditor:Main:side.${side}`, label)}
                    value={sizing[property]}
                    locked={isLocked(property)}
                    disabled={isDisabled}
                    onChange={nr => update(property, nr)}
                />
            ))}
            <div className={classes.content} aria-hidden="true" />
        </div>
    );
};

type SideInputProps = {
    id?: string;
    side: Side;
    label: string;
    value: number;
    locked: boolean;
    disabled: boolean;
    onChange: (value: number) => void;
}

const SideInput: React.FunctionComponent<SideInputProps> = ({ id, side, label, value, locked, disabled, onChange }) => {
    // keeps the raw input while typing, so intermediate states like "" or "-" are possible
    const [ draft, setDraft ] = useState<string | null>(null);
    const readOnly = disabled || locked;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDraft(event.currentTarget.value);
        const nr = parseNumber(event.currentTarget.value);
        if (nr !== null) {
            onChange(nr);
        }
    };

    // like browser devtools: shift steps by 10, alt by 0.1
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (readOnly || (event.key !== 'ArrowUp' && event.key !== 'ArrowDown')) {
            return;
        }
        event.preventDefault();
        const step = event.shiftKey ? 10 : event.altKey ? 0.1 : 1;
        const direction = event.key === 'ArrowUp' ? 1 : -1;
        setDraft(null);
        onChange(Math.round((value + direction * step) * 10) / 10);
    };

    return (
        <input
            id={id}
            className={classes.input}
            data-side={side}
            type="number"
            inputMode="decimal"
            aria-label={label}
            title={locked ? undefined : label}
            value={draft ?? String(value)}
            readOnly={readOnly}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={event => event.currentTarget.select()}
            onBlur={() => setDraft(null)}
        />
    );
};
