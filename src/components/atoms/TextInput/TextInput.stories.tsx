import type { Meta, StoryObj } from '@storybook/react-vite';

import { TextInput } from './TextInput';

const meta = {
  title: 'Components/Atoms/TextInput',
  component: TextInput,
  args: {
    hint: 'Examples: khoer or khỏe',
    label: 'Your answer',
    placeholder: 'Type your answer',
  },
} satisfies Meta<typeof TextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
