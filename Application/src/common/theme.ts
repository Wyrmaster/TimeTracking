import {createSystem, defaultConfig, defineConfig} from '@chakra-ui/react';

/**
 * Theme of the application.
 *
 * Based on the default chakra theme, but with a dark mode that uses soft grays instead of
 * pure black for its backgrounds and borders.
 */
const config = defineConfig({
  theme: {
    semanticTokens: {
      colors: {
        bg: {
          DEFAULT: {value: {_light: '{colors.white}', _dark: '#25272d'}},
          subtle: {value: {_light: '{colors.gray.50}', _dark: '#2b2d34'}},
          muted: {value: {_light: '{colors.gray.100}', _dark: '#32353d'}},
          emphasized: {value: {_light: '{colors.gray.200}', _dark: '#3b3e47'}},
          panel: {value: {_light: '{colors.white}', _dark: '#2b2d34'}},
        },
        border: {
          DEFAULT: {value: {_light: '{colors.gray.200}', _dark: '#41444d'}},
          muted: {value: {_light: '{colors.gray.100}', _dark: '#383b43'}},
          subtle: {value: {_light: '{colors.gray.50}', _dark: '#30333a'}},
          emphasized: {value: {_light: '{colors.gray.300}', _dark: '#4d515b'}},
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
