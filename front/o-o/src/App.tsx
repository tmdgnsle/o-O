import AppRouter from "@/app/AppRouter";
import "./index.css";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { SessionRestorer } from "./shared/components/SessionRestorer";

// 최상위 컴포넌트
function App() {
  return (
    <Provider store={store}>
      <SessionRestorer />
      <div className="font-paperlogy">
        <AppRouter />
      </div>
    </Provider>
  );
}

export default App;
