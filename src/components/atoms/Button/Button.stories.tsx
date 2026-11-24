import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from './Button';

const meta = {
  title: 'Components/Atoms/Button',
  component: Button,
  args: {
    children: 'Continue',
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { variant: 'primary' },
};

export const Secondary: Story = {};

export const Ghost: Story = {
  args: { variant: 'ghost' },
};
