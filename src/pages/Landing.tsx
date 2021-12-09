import { useState } from "react";
import { useNavigate } from "react-router";

function Landing() {
  const [roomName, setRoomName] = useState("");
  const navigate = useNavigate();

  const handle = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (roomName.length < 4) {
      alert("roomname should be at least 4 character long");
      return;
    }
    navigate(`/${roomName}`);
  };

  return (
    <div className="text-white">
      <div>
        <h1>Welcome</h1>
        <h3>enter room name</h3>
      </div>
      <form onSubmit={handle}>
        <input
          className="text-black"
          type="text"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />
        <div>
          <button type="submit">Enter</button>
        </div>
      </form>
    </div>
  );
}

export default Landing;
