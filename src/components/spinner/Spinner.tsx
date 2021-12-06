import "./spinner.css";

export default function Spinner({ width }: { width: string }) {
  return (
    <div
      className="spinner-loader"
      style={{ width: width, height: width }}
    ></div>
  );
}
