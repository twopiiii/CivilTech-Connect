import "../../css/footer.css";

export default function ContactDeets({ media, value }) {
  return (
    <li>
      <p className="media" style={{ textTransform: "capitalize" }}>
        {media}
      </p>
      <p className="value">{value}</p>
    </li>
  );
}
