const plugin = require("tailwindcss/plugin");
const colors = require("tailwindcss/colors");
const { nextui } = require("@nextui-org/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	colors: {
  		transparent: 'transparent',
  		current: 'currentColor',
  		black: 'colors.black',
  		white: 'colors.white',
  		gray: 'colors.gray',
  		emerald: 'colors.emerald',
  		indigo: 'colors.indigo',
  		yellow: 'colors.yellow',
  		'panel-bg': '#202124',
  		'panel-border': '#4E4E4E',
  		'main-blue': '#46A8E5',
  		inputBackGround: '#202020'
  	},
  	extend: {
  		backgroundImage: {
  			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
  			'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
  		},
  		animation: {
  			grid: 'grid 15s linear infinite',
  			'shimmer-slide': 'shimmer-slide var(--speed) ease-in-out infinite alternate',
  			'spin-around': 'spin-around calc(var(--speed) * 2) infinite linear'
  		},
  		keyframes: {
  			grid: {
  				'0%': {
  					transform: 'translateY(-50%)'
  				},
  				'100%': {
  					transform: 'translateY(0)'
  				}
  			},
  			'shimmer-slide': {
  				to: {
  					transform: 'translate(calc(100cqw - 100%), 0)'
  				}
  			},
  			'spin-around': {
  				'0%': {
  					transform: 'translateZ(0) rotate(0)'
  				},
  				'15%, 35%': {
  					transform: 'translateZ(0) rotate(90deg)'
  				},
  				'65%, 85%': {
  					transform: 'translateZ(0) rotate(270deg)'
  				},
  				'100%': {
  					transform: 'translateZ(0) rotate(360deg)'
  				}
  			}
  		},
  		scale: {
  			'102': '1.02',
  			'103': '1.03'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		}
  	}
  },
  darkMode: ["class", "class"],
  plugins: [
    nextui({
      themes: {
        dark: {
          colors: {
            default: {
              DEFAULT: "#686868",
              foreground: "#FFFFFF",
            },
            primary: {
              DEFAULT: "#46A8E5",
              foreground: "#000000",
            },
            secondary: {
              DEFAULT: "#686868",
              foreground: "#FFFFFF",
            },
            warning: {
              DEFAULT: "#202020",
              foreground: "#686868",
            },
            focus: "#BEF264",
          },
        },
      },
    }),
    plugin(function ({ addUtilities }) {
      const newUtilities = {
        ".scrollbar-thin": {
          scrollbarWidth: "none",
          scrollbarColor: "#d4d4d4 transparent",
        },
        ".scrollbar-webkit": {
          "&::-webkit-scrollbar": {
            width: "8px",
            height: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
            borderRadius: "10px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "white !important",
            borderRadius: "10px",
            border: "2px solid #4E4E4E !important",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "#888 !important",
          },
          "&::-webkit-scrollbar-button": {
            display: "none !important",
          },
        },
        ".custom-input-wrapper": {
          "@apply shadow-xl bg-inputBackGround backdrop-blur-xl backdrop-saturate-200 cursor-text":
            {},
          "@apply dark:bg-inputBackGround/60": {},
          "@apply dark:hover:bg-inputBackGround/70": {},
          "@apply dark:focus:bg-inputBackGround/80": {},
        },
      };
      addUtilities(newUtilities, ["responsive", "hover"]);
    }),
    require("tailwindcss-animate"),
  ],
};
