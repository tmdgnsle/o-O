import { Button } from '@/components/ui/button';
import AskPopoIcon from '@/shared/assets/images/AskPopo.png';


export default function AskPopo() {
  return (

    <img 
      src={AskPopoIcon} 
      alt="Ask Popo" 
      className="cursor-pointer hover:opacity-80 transition-opacity w-20"
      onClick={() => {
        // 클릭 시 동작
        console.log('Ask Popo clicked!');
      }}
      />

  );
}