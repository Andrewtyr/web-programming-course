import Task4 from './tasks/Task4';
import { Auth } from '@course/auth-component';

function App() {
  

  return (
    <Auth>
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <Task4 />
      </div>
    </Auth>
  );
}

export default App;