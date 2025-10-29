import "./index.css";
import { Button } from "./components/ui/button";

function App() {
  return (
    <div className="bg-dotted bg-size-dotted flex min-h-svh flex-col items-center justify-center gap-4">
      <div className="font-paperlogy">
        <p className="text-2xl font-bold mb-4">Button 테스트</p>
      </div>

      <div className="flex gap-2">
        <Button>Default Button</Button>
        <Button variant="danger">Danger Button</Button>
        <Button variant="outline">Outline Button</Button>
        <Button variant="ghost">Ghost Button</Button>
        <Button variant="link">Link Button</Button>
      </div>

      <div className="flex gap-2">
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
        <Button size="icon">🎨</Button>
      </div>

      <div className="flex gap-2">
        <Button disabled>Disabled</Button>
        <Button variant="danger" disabled>
          Disabled Danger
        </Button>
      </div>
    </div>
  );
}

export default App;
