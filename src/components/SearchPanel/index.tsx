import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import SearchWrapper from '@/components/SearchWrapper';
import useStore, { RETRY_TIMES } from '@/store/store';
import useFetch, { isServerError } from '@/hooks/useFetch';
import { parseGeoJSON } from '@/lib/geo';
import { SEARCH_TEXT, BTN_TEXT, RESULT_TEXT, ERR_TEXT } from '@/constants/text';
import { TokenRes, RouteRes } from './type';
import { getRouteUrl } from '@/constants/api';

const SearchPanel = () => {
  const {
    search: { origin, destination },
    geoToken,
    setSearchError,
    resetSearch,
    setGeoToken,
    geoData,
    setGeoData,
    resetGeoData,
  } = useStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverErrMsg, setServerErrMsg] = useState('');

  const {
    data: resToken,
    error: errToken,
    execute: executeFetchToken,
  } = useFetch<TokenRes>(getRouteUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    immediate: false,
  });

  const { data: resData, error: errData } = useFetch<RouteRes>(
    `${getRouteUrl}/${geoToken.token}?timestamp=${geoToken.stamp}`,
    {
      immediate: !!geoToken.token,
    },
  );

  // if the search input has invalid
  const hasInvalid = () => {
    let invalid = false;
    // 前置校验
    if (!origin.value) {
      setSearchError('origin', [ERR_TEXT.EMPTY]);
      invalid = true;
    }
    if (!destination.value) {
      setSearchError('destination', [ERR_TEXT.EMPTY]);
      invalid = true;
    }
    return invalid;
  };

  // handle submit
  const onSubmit = async () => {
    // reset result
    onReset(true);

    if (hasInvalid()) return;

    setIsSubmitting(true);

    const body = {
      origin: origin.value,
      destination: destination.value,
    };

    executeFetchToken(JSON.stringify(body));
  };

  useEffect(() => {
    if (!resToken) return;

    setGeoToken({
      token: resToken.token,
      stamp: new Date().getTime().toString(),
      retry: RETRY_TIMES,
    });
  }, [resToken]);

  useEffect(() => {
    if (!errToken && !errData) return;

    setIsSubmitting(false);

    // server error
    if (isServerError(errToken) || isServerError(errData)) {
      setServerErrMsg(ERR_TEXT.SERVER_ERR);
    } else {
      setServerErrMsg(ERR_TEXT.OTHER_ERR);
    }
  }, [errToken, errData]);

  useEffect(() => {
    if (!resData) return;

    setIsSubmitting(false);

    console.log('resData', resData);
    if (resData.status !== 'success') {
      if (resData.status === 'in progress') {
        // 重试三次
        if (geoToken.retry) {
          setIsSubmitting(true);
          setGeoToken({
            stamp: new Date().getTime().toString(),
            retry: geoToken.retry - 1,
          });
        } else {
          setServerErrMsg(ERR_TEXT.SERVER_BUSY);
        }
      } else if (resData.status === 'failure') {
        setServerErrMsg(resData.error || ERR_TEXT.SERVER_ERR);
      }

      return;
    }

    setGeoData({
      path: parseGeoJSON(resData.path),
      total_distance: resData.total_distance,
      total_time: resData.total_time,
    });
    setServerErrMsg('');
  }, [resData]);

  // Reset value and result
  const onReset = (onlyResult: boolean = false) => {
    if (!onlyResult) resetSearch();
    resetGeoData();
    setServerErrMsg('');
  };

  return (
    <div className='search-panel w-96 bg-white m-2 rounded-sm p-4 absolute z-100 h-screen flex flex-col gap-8'>
      <SearchWrapper
        searchKey={'origin'}
        labelText={SEARCH_TEXT.ORIGIN}
        value={origin.value}
        errorList={origin.error}
      />
      <SearchWrapper
        searchKey={'destination'}
        labelText={SEARCH_TEXT.DESTINATION}
        value={destination.value}
        errorList={destination.error}
      />

      <div className='tips-wrapper w-full h-48 bg-gray-200'>
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
        {serverErrMsg && <div className='text-red-500'>{serverErrMsg}</div>}
      </div>

      <div className='button-wrapper flex justify-center'>
        <Button type='submit' onClick={onSubmit} disabled={isSubmitting} className='mr-4'>
          {isSubmitting ? <Loader2 className='animate-spin' /> : null}
          {BTN_TEXT.SUBMIT}
        </Button>
        <Button variant='outline' onClick={() => onReset()}>
          {BTN_TEXT.RESET}
        </Button>
      </div>
    </div>
  );
};

export default SearchPanel;
