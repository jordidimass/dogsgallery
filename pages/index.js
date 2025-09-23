import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Dialog } from '@headlessui/react';
import InfiniteScroll from 'react-infinite-scroll-component';
import BlurFade from '@/components/ui/blur-fade';

export default function Home() {
  const [combinedAnimals, setCombinedAnimals] = useState([]); // New state for combined animals
  const [loading, setLoading] = useState(true);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'dogs', 'cats'
  const requestIdRef = useRef(0);
  const prefillAttemptsRef = useRef(0);
  const isAnimatedUrl = (url) => /\.gif(\?|$)/i.test(url || "");

  const fetchAnimals = useCallback(async () => {
    const currentId = ++requestIdRef.current;
    setLoading(true);
    try {
      const dogsPromise = (filter === 'all' || filter === 'dogs')
        ? fetch('https://dog.ceo/api/breeds/image/random/10').then((r) => r.json())
        : Promise.resolve(null);
      const catsPromise = (filter === 'all' || filter === 'cats')
        ? fetch('https://api.thecatapi.com/v1/images/search?limit=10').then((r) => r.json())
        : Promise.resolve(null);

      const [dogsData, catsData] = await Promise.all([dogsPromise, catsPromise]);

      const newDogs = dogsData?.message ? dogsData.message.map((url) => ({ url, type: 'dog' })) : [];
      const newCats = Array.isArray(catsData) ? catsData.map((cat) => ({ url: cat.url, type: 'cat' })) : [];
      const newAnimals = [...newDogs, ...newCats].sort(() => Math.random() - 0.5);

      if (currentId !== requestIdRef.current) return; // stale response, do not update
      setCombinedAnimals((prev) => [...prev, ...newAnimals]);
    } catch (error) {
      console.error('Error fetching animals:', error);
    } finally {
      if (currentId === requestIdRef.current) setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchAnimals();
  }, [fetchAnimals]);

  // Prefill more items after load until the page becomes scrollable,
  // capped to avoid excessive requests on tall viewports.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const doc = document.documentElement;
    const isScrollable = doc.scrollHeight > window.innerHeight + 1;
    if (!loading && !isScrollable && prefillAttemptsRef.current < 5) {
      prefillAttemptsRef.current += 1;
      fetchAnimals();
    }
  }, [combinedAnimals.length, loading, fetchAnimals]);

  const handleFilterChange = useCallback((newFilter) => {
    if (newFilter !== filter) {
      setFilter(newFilter);
      setCombinedAnimals([]); // Clear current animals when filter changes
      prefillAttemptsRef.current = 0; // reset prefill attempts per filter
    }
  }, [filter]);

  const openModal = useCallback((animal, e) => {
    e?.preventDefault();
    setSelectedAnimal(animal);
    setIsOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeModal = useCallback((e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    setIsOpen(false);
    setTimeout(() => {
      setSelectedAnimal(null);
      document.body.style.overflow = 'unset';
    }, 200);
  }, []);

  return (
    <div className="font-sans text-center">
      {/* Filter Buttons */}
      <div className="sticky top-0 bg-black/70 backdrop-blur-lg shadow-lg z-40 py-4">
        <div className="flex justify-center gap-1">
          {[
            { key: 'all', label: 'Todos' },
            { key: 'dogs', label: 'Perritos' },
            { key: 'cats', label: 'Gatitos' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleFilterChange(key)}
              className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                filter === key
                  ? 'text-white border-b-2 border-white'
                  : 'text-gray-300 hover:text-white/90'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      
      <main className="p-4">
        <InfiniteScroll
          key={filter}
          dataLength={combinedAnimals.length}
          next={fetchAnimals}
          hasMore={true}
          loader={<p>Cargando más animales...</p>}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {combinedAnimals.map((animal, index) => (
            <BlurFade 
              key={`${animal.url}-${index}`} 
              delay={index * 0.02}
              duration={0.1}
              blur="4px"
              yOffset={4}
            >
              <div className="relative w-full h-48">
                <Image
                  src={animal.url}
                  alt={animal.type === 'dog' ? 'Perrito' : 'Gatito'}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover rounded-lg shadow-md cursor-pointer"
                  onClick={(e) => openModal(animal, e)}
                  unoptimized={animal.type === 'cat' || isAnimatedUrl(animal.url)}
                />
              </div>
            </BlurFade>
          ))}
        </InfiniteScroll>
      </main>

      {selectedAnimal && (
        <Dialog
          open={isOpen}
          onClose={closeModal}
          className="fixed inset-0 z-50"
        >
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
            onClick={(e) => closeModal(e)}
          />
          <div className="fixed inset-0 flex items-center justify-center" onClick={(e) => closeModal(e)}>
            <Dialog.Panel className="relative w-[calc(100vw-2rem)] h-[calc(100vh-2rem)]" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={(e) => closeModal(e)}
                className="absolute right-4 top-4 text-white text-4xl font-bold bg-black/50 rounded-full w-12 h-12 flex items-center justify-center hover:bg-black/70 z-50"
              >
                &times;
              </button>
              <div className="relative w-full h-full">
                <Image
                  src={selectedAnimal.url}
                  alt="Animal ampliado"
                  fill
                  className="object-contain"
                  priority
                  unoptimized
                />
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </div>
  );
}
