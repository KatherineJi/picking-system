import React from 'react';
import { X } from 'lucide-react';

import { Label } from '@/components/ui/label';
import useStore from '@/store/store';
import { SEARCH_TEXT } from '@/constants/text';
import SearchInput from '../SearchInput';

type Props = {
  searchKey: 'origin' | 'destination';
  labelText: string;
};

const SearchWrapper = React.memo((props: Props) => {
  const { searchKey, labelText } = props;

  const { setSearchValue } = useStore();
  const { value, error } = useStore((state) => state.search[searchKey]);

  const onChange = (v: string) => {
    setSearchValue(searchKey, v);
  };

  const onClear = () => {
    setSearchValue(searchKey, '');
  };

  return (
    <>
      <div className='flex flex-col gap-4'>
        <Label>{labelText}</Label>
        <div className='flex relative'>
          <SearchInput
            value={value}
            onChange={onChange}
            placeholder={SEARCH_TEXT.PLACEHOLDER}
            emptyText={SEARCH_TEXT.EMPTY}
          />
          {/* Original Version */}
          {/* <Input placeholder={SEARCH_TEXT.PLACEHOLDER} value={value} onChange={onChange} /> */}
          {value && (
            <X
              className='absolute right-3 top-0 bottom-0 m-auto cursor-pointer'
              onClick={onClear}
            />
          )}
        </div>
        {error.map((err) => (
          <div className='text-red-500'>{err}</div>
        ))}
      </div>
    </>
  );
});

export default SearchWrapper;
