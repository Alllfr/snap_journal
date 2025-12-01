import React from "react";

interface InputErrorProps {
    message?: string;
}

export default function InputError({ message }: InputErrorProps) {
    if (!message) return null;

    return (
        <p style={{
            color: "red",
            fontSize: "12px",
            marginTop: "4px"
        }}>
            {message}
        </p>
    );
}
