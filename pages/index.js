import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Dialog } from '@headlessui/react';
import InfiniteScroll from 'react-infinite-scroll-component';
import 'tailwindcss/tailwind.css';

export default function Home() {
  const [dogs, setDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDog, setSelectedDog] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const fetchDogs = useCallback(async () => {
    setLoading(true);
    const response = await axios.get('https://dog.ceo/api/breeds/image/random/30');
    setDogs((prevDogs) => [...prevDogs, ...response.data.message]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDogs();
  }, [fetchDogs]);

  const openModal = (dog) => {
    setSelectedDog(dog);
    setIsOpen(true);
  };

  const closeModal = () => {
    setSelectedDog(null);
    setIsOpen(false);
  };

  return (
    <div className="font-sans text-center">
      <header className="bg-green-500 text-white py-4">
        <h1>¡Bienvenido a la página de perritos!</h1>
      </header>
      <main className="p-4">
      <InfiniteScroll
        dataLength={dogs.length}
        next={fetchDogs}
        hasMore={true}
        loader={<p>Cargando más imágenes de perritos...</p>}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
          {dogs.map((dog, index) => (
            <img
              key={index}
              src={dog}
              alt="Perrito"
              className="w-full h-48 object-cover rounded-lg shadow-md cursor-pointer"
              onClick={() => openModal(dog)}
            />
          ))}
        </InfiniteScroll>
      </main>
      {selectedDog && (
        <Dialog open={isOpen} onClose={closeModal} className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="bg-white rounded-lg p-2 max-w-6xl w-full mx-4">
              <button
                onClick={closeModal}
                className="absolute right-4 top-4 text-black text-2xl font-bold"
              >
                &times;
              </button>
              <img
                src={selectedDog}
                alt="Perrito ampliado"
                className="w-full h-[90vh] object-contain mx-auto"
              />
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
