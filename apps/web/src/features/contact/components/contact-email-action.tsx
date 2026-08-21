'use client';

import type { ReactNode } from 'react';

const contactEmailCodes = [
  115, 101, 114, 103, 101, 46, 104, 97, 108, 108, 46, 100, 101, 118, 64, 103, 109, 97, 105, 108, 46,
  99, 111, 109,
] as const;

function getContactEmail(): string {
  return String.fromCharCode(...contactEmailCodes);
}

type ContactEmailActionProps = {
  readonly children: ReactNode;
};

export function ContactEmailAction({ children }: ContactEmailActionProps) {
  return (
    <button
      className="button button--primary"
      type="button"
      aria-label="Написать Serge Hall по электронной почте"
      onClick={() => {
        const mailProtocol = String.fromCharCode(109, 97, 105, 108, 116, 111, 58);
        window.open(`${mailProtocol}${getContactEmail()}`, '_self', 'noopener,noreferrer');
      }}
    >
      {children}
    </button>
  );
}
