import "../../css/style.css";

export default function Socials({ fa_icon, link }) {
  return (
    <li>
      <a
        href={`https://${link}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          e.preventDefault();
          window.open(`https://${link}`, "_blank");
        }}
      >
        <i className={fa_icon}></i>
      </a>
    </li>
  );
}
