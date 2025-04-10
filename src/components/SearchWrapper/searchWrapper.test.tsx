import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import SearchWrapper from './index';
import { SEARCH_TEXT, ERR_TEXT } from '@/constants/text';

describe('SearchWrapper Test', () => {
  const mockProps = {
    searchKey: 'origin' as const,
    labelText: 'Start',
    value: '',
    errorList: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Test basic', () => {
    render(<SearchWrapper {...mockProps} />);

    expect(screen.getByText(mockProps.labelText)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(SEARCH_TEXT.PLACEHOLDER)).toBeInTheDocument();
  });

  it('Test input', () => {
    const propsWithValue = { ...mockProps, value: 'Beijing' };
    render(<SearchWrapper {...propsWithValue} />);

    const input = screen.getByPlaceholderText(SEARCH_TEXT.PLACEHOLDER) as HTMLInputElement;
    expect(input.value).toBe('Beijing');
  });

  it('Test show clear icon', () => {
    const propsWithValue = { ...mockProps, value: '北京' };
    render(<SearchWrapper {...propsWithValue} />);

    expect(screen.getByText('', { selector: 'svg' })).toBeInTheDocument();
  });

  it('Test show err', () => {
    const propsWithErrors = {
      ...mockProps,
      errorList: [ERR_TEXT.EMPTY],
    };
    render(<SearchWrapper {...propsWithErrors} />);

    expect(screen.getByText(ERR_TEXT.EMPTY)).toBeInTheDocument();
    expect(screen.getAllByText(/Can\'t be empty/)).toHaveLength(1);
  });

  it('Test no show err', () => {
    render(<SearchWrapper {...mockProps} />);

    expect(screen.queryByText(/Can\'t be empty/)).not.toBeInTheDocument();
  });
});
