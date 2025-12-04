import { LinkProps as NextLinkProps } from 'expo-router';

declare module 'expo-router' {
  export interface LinkProps extends NextLinkProps {
    href: string | { pathname: string; params?: Record<string, any> };
  }
}
