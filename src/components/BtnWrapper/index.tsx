import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import useStore, {
  resetSearch,
  setGeoToken,
  setGeoData,
  resetGeoData,
  setErrMsg,
  StoreState,
  RETRY_TIMES,
} from '@/store/store';
import useFetch, { isServerError } from '@/hooks/useFetch';
import { parseGeoJSON } from '@/lib/geo';
import { BTN_TEXT, ERR_TEXT } from '@/constants/text';
import { TokenRes, RouteRes } from './type';
import { STATUS, getRouteUrl } from '@/constants/api';

// if the search input has invalid
const checkIsInvalid = () => {
  let isValid = false;

  useStore.setState((state) => {
    const errorObj: Record<string, object> = {};

    (Object.keys(state.search) as (keyof StoreState['search'])[]).forEach((key) => {
      if (!state.search[key].value) {
        errorObj[key] = {
          ...state.search[key],
          error: [ERR_TEXT.EMPTY],
        };
        isValid = true;
      }
    });

    return {
      search: {
        ...state.search,
        ...errorObj,
      },
    };
  });

  return isValid;
};

const BtnWrapper = () => {
  const { origin, destination } = useStore.use.search();
  const geoToken = useStore.use.geoToken();
  const errMsg = useStore.use.errMsg();

  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // handle submit
  const onSubmit = async () => {
    // reset result
    onReset(true);

    if (checkIsInvalid()) return;

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
      setErrMsg(ERR_TEXT.SERVER_ERR);
    } else {
      setErrMsg(ERR_TEXT.OTHER_ERR);
    }
  }, [errToken, errData]);

  useEffect(() => {
    if (!resData) return;

    setIsSubmitting(false);

    if (resData.status !== STATUS.SUCCESS) {
      if (resData.status === STATUS.BUSY) {
        // retry 3 times
        if (geoToken.retry) {
          setIsSubmitting(true);
          setGeoToken({
            stamp: new Date().getTime().toString(),
            retry: geoToken.retry - 1,
          });
        } else {
          setErrMsg(ERR_TEXT.SERVER_BUSY);
        }
      } else if (resData.status === STATUS.FAIL) {
        setErrMsg(resData.error || ERR_TEXT.SERVER_ERR);
      }

      return;
    }

    setGeoData({
      path: parseGeoJSON(resData.path),
      total_distance: resData.total_distance,
      total_time: resData.total_time,
    });
    errMsg && setErrMsg('');
  }, [resData]);

  // Reset value and result
  const onReset = (onlyResult: boolean = false) => {
    !onlyResult && resetSearch();
    resetGeoData();
    errMsg && setErrMsg('');
  };

  return (
    <div className='button-wrapper flex'>
      <Button type='submit' onClick={onSubmit} disabled={isSubmitting} className='mr-8'>
        {isSubmitting ? <Loader2 className='animate-spin' /> : null}
        {BTN_TEXT.SUBMIT}
      </Button>
      <Button variant='outline' onClick={() => onReset()}>
        {BTN_TEXT.RESET}
      </Button>
    </div>
  );
};

export default BtnWrapper;
