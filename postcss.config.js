module.exports = {
	plugins: {
		"@fullhuman/postcss-purgecss": {
			content: ["./web/**/*.html"],
			safelist: {
				greedy: [/data-v-.*/],
			},
		},
	},
};
