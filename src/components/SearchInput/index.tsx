import { useState, useEffect, useCallback, ChangeEvent } from 'react';
import debounce from 'lodash.debounce';
import { Input } from '@/components/ui/input';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getSearchPlacesUrl } from '@/constants/api';
import { SEARCH_TEXT } from '@/constants/text';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

type SearchResult = {
  id: string;
  label: string;
};

const SearchInput = ({
  value,
  onChange,
  placeholder,
  emptyText,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  emptyText?: string;
}) => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchResults = useCallback(async (query: string) => {
    const placeList = await fetch(
      `${getSearchPlacesUrl}/${query}.json?access_token=${MAPBOX_TOKEN}`,
    ).then((res) => res.json());

    return placeList.features.map((feature: { center: unknown; place_name: unknown }) => {
      return {
        id: feature.center,
        label: feature.place_name,
      };
    });
  }, []);

  const debouncedSearch = useCallback(
    debounce(async (q: string) => {
      if (!q) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      try {
        const data = await fetchResults(q);
        setResults(data);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [],
  );

  const handleChange = (v: string) => {
    onChange(v);
  };

  const handleOriginChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleChange(e.target.value);
  };

  useEffect(() => {
    debouncedSearch(value);
    return () => debouncedSearch.cancel();
  }, [value, debouncedSearch]);

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <span></span>
        </PopoverTrigger>
        <PopoverContent className='w-84 p-0 z-200' align='start'>
          <Command shouldFilter={false}>
            <CommandInput value={value} onValueChange={handleChange} placeholder={placeholder} />
            <CommandList>
              {isLoading ? (
                <CommandEmpty>{SEARCH_TEXT.LOADING}</CommandEmpty>
              ) : (
                <>
                  <CommandEmpty>{emptyText}</CommandEmpty>
                  <CommandGroup>
                    {results.map((item) => (
                      <CommandItem
                        key={item.id}
                        value={item.id}
                        onSelect={() => {
                          onChange(item.label);
                          setIsOpen(false);
                        }}
                      >
                        {item.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <div></div>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Input
        className='pl-3 pr-10'
        value={value}
        onChange={handleOriginChange}
        placeholder={placeholder}
        onClick={() => setTimeout(() => setIsOpen(true), 100)}
      />
    </>
  );
};

export default SearchInput;
