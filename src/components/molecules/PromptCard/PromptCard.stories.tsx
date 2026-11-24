import type { Meta, StoryObj } from '@storybook/react-vite';

import { PromptCard } from './PromptCard';

const meta = {
  title: 'Components/Molecules/PromptCard',
  component: PromptCard,
  args: {
    audioPath: null,
    word: 'khỏe',
  },
} satisfies Meta<typeof PromptCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
