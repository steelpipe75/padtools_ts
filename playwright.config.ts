import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./tests/web",
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:1234" },
		},
	],
	webServer: {
		command: "npm run start:web",
		url: "http://localhost:1234",
		reuseExistingServer: !process.env.CI,
	},
});
