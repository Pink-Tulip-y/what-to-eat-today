import { useState, useCallback } from 'react';
import type { PageStep, SelectedLocation } from './types';
import { useHistory } from './useHistory';
import Onboarding from './components/Onboarding';
import LocationInput from './components/LocationInput';
import DietaryForm from './components/DietaryForm';
import SpinningWheel from './components/SpinningWheel';
import CategoryConfirm from './components/CategoryConfirm';
import RestaurantList from './components/RestaurantList';
import './App.css';

export default function App() {
  const [step, setStep] = useState<PageStep>('location');
  const [location, setLocation] = useState<SelectedLocation | null>(null);
  const [excludes, setExcludes] = useState<string[]>([]);
  const [category, setCategory] = useState('');
  const history = useHistory();

  const handleLocation = useCallback((loc: SelectedLocation) => {
    setLocation(loc);
    setStep('dietary');
  }, []);

  const handleDietary = useCallback((ex: string[]) => {
    setExcludes(ex);
    setStep('wheel');
  }, []);

  const handleWheelResult = useCallback((cat: string) => {
    setCategory(cat);
    setStep('confirm');
  }, []);

  const handleAccept = useCallback(() => {
    if (location) {
      history.add({ location: location.name, category });
    }
    setStep('results');
  }, [location, category, history]);

  const handleReroll = useCallback(() => {
    setStep('wheel');
  }, []);

  const handleRestart = useCallback(() => {
    setLocation(null);
    setExcludes([]);
    setCategory('');
    setStep('location');
  }, []);

  const handleHistorySelect = useCallback((entry: { location: string; category: string }) => {
    setLocation({ name: entry.location, lat: 0, lng: 0 });
    setExcludes([]);
    setCategory(entry.category);
    setStep('results');
  }, []);

  return (
    <>
      <Onboarding />

      {step === 'location' && (
        <>
          <LocationInput onNext={handleLocation} />
          {history.items.length > 0 && (
            <div className="history-section" style={{ padding: '0 20px' }}>
              <div className="history-header">
                <span className="history-title">最近搜索</span>
                <button className="history-clear" onClick={history.clear}>清空</button>
              </div>
              <div className="history-chips">
                {history.items.slice(0, 6).map((e, i) => (
                  <button
                    key={i}
                    className="history-chip"
                    onClick={() => handleHistorySelect(e)}
                  >
                    {e.category} · {e.location.length > 10 ? e.location.slice(0, 10) + '...' : e.location}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {step === 'dietary' && (
        <DietaryForm
          onNext={handleDietary}
          onBack={() => setStep('location')}
        />
      )}
      {step === 'wheel' && (
        <SpinningWheel
          onResult={handleWheelResult}
          onBack={() => setStep('dietary')}
        />
      )}
      {step === 'confirm' && (
        <CategoryConfirm
          category={category}
          onAccept={handleAccept}
          onReroll={handleReroll}
        />
      )}
      {step === 'results' && location && (
        <RestaurantList
          location={location}
          category={category}
          excludes={excludes}
          onBack={handleReroll}
          onRestart={handleRestart}
        />
      )}
    </>
  );
}
