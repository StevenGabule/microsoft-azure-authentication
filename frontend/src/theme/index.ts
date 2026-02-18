'use client';

import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const config = defineConfig({
  globalCss: {
    'html, body': {
      fontFamily: 'var(--font-geist-sans), sans-serif',
      bg: 'bg',
      color: 'fg',
    },
    '*': {
      borderColor: 'border',
    },
  },
  theme: {
    tokens: {
      colors: {
        blue: {
          50: { value: '#eff6ff' },
          100: { value: '#dbeafe' },
          200: { value: '#bfdbfe' },
          300: { value: '#93c5fd' },
          400: { value: '#60a5fa' },
          500: { value: '#3b82f6' },
          600: { value: '#2563eb' },
          700: { value: '#1d4ed8' },
          800: { value: '#1e40af' },
          900: { value: '#1e3a8a' },
          950: { value: '#172554' },
        },
      },
    },
    semanticTokens: {
      colors: {
        bg: {
          value: { _light: '#ffffff', _dark: '#1a1a1a' },
        },
        fg: {
          DEFAULT: {
            value: { _light: '#171717', _dark: '#fafafa' },
          },
          muted: {
            value: { _light: '#737373', _dark: '#a3a3a3' },
          },
        },
        border: {
          value: { _light: '#e5e5e5', _dark: '#404040' },
        },
        primary: {
          DEFAULT: {
            value: { _light: '#1e3a8a', _dark: '#60a5fa' },
          },
          fg: {
            value: { _light: '#fafafa', _dark: '#1e3a8a' },
          },
        },
        destructive: {
          DEFAULT: {
            value: { _light: '#dc2626', _dark: '#dc2626' },
          },
          fg: {
            value: { _light: '#fafafa', _dark: '#fafafa' },
          },
        },
        success: {
          DEFAULT: {
            value: { _light: '#16a34a', _dark: '#22c55e' },
          },
          fg: {
            value: { _light: '#ffffff', _dark: '#ffffff' },
          },
        },
        card: {
          DEFAULT: {
            value: { _light: '#ffffff', _dark: '#1a1a1a' },
          },
          fg: {
            value: { _light: '#171717', _dark: '#fafafa' },
          },
        },
        muted: {
          DEFAULT: {
            value: { _light: '#f5f5f5', _dark: '#404040' },
          },
          fg: {
            value: { _light: '#737373', _dark: '#a3a3a3' },
          },
        },
        accent: {
          DEFAULT: {
            value: { _light: '#f5f5f5', _dark: '#404040' },
          },
          fg: {
            value: { _light: '#1e3a8a', _dark: '#fafafa' },
          },
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
