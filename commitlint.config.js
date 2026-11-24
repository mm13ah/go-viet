const AI_ATTRIBUTION =
  /co-authored-by:[^\n]*(claude|anthropic|copilot|openai|chatgpt|gpt|gemini|codex|cursor)|generated (with|by)[^\n]*(claude|copilot|chatgpt|gemini|\bai\b)|🤖/i;

export default {
  extends: ['@commitlint/config-conventional'],
  plugins: [
    {
      rules: {
        'no-ai-attribution': (parsed) => [
          !AI_ATTRIBUTION.test(parsed.raw ?? ''),
          'remove AI attribution: commits are authored by the human who commits them',
        ],
      },
    },
  ],
  rules: { 'no-ai-attribution': [2, 'always'] },
};
