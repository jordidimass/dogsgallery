import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Dialog } from '@headlessui/react';
import InfiniteScroll from 'react-infinite-scroll-component';
import 'tailwindcss/tailwind.css';
import BlurFade from '../src/components/ui/blur-fade'; // Implied import for BlurFade component

export default function Home() {
  const [combinedAnimals, setCombinedAnimals] = useState([]); // New state for combined animals
  const [loading, setLoading] = useState(true);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'dogs', 'cats'

  const fetchAnimals = useCallback(async () => {
    setLoading(true);
    try {
      let newAnimals = [];
      
      if (filter === 'all' || filter === 'dogs') {
        const dogsResponse = await axios.get('https://dog.ceo/api/breeds/image/random/10');
        const newDogs = dogsResponse.data.message.map(url => ({ url, type: 'dog' }));
        newAnimals = [...newAnimals, ...newDogs];
      }
      
      if (filter === 'all' || filter === 'cats') {
        const catsResponse = await axios.get('https://api.thecatapi.com/v1/images/search?limit=10');
        const newCats = catsResponse.data.map(cat => ({ url: cat.url, type: 'cat' }));
        newAnimals = [...newAnimals, ...newCats];
      }
      
      // Shuffle the new animals
      newAnimals = newAnimals.sort(() => Math.random() - 0.5);
      
      setCombinedAnimals(prev => [...prev, ...newAnimals]);
    } catch (error) {
      console.error('Error fetching animals:', error);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchAnimals();
  }, [fetchAnimals]);

  const handleFilterChange = useCallback((newFilter) => {
    if (newFilter !== filter) {
      setFilter(newFilter);
      setCombinedAnimals([]); // Clear current animals when filter changes
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
              <img
                src={animal.url}
                alt={animal.type === 'dog' ? 'Perrito' : 'Gatito'}
                className="w-full h-48 object-cover rounded-lg shadow-md cursor-pointer"
                onClick={(e) => openModal(animal.url, e)}
              />
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
            role="button"
            tabIndex={0}
          />
          <div className="fixed inset-0 flex items-center justify-center">
            <div className="relative w-full h-full">
              <button
                onClick={(e) => closeModal(e)}
                className="absolute right-4 top-4 text-white text-4xl font-bold bg-black/50 rounded-full w-12 h-12 flex items-center justify-center hover:bg-black/70 z-50"
              >
                &times;
              </button>
              <img
                src={selectedAnimal}
                alt="Animal ampliado"
                className="w-full h-full object-contain p-4"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
