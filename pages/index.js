import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const getJson = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
};

const getAnimalBatch = async (filter, limit = 10) => {
  const allLimit = Math.max(2, Math.ceil(limit / 2));
  const dogsPromise = (filter === 'all' || filter === 'dogs')
    ? getJson(`https://dog.ceo/api/breeds/image/random/${filter === 'all' ? allLimit : limit}`)
    : Promise.resolve(null);
  const catsPromise = (filter === 'all' || filter === 'cats')
    ? getJson(`https://api.thecatapi.com/v1/images/search?mime_types=jpg,png&limit=${filter === 'all' ? allLimit : limit}`)
    : Promise.resolve(null);

  const [dogsData, catsData] = await Promise.all([dogsPromise, catsPromise]);

  const newDogs = dogsData?.message ? dogsData.message.map((url) => ({ url, type: 'dog' })) : [];
  const newCats = Array.isArray(catsData) ? catsData.map((cat) => ({ url: cat.url, type: 'cat' })) : [];

  return [...newDogs, ...newCats]
    .filter((animal) => !/\.gif(\?|$)/i.test(animal.url || ""))
    .sort(() => Math.random() - 0.5);
};

export default function Home({ initialAnimals = [] }) {
  const [combinedAnimals, setCombinedAnimals] = useState(initialAnimals);
  const [loading, setLoading] = useState(initialAnimals.length === 0);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const loadMoreRef = useRef(null);
  const requestIdRef = useRef(0);
  const prefillAttemptsRef = useRef(0);
  const isAnimatedUrl = (url) => /\.gif(\?|$)/i.test(url || "");

  const fetchAnimals = useCallback(async () => {
    const currentId = ++requestIdRef.current;
    setLoading(true);
    try {
      const newAnimals = await getAnimalBatch(filter);

      if (currentId !== requestIdRef.current) return;
      setCombinedAnimals((prev) => [...prev, ...newAnimals]);
    } catch (error) {
      console.error('Error fetching animals:', error);
    } finally {
      if (currentId === requestIdRef.current) setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (combinedAnimals.length === 0) {
      fetchAnimals();
    }
  }, [combinedAnimals.length, fetchAnimals]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const doc = document.documentElement;
    const isScrollable = doc.scrollHeight > window.innerHeight + 1;
    if (!loading && !isScrollable && prefillAttemptsRef.current < 5) {
      prefillAttemptsRef.current += 1;
      fetchAnimals();
    }
  }, [combinedAnimals.length, loading, fetchAnimals]);

  useEffect(() => {
    const loadMoreElement = loadMoreRef.current;
    if (!loadMoreElement || loading) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          fetchAnimals();
        }
      },
      { rootMargin: '300px 0px' }
    );

    observer.observe(loadMoreElement);
    return () => observer.disconnect();
  }, [loading, fetchAnimals]);

  const handleFilterChange = useCallback((newFilter) => {
    if (newFilter !== filter) {
      requestIdRef.current += 1;
      setFilter(newFilter);
      setCombinedAnimals([]);
      prefillAttemptsRef.current = 0;
    }
  }, [filter]);

  const openModal = useCallback((animal, e) => {
    e?.preventDefault();
    setSelectedAnimal(animal);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setSelectedAnimal(null);
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
              className={`px-4 py-2 text-button-14 transition-all duration-500 rounded-full border border-white/10 ${
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {combinedAnimals.map((animal, index) => {
            const isLikelyInitialLcp = index < 2;
            return (
              <div
                key={`${animal.url}-${index}`}
                className="group relative h-56 w-full cursor-zoom-in overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/0 to-white/5 sm:h-64"
              >
                <Image
                  src={animal.url}
                  alt={animal.type === 'dog' ? 'Perrito' : 'Gatito'}
                  fill
                  sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1024px) calc(50vw - 24px), calc(25vw - 28px)"
                  className="object-cover transition duration-700 ease-out group-hover:scale-105"
                  onClick={(e) => openModal(animal, e)}
                  priority={isLikelyInitialLcp}
                  fetchPriority={isLikelyInitialLcp ? 'high' : 'auto'}
                  loading={isLikelyInitialLcp ? 'eager' : 'lazy'}
                  quality={60}
                  unoptimized={isAnimatedUrl(animal.url)}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </div>
            );
          })}
        </div>
        <div ref={loadMoreRef} className="h-16 py-6">
          {loading && <p className="text-center text-sm text-white/70">Cargando mas animales...</p>}
        </div>
      </main>

      {selectedAnimal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Animal ampliado"
          className={`fixed inset-0 z-50 ${isOpen ? '' : 'hidden'}`}
          onKeyDown={(e) => {
            if (e.key === 'Escape') closeModal();
          }}
        >
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center px-4 py-6" onClick={closeModal}>
            <div className="relative w-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Cerrar"
                className="absolute right-4 top-4 z-10 border border-white/30 bg-black/50 text-white hover:bg-white/10 transition-colors duration-200 rounded-lg"
                onClick={closeModal}
              >
                <X className="h-5 w-5" />
              </Button>
              <div className="relative mx-auto h-[calc(100vh-2rem)] w-full">
                <Image
                  src={selectedAnimal.url}
                  alt="Animal ampliado"
                  fill
                  className="object-contain"
                  priority
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export async function getStaticProps() {
  try {
    return {
      props: {
        initialAnimals: await getAnimalBatch('all', 8),
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error('Error fetching initial animals:', error);
    return {
      props: {
        initialAnimals: [],
      },
      revalidate: 15,
    };
  }
}
