import React from 'react';
import AskPopo from '../components/AskPopoButton'

const MindmapPage: React.FC = () => {
  
  return(
    <div className='bg-dotted font-paperlogy m-6 min-h-screen'> 
      <h1> Mindmap Page </h1> 
      <AskPopo />
    </div>
  );
};

export default MindmapPage;