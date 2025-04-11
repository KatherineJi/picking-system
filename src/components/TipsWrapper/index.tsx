import useStore from '@/store/store';
import { RESULT_TEXT } from '@/constants/text';

const TipsWrapper = () => {
  const { geoData, errMsg } = useStore();

  return (
    <div className='tips-wrapper w-full h-12 flex flex-col justify-end md:h-48'>
      {geoData ? (
        <div className=''>
          <div>
            {RESULT_TEXT.DISTANCE}: {geoData.total_distance}
          </div>
          <div>
            {RESULT_TEXT.TIME}: {geoData.total_time}
          </div>
        </div>
      ) : null}
      {errMsg && <div className='text-red-500'>{errMsg}</div>}
    </div>
  );
};

export default TipsWrapper;
