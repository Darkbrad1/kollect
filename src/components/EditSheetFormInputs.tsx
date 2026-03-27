// EditSheetInputs.tsx
import * as React from "react";
import { Textarea } from "~components/ui/textarea";
import { Input } from "~components/ui/input";
import { Label } from "~components/ui/label";

type BaseProps = {
    id?: string;
    title?: string;
    name: string; // important for FormData
};

type EditSheetTextareaProps = BaseProps &
    Omit<
        React.ComponentProps<typeof Textarea>,
        "id" | "name" | "defaultValue" | "value" | "onChange"
    > & {
        defaultValue?: string;
    };

function EditSheetTextarea({
    title,
    id,
    name,
    defaultValue,
    ...rest
}: EditSheetTextareaProps) {
    return (
        <div>
            <Label className="p-2" htmlFor={id}>
                {title}
            </Label>
            <Textarea
                id={id}
                name={name}
                cols={20}
                defaultValue={defaultValue}
                className="bg-black border-none wrap-anywhere"
                {...rest}
            />
        </div>
    );
}

type EditSheetInputProps = BaseProps &
    Omit<
        React.ComponentProps<typeof Input>,
        "id" | "name" | "defaultValue" | "value" | "onChange"
    > & {
        defaultValue?: string | number;
    };

function EditSheetInput({
    title,
    id,
    name,
    defaultValue,
    ...rest
}: EditSheetInputProps) {
    return (
        <div>
            <Label className="p-2" htmlFor={id}>
                {title}
            </Label>
            <Input id={id} name={name} defaultValue={defaultValue} {...rest} className="bg-black border-none"/>
        </div>
    );
}

export { EditSheetTextarea, EditSheetInput };
