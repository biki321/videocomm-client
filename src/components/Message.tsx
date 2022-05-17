import { ITextMsg } from "../interfaces/textMsg.interface";
import "../static/css/message.css";

interface IProps {
  message: ITextMsg;
}

export default function Message({ message }: IProps) {
  return (
    <div className={`message-box ${message.self ? "right-side" : "left-side"}`}>
      {message.self ? <div className="flex1"></div> : null}
      <div className="message-main">
        <div className="sender">{message.email.split("@")[0]}</div>
        <div className="message-content">
          <p>{message.text}</p>
        </div>
      </div>
    </div>
  );
}
