import React from 'react';
import MiniNav from '@/shared/ui/MiniNav';
import AskPopo from '../components/AskPopoButton'
import StatusBox from '../components/StatusBox';
import ModeToggleButton from '../components/ModeToggleButton';
import { Textbox } from '../components/Textbox';

const MindmapPage: React.FC = () => {
  
  return(
    <div className='bg-dotted font-paperlogy p-6 h-screen'> 
      <div>
        <MiniNav />
      </div>
      <div className='fixed bottom-4 right-4 z-50'>
        <AskPopo />
      </div>
      <div className='fixed top-4 right-4 z-50'>
        <StatusBox />
      </div>
      <div className='fixed top-4 left-1/2 -translate-x-1/2 z-50'>
        <ModeToggleButton />
      </div>
      <div className='fixed bottom-16 left-1/2 -translate-x-1/2 z-50 w-[min(92vw,48rem)] px-4'>
        <Textbox />
      </div>
    </div>
  );
};

export default MindmapPage;