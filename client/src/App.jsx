// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App


import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import RoomList from './components/RoomList';
import RoomSearch from './components/RoomSearch';

function App() {
  return (
    <Router>
      <div style={{ direction: 'rtl', fontFamily: 'Arial', padding: '20px' }}>
        <nav style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f4f4f4', borderRadius: '8px' }}>
          <Link to="/" style={{ marginLeft: '20px', textDecoration: 'none', color: '#007bff', fontWeight: 'bold' }}>📋 רשימת חדרים</Link>
          <Link to="/search" style={{ textDecoration: 'none', color: '#007bff', fontWeight: 'bold' }}>🔍 חיפוש חדר</Link>
        </nav>

        <h1>מערכת הזמנת חדרים</h1>

        <Routes>
          <Route path="/" element={<RoomList />} />
          <Route path="/search" element={<RoomSearch />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;