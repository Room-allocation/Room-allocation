import { useEffect, useState } from 'react';

function RoomList() {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/rooms')
      .then(res => res.json())
      .then(data => setRooms(data));
  }, []);

  return (
    <div>
      <h2>רשימת חדרים</h2>
      {rooms.length === 0 ? (
        <p>אין חדרים במסד הנתונים</p>
      ) : (
        rooms.map(room => (
          <div key={room._id}>
            <p>{room.name}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default RoomList;