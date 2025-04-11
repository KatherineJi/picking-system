import SearchWrapper from '@/components/SearchWrapper';
import { SEARCH_TEXT } from '@/constants/text';
import TipsWrapper from '@/components/TipsWrapper';
import BtnWrapper from '@/components/BtnWrapper';

const SearchPanel = () => {
  return (
    <div className='search-panel w-full h-auto z-100 absolute flex md:w-96 md:h-screen'>
      <div className='bg-white m-2 w-full rounded-sm p-4 flex flex-col gap-8'>
        <SearchWrapper searchKey={'origin'} labelText={SEARCH_TEXT.ORIGIN} />
        <SearchWrapper searchKey={'destination'} labelText={SEARCH_TEXT.DESTINATION} />

        <TipsWrapper />

        <BtnWrapper />
      </div>
    </div>
  );
};

export default SearchPanel;
