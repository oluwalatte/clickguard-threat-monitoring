import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Pagination, pageWindow } from './Pagination';

function Controlled(props: { pageCount: number; total: number; pageSize: number; initial?: number }) {
  const [page, setPage] = useState(props.initial ?? 1);
  const from = (page - 1) * props.pageSize + 1;
  const to = Math.min(props.total, page * props.pageSize);
  return <Pagination page={page} pageCount={props.pageCount} onPageChange={setPage} summary={`${from} to ${to} of ${props.total} visitors`} />;
}

const meta = {
  title: 'Data/Pagination',
  component: Pagination,
  args: { page: 1, pageCount: 3, onPageChange: fn(), summary: '1 to 20 of 48 visitors' },
  parameters: {
    docs: { description: { component: 'Page controls as a navigation landmark. The current page carries aria-current and changes weight as well as surface; the summary is a live region so a page change is announced. Up to seven pages are listed in full; beyond that the ends and the neighbours of the current page remain.' } },
  },
} satisfies Meta<typeof Pagination>;
export default meta;

type Story = StoryObj<typeof meta>;

export const ThreePages: Story = {
  render: () => <Controlled pageCount={3} total={48} pageSize={20} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page');
    await expect(c.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    await userEvent.click(c.getByRole('button', { name: 'Next page' }));
    await expect(c.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
    await expect(c.getByText('21 to 40 of 48 visitors')).toBeInTheDocument();
    await userEvent.click(c.getByRole('button', { name: 'Page 3' }));
    await expect(c.getByRole('button', { name: 'Next page' })).toBeDisabled();
    await expect(c.getByText('41 to 48 of 48 visitors')).toBeInTheDocument();
  },
};

export const ManyPages: Story = {
  render: () => <Controlled pageCount={14} total={276} pageSize={20} initial={7} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('button', { name: 'Page 1' })).toBeInTheDocument();
    await expect(c.getByRole('button', { name: 'Page 14' })).toBeInTheDocument();
    await expect(c.queryByRole('button', { name: 'Page 3' })).not.toBeInTheDocument();
    expect(pageWindow(7, 14)).toEqual([1, 'gap', 6, 7, 8, 'gap', 14]);
  },
};

export const SinglePage: Story = {
  args: { pageCount: 1, summary: '1 to 12 of 12 visitors' },
};
