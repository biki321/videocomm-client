import { useState } from "react";
import { useNavigate } from "react-router";
import { useSocketContext } from "../contexts/socket-context";
import svg from "../static/svg/undraw_group_video_re_btu7.svg";

function Landing() {
  const [roomName, setRoomName] = useState("");
  const navigate = useNavigate();
  const socket = useSocketContext();

  const handle = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (roomName.length < 4) {
      alert("roomname should be at least 4 character long");
      return;
    }
    socket.emit("roomExist", roomName, (exist: boolean) => {
      if (exist) navigate(`/${roomName}`);
      else alert("room does not exist");
    });
  };

  const createMeeting = () => {
    console.log("createMeeting");
    if (!socket.connected) {
      alert("socket not connected");
      return;
    }

    socket.emit("createRoomName", (createdRoomName: string) => {
      console.log("create room name", createdRoomName);
      navigate(`/${createdRoomName}`);
    });
  };

  return (
    <div
      className="h-screen w-screen bg-white px-4 space-y-10
    overflow-auto flex flex-col justify-center xl:flex xl:flex-row xl:justify-around xl:items-center"
    >
      <div
        className="space-y-4 md:flex md:flex-col md:items-center 
      xl:block"
      >
        <div className="text-3xl md:text-4xl">
          Video conference for Your Class.
        </div>
        <button
          onClick={createMeeting}
          type="button"
          className="p-2 text-white text-lg font-semibold block bg-blue-600
          rounded-sm"
        >
          Create Meeting
        </button>
        <form onSubmit={handle} className="space-x-2">
          <input
            className="p-2 border-solid border-2 border-zinc-500
            rounded-sm focus:outline-none focus:ring focus:ring-violet-300"
            type="text"
            placeholder="Enter room name to Join"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />

          <button
            type="submit"
            className={`p-2 font-semibold ${
              roomName.length > 0 ? "font-bold text-blue-600" : ""
            }`}
          >
            Enter
          </button>
        </form>
      </div>
      <div className="md:max-w-lg md:w-full mx-auto xl:mx-0">
        <img
          src={svg}
          title="source: imgur.com"
          alt="video meet"
          className="object-contain"
        />
      </div>
    </div>
  );
}

export default Landing;
