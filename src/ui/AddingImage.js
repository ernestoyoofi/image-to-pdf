import "./AddingImage.css"
import ApplyLanguage from "../LanguageSelect"

export default function AddingImage({ action_btn }) {
  return <div className="tab-addingimage">
    <div className="center-content">
      <h3 style={{textAlign:"center"}}>{ApplyLanguage("title")} (Beta Preview)</h3>
      <p>{ApplyLanguage("description")}</p>
      <div className="btn-center">
        <button onClick={action_btn}>{ApplyLanguage("add_image")}</button>
      </div>
    </div>
  </div>
}