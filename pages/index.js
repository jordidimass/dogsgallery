import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Dialog } from '@headlessui/react';
import InfiniteScroll from 'react-infinite-scroll-component';
import BlurFade from '@/components/ui/blur-fade';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export default function Home() {
  const [combinedAnimals, setCombinedAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all');
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

      if (currentId !== requestIdRef.current) return;
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
      setCombinedAnimals([]);
      prefillAttemptsRef.current = 0;
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
    <div className="min-h-screen bg-black text-white font-sans">
      <div className="sticky top-0 bg-black/80 backdrop-blur-xl shadow-lg z-40 py-4 px-4">
        <div className="flex justify-center gap-2">
          {[
            { key: 'all', label: 'Todos' },
            { key: 'dogs', label: 'Perritos' },
            { key: 'cats', label: 'Gatitos' }
          ].map(({ key, label }) => (
            <Button
              key={key}
              type="button"
              variant="ghost"
              onClick={() => handleFilterChange(key)}
              className={`px-4 py-2 text-sm font-medium transition-all duration-500 rounded-full border border-white/10 ${
                filter === key
                  ? 'text-white bg-white/10 shadow-[0_10px_25px_rgba(0,0,0,0.35)]'
                  : 'text-gray-300/90 hover:text-white/90 hover:bg-white/5'
              }`}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>
      
      <main className="p-4 sm:p-6 lg:p-10">
        <div className="mb-6 text-center">
        </div>
        <InfiniteScroll
          key={filter}
          dataLength={combinedAnimals.length}
          next={fetchAnimals}
          hasMore={true}
          loader={<p className="text-center text-sm text-white/70">Cargando mas animales...</p>}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {combinedAnimals.map((animal, index) => (
            <BlurFade 
              key={`${animal.url}-${index}`} 
              delay={index * 0.02}
              duration={0.25}
              blur="6px"
              yOffset={5}
            >
              <div className="group relative w-full h-56 sm:h-64 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/0 to-white/5 cursor-zoom-in">
                <Image
                  src={animal.url}
                  alt={animal.type === 'dog' ? 'Perrito' : 'Gatito'}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition duration-700 ease-out group-hover:scale-105"
                  onClick={(e) => openModal(animal, e)}
                  unoptimized={animal.type === 'cat' || isAnimatedUrl(animal.url)}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="pointer-events-none absolute inset-0 flex flex-col justify-end p-4" />
              </div>
            </BlurFade>
          ))}
        </InfiniteScroll>
      </main>

      {selectedAnimal && (
        <Dialog open={isOpen} onClose={closeModal} className="fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur"
            aria-hidden="true"
            onClick={closeModal}
          />
          <div className="fixed inset-0 flex items-center justify-center px-4 py-6">
            <Dialog.Panel
              className="relative w-full"
              onClick={closeModal}
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Cerrar"
                className="absolute right-6 top-6 border border-white/30 bg-black/50 text-white hover:bg-black/70"
                onClick={(e) => {
                  e.stopPropagation();
                  closeModal(e);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
              <div
                className="relative mx-auto h-[calc(100vh-4rem)] w-full max-w-6xl"
                onClick={(e) => e.stopPropagation()}
              >
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
