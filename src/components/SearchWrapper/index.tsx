import { ChangeEvent } from 'react';
import { X } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useStore from '@/store/store';
import { SEARCH_TEXT } from '@/constants/text';

type Props = {
  searchKey: 'origin' | 'destination';
  labelText: string;
  value: string;
  errorList: string[];
};

const SearchWrapper = (props: Props) => {
  const { searchKey, labelText, value, errorList } = props;

  const { setSearchValue } = useStore();

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(searchKey, e.target.value);
  };

  const onClear = () => {
    setSearchValue(searchKey, '');
  };

  return (
    <>
      <div className='flex flex-col gap-4'>
        <Label>{labelText}</Label>
        <div className='flex relative'>
          <Input placeholder={SEARCH_TEXT.PLACEHOLDER} value={value} onChange={onChange} />
          {value && (
            <X
              className='absolute right-3 top-0 bottom-0 m-auto cursor-pointer'
              onClick={onClear}
            />
          )}
        </div>
        {errorList.map((err) => (
          <div className='text-red-500'>{err}</div>
        ))}
      </div>
    </>
  );
};

export default SearchWrapper;
