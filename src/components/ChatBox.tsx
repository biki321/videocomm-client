import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSocketContext } from "../contexts/socket-context";
import { ITextMsg } from "../interfaces/textMsg.interface";
import { IoMdSend } from "react-icons/io";
import AutoTextArea from "./AutoTextArea";
import "../static/css/chat.css";
import Message from "./Message";
import { useAuthContext } from "../contexts/auth/auth-context";

function Text({ text, email }: { text: string; email: string }) {
  return (
    <div>
      <div className="font-semibold text-sm">{email.split("@")[0]}</div>
      <p className="text-sm break-words">{text}</p>
    </div>
  );
}

function ChatBox() {
  let dummyMsgs: ITextMsg[] = [];
  // for (let i = 0; i < 5; i++) {
  //   dummyMsgs.push({
  //     text: "1 hi ow ru fhsdlf sfksd  fnksjfsd sjfoisdf jfisjf fsjdofjsdofj jsoifjsdjfsdjofjsd sldfs",
  //     self: false,
  //     email: "bikideka@gmail.com",
  //   });
  // }
  const { socket } = useSocketContext();
  const [msgs, setMsgs] = useState<ITextMsg[]>(dummyMsgs);
  const [typedMessageData, setTypedMessageData] = useState("");
  const [sentOrReceivedMsgCount, setSentOrReceivedMsgCount] = useState(0);
  const { user } = useAuthContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const pushNewMsg = (msg: ITextMsg) => {
    setMsgs((prevState) => [msg, ...prevState]);
    setSentOrReceivedMsgCount((prevState) => prevState + 1);
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  const onMsgReceiveHandler = useCallback(
    (message: { text: string; email: string }) => {
      console.log("msg at onMsgReceiveHandler", message);
      if (user && user.email === message.email) console.log(true);
      pushNewMsg({
        text: message.text,
        email: message.email,
        self: user && user.email === message.email ? true : false,
      });
    },
    [user]
  );

  useEffect(() => {
    socket?.on("get_message", onMsgReceiveHandler);

    return () => {
      socket?.off("get_message", onMsgReceiveHandler);
    };
  }, [onMsgReceiveHandler, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [sentOrReceivedMsgCount]);

  function sendMsg(e: React.MouseEvent<SVGElement, MouseEvent>): void {
    const msg = {
      text: typedMessageData,
      email: user ? user.email : "",
    };
    console.log("msg", msg);
    socket?.emit("message", msg);
    setTypedMessageData("");
  }
  return (
    <div className="container-chat bg-gray-300">
      {/* <div className="error">{error}</div> */}
      <div className="chat">
        {/* <div className="chat-header">
          <ProfileMessageBox profile={profile!} />
        </div> */}
        <div className="chat-box">
          <div ref={messagesEndRef} />
          {msgs.map((message, index) => {
            return (
              <div key={index}>
                <Message message={message} />
              </div>
            );
          })}
        </div>

        {/* <div className="text-error">{typedMessageData.textError}</div> */}
        <div className="chat-footer">
          <AutoTextArea
            onChange={(e) => setTypedMessageData(e.target.value)}
            minChars={0}
            maxChars={500}
            text={typedMessageData}
            placeholder="type your message"
          />
          <IoMdSend className="message-send-btn" onClick={(e) => sendMsg(e)} />
        </div>
      </div>
    </div>
  );
}

export default ChatBox;
