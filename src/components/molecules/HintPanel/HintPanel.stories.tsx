import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { HintPanel } from './HintPanel';

const meta = {
  title: 'Components/Molecules/HintPanel',
  component: HintPanel,
  args: {
    isOpen: true,
    onToggle: fn(),
  },
} satisfies Meta<typeof HintPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {};

export const Closed: Story = {
  args: { isOpen: false },
};
