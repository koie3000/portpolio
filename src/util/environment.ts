export const isSSR = () => import.meta.env.SSR;

export const isCSR = () => !import.meta.env.SSR;

export const isDEV = () => import.meta.env.DEV;

export const isPROD = () => import.meta.env.PROD; 