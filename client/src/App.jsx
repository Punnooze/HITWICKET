import GameBoard from './components/GameBoard';

function App() {
  return (
    <div className="p-10 h-[100vh]">
      <h1 className="text-3xl mb-5">5x5 Game Board</h1>
      <GameBoard />
    </div>
  );
}

export default App;
