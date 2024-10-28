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

  const fetchAnimals = useCallback(async () => {
    setLoading(true);
    try {
      const dogsResponse = await axios.get('https://dog.ceo/api/breeds/image/random/10');
      const catsResponse = await axios.get('https://api.thecatapi.com/v1/images/search?limit=10');

      const newDogs = dogsResponse.data.message;
      const newCats = catsResponse.data.map(cat => cat.url);
      
      // Combine and shuffle only the new animals
      const newAnimals = [...newDogs, ...newCats].sort(() => Math.random() - 0.5);
      
      setCombinedAnimals(prev => [...prev, ...newAnimals]);
    } catch (error) {
      console.error('Error fetching animals:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAnimals();
  }, [fetchAnimals]);

  const openModal = useCallback((animal, e) => {
    e?.preventDefault();
    setSelectedAnimal(animal);
    setIsOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeModal = useCallback((e) => {
    e?.preventDefault();
    setIsOpen(false);
    setTimeout(() => {
      setSelectedAnimal(null);
      document.body.style.overflow = 'unset';
    }, 200);
  }, []);

  return (
    <div className="font-sans text-center">
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
              key={`${animal}-${index}`} 
              delay={index * 0.02}
              duration={0.1}
              blur="4px"
              yOffset={4}
            >
              <img
                src={animal}
                alt="Animal"
                className="w-full h-48 object-cover rounded-lg shadow-md cursor-pointer"
                onClick={(e) => openModal(animal, e)}
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
                className="w-full h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
