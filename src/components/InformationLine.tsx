function InformationLine({ text }: { text: string }) {
  return (
    <div className="flex justify-center content-center font-semibold text-lg">
      <div>{text}</div>
    </div>
  );
}
export default InformationLine;
