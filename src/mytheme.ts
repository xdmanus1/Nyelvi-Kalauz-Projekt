import type { CustomThemeConfig } from '@skeletonlabs/tw-plugin';

export const myCustomTheme: CustomThemeConfig = {
    name: 'my-custom-theme',
    properties: {
		// =~= Theme Properties =~=
		"--theme-font-family-base": `system-ui`,
		"--theme-font-family-heading": `system-ui`,
		"--theme-font-color-base": "0 0 0",
		"--theme-font-color-dark": "255 255 255",
		"--theme-rounded-base": "9999px",
		"--theme-rounded-container": "24px",
		"--theme-border-base": "2px",
		// =~= Theme On-X Colors =~=
		"--on-primary": "0 0 0",
		"--on-secondary": "0 0 0",
		"--on-tertiary": "0 0 0",
		"--on-success": "0 0 0",
		"--on-warning": "0 0 0",
		"--on-error": "0 0 0",
		"--on-surface": "0 0 0",
		// =~= Theme Colors  =~=
		// primary | #d9f2d4 
		"--color-primary-50": "249 253 249", // #f9fdf9
		"--color-primary-100": "247 252 246", // #f7fcf6
		"--color-primary-200": "246 252 244", // #f6fcf4
		"--color-primary-300": "240 250 238", // #f0faee
		"--color-primary-400": "228 246 225", // #e4f6e1
		"--color-primary-500": "217 242 212", // #d9f2d4
		"--color-primary-600": "195 218 191", // #c3dabf
		"--color-primary-700": "163 182 159", // #a3b69f
		"--color-primary-800": "130 145 127", // #82917f
		"--color-primary-900": "106 119 104", // #6a7768
		// secondary | #b3cdb1 
		"--color-secondary-50": "244 248 243", // #f4f8f3
		"--color-secondary-100": "240 245 239", // #f0f5ef
		"--color-secondary-200": "236 243 236", // #ecf3ec
		"--color-secondary-300": "225 235 224", // #e1ebe0
		"--color-secondary-400": "202 220 200", // #cadcc8
		"--color-secondary-500": "179 205 177", // #b3cdb1
		"--color-secondary-600": "161 185 159", // #a1b99f
		"--color-secondary-700": "134 154 133", // #869a85
		"--color-secondary-800": "107 123 106", // #6b7b6a
		"--color-secondary-900": "88 100 87", // #586457
		// tertiary | #839b78 
		"--color-tertiary-50": "236 240 235", // #ecf0eb
		"--color-tertiary-100": "230 235 228", // #e6ebe4
		"--color-tertiary-200": "224 230 221", // #e0e6dd
		"--color-tertiary-300": "205 215 201", // #cdd7c9
		"--color-tertiary-400": "168 185 161", // #a8b9a1
		"--color-tertiary-500": "131 155 120", // #839b78
		"--color-tertiary-600": "118 140 108", // #768c6c
		"--color-tertiary-700": "98 116 90", // #62745a
		"--color-tertiary-800": "79 93 72", // #4f5d48
		"--color-tertiary-900": "64 76 59", // #404c3b
		// success | #abdb7b 
		"--color-success-50": "242 250 235", // #f2faeb
		"--color-success-100": "238 248 229", // #eef8e5
		"--color-success-200": "234 246 222", // #eaf6de
		"--color-success-300": "221 241 202", // #ddf1ca
		"--color-success-400": "196 230 163", // #c4e6a3
		"--color-success-500": "171 219 123", // #abdb7b
		"--color-success-600": "154 197 111", // #9ac56f
		"--color-success-700": "128 164 92", // #80a45c
		"--color-success-800": "103 131 74", // #67834a
		"--color-success-900": "84 107 60", // #546b3c
		// warning | #d4e123 
		"--color-warning-50": "249 251 222", // #f9fbde
		"--color-warning-100": "246 249 211", // #f6f9d3
		"--color-warning-200": "244 248 200", // #f4f8c8
		"--color-warning-300": "238 243 167", // #eef3a7
		"--color-warning-400": "225 234 101", // #e1ea65
		"--color-warning-500": "212 225 35", // #d4e123
		"--color-warning-600": "191 203 32", // #bfcb20
		"--color-warning-700": "159 169 26", // #9fa91a
		"--color-warning-800": "127 135 21", // #7f8715
		"--color-warning-900": "104 110 17", // #686e11
		// error | #eb603d 
		"--color-error-50": "252 231 226", // #fce7e2
		"--color-error-100": "251 223 216", // #fbdfd8
		"--color-error-200": "250 215 207", // #fad7cf
		"--color-error-300": "247 191 177", // #f7bfb1
		"--color-error-400": "241 144 119", // #f19077
		"--color-error-500": "235 96 61", // #eb603d
		"--color-error-600": "212 86 55", // #d45637
		"--color-error-700": "176 72 46", // #b0482e
		"--color-error-800": "141 58 37", // #8d3a25
		"--color-error-900": "115 47 30", // #732f1e
		// surface | #778b6f 
		"--color-surface-50": "235 238 233", // #ebeee9
		"--color-surface-100": "228 232 226", // #e4e8e2
		"--color-surface-200": "221 226 219", // #dde2db
		"--color-surface-300": "201 209 197", // #c9d1c5
		"--color-surface-400": "160 174 154", // #a0ae9a
		"--color-surface-500": "119 139 111", // #778b6f
		"--color-surface-600": "107 125 100", // #6b7d64
		"--color-surface-700": "89 104 83", // #596853
		"--color-surface-800": "71 83 67", // #475343
		"--color-surface-900": "58 68 54", // #3a4436
		
	}
}