import React from 'react';
import { HelmetProvider as Provider } from 'react-helmet-async';

export function HelmetProvider({ children }: { children: React.ReactNode }) {
    return <Provider>{children}</Provider>;
}
