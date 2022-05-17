import React, { useState, useEffect, useRef } from "react";

interface IProps {
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  minChars: number;
  maxChars: number;
  text: string;
  // rows: number;
  // required: boolean;
  style?: Object;
  placeholder?: string;
}

const AutoTextArea = ({
  onChange,
  minChars,
  maxChars,
  text,
  // rows,
  // required,
  style,
  placeholder,
}: IProps) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [textAreaHeight, setTextAreaHeight] = useState("auto");
  // const [parentHeight, setParentHeight] = useState("auto");

  useEffect(() => {
    // setParentHeight(`${textAreaRef.current!.scrollHeight}px`);
    setTextAreaHeight(`${textAreaRef.current!.scrollHeight}px`);
    // console.log("use effect text a");
  }, [text]);

  const onChangeHandler = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextAreaHeight("auto");
    // setParentHeight(`${textAreaRef.current!.scrollHeight}px`);

    onChange(event);
  };

  return (
    <textarea
      // required
      className="auto-textarea"
      ref={textAreaRef}
      // rows={rows}
      style={{
        height: textAreaHeight,
        // ...style,
      }}
      placeholder={placeholder ?? ""}
      onChange={onChangeHandler}
      value={text}
    />
  );
};

export default AutoTextArea;
