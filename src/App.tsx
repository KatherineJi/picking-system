import SearchPanel from '@/components/SearchPanel';
import MapPanel from '@/components/MapPanel';

const App = () => {
  return (
    <div className='home-page flex bg-stone-200 h-screen'>
      <SearchPanel />
      <MapPanel />
    </div>
  );
};

export default App;
