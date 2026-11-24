import type { Meta, StoryObj } from '@storybook/react-vite';

import { LoadingPanel } from './LoadingPanel';

const meta = {
  title: 'Components/Molecules/LoadingPanel',
  component: LoadingPanel,
  args: {
    status: 'Preparing the trainer',
  },
} satisfies Meta<typeof LoadingPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FullScreen: Story = {
  args: { fullScreen: true },
  parameters: { layout: 'fullscreen' },
};
