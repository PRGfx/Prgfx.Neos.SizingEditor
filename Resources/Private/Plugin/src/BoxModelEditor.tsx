import React, { useMemo, useState } from 'react';
import classes from './BoxModelEditor.module.css';

type BoxModelSizing = {
    blockStart: number;
    blockEnd: number;
    inlineStart: number;
    inlineEnd: number;
}

type Property = keyof BoxModelSizing;

type BoxModelEditorOptions = {
    lockInline: boolean;
    lockBlock: boolean;
    disabled: boolean;
} & {
    [K in `${Property}${'Minimum' | 'Maximum'}`]: number;
}

type Limits = { min?: number, max?: number };

type BoxModelEditorProps = {
    id: string;
    value: Partial<BoxModelSizing> | null;
    options?: Partial<BoxModelEditorOptions>;
    commit: (value: BoxModelSizing) => void;
    i18nRegistry: { translate: (key: string, fallback?: string) => string };
    disabled?: boolean;
}

type Side = 'top' | 'right' | 'bottom' | 'left';

const sides: ReadonlyArray<{ side: Side, property: Property, label: string }> = [
    { side: 'top', property: 'blockStart', label: 'Top' },
    { side: 'right', property: 'inlineEnd', label: 'Right' },
    { side: 'bottom', property: 'blockEnd', label: 'Bottom' },
    { side: 'left', property: 'inlineStart', label: 'Left' },
];

/** Sides whose value is mirrored from the opposite side when the axis is locked */
const mirrors: Partial<Record<Property, Property>> = {
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

const toLimit = (option: unknown): number | undefined =>
    typeof option === 'number' && Number.isFinite(option) ? option : undefined;

const clamp = (nr: number, { min, max }: Limits): number =>
    Math.min(max ?? Infinity, Math.max(min ?? -Infinity, nr));

export const BoxModelEditor: React.FunctionComponent<BoxModelEditorProps> = ({ value, options, commit, i18nRegistry, disabled, id }) => {
    const lockInline = options?.lockInline === true;
    const lockBlock = options?.lockBlock === true;
    const isDisabled = disabled === true || options?.disabled === true;

    const isLocked = (property: Property) =>
        (lockBlock && property === 'blockEnd') || (lockInline && property === 'inlineEnd');

    const limits = (property: Property): Limits => ({
        min: toLimit(options?.[`${property}Minimum`]),
        max: toLimit(options?.[`${property}Maximum`]),
    });

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

    const update = (property: Property, nr: number) => {
        const next = { ...sizing, [property]: clamp(nr, limits(property)) };
        for (const [ target, source ] of Object.entries(mirrors) as Array<[Property, Property]>) {
            if (isLocked(target)) {
                next[target] = clamp(next[source], limits(target));
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
                    {...limits(property)}
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
    min?: number;
    max?: number;
    locked: boolean;
    disabled: boolean;
    onChange: (value: number) => void;
}

const SideInput: React.FunctionComponent<SideInputProps> = ({ id, side, label, value, min, max, locked, disabled, onChange }) => {
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
            min={min}
            max={max}
            readOnly={readOnly}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={event => event.currentTarget.select()}
            onBlur={() => setDraft(null)}
        />
    );
};
