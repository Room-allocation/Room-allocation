import { useState } from 'react';

function RoomSearch() {
  const [searchParams, setSearchParams] = useState({
    date: '',
    startHour: '',
    endHour: '',
    capacity: '',
    roomType: '',
    hasProjector: false
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // const handleSearch = (e) => {
  //   if (e) e.preventDefault();
  //   if (!searchParams.date || !searchParams.startHour || !searchParams.endHour) {
  //       alert("נא למלא תאריך ושעות לחיפוש");
  //       return;
  //   }
  //   setLoading(true);

  //   const query = new URLSearchParams(searchParams).toString();
  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    // יצירת אובייקט נקי ללא undefined וללא ערכים ריקים
    const params = {};
    if (searchParams.date) params.date = searchParams.date;
    if (searchParams.startHour) params.startHour = searchParams.startHour;
    if (searchParams.endHour) params.endHour = searchParams.endHour;
    if (searchParams.capacity) params.capacity = searchParams.capacity;
    if (searchParams.roomType) params.roomType = searchParams.roomType;
    if (searchParams.hasProjector) params.hasProjector = searchParams.hasProjector;

    const query = new URLSearchParams(params).toString();

    fetch(`http://localhost:5000/api/rooms/search?${query}`)
    // ... המשך הקוד
    fetch(`http://localhost:5000/api/rooms/search?${query}`)
      .then(res => res.json())
      .then(data => {
        setResults(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleAssign = (roomId) => {
    const subject = prompt("הזיני את שם השיעור/האירוע:");

    // אם המשתמשת לחצה ביטול או השאירה ריק
    if (!subject || subject.trim() === "") {
      alert("⚠️ לא הוזן שם לשיעור, לכן השיבוץ לא בוצע.");
      return;
    }

    const assignmentData = {
      date: searchParams.date,
      startHour: searchParams.startHour.toString(),
      endHour: searchParams.endHour.toString(),
      room: roomId,
      subject: subject,
      bookedBy: {
        operatorName: "מערכת",
        phone: "000-0000000",
        eventType: "שיעור"
      }
    };

    fetch(`http://localhost:5000/api/assignments/temporary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assignmentData)
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "שגיאה בשיבוץ");
        return data;
      })
      .then((data) => {
        alert("✅ השיבוץ בוצע בהצלחה!");
        handleSearch(); // מרענן את הרשימה והחדר ייעלם
      })
      .catch(err => {
        alert("❌ שגיאה: " + err.message);
      });
  };



  return (
    <div style={{ direction: 'rtl', padding: '20px', fontFamily: 'Arial' }}>
      <h2>🔍 חיפוש חדר פנוי</h2>

      <form onSubmit={handleSearch} style={formStyle}>
        <div style={inputGroupStyle}>
          <label>תאריך:</label>
          <input type="date" required onChange={e => setSearchParams({ ...searchParams, date: e.target.value })} />
        </div>

        <div style={inputGroupStyle}>
          <label>משעה:</label>
          {/* שינוי מ-number ל-time */}
          <input type="time" required onChange={e => setSearchParams({ ...searchParams, startHour: e.target.value })} />
        </div>
        <div style={inputGroupStyle}>
          <label>עד שעה:</label>
          {/* שינוי מ-number ל-time */}
          <input type="time" required onChange={e => setSearchParams({ ...searchParams, endHour: e.target.value })} />
        </div>

        <div style={inputGroupStyle}>
          <label>מקומות:</label>
          <input type="number" placeholder="מינימום" onChange={e => setSearchParams({ ...searchParams, capacity: e.target.value })} />
        </div>

        <select style={selectStyle} onChange={e => setSearchParams({ ...searchParams, roomType: e.target.value })}>
          <option value="">כל סוגי החדרים</option>
          <option value="מחשבים">מחשבים</option>
          <option value="רגיל">רגיל</option>
          <option value="אולם">אולם</option>
        </select>

        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
          <input type="checkbox" onChange={e => setSearchParams({ ...searchParams, hasProjector: e.target.checked })} />
          צריך מקרן?
        </label>

        <button type="submit" style={btnSearchStyle}>חפשי חדר</button>
      </form>

      <hr />

      <h3>תוצאות חיפוש:</h3>
      {loading && <p>מחפש חדרים מתאימים...</p>}
      <div style={{ display: 'grid', gap: '15px' }}>
        {results.length > 0 ? results.map(room => (
          <div key={room._id} style={roomCardStyle}>
            <div>
              <strong style={{ fontSize: '1.1em' }}>{room.name}</strong> - {room.roomType} (קומה {room.floor})
              <br />
              <small>קיבולת: {room.capacity} | אגף: {room.wing} {room.hasProjector ? " | 📽️ כולל מקרן" : ""}</small>
            </div>
            <button onClick={() => handleAssign(room._id)} style={btnAssignStyle}>
              ✅ שבצי לזמן זה
            </button>
          </div>
        )) : !loading && searchParams.date && <p>לא נמצאו חדרים פנויים העונים על הדרישות.</p>}
      </div>
    </div>
  );
}

// עיצובים משופרים
const formStyle = { display: 'flex', flexWrap: 'wrap', gap: '15px', backgroundColor: '#f4f7f6', padding: '20px', borderRadius: '12px', alignItems: 'flex-end', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' };
const inputGroupStyle = { display: 'flex', flexDirection: 'column', gap: '5px' };
const selectStyle = { padding: '8px', borderRadius: '4px', border: '1px solid #ccc' };
const btnSearchStyle = { backgroundColor: '#3498db', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const btnAssignStyle = { backgroundColor: '#27ae60', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', transition: '0.3s' };
const roomCardStyle = { border: '1px solid #eee', padding: '15px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' };

export default RoomSearch;