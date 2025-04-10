import SearchPanel from '@/components/SearchPanel';
import MapPanel from '@/components/MapPanel';

const Home = () => {
  return (
    <div className='home-page flex bg-stone-200 h-screen'>
      <SearchPanel />
      <MapPanel />
    </div>
  );
};

export default Home;
