import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Dialog } from '@headlessui/react';
import InfiniteScroll from 'react-infinite-scroll-component';
import 'tailwindcss/tailwind.css';
import BlurFade from '../src/components/ui/blur-fade';

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

  const downloadImage = (url) => {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'perrito.jpg'); // You can customize the file name here
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="font-sans text-center">
      <main className="p-4">
        <InfiniteScroll
          dataLength={dogs.length}
          next={fetchDogs}
          hasMore={true}
          loader={<p>Cargando más imágenes de perritos...</p>}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {dogs.map((dog, index) => (
            <BlurFade key={index} delay={index * 0.05} duration={0.2}>
              <img
                src={dog}
                alt="Perrito"
                className="w-full h-48 object-cover rounded-lg shadow-md cursor-pointer"
                onClick={() => openModal(dog)}
              />
            </BlurFade>
          ))}
        </InfiniteScroll>
      </main>
      {selectedDog && (
        <Dialog open={isOpen} onClose={closeModal} className="fixed inset-0 z-10 overflow-y-auto">
          {/* Backdrop with blur and opacity */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true"></div>
          {/* Modal content, no blur */}
          <div className="relative flex items-center justify-center min-h-screen z-20">
            <div className="bg-black w-full h-full sm:bg-white sm:rounded-lg sm:p-2 sm:max-w-6xl sm:w-full sm:mx-4 sm:h-auto">
              <button
                onClick={closeModal}
                className="absolute right-4 top-4 text-white sm:text-black text-4xl font-bold bg-gray-800 sm:bg-gray-200 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center hover:bg-gray-700 sm:hover:bg-gray-300 z-30"
              >
                &times;
              </button>
              <img
                src={selectedDog}
                alt="Perrito ampliado"
                className="w-full h-full object-contain mx-auto"
              />
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
